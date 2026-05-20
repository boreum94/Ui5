
/*
 * JAWS Script file for SAPGUI - Helper and utility functions
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2022/06/24
 */

include "HJConst.jsh"
include "HJGlobal.jsh"
include "HJHelp.jsh"
include "common.jsm"

include "sapfront.jsh"
include "sapfront.jsm"
include "sapglobal.jsh"

Const
  StartTimeout = 2
  
Globals
  int g_iControlGroupMode,
  int g_nScreenEchoMode,
  int g_nTypingEchoMode,
  int g_nGraphicsMode,
  int g_nControlTypeMode,
  int g_nNextConfiguationID,
  string g_sNextConfiguration,
  string g_sStartMessage,
  string g_sStartTutorMessage

Globals
  /* defs for progress bar announcement */
  int g_nProgressBarMode,
  int g_nProgressBarPercentage,
  int g_nProgressBarLastChange,
  string g_sProgressBarSound,
  string g_sProgressBarText,
  string g_sProgressBarPreviousText

/*
 **********************************************************************
 ** Some utility functions
 **********************************************************************
*/

;For compatibility with Jaws 6.2
int Function StringSegmentCount (string TheString, string Delimiter)
var
  int Position,
  int Count,
  int length

  If (GetJFWVersion () >= 700000) then
    return StringSegmentCount (TheString, Delimiter)
  EndIf

  Length = StringLength (TheString)
  Position = 1
  Count = 0

  While (Position <= Length)
    IF (SubString (TheString, Position, 1) == Delimiter) THEN
      Count = Count + 1
    ENDIF
    Position = Position + 1
  EndWhile

  RETURN Count

EndFunction

string Function TrimString (string s)
var
  string sTmp,
  string sRes

  sTmp = StringTrimLeadingBlanks (s)
  sRes = StringTrimTrailingBlanks (sTmp)

  return (sRes)

EndFunction

int Function CompareStrings (string s1, string s2)

  if (StringLength (s1) != StringLength (s2)) then
    return false
  endif
    
  if (StringContains (s1, s2) == 0) then
    return false
  endif

  return true

EndFunction

/*
 **********************************************************************
 ** Initialization
 **********************************************************************
*/

void Function InitSAPUtils ()

  g_iControlGroupMode = ShouldItemSpeak (OT_CONTROL_GROUP_NAME)
  g_nScreenEchoMode = GetScreenEcho ()
  g_nTypingEchoMode = GetJcfOption (OPT_TYPING_ECHO)
  g_nGraphicsMode = GetJcfOption (OPT_INCLUDE_GRAPHICS)
  g_nControlTypeMode = GetJcfOption (OT_CONTROL_TYPE)

  g_nNextConfiguationID = 0
  g_sStartMessage = ""
  g_sStartTutorMessage = ""

  ; verbosity level functions

  g_nSapGuiAccVerbosity = 1
  g_nSapGuiSteploopMode = TRUE
  g_nMultipleSelectionVerbosity = 1
  g_nTooltipsBrailleMode = 1

  ; reset progress bar settings
  g_nProgressBarPercentage = 0
  g_nProgressBarLastChange = 0
  g_sProgressBarText = ""
  g_sProgressBarPreviousText = ""
  g_sProgressBarSound = FindJAWSSoundFile ("Click6.wav")

  LoadApplicationSettings ()

EndFunction

/*
 **********************************************************************
 ** Speech functions
 **********************************************************************
*/

/*
 * ShouldItemSpeak
 */


int Function ShouldItemSpeak (int iOutputMode)
var
  int iGeneralMode

  if (iOutputMode == OT_CONTROL_GROUP_NAME) then
    if (g_iControlGroupMode == OFF) then
      return (OFF)
    endif
  endif

  iGeneralMode = shouldItemSpeak (iOutputMode)

  return (iGeneralMode)

EndFunction

/*
 * SetLocalOutputMode
 */

void Function SetLocalOutputMode (int iOutputMode, int iSwitch)

  if (iOutputMode == OT_CONTROL_GROUP_NAME) then
    g_iControlGroupMode = iSwitch
  endif

EndFunction

/*
 * Set/Reset screen/typing echo modes
 */

Void Function SetLocalScreenEchoMode (int nMode)
var
  int nCurMode

  nCurMode = GetJcfOption (GUI_OPT_SCREEN_ECHO)
  if (nMode == nCurMode) then
    return
  endif
  g_nScreenEchoMode = nCurMode
  SetJcfOption (GUI_OPT_SCREEN_ECHO, nMode)
EndFunction

Void Function SetLocalTypingEchoMode (int nMode)
var
  int nCurMode

  nCurMode = GetJcfOption (OPT_TYPING_ECHO)
  if (nMode == nCurMode) then
    return
  endif
  g_nTypingEchoMode = nCurMode
  SetJcfOption (OPT_TYPING_ECHO, nMode)
EndFunction

void Function SetLocalGraphicsMode (int nMode)
var
  int nCurMode

  nCurMode = GetJcfOption (OPT_INCLUDE_GRAPHICS)
  if (nMode == nCurMode) then
    return
  endif
  g_nGraphicsMode = nCurMode
  SetJcfOption (OPT_INCLUDE_GRAPHICS, nMode)
EndFunction

void Function ResetLocalGraphicsMode ()
  SetJcfOption (OPT_INCLUDE_GRAPHICS, g_nGraphicsMode)
EndFunction

void Function ResetLocalScreenEchoMode  ()
  SetJcfOption (GUI_OPT_SCREEN_ECHO, g_nScreenEchoMode)
EndFunction

void Function ResetLocalTypingEchoMode  ()
  SetJcfOption (OPT_TYPING_ECHO, g_nTypingEchoMode)
EndFunction

/*
 * Appplication settings
 */
 
int Function SaveApplicationSettings ()
var
  int iResult

  iResult = iniWriteInteger (Section_SapGuiVerbositySettings, Key_SapGuiAccVerbosity, g_nSapGuiAccVerbosity, SapGuiJsiFileName)
  iResult = iniWriteInteger (Section_SapGuiVerbositySettings, Key_SapGuiSteploopMode, g_nSapGuiSteploopMode, SapGuiJsiFileName)
  ; g_nProgressBarMode = 1  /* announcement of progress bar through COM event (not recommended) */

  return iResult

EndFunction

int Function LoadApplicationSettings ()

  g_nSapGuiAccVerbosity = iniReadInteger (Section_SapGuiVerbositySettings, Key_SapGuiAccVerbosity, g_nSapGuiAccVerbosity, SapGuiJsiFileName)
  g_nSapGuiSteploopMode = iniReadInteger (Section_SapGuiVerbositySettings, Key_SapGuiSteploopMode, g_nSapGuiSteploopMode, SapGuiJsiFileName)

  /*
   * ROM 2011/09/19:
   * - the default setting does not use a COM event anymore, because it has caused frequent SAPGUI crashes
   * - use of COM event can be enabled via the key "ProgressBarAnnouncement" in settings file sapfront.jsi (but handle with care!)
   * ROM 2012/05/21:
   * - new SAPGUI properties are used to announce progress bar
   */
  g_nProgressBarMode = iniReadInteger (Section_SapGuiVerbositySettings, Key_SapGuiProgressBarMode, 0, SapGuiJsiFileName)

  /*
   * Switch on/off kludge for multiple selection button (ROM 2013/11/28) - default is on
   */
   g_nMultipleSelectionVerbosity = iniReadInteger (Section_SapGuiVerbositySettings, Key_SapGuiMultipleSelection, 1, SapGuiJsiFileName)

  /*
   * show more tooltips in Braille - default is on
   */
   g_nTooltipsBrailleMode = iniReadInteger (Section_SapGuiVerbositySettings, Key_SapGuiTooltipsBrailleMode, 1, SapGuiJsiFileName)

   return TRUE

EndFunction

/*
 **********************************************************************
 ** General SAPGUI functions
 **********************************************************************
*/

/*
 * SAPGUI Object
 */

Object Function GetSAPGUI ()
var
  handle hCurWnd,
  handle hActiveWnd,
  object oWrapper,
  object oRotSAPGUI,
  object oSAPGUI,
  int bFoundStandalone,
  int bFoundEmbedded,
  int nLevel,
  handle hAppWindow,
  handle hTopLevelWindow,
  handle hFocus,
  handle hFound,
  handle hRun,
  string sWindowClass,
  string sAppWindowClass

  g_oSAPGUI = oNull

  hFocus = GetFocus ()
  hTopLevelWindow = GetTopLevelWindow (hFocus)
  hAppWindow = GetAppMainWindow (hFocus)

  /*
    * changed logic for cases when dialogs are running embedded in BC (2016-01-18 rom)
    * another case added: ((hTopLevelWindow!=hAppWindow) && (hAppWindow==sClassSapFrontend))
    */

  sWindowClass = GetWindowClass (hTopLevelWindow)
  sAppWindowClass = GetWindowClass (hAppWindow)
  bFoundStandalone = (CompareStrings (sWindowClass, sClassSapFrontend) || CompareStrings (sAppWindowClass, sClassSapFrontend))

  /*
  * Performance Assistant is not owned by another window, just check the window class
  */
  if (!bFoundStandalone) then
    bFoundStandalone = (CompareStrings (sWindowClass, sClassDialogContainer))
  endif

  if (!bFoundStandalone) then
    nLevel = 0
    while ((GetWindowClass (hAppWindow) == cWc_dlg32770) && (nLevel < 10))
      hAppWindow = GetAppMainWindow (hAppWindow)
      nLevel = nLevel + 1
    endwhile

    if ((hTopLevelWindow != hAppWindow) && (GetWindowClass (hTopLevelWindow) == cWc_dlg32770)) then
      if (CompareStrings (GetWindowClass (hAppWindow), sClassSapFrontend)) then
        bFoundStandalone = true
      else
        hFound = FindWindow (hAppWindow, sClassSapFrontend)
        if (hFound) then
          bFoundStandalone = true
        endif
      endif
    endif
  endif

  ;  1. Try first to connect to a standalone SAPGUI  session
  if (bFoundStandalone) then
    oRotSAPGUI = GetObject ("SAPGUI")
    if (!oRotSAPGUI) then
      oRotSAPGUI = GetObject ("SAPGUISERVER")
    endif
    if (!oRotSAPGUI) then
      oWrapper = CreateObject ("SapROTWr.SapROTWrapper")
      if (oWrapper) then
        oRotSAPGUI = oWrapper.GetROTEntry ("SAPGUI")
        if (!oRotSAPGUI) then
          oRotSAPGUI = oWrapper.GetROTEntry ("SAPGUISERVER")
        endif
      endif
      oWrapper = oNull
    endif

    if (oRotSAPGUI) then
      oSAPGUI = oRotSAPGUI.GetScriptingEngine
    endif

    hActiveWnd = hNull
    if (oSAPGUI) then
      hActiveWnd = oSAPGUI.ActiveSession.ActiveWindow.Handle
    endif

  else

    ;  2. No standalone session detected - try to connect to an embedded SAPGUISERVER session

    bFoundEmbedded = false

    if ((hTopLevelWindow != hAppWindow) && (GetWindowClass (hTopLevelWindow) == cWc_dlg32770)) then
      hFound = FindWindow (hAppWindow, sClassSapEmbeddedFrontend)
      if (hFound) then
        bFoundEmbedded = true
      endif
    endif

    if (!bFoundEmbedded) then
      hRun = hFocus
      while (hRun && !bFoundEmbedded)
        sWindowClass = GetWindowClass (hRun)
        bFoundEmbedded = (CompareStrings (sWindowClass, sClassSapEmbeddedFrontend))
        hRun = GetParent (hRun)
      endwhile
    endif

    if (bFoundEmbedded) then
      oSAPGUI = oNull
      oRotSAPGUI = GetObject ("SAPGUISERVER")
      if (!oRotSAPGUI) then
        oWrapper = CreateObject ("SapROTWr.SapROTWrapper")
        if (!oWrapper) then
          return oNull
        endif
        oRotSAPGUI = oWrapper.GetROTEntry ("SAPGUISERVER")
        if (!oRotSAPGUI) then
          return oNull
        endif
        oWrapper = oNull
      endif
      oSAPGUI = oRotSAPGUI.GetScriptingEngine
      hActiveWnd = hNull
      if (oSAPGUI) then
        hActiveWnd = oSAPGUI.ActiveSession.ActiveWindow.Handle
      endif
    endif
  endif
 
  if (!oSAPGUI || !hActiveWnd) then
    return oNull
  endif

  g_oSAPGUI = oSAPGUI
  return (oSAPGUI)

EndFunction

int Function IsSAPGUIActive ()
  if (!g_oSAPGUI) then
    return FALSE
  endif
  return TRUE
EndFunction

void Function ExitSAPGUI ()
  g_oSAPGUIFrame = oNull
  g_oSAPGUISession = oNull
  g_oSAPGUI = oNull
EndFunction

/*
 * GuiSession
 */
 
object Function GetSAPGUISession ()
var
  object oSession

  if (!g_oSAPGUI) then
    GetSAPGUI ()
  endif

  oSession = g_oSAPGUI.ActiveSession

  g_oSAPGUISession = oSession

  ; ROM 2011/04/05 - experimental use of ComEvent "ProgressIndicator"
  ; attach event ProgressIndicator to session event if progress bar mode is "verbose" (1)
  if (!g_oSAPGUISession) then
    return oNull
  endif

  if (g_nProgressBarMode == 1) then
    ComAttachEvents (g_oSAPGUISession, "Sap")
  endif

  return oSession

EndFunction

int Function IsSAPGUISessionActive ()

  if (!g_oSAPGUISession) then
    return FALSE
  endif
  return TRUE

EndFunction

void Function ExitSAPGUISession ()

  if (g_oSAPGUISession && (g_nProgressBarMode == 1)) then
    ComDetachEvents (g_oSAPGUISession)
  endif

  g_oSAPGUIFrame = oNull
  g_oSAPGUISession = oNull
EndFunction

/*
 * ROM: 2009/10/20 - new function to check if session is currently busy; waits until session is free again
 */

int Function IsSAPGUISessionBusy (int nMaxTries, int bUsePauses)
var
  int i,
  int bBusy

  if (!g_oSAPGUISession) then
    return (FALSE)
  endif

  i = nMaxTries
  bBusy = g_oSAPGUISession.Busy
  while (bBusy && (i > 0))
    if (bUsePauses) then
      Pause ()
    endif
    i = i - 1
    bBusy = g_oSAPGUISession.Busy
  endwhile

  return (bBusy)

EndFunction

/*
 * GuiFrameWindow
 */
 
object Function GetSAPGUIFrame ()
var
  object oFrameWindow,
  object oSession

  if (!g_oSAPGUISession) then
    GetSAPGUISession ()
  endif

  if (g_oSAPGUISession.Busy) then
    return (oNull)
  endif

  oFrameWindow = g_oSAPGUISession.ActiveWindow
  g_oSAPGUIFrame = oFrameWindow

  return oFrameWindow

EndFunction

int Function IsSAPGUIFrameActive ()

  if (!g_oSAPGUIFrame) then
    return FALSE
  endif
  return TRUE

EndFunction

void Function ExitSAPGUIFrame ()
  g_oSAPGUIFrame = oNull
EndFunction

/*
 * GuiFocus object
 */

object Function GetSAPGUIFocus ()
var
  object oGuiFocus

  if (g_oSAPGUISession.Busy) then
    return (oNull)
  endif

  if (!g_oSAPGUIFrame) then
    GetSAPGUIFrame ()
  endif

  oGuiFocus = g_oSAPGUIFrame.guiFocus

  return (oGuiFocus)

EndFunction

/*
 * GuiShell - Integration of application objects ("OfficeIntegration"/"HTMLViewer")
 */

void Function GuiShellIntegration (int nShellIntegrationType, optional string sGuiShellSubType)
var
  string sConfig,
  string sWindowClass,
  string sMessage,
  string sMessageTutor

  ; sGuiShellSubType parameter obsolete

  sConfig = ""
  sMessage = ""
  sMessageTutor = ""

  if (nShellIntegrationType == GUI_SI_BROWSERCONTROL_IE) then
    ; TODO: checking for AcrobatReader window class, is it obsolete?
    Delay (2)
    sWindowClass = GetWindowClass (GetFocus ())
    if (sWindowClass == sClassAcrobatReader) then
      sMessage = msgAdobeAcrobat
      sMessageTutor = msgTutorAdobeAcrobat
      sConfig = sConfAdobeAcrobat
    else
      sMessage = msgInternetExplorer
      sMessageTutor = msgTutorInternetExplorer
      sConfig = sConfInternetExplorer
    endif
  elif (nShellIntegrationType == GUI_SI_BROWSERCONTROL_EDGE) then
    sMessage = msgEdge
    sMessageTutor = msgTutorEdge
    sConfig = sConfEdge
  elif (nShellIntegrationType == GUI_SI_WORD) then
    sMessage = msgWinword
    sMessageTutor = msgTutorWinword
    sConfig = sConfWinword
  elif (nShellIntegrationType == GUI_SI_EXCEL) then
    sMessage = msgExcel
    sMessageTutor = msgTutorExcel
    sConfig = sConfExcel
  elif (nShellIntegrationType == GUI_SI_POWERPOINT) then
    sMessage = msgPowerPoint
    sMessageTutor = msgTutorPowerPoint
    sConfig = sConfPowerpoint
  elif (nShellIntegrationType == GUI_SI_PROJECT) then
    sMessage = msgProject
    sMessageTutor = msgTutorProject
    sConfig = sConfProject
  elif (nShellIntegrationType == GUI_SI_WORDPERFECT) then
    sMessage = msgWordPerfect
    sMessageTutor = msgTutorWordPerfect
    sConfig = sConfWordperfect
  elif (nShellIntegrationType == GUI_SI_ADOBE) then
    sMessage = msgAdobeAcrobat
    sMessageTutor = msgTutorAdobeAcrobat
    sConfig = sConfAdobeAcrobat
  endif

  if (!StringIsBlank (sConfig) && !CompareStrings (sConfig, GetActiveConfiguration ())) then

    InvokeConfiguration (sConfig, sMessage, sMessageTutor)

  endif

  return

/*
  Currently not supported:
  ; GUI_SI_VISIO, GUI_SI_WORDPRO, GUI_SI_LOTUS123, GUI_SI_SAPOROS, GUI_SI_PSPLANNINGMODELLER
*/

EndFunction

/*
 **********************************************************************
 ** Configurations
 **********************************************************************
*/

Void Function InvokeConfiguration (string sNextConfiguration, string sMessage, string sTutorMessage)

  g_sNextConfiguration = sNextConfiguration

  if (g_nNextConfiguationID != 0) then
    UnscheduleFunction (g_nNextConfiguationID)
    g_nNextConfiguationID = 0
  endif
  if (StringIsBlank (g_sNextConfiguration)) then
    return
  endif

  g_sStartMessage = sMessage
  g_sStartTutorMessage = sTutorMessage

  g_nNextConfiguationID = ScheduleFunction ("StartConfiguration", StartTimeout)

EndFunction

Void Function StartConfiguration ()

  if (StringIsBlank (g_sNextConfiguration)) then
    return
  endif

  g_sPreviousConfiguration = GetActiveConfiguration ()
  g_nNextConfiguationID = 0

  var int bDoAnnouncement = false
  if (CompareStrings (g_sPreviousConfiguration, sSapGuiConfiguration) == true) then
    if (!CompareStrings (g_sPreviousConfiguration, g_sNextConfiguration)) then
      bDoAnnouncement = true
    endif
  endif
  if (!bDoAnnouncement) then
    if ((CompareStrings (g_sPreviousConfiguration, g_sNextConfiguration) == true) && (g_sNextConfiguration == "msedge")) then
      bDoAnnouncement = true
    endif
  endif

  if (bDoAnnouncement) then
    /* StopSpeech () */
    /* SayCurrentGuiShell () */
    if (!StringIsBlank (g_sStartMessage)) then
      SayFormattedMessage (OT_CONTROL_TYPE, g_sStartMessage)
      if (!StringIsBlank (g_sStartTutorMessage)) then
        SayFormattedMessage (OT_TUTOR, g_sStartTutorMessage)
      endif
    endif
    ; sapfront::ResetGuiComponent ()
    ExitSAPGUIFrame ()
    /*  Delay (2, FALSE)  */
  endif
 
  SwitchToConfiguration (g_sNextConfiguration)

  if (StringCompare (g_sNextConfiguration, sSapGuiConfiguration) != 0) then
    if (IsVirtualPCCursor ()) then
      SayFormattedMessage (OT_TUTOR, cMSG288_L)
    elif (IsFormsModeActive ()) then
      SayFormattedMessage (OT_TUTOR, cmsg286_L)
    elif (IsPCCursor ()) then
      SayFormattedMessage (OT_TUTOR, cmsg9_L)
    endif
  endif

EndFunction

Void Function SapSwitchBackConfiguration ()
var
  int bFound,
  int iSubType,
  int nGuiComponentType,
  handle hAppWindow,
  handle hFocus,
  handle hRun,
  object oFocus,
  string sCurConfig,
  string sGuiComponentSubType,
  string sWindowClass,
  string sAppName

  hFocus = GetFocus ()
  hAppWindow = GetAppMainWindow (hFocus)

  sAppName = GetAppFileName ()
  sCurConfig = GetActiveConfiguration ()

  if (StringCompare (sAppName, "nwbc.exe", false) == 0) then
    if (StringCompare (sCurConfig, sConfInternetExplorer, false) == 0) then
      if (NwbcExitIECanvas ()) then /* switching is probably done in function called */
        return
      endif
    endif
    ; return
  endif

  if (CompareStrings (sCurConfig, sSapGuiConfiguration)) then
    if (IsSAPGUIActive ()) then
      var object oSession = g_oSAPGUI.ActiveSession
      if (oSession != g_oSAPGUISession) then
        GetSAPGUISession ()
      endif
    endif
    return
  endif

  sWindowClass = GetWindowClass (hAppWindow)

  /* check for SAPGUI running inplace in IE */
  if (CompareStrings (sWindowClass, sClassIEFrame)) then
    if (!CompareStrings (sCurConfig, sConfInternetExplorer)) then
      return
    endif

    bFound = FALSE
    hRun = hFocus
    while (!bFound)
      hRun = GetParent (hRun)
      if ((!hRun) || (hRun == hAppWindow)) then
        return
      endif
      sWindowClass = GetWindowClass (hRun)
      bFound = (CompareStrings (sWindowClass, sClassSapFrontend))
    endwhile

    GetSAPGUIFrame ()
    if (!g_oSAPGUIFrame) then
      /* SayString ("no SAPGUI frame window") */
      return
    endif
    
    if (g_oSAPGUIFrame.handle == hRun) then
      InvokeConfiguration (sSapGuiConfiguration, "", "")
    endif

    ExitSAPGUI ()
    return
  endif

  /*
   * ROM 2012/11/02
   * Checking for SAP dialog box and performance assistance classes seem to be obsolete, because the standard Win dialog box class "#32770"
   * is also used by SAPGUI. Therefore, we rely on SAPGUI scripting ActiveSession/ActiveWindow and  GuiFocus returnig null whenever
   * no SAPGUI element is active
   */
 
  if (g_oSAPGUISession.Busy) then
    ExitSAPGUIFrame ()
    return
  endif

  GetSAPGUIFrame ()
  if (!g_oSAPGUIFrame) then
    return
  endif

  oFocus = GetSAPGUIFocus ()
  if (!oFocus) then
    ExitSAPGUIFrame ()
    return
  endif 

  nGuiComponentType = oFocus.typeAsNumber

  if (nGuiComponentType == GUI_TC_GUISHELL) then
    sGuiComponentSubType = oFocus.SubType
    if (sGuiComponentSubType == sGuiOfficeIntegration) then
      iSubType = g_oGuiComponent.HostedApplication
      GuiShellIntegration (iSubType)
    elif (sGuiComponentSubType == sGuiHtmlViewer) then
      ; TODO - edge browser control type
      iSubType = oFocus.GetBrowserControlType ()
      iSubType = iSubType + GUI_SI_BROWSERCONTROL_IE
      GuiShellIntegration (iSubType)
    else
      oFocus = oNull
      ExitSAPGUIFrame ()
      StopSpeech ()
      InvokeConfiguration (sSapGuiConfiguration, "", "")
    endif
  else
    oFocus = oNull
    ExitSAPGUIFrame ()
    StopSpeech ()
    InvokeConfiguration (sSapGuiConfiguration, "", "")
  endif

  oFocus = oNull
  ExitSAPGUIFrame ()

EndFunction

/* rom 2017/05/04 - check for switching back from IE canvas */
int function NwbcExitIECanvas ()
var
  int bFoundIE,
  int bFoundSAPGUI,
  int iSubType,
  int nGuiComponentType,
  int nLevel,
  handle hAppWindow,
  handle hTopLevelWindow,
  handle hFound,
  handle hFocus,
  handle hRun,
  object oFocus,
  string sGuiComponentSubType,
  string sWindowClass,
  string sAppWindowClass

  hFocus = GetFocus ()
  hTopLevelWindow = GetTopLevelWindow (hFocus)
  hAppWindow = GetAppMainWindow (hFocus)

  sWindowClass = GetWindowClass (hTopLevelWindow)
  sAppWindowClass = GetWindowClass (hAppWindow)

  if (CompareStrings (sWindowClass, sClassIEFrame) || CompareStrings (sAppWindowClass, sClassIEFrame)) then
    return false
  endif

  if ((hTopLevelWindow != hAppWindow) && (StringContains (GetWindowClass (hTopLevelWindow), "NWBC.exe") != 0)) then
    nLevel = 0
    while ((GetWindowClass (hAppWindow) == cWc_dlg32770) && (nLevel < 10))
      hAppWindow = GetAppMainWindow (hAppWindow)
      nLevel = nLevel + 1
    endwhile
    if (CompareStrings (GetWindowClass (hAppWindow), sClassIEFrame)) then
      return false
    endif
    hFound = FindWindow (hAppWindow, sClassSapFrontend)
    if (hFound) then
      InvokeConfiguration (sSapGuiConfiguration, "", "")
      return true
    endif
  endif

  ; Check parent windows  of focused window for sClassInternetExplorer / sClassSapEmbeddedFrontend
  bFoundIE = false
  bFoundSAPGUI = false
  if ((hTopLevelWindow != hAppWindow) && (StringContains (GetWindowClass (hTopLevelWindow), "NWBC.exe") != 0)) then
    hFound = FindWindow (hAppWindow, sClassInternetExplorer)
    if (hFound) then
      bFoundIE = true
    else
      hFound = FindWindow (hAppWindow, sClassSapEmbeddedFrontend)
      if (hFound) then
        bFoundSAPGUI = true
      endif
    endif
  endif

  if (!bFoundIE && !bFoundSAPGUI) then
    hRun = hFocus
    while (hRun && !bFoundIE && !bFoundSAPGUI)
      sWindowClass = GetWindowClass (hRun)
      bFoundIE = (CompareStrings (sWindowClass, sClassInternetExplorer))
      bFoundSAPGUI = (CompareStrings (sWindowClass, sClassSapEmbeddedFrontend))
      hRun = GetParent (hRun)
    endwhile
  endif

  if (bFoundSAPGUI) then
    InvokeConfiguration (sSapGuiConfiguration, "", "")
    return true
  endif

  if (!bFoundIE) then
    InvokeConfiguration (sConfNWBC, "", "")
    return true
  endif

  return false

endFunction

/*
 **********************************************************************
 ** Event functions
 **********************************************************************
*/

script StatusBarUpdated ()
  /* do nothing - to prevent JAWS announcing "unknown script" */
endScript

Script SapFocusChanged ()

  SapSwitchBackConfiguration ()

EndScript

Script SapEndRequest ()

  g_sProgressBarText = ""
  g_sProgressBarPreviousText = ""
  ; Say ("saputils end request", OT_JAWS_MESSAGE)

EndScript

/*
 * ROM 2011/04/05 - following event is triggered by ComEvent "ProgressIndicator" - this COM event will get fired to 
 * indicate updates to the progress bar;
 * alternatively, the script function "ProgressIndicator" can be used, which is invoked by SAPGUI via JfwRunScript
 */

void Function SapProgressIndicator (int nPercentage, string sText)
var
  int nElapsed

  if (g_nProgressBarMode != 1) then
    return
  endif

  if (nPercentage <= g_nProgressBarPercentage) then
    g_sProgressBarPreviousText = ""
  endif
  g_nProgressBarPercentage = nPercentage
  g_sProgressBarText = sText

  nElapsed = (GetTickCount () - g_nProgressBarLastChange)
  if (nElapsed < 2500) then
    return
  endif

  g_nProgressBarLastChange = GetTickCount ()

  ScheduleFunction ("AnnounceProgressIndicator", 1)

EndFunction

script ProgressIndicator ()

  if (g_nProgressBarMode != 0) then
    return
  endif

  if (!g_oSAPGUISession) then
    return
  endif

  ScheduleFunction ("AnnounceProgressIndicator", 1)

EndScript

/*
 * helper function to announce progress indicator
 */

void Function AnnounceProgressIndicator ()
var
  int nPercentage,
  int nElapsed,
  string sAnnouncement

  if (!StringIsBlank (g_sProgressBarSound)) then
    PlaySound (g_sProgressBarSound)
  endif

  sAnnouncement = ""

  if (!g_nProgressBarMode) then
    nElapsed = (GetTickCount () - g_nProgressBarLastChange)
    if (nElapsed < 2500) then
      return
    endif
    g_nProgressBarLastChange = GetTickCount ()

    if (!g_oSAPGUISession) then
      return
    endif

    nPercentage = g_oSAPGUISession.ProgressPercent
    if (nPercentage <= g_nProgressBarPercentage) then
      g_sProgressBarPreviousText = ""
    endif
    g_nProgressBarPercentage = nPercentage
    g_sProgressBarText = g_oSAPGUISession.ProgressText

  endif

  if (StringCompare (g_sProgressBarText, g_sProgressBarPreviousText, true) != 0) then
    sAnnouncement = g_sProgressBarText
    g_sProgressBarPreviousText = g_sProgressBarText
  endif

  sAnnouncement = sAnnouncement + " " + IntToString (g_nProgressBarPercentage) + " %"
  Say (sAnnouncement, OT_JAWS_MESSAGE)

EndFunction

/*
 * Reset and set focus to ok code field
 */

Script SapExitToOCF ()
var
  object oSAPGUI,
  object oOCF,
  string sCurConfig

  ExitSAPGUI ()
  Delay (1, TRUE)

  GetSAPGUIFrame ()
  if (!g_oSAPGUIFrame) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    return
  endif

  if (g_oSAPGUIFrame.handle != GetAppMainWindow (GetFocus ())) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    ExitSAPGUIFrame ()
    return
  endif

  oOCF = g_oSAPGUIFrame.findByName (sSapGuiOkCodeFieldName, sSapGuiOkCodeFieldType)
  if (!oOCF) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    ExitSAPGUIFrame ()
    return
  endif

  ; SayString ("okay code field jump")

  oOCF.SetFocus ()

  Refresh (1)
  Delay (2)

  ExitSAPGUIFrame ()

  sCurConfig = GetActiveConfiguration ()
  if (sCurConfig != sSapGuiConfiguration) then
    InvokeConfiguration (sSapGuiConfiguration, "", "")
  endif

EndScript

void Function Unknown (string TheName)
  ; do nothing
  return
EndFunction
