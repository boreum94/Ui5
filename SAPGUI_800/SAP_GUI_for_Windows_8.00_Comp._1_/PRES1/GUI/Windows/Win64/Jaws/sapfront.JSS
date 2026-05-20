
/*
 * JAWS Script file for SAPGUI.
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2022/12/02 - for Screen Reader Extensions xSRX 66
 */

include "HJConst.jsh"
include "HJGlobal.jsh"
include "HJHelp.jsh"
include "common.jsm"
include "MSAAConst.jsh"
include "WinStyles.jsh"
include "locale.jsh"

include "sapfront.jsh"
include "sapglobal.jsh"
include "sapfront.jsm"

use "saputils.jsb"

;#pragma usePoFile 0

const
  SRX_REVISION =  "xSRX 66"

const
  CID_OPTIONS_CONTAINER = 0x07D2       ; control id of container with play buttons

const
  WS_THICKFRAME = 0x00040000

const
  ; the multiple selection button in various languages
  CTXT_MULTIPLE_SELECTION_BUTTON = "Mehrfachselektion|Multiple selection|Sélection multiple|Seleziona multipla"

globals
  int g_iTextInputID,
  int g_iComboboxInputID,
  int g_iWindowRedrawID,
  int g_iSelectedID,
  int g_iStatusbarID,
  ; int g_iSchedulerID,
  int g_iPopupWindowID,
  int g_iCurScreenEchoMode,
  int g_iWarningMessage,
  int g_iWindowTitleID,
  int g_bAutoCompletionProcessed,
  int g_iAutoCompletionID,
  int g_iAutoCompletionToolbarID,
  int g_iBooknmarkStatusID,
  int g_iLineWithBreakpointID,
  int g_nMouseNavigationId,
  int g_bTypeEchoDisabled,
  int g_bFocusChanged,
  ; int g_bEndRequestReceived,
  int g_bFlushing,
  int g_bHandledByNavigationKey,
  int g_bRealWindowFocusChanged,
  int g_nPrevBrailleRestriction,
  int g_bHistoryIsActive,
  int g_nHistoryCurIndex,
  int g_nHistoryEntries,
  string g_sHistoryCurEntry,
  int g_bFooterWasAnnounced,
  int g_bFooterLeft,
  handle g_hCurrentWindow,
  handle g_hPrevFocusWindow,
  string g_sCurrentAccessKey,
  string g_sOfficeIntegrationMessage

globals
  int g_bPlayButtonsInitialized,
  int g_nPlayButtonCount,
  string g_sPlayButtonLabel,
  IntArray g_nPlayButtonIds

globals
  string g_sStartRequestId

/*
 **********************************************************************
 ** General SAPGUI functions
 **********************************************************************
*/

int Function IsCursorInRect (int x1, int y1, int x2, int y2)
var
  int x, int y

  let x = GetCursorCol ()
  let y = getCursorRow ()

  if ((x1 <= x) && (x <= x2) && (y1 <= y) && (y <= y2)) then
    return TRUE
  endif

  return FALSE

EndFunction

int Function IsParentWindow (handle hWnd, handle hParentWnd)
var
  handle hRun,
  handle hTop

  let hTop = GetTopLevelWindow (hWnd)
  if (hWnd == hTop) then
    return false
  endif

  let hRun = GetParent (hWnd)
  while (hRun != hTop)
    if (hRun == hParentWnd) then
      return true
    endif
    let hRun = GetParent (hRun)
  endwhile

  return false

EndFunction

/*
 * GetWindowWithRealTitle
 *
 *  - searches the parents of hWnd for a window with a real window title
 *  - modification of GetRealWindow function
 *
 */
handle function GetRealTitleWindow (handle hWnd)
var
  int bStop,
  handle hRun,
  handle hParent,
  string sClass

  hRun = GetRealWindow (hWnd)
  bStop = false
  while (hRun && !bStop)
    sClass = GetWindowClass (hRun)
    if (!StringContains (sClass, sTextEditBodyClass) && (sClass != sShellClass) && (sClass != sContainerClass) &&
      (sClass != sCalendarClass)) then
      bStop = true
    endif
    if (!bStop) then
      hRun = GetRealWindow (GetParent (hRun))
    endif
  endwhile

  if (bStop) then
    return hRun
  endif

  return hNull

endFunction

/*
 * ROM 2012/08/06
 * GetObjectSubTypeCode and GetWindowSubTypeCode are behaving differently in
 * JAWS Versions 12 and 13 for unknown object types - they return the value of the last know
 * object type, which makes them unreliable to use.
 * The following utility function is used to call a variant of GetWindowSubtypeCode depending on the
 * JAWS version.
 */
int function GetCurrentSubtypeCode ()
var
  handle hWnd

  let hWnd = GetFocus ()
  if (GetJfwVersion () >= 1200000) then
    return GetWindowSubtypeCode (hWnd, true)
  endif

  return GetWindowSubtypeCode (hWnd)

endfunction

/*
 **********************************************************************
 ** Some helper functions for handling options dialog
 **********************************************************************
 */

/*
 * Functions for play/browse buttons
 */

void function InitializePlayButtons ()
  /* ROM - added for play/browse buttons */

  g_nPlayButtonCount = 18
  g_nPlayButtonIds = new IntArray[g_nPlayButtonCount]

  /* play buttons */
  g_nPlayButtonIds[1] = 3565
  g_nPlayButtonIds[2] = 3568
  g_nPlayButtonIds[3] = 3571
  g_nPlayButtonIds[4] = 3574
  g_nPlayButtonIds[5] = 3577
  g_nPlayButtonIds[6] = 3580
  g_nPlayButtonIds[7] = 3583
  g_nPlayButtonIds[8] = 3586
  g_nPlayButtonIds[9] = 3589

  /* browse buttons */
  g_nPlayButtonIds[10] = 3567
  g_nPlayButtonIds[11] = 3570
  g_nPlayButtonIds[12] = 3573
  g_nPlayButtonIds[13] = 3576
  g_nPlayButtonIds[14] = 3582
  g_nPlayButtonIds[15] = 3579
  g_nPlayButtonIds[16] = 3585
  g_nPlayButtonIds[17] = 3588
  g_nPlayButtonIds[18] = 3591

  g_bPlayButtonsInitialized = true

endFunction

int function IsPlayButton (int nControlId)
var
  int i

  if (!g_bPlayButtonsInitialized) then
    InitializePlayButtons ()
  endif

  for i = 1 to g_nPlayButtonCount
    if (nControlId == g_nPlayButtonIds[i]) then
      return (true)
    endif
  endfor

  return false

endFunction

/*
 * checks if the control with the given (sub)types is an old or new input control
 */
int function IsInputField (optional int nTypeCode, optional string sSubType)

  if (nTypeCode == 0) then
    nTypeCode = g_nGuiComponentType
  endif
  if ((nTypeCode == GUI_TC_GUISHELL) && sSubType == "") then
    sSubType = g_sGuiComponentSubType
  endif

  if (nTypeCode == GUI_TC_TEXTFIELD) then
    return GUI_IF_TEXTFIELD
  endif
  if ((nTypeCode == GUI_TC_GUISHELL) && (sSubType == sGuiInputField)) then
    return GUI_IF_INPUTFIELDCONTROL
  endif

  return GUI_IF_NONE

endfunction

/*
 **********************************************************************
 ** GuiComponent object functions
 **********************************************************************
 */

/*
 * Functions to access common values of GuiComponent objects
 */

int Function GetGuiComponentProperties (object oGuiComponent, int ByRef nTypeAsNumber, int ByRef bChangeable,
  string ByRef sId, string ByRef sTooltip, string ByRef sAccTooltip, string ByRef sAccText,
  string ByRef sAccDescription)
var
  string sStandardTooltip,
  string sDefaultTooltip

  let nTypeAsNumber = oGuiComponent.typeAsNumber
  let bChangeable = oGuiComponent.changeable
  let sId = oGuiComponent.id
  let sTooltip = oGuiComponent.Tooltip

  let sStandardTooltip = TrimString (oGuiComponent.Tooltip)
  let sDefaultTooltip = TrimString (oGuiComponent.DefaultTooltip)
  if (!StringIsBlank (sStandardTooltip)) then
    let sTooltip = sStandardTooltip
  else
    let sTooltip = sDefaultTooltip
  endif

  let sAccTooltip = TrimString (oGuiComponent.AccTooltip)
  let sAccText = TrimString (oGuiComponent.AccText)
  let sAccDescription = TrimString (oGuiComponent.AccDescription)

  return (true)

EndFunction

int Function GetGuiComponentPos (object oGuiComponent, int ByRef nLeft, int ByRef nTop, int ByRef nWidth, int ByRef nHeight)

  let nLeft = oGuiComponent.ScreenLeft
  let nTop = oGuiComponent.ScreenTop
  let nWidth = oGuiComponent.Width
  let nHeight = oGuiComponent.Height

  return (true)

EndFunction

int Function GetGuiComponentParent (object oGuiComponent, object ByRef oParent, int ByRef nParentType, string ByRef sParentId)

  let oParent = oGuiComponent.parent
  let nParentType = oParent.typeAsNumber
  let sParentId = oParent.id

  return (true)

EndFunction

int Function GetCurrentGuiComponent ()
var
  int    nElapsed,
  object oParentFrame,
  string idPrevious,
  string sWinTitle,
  string sTmp,
  string sToolbarName,
  handle hCurrentWindow,
  handle hFocusWindow

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    return FALSE
  endif

  if (!g_bGuiComponentIsValid) then

    ; if (g_oSAPGUISession.Busy) then -- ROM 2009/10/20 - use function to check if session is busy (changed also in code below)
    if (IsSAPGUISessionBusy (5, TRUE)) then
      ResetGuiComponent ()
      return FALSE
    endif

    let g_nGuiComponentPreviousType = g_nGuiComponentType
    let g_nGuiComponentPreviousParentType = g_nGuiComponentParentType

    let idPrevious = g_sGuiComponentId

    let g_sGuiComponentPreviousParentId = g_sGuiComponentParentId
    let g_sGuiComponentPreviousFrameId = g_sGuiComponentFrameId

    let g_oGuiComponent = GetSAPGUIFocus ()

    if (!g_oGuiComponent) then
      if (!IsSAPGUIActive () || !IsSAPGUISessionActive ()) then
        /* try to avoid reading out passwords */
        let hFocusWindow = GetFocus ()
        if ((GetWindowTypeCode (hFocusWindow) == WT_UNKNOWN) && (GetTopLevelWindow (hFocusWindow) == GetAppMainWindow (hFocusWindow))) then
          SetLocalTypingEchoMode (ECHO_NONE)
          let g_bTypeEchoDisabled = true
          let g_bGuiComponentIsValid = true
          let hCurrentWindow = GetCurrentWindow ()
          if (hCurrentWindow != 0) then
            let g_hPreviousRealWindow = g_hRealWindow
            let g_hRealWindow = GetRealTitleWindow (hCurrentWindow)
            ; ROM - changed AppMainWindow to RealWindow (2010/02/25)
            ; let hAppMainWindow = GetAppMainWindow (hCurrentWindow)
            ; let hTopLevelWindow = GetTopLevelWindow (hCurrentWindow)
            let sWinTitle = GetWindowName (g_hRealWindow)
            if (StringCompare (sWinTitle, g_sAppMainWindowTitle) != 0) then
              let g_sAppMainWindowTitle = sWinTitle
              if (g_iWarningMessage != 0) then
                UnscheduleFunction (g_iWarningMessage)
              endif
              let g_iWarningMessage = ScheduleFunction ("SayWarningMessage", 10)
            endif
          endif
          return FALSE
        endif
      endif
      ResetGuiComponent ()
      return FALSE
    endif

    ; if (g_oSAPGUISession.Busy) then -- ROM 2009/10/20 - use function to check if session is busy (changed also in code below)
    if (IsSAPGUISessionBusy (2, FALSE)) then
      return FALSE
    endif

    GetGuiComponentProperties (g_oGuiComponent, g_nGuiComponentType, g_bGuiComponentChangeable, g_sGuiComponentId,
      g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, g_sGuiComponentAccText, g_sGuiComponentAccDescription)

    if (g_nGuiComponentType == GUI_TC_GUISHELL) then
      g_sGuiComponentPreviousSubType = g_sGuiComponentSubType
    endif
    g_sGuiComponentSubType = g_oGuiComponent.SubType

    GetGuiComponentPos (g_oGuiComponent, g_nGuiComponentLeft, g_nGuiComponentTop, g_nGuiComponentWidth, g_nGuiComponentHeight)

    /* gather labels, it's tooltips and acc values */

    GetLabelText (g_oGuiComponent, g_sLeftLabelText, g_sRightLabelText, g_sLeftLabelTooltip, g_sRightLabelTooltip, g_sGuiComponentAccLabels)

    /* get some info on current component's "surroundings" */

    GetGuiComponentParent (g_oGuiComponent, g_oGuiComponentParent, g_nGuiComponentParentType, g_sGuiComponentParentId)

    let nElapsed = (GetTickCount () - g_nGuiComponentLastUpdate)
    let g_nGuiComponentLastUpdate = GetTickCount ()

    if (StringCompare (idPrevious, g_sGuiComponentId, true) != 0) then

      let oParentFrame = g_oGuiComponent.parentFrame
      if (!oParentFrame) then
        let g_sGuiComponentFrameId = ""
      else
        let g_sGuiComponentFrameId = TrimString (oParentFrame.id)
      endif
      let oParentFrame = oNull

      let g_bGuiComponentSameAsPrevious = FALSE
      let g_bGuiBoxIsValid = FALSE
      let g_bGuiTabIsValid = FALSE
      let g_bIsOTFPreview = FALSE

      GetCurrentGuiTab ()
      GetCurrentGuiBox ()
      GetGuiTableControlAttributes ()
      GetCurrentStepLoop()

    else

      if (nElapsed > 500) then
        let g_bGuiComponentSameAsPrevious = TRUE
      endif

    endif

    let g_sLstPreviousContainerType = g_sLstContainerType
    let g_bLstIsListElement = g_oGuiComponent.IsListElement
    let g_sLstContainerType = g_oGuiComponent.GetListProperty("ContainerType")

    if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
      GetCurrentABAPListElement ()
    else
      if (!StringIsBlank (g_sLstPreviousContainerType)) then
        ResetABAPListElement ()
        let g_sLstPreviousContainerType = ""
      endif
    endif

    /* check if on the system/application toolbar */
    g_bIsApplicationToolbar = false
    g_bIsSystemToolbar = false
    g_bIsCombinedToolbar = false
    if (g_nGuiComponentParentType == GUI_TC_TOOLBAR) then
      var int nTop1, int nTop2
      var string sId1, string sId2
      var object oAppToolbar, object oSysToolbar

      sId1 = g_oGuiComponent.Parent.Id
      sToolbarName = g_oGuiComponent.Parent.Name
      if (StringCompare (sToolbarName, sSystemToolbarName, true) == 0) then
        sId2 = StringReplaceSubstrings (sId1, sSystemToolbarName, sApplicationToolbarName)
        oAppToolbar = g_oSAPGUISession.findById (sId2)
        nTop1  = g_oGuiComponent.Parent.Top
        nTop2  = oAppToolbar.Top
        if (nTop1 == nTop2) then
          g_bIsCombinedToolbar = true
        endif

        if (DialogActive () == ACTIVE) then
          let g_bIsApplicationToolbar = true
        else
          let g_bIsSystemToolbar = true
        endif
      elif (StringCompare (sToolbarName, sApplicationToolbarName, true) == 0) then
        sId2 = StringReplaceSubstrings (sId1, sApplicationToolbarName, sSystemToolbarName)
        oSysToolbar = g_oSAPGUISession.findById (sId2)
        nTop1  = g_oGuiComponent.Parent.Top
        nTop2  = oSysToolbar.Top
        if (nTop1 == nTop2) then
          g_bIsCombinedToolbar = true
        endif
  
       let g_bIsApplicationToolbar = true
      endif
    endif

    /* check for Belize or newer theme and prepare for footer */
    g_bIsFooter = false
    g_nUserInterfaceGuideline = g_oSAPGUISession.Info.UI_GUIDELINE
    if (g_nUserInterfaceGuideline >= GUI_UI_GUIDELINE_BELIZE) /* Belize or newer */
      var handle hWnd = GetParent (GetFocus ())
      var string sWndTitle = GetWindowName (hWnd)
      if (sWndTitle == sWndNameFooter) then
        let g_bIsFooter = true
        g_bIsApplicationToolbar = false
        g_bIsSystemToolbar = false
      else
        if (g_bFooterWasAnnounced) then
          g_bFooterWasAnnounced = false
          g_bFooterLeft = true
        endif
      endif
    endif

    let g_bGuiComponentIsValid = TRUE

    if (g_nGuiComponentType == GUI_TC_GUISHELL) then
      if (g_sGuiComponentSubType == sGuiInputField) then
        let g_bGuiTextFieldIsValid = false
        GetCurrentGuiTextField ()
      elif (g_sGuiComponentSubType == sGuiComboBox) then
        let g_bGuiTextFieldIsValid = false
        GetCurrentGuiComboBox ()
      else
        let g_bGuiShellIsValid = FALSE
        GetCurrentGuiShell ()
      endif
    elif (g_nGuiComponentType == GUI_TC_CHECKBOX) then
      let g_bGuiCheckBoxIsValid = FALSE
      GetCurrentGuiCheckBox ()
    elif (g_nGuiComponentType == GUI_TC_LABEL) then
      let g_bGuiLabelIsValid = FALSE
      GetCurrentGuiLabel ()
    elif (g_nGuiComponentType == GUI_TC_OKCODEFIELD) then
      let g_bGuiOkCodeFieldIsValid = FALSE
      GetCurrentGuiOkCodeField ()
    elif (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH) then
      let g_bGuiVHViewSwitchIsValid = FALSE
      GetCurrentGuiVHViewSwitch ()
    elif (g_nGuiComponentType == GUI_TC_RADIOBUTTON) then
      let g_bGuiRadioButtonIsValid = FALSE
      GetCurrentGuiRadioButton ()
    elif ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD) || (g_nGuiComponentType == GUI_TC_PASSWORDFIELD)) then
      let g_bGuiTextFieldIsValid = FALSE
      GetCurrentGuiTextField ()
    elif (g_nGuiComponentType == GUI_TC_BUTTON) then
      let g_bGuiButtonIsValid = FALSE
      GetCurrentGuiButton ()
    elif (g_nGuiComponentType == GUI_TC_COMBOBOX) then
      let g_bGuiComboBoxIsValid = FALSE
      GetCurrentGuiComboBox ()
    elif (g_nGuiComponentType == GUI_TC_TAB) then      ; tg : ??? was not active 159133 item 21
       let g_bGuiTabIsValid = FALSE
       GetCurrentGuiTab ()
    elif (g_nGuiComponentType == GUI_TC_SIMPLECONTAINER) then
      let g_bGuiContainerIsValid = FALSE
      GetCurrentGuiContainer()
    elif (g_nGuiComponentType == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER || g_nGuiComponentType == GUI_TC_DOCKSHELL) then
      let g_bGuiSplitterShellIsValid = FALSE
      GetCurrentGuiSplitterShell ()
    elif (g_nGuiComponentType == GUI_TC_USERAREA) then
      let g_bIsOTFPreview = g_oGuiComponent.IsOTFPreview ()
      ; if (g_bIsOTFPreview) then
        ; GetCurrentOTFPreview () - there are no special properties
      ; endif
    elif (g_nGuiComponentType == GUI_TC_STATUSPANE) then
      g_bGuiStatusPaneIsValid = false
      GetCurrentGuiStatusPane ()
    endif

    let g_hGuiFrameWnd = g_oSAPGUIFrame.handle

    if (nElapsed > 500) then
      let g_bWindowTitleChanged = FALSE
    endif
    let hCurrentWindow = GetCurrentWindow ()
    if (hCurrentWindow != 0) then
      let g_hPreviousRealWindow = g_hRealWindow
      let g_hRealWindow = GetRealTitleWindow (hCurrentWindow)
      ; let hAppMainWindow = GetAppMainWindow (hCurrentWindow)
      ; let hTopLevelWindow = GetTopLevelWindow (hCurrentWindow)
      let sWinTitle = GetWindowName (g_hRealWindow)
      if (StringCompare (sWinTitle, g_sAppMainWindowTitle) != 0) then

        let g_sAppMainWindowTitle = sWinTitle
        if (!StringIsBlank (g_sAppMainWindowTitle)) then
          let g_bWindowTitleChanged = TRUE
        endif
      endif
    endif

    let g_oGuiComponent = oNull
    let g_oGuiComponentParent = oNull

    ExitSAPGUIFrame ()

  else

    if (!IsSAPGUIActive ()) then
      let g_bGuiComponentIsValid = FALSE
    endif

  endif

  return (TRUE)

EndFunction

/*
 * ResetGuiComponent
 */

void Function ResetGuiComponent ()

  let g_oGuiComponent = oNull
  let g_oGuiComponentParent = oNull

  let g_nGuiComponentType = GUI_TC_UNKNOWN
  let g_sGuiComponentSubType = ""
  let g_sGuiComponentPreviousSubType = ""
  let g_nGuiComponentParentType = GUI_TC_UNKNOWN
  let g_bGuiComponentChangeable = FALSE

  let g_sGuiComponentId = ""
  let g_sGuiComponentParentColumnName = ""
  let g_sGuiComponentParentColumnTooltip = ""
  let g_sGuiComponentParentTabText = ""
  let g_sGuiComponentPreviousTabText = ""

  let g_nGuiComponentPreviousType = GUI_TC_UNKNOWN
  let g_bGuiComponentSameAsPrevious = FALSE

  let g_bIsPopupDialog = FALSE
  let g_sPopupDialogText = ""

  let g_bFlushing = false

  let g_sStepLoopId = ""

  let g_sGuiComponentAccLabels = ""
  let g_sGuiComponentAccTooltip = ""
  let g_sGuiComponentAccText = ""
  let g_sGuiComponentAccDescription = ""

  let g_nGuiComponentLeft = -1
  let g_nGuiComponentTop  = -1

  let g_sLeftLabelText = ""
  let g_sLeftLabelTooltip = ""
  let g_sRightLabelText = ""
  let g_sRightLabelTooltip = ""

  let g_bIsApplicationToolbar = false
  let g_bIsSystemToolbar = false
  let g_nUserInterfaceGuideline = 0
  let g_bIsFooter = false

  let g_bGuiComponentIsValid = TRUE

  ResetGuiBox ()
  ResetGuiButton ()
  ResetGuiLabel ()
  ResetGuiOkCodeField ()
  ResetGuiVHViewSwitch ()
  ResetGuiShell ()
  ResetGuiSplitterShell ()
  ResetGuiCtrlApoGrid ()
  ResetGuiCombobox ()
  ResetGuiTextField ()
  ResetGuiCheckBox ()
  ResetGuiRadioButton ()

  ResetGuiContainer ()
  ResetABAPListElement ()
  ResetGuiTableControl ()

  ResetGuiStatusPane ()

EndFunction

/*
 * UpdateCurrentGuiComponent
 *
 * Invalidate cached values of current object and get values.
 */

int Function UpdateCurrentGuiComponent ()
var
  int bSuccess

  let g_bGuiComponentIsValid = FALSE

  let g_bGuiCheckBoxIsValid = FALSE
  let g_bGuiBoxIsValid = FALSE
  let g_bGuiTabIsValid = FALSE
  let g_bGuiTextFieldIsValid = FALSE
  let g_bGuiRadioButtonIsValid = FALSE
  let g_bGuiLabelIsValid = FALSE
  let g_bGuiOkCodeFieldIsValid = FALSE
  let g_bGuiVHViewSwitchIsValid = FALSE
  let g_bGuiButtonIsValid = FALSE
  let g_bGuiComboboxIsValid = FALSE
  let g_bGuiTableControlIsValid = FALSE
  let g_bGuiShellIsValid = FALSE
  let g_bGuiSplitterShellIsValid = FALSE
  let g_bGuiStatusPaneIsValid = FALSE

  let bSuccess = GetCurrentGuiComponent ()

  return bSuccess

EndFunction


/*
 * SayCurrentGuiComponent
 */
void Function SayCurrentGuiComponent ()
var
  string sWinTitle,
  int bFooterWasJustLeft = false

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    return
  endif

  if (g_nGuiComponentType == GUI_TC_PASSWORDFIELD) then
    SetLocalTypingEchoMode (ECHO_NONE)
    let g_bTypeEchoDisabled = true
  /* elif (g_nGuiComponentPreviousType == GUI_TC_PASSWORDFIELD) then */
  elif (g_bTypeEchoDisabled && IsSAPGUIActive () && IsSAPGUISessionActive ()) then
    let g_bTypeEchoDisabled = false
    ResetLocalTypingEchoMode ()
  endif

  if ((DialogActive () == ACTIVE) && (GetTopLevelWindow (GetCurrentWindow ()) != g_hGuiFrameWnd)) then
    return
  endif

  if (g_nGuiComponentType == GUI_TC_UNKNOWN) then
    return
  endif

;  if ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentType == GUI_TC_GUISHELL) || (g_nGuiComponentType == GUI_TC_LABEL)) then
;    SetLocalScreenEchoMode (ECHO_NONE)
;  elif ((g_nGuiComponentPreviousType == GUI_TC_COMBOBOX) || (g_nGuiComponentPreviousType == GUI_TC_GUISHELL) || (g_nGuiComponentType == GUI_TC_LABEL)) then
;    ResetLocalScreenEchoMode ()
;  endif

  if (!g_bGuiComponentSameAsPrevious) then
    CheckForGroupEnd ()
  endif

  SayCurrentGuiTabPage ()

  if (!g_bGuiComponentSameAsPrevious) then
    SayCurrentGuiBox ()
  endif

  if (!g_bGuiComponentSameAsPrevious) then
    if (g_bIsFooter) then
      if (!g_bFooterWasAnnounced) then
        Say (msgFooter, OT_CONTROL_GROUP_NAME)
        g_bFooterWasAnnounced = true
      endif
    elif (g_bFooterLeft) then
      Say (msgEndOfFooter, OT_CONTROL_GROUP_NAME)
      g_bFooterLeft = false
      bFooterWasJustLeft = true
    endif

    if (g_nUserInterfaceGuideline < GUI_UI_GUIDELINE_BELIZE) then
      if (StringCompare (g_sGuiComponentPreviousParentId, g_sGuiComponentParentId, true) != 0) then
        if (g_bIsCombinedToolbar) then
          if (!StringContains (g_sGuiComponentPreviousParentId, sApplicationToolbarName) && !StringContains (g_sGuiComponentPreviousParentId, sSystemToolbarName))
            IndicateControlType (WT_TOOLBAR, cscNull, cscNull)
          endif
        elif (g_bIsSystemToolbar) then
          Say (msgSystemToolbar, OT_CONTROL_GROUP_NAME)
        elif (g_bIsApplicationToolbar) then
          Say (msgApplicationToolbar, OT_CONTROL_GROUP_NAME)
        endif
      endif
    else
      /* Belize and newer */
      if (!g_bIsFooter && (g_nGuiComponentParentType == GUI_TC_TOOLBAR)) then
        if (bFooterWasJustLeft || (g_nGuiComponentPreviousParentType != GUI_TC_TOOLBAR)) then
          ; SayString ("*")
          IndicateControlType (WT_TOOLBAR, cscNull, cscNull)
        endif
      endif
    endif
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
      SayCurrentGuiTextField ()
    elif (g_sGuiComponentSubType == sGuiComboBox) then
      SayCurrentGuiComboBox ()
    else
      SayCurrentGuiShell ()
    endif
  elif (g_nGuiComponentType == GUI_TC_CHECKBOX) then
    SayCurrentGuiCheckBox ()
    ; RouteToCurrentGuiComponent ()
  elif (g_nGuiComponentType == GUI_TC_RADIOBUTTON) then
    SayCurrentGuiRadioButton ()
    ; RouteToCurrentGuiComponent ()
  elif ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD) || (g_nGuiComponentType == GUI_TC_PASSWORDFIELD)) then
    SayCurrentGuiTextField ()
  elif (g_nGuiComponentType == GUI_TC_LABEL) then
    SayCurrentGuiLabel ()
    ; RouteToCurrentGuiComponent ()
  elif (g_nGuiComponentType == GUI_TC_OKCODEFIELD) then
    SayCurrentGuiOkCodeField ()
  elif (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH) then
    SayCurrentGuiVHViewSwitch ()
  elif (g_nGuiComponentType == GUI_TC_BUTTON) then
    SayCurrentGuiButton ()
       ; RouteToCurrentGuiComponent ()
  elif (g_nGuiComponentType == GUI_TC_COMBOBOX) then
    SayCurrentGuiComboBox ()
  elif (g_nGuiComponentType == GUI_TC_TAB) then
    SayCurrentGuiTab ()
  elif (g_nGuiComponentType == GUI_TC_SIMPLECONTAINER) then
    SayCurrentGuiContainer()
  elif (g_nGuiComponentType == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER || g_nGuiComponentType == GUI_TC_DOCKSHELL) then
    SayCurrentGuiSplitterShell ()
  elif (g_nGuiComponentType == GUI_TC_STATUSPANE) then
    SayCurrentGuiStatusPane ()
  elif (g_bIsOTFPreview)
    SayCurrentOTFPreview ()
  endif

  if (g_bWindowTitleChanged) then
    if (g_iWindowTitleID != 0) then
      UnscheduleFunction (g_iWindowTitleID)
    endif
    let g_iWindowTitleID = ScheduleFunction ("HandleWindowTitle", 2)
    let g_bWindowTitleChanged = FALSE
  endif

  BrailleRefresh () /* ROM: 2011/11/19 - since JAWS 11 this seems to be necessary */

EndFunction

void Function RouteToCurrentGuiComponent ()

  if (g_nGuiComponentLeft == -1) then
    return
  endif

  if (IsPCCursor ()) then
    SaveCursor ()
    BrailleCursor ()
    MoveTo (g_nGuiComponentLeft, g_nGuiComponentTop)
    NextChunk ()
    ; RouteBrailleToJaws ()
    RestoreCursor ()
  endif

EndFunction

int Function GuiFocusChanged ()
var
  string id,
  object oFocus

  if (!IsSAPGUISessionActive ()) then
    GetSAPGUISession ()
  endif

  if (g_oSAPGUISession && !IsSAPGUISessionBusy (2, TRUE)) then
    let oFocus = GetSAPGUIFocus ()
    let id = oFocus.id
    ExitSAPGUIFrame ()
    let oFocus = oNull
    if (StringCompare (id, g_sGuiComponentId, true) != 0) then
      return TRUE
    endif
  endif

  return FALSE
EndFunction

/*
 **********************************************************************
 ** Function for label/prompts of objects
 **********************************************************************
*/

int Function GetLabelText (object oGuiComponent, string ByRef sLeftLabelText, string ByRef sRightLabelText,
  string ByRef sLeftLabelTooltip, string ByRef sRightLabelTooltip, string ByRef sAccLabels)
var
  int y,
  int z,
  int nType,
  string sSubType,
  string s,
  object oLeftLabel,
  object oRightLabel

  let nType = oGuiComponent.TypeAsNumber
  let sSubType = oGuiComponent.SubType

  sLeftLabelText = ""
  sRightLabelText = ""
  sLeftLabelTooltip == ""
  sRightLabelTooltip = ""

  if (IsInputField (nType, sSubType) == GUI_IF_INPUTFIELDCONTROL) then
    ; sLeftLabelText = oGuiComponent.LabelText
    return
  endif

  let oLeftLabel = oGuiComponent.LeftLabel
  let oRightLabel = oGuiComponent.RightLabel

  let sLeftLabelText  = TrimString (oLeftLabel.Text)
  let sRightLabelText = TrimString (oRightLabel.Text)
  let sLeftLabelTooltip  = TrimString (oLeftLabel.AccTooltip)
  if (StringIsBlank (sLeftLabelTooltip)) then
    let sLeftLabelTooltip  = TrimString (oLeftLabel.Tooltip)
  endif
  let sRightLabelTooltip = TrimString (oRightLabel.AccTooltip)
  if (StringIsBlank (sRightLabelTooltip)) then
     let sRightLabelTooltip = TrimString (oRightLabel.Tooltip)
  endif

  let sAccLabels = ""
  let y = 0
  let z = oGuiComponent.AccLabelCollection.Count -1
  while (y <= z)
    let s = TrimString (oGuiComponent.AccLabelCollection.Item(y).Text)
    if (!StringIsBlank (sAccLabels)) then
      let sAccLabels = sAccLabels + cscSpace + s
    else
      let sAccLabels = s
    endif
    let y = y + 1
  endwhile

  /*
   * ROM 2012/05/21 : suppress left labels on checkboxes with non-empty property "Text" - this fixes a situation where
   * a checkbox is mistakingly associated to a label by the SAPGUI frontend
   */

  if (nType == GUI_TC_CHECKBOX) then
    let s = TrimString (oGuiComponent.Text)
    if (!StringIsBlank (s) && !StringIsBlank (sLeftLabelText)) then
      let sLeftLabelText = ""
      let sLeftLabelTooltip = "" /* ROM 2012/07/05 - suppress also left tooltip */
    endif
  elif (nType == GUI_TC_TEXTFIELD || nType == GUI_TC_CTEXTFIELD || nType == GUI_TC_COMBOBOX) then
    if (StringIsBlank (sLeftLabelText) && StringIsBlank (sAccLabels)) then
      let sLeftLabelText = TrimString (oGuiComponent.Tooltip)
      if (StringIsBlank (sLeftLabelText)) then
        let sLeftLabelText = TrimString (oGuiComponent.DefaultTooltip)
      endif
      if (StringIsBlank (sLeftLabelText)) then
        let sLeftLabelText = TrimString (oGuiComponent.AccTooltip)
      endif
    endif
  endif

  return TRUE

EndFunction

/*
 * 2011/10/28 ROM - separate announcement of right label from other label announcements, so that a right label can be spoken
 * after speaking the control content
 */
string function SayLabelText ()
var
  string info,
  string tooltip

  let info = ""
  let tooltip = ""

  ; ROM: !TODO -> actually, this belongs to the Get... routine
  if ((g_bNewColumn==True) && (g_nGuiComponentParentType == GUI_TC_TABLECONTROL)) then
    if (StringIsBlank (g_sLeftLabelText) && !StringIsBlank (g_sGuiComponentParentColumnName)) then
      let g_sLeftLabelText = g_sGuiComponentParentColumnName
    endif
  endif

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    if (!StringIsBlank (g_sGuiComponentAccLabels)) then
      ; if ((g_sGuiComponentAccLabels != g_sLeftLabelText) && (g_sGuiComponentAccLabels != g_sRightLabelText)) then
      let info = g_sGuiComponentAccLabels
      ; endif
    endif

    if (!StringIsBlank (g_sLeftLabelText)) then
      if (!StringIsBlank (g_sGuiComponentAccLabels)) then
        if (StringCompare (g_sGuiComponentAccLabels, g_sLeftLabelText) != 0) then
          let info = info + cscSpace + g_sLeftLabelText
        endif
      else
        let info = g_sLeftLabelText
      endif
      if (StringCompare (g_sLeftLabelText, g_sLeftLabelTooltip, false) != 0) then
        let tooltip = g_sLeftLabelTooltip
      endif
    else
      if (StringIsBlank (g_sGuiComponentAccLabels)) then
        let info = g_sLeftLabelTooltip
      else
        let tooltip = g_sLeftLabelTooltip
      endif
    endif

    if (!StringIsBlank (info)) then
      Say (info, OT_CONTROL_NAME)
    endif
    if (!StringIsBlank (tooltip)) then
      Say (tooltip, OT_TOOL_TIP)
    endif
  endif

  return (info)

endFunction

void function SayRightLabelText ()

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    if (!StringIsBlank (g_sRightLabelText)) then
      if (StringCompare (g_sGuiComponentAccLabels, g_sRightLabelText) != 0) then
        Say (g_sRightLabelText, OT_TOOL_TIP)
      endif
      if (StringCompare (g_sRightLabelText, g_sRightLabelTooltip, false) != 0) then
        Say (g_sRightLabelTooltip, OT_TOOL_TIP)
      endif
    elif (!StringIsBlank(g_sRightLabelTooltip)) then
      Say (g_sRightLabelTooltip, OT_TOOL_TIP)
    endif
  endif

endFunction

int Function BrailleAddObjectGuiComponentPrompt (int nType)
var
  string type,
  string name,
  string s1,
  string s2,
  string s3

  /* ROM: 2012/07/05 - braille support for group boxes */
  let name = ""
  if (!StringIsBlank (g_sGuiBoxText)) then
    let type = BrailleGetSubtypeString (WT_GROUPBOX)
    let name = g_sGuiBoxText + cscSpace + type
    BrailleAddString (name, 0, 0, 0)
  endif

  let name = ""
  if (!StringIsBlank (g_sLeftLabelText)) then
    let name = g_sLeftLabelText
  elif (!StringIsBlank (g_sGuiComponentAccLabels)) then
    let name = g_sGuiComponentAccLabels
  endif

  if (!StringIsBlank (name)) then
    BrailleAddString (name, 0, 0, 0)
  endif

  return true

EndFunction

; ROM 2009/11/11 - added the following function to braille Right/Acc-Labels
int Function BrailleAddObjectGuiComponentDescriptions (int nType)

  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    if (!g_bInputFieldButtonActivated && !(g_bHistoryIsActive && (g_nHistoryCurIndex > 0))) then
      BrailleAddString (msgBrlSeparator, getCursorCol (), getCursorRow (), getCharacterAttributes ())
      BrailleAddString (g_sInputFieldPromptText, getCursorCol (), getCursorRow (), getCharacterAttributes ())
      BrailleAddString (msgBrlSeparator, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    endif
    return true
  endIf

  if (StringIsBlank (g_sRightLabelText) && StringIsBlank (g_sGuiComponentAccLabels)) then
    return false
  endif

  if (!StringIsBlank (g_sRightLabelText)) then
    BrailleAddString (msgBrlSeparator, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    BrailleAddString (g_sRightLabelText, getCursorCol (), getCursorRow (), getCharacterAttributes ())
  endif

  if (!StringIsBlank (g_sGuiComponentAccLabels)) then
    BrailleAddString (msgBrlSeparator, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    BrailleAddString (g_sGuiComponentAccLabels, getCursorCol (), getCursorRow (), getCharacterAttributes ())
  endif

  return true

EndFunction

int Function BrailleAddObjectGuiComponentState (int nType)

  if (!g_bGuiComponentChangeable) then
    BrailleAddString (BrailleGetStateString(CTRL_GRAYED), 0, 0, 0)
  elif (g_bGuiButtonEmphasized)
    /* only in Belize */
    BrailleAddString (msgBrlStateHighlighted, 0, 0, 0)
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiCheckBox functions
 **********************************************************************
*/

int function GetGuiCheckBox (object oGuiComponent, string ByRef sText, int ByRef bState)

  sText = TrimString (oGuiComponent.Text)
  if (!StringIsBlank (g_sGuiComponentAccText)) then
    let sText = g_sGuiComponentAccText
  endif

  bState = oGuiComponent.Selected

  return true

endFunction

/*
 * GetCurrentGuiCheckBox
 */
int Function GetCurrentGuiCheckBox ()

  if (g_bGuiCheckBoxIsValid) then
    return (TRUE)
  endif

  GetGuiCheckBox (g_oGuiComponent, g_sGuiCheckBoxText, g_bGuiCheckBoxState)

  ; ROM 2010/08/20 - different behaviour for AccTooltips: if AccTooltip is different from standard or
  ; default tooltips, then both act as the tooltip - this has been modified for all components
  let g_sGuiCheckBoxTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiCheckBoxTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiCheckBoxTooltip
    endif
  endif

  if (StringIsBlank (g_sGuiCheckBoxText) && !StringIsBlank (g_sGuiCheckBoxTooltip)) then
    let g_sGuiCheckBoxText = g_sGuiCheckBoxTooltip
  endif

  let g_bFlushing = g_oGuiComponent.Flushing

  let g_bGuiCheckBoxIsValid = TRUE

  return (TRUE)

EndFunction

/*
 * ResetGuiCheckBox
 */
int function ResetGuiCheckBox ()

  let g_bGuiCheckBoxState = false
  let g_sGuiCheckBoxText = ""
  let g_sGuiCheckBoxTooltip = ""
  let g_bFlushing = false

  let g_bGuiCheckBoxIsValid = true

  return (TRUE)

EndFunction

/*
 * SayCurrentGuiCheckBox
 */
Void Function SayCurrentGuiCheckBox ()
Var
  string text,
  string info,
  string s1,
  string s2,
  string sTooltip

  /* ABAP list */

  if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    SayCurrentABAPListElement ()

    if (ShouldItemSpeak (OT_ITEM_STATE)) then
      if (g_bGuiComboboxHighlighted) then
        Say (msgStateHighlighted, OT_ITEM_STATE)
      endif
    endif

    if (g_bGuiComboboxHighlighted) then
      Say (msgHasHotspot, OT_CONTROL_TYPE)
    endif

    ; return ; rom: speak checkbox regardless of being an ABAP list element (?)
  endif

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    ; let info = g_sLeftLabelText+cscSpace+g_sRightLabelText+cscSpace
    SayLabelText ()
  endif

  let text = g_sGuiCheckBoxText
  if ((g_bNewColumn == True) && (g_nGuiComponentParentType == GUI_TC_TABLECONTROL)) then
    if (StringIsBlank (text) && !StringIsBlank (g_sGuiComponentParentColumnName)) then
      if (StringCompare (g_sLeftLabelText, g_sGuiComponentParentColumnName, false) != 0) then
        /* avoid reading it twice */
        let text= g_sGuiComponentParentColumnName
      endif
    endif
  endif

  let info = ""
  let sTooltip = ""

  SayRightLabelText ()

  if (!StringIsBlank (text)) then
    let info = text+cscSpace
    if (ShoulditemSpeak (OT_TOOL_TIP)) then
      if (g_sGuiCheckBoxTooltip != cscNull) then
        let s1 = TrimString (text)
        let s2 = TrimString (g_sGuiCheckBoxTooltip)
        if (StringCompare (s1, s2, false) != 0) then
          let sTooltip = s2
        endif
      endif
    endif
  elif (!StringIsBlank (g_sGuiCheckBoxTooltip)) then
    let info =  g_sGuiCheckBoxTooltip + cscSpace
  endif

  Say (info, OT_CONTROL_NAME)

  if (!g_bGuiComponentChangeable) then
    IndicateControlState (WT_CHECKBOX, CTRL_DISABLED)
  endif

  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
      IndicateControlType (WT_CHECKBOX, cscSpace, cscSpace)
    endif
  endif

  if (ShoulditemSpeak (OT_ITEM_STATE)) then
    if (g_bGuiCheckBoxState) then
      IndicateControlState (WT_CHECKBOX, CTRL_CHECKED)
    else
      IndicateControlState (WT_CHECKBOX, CTRL_UNCHECKED)
    endif
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

  if (g_bIsStepLoop) then
    SayCurrentStepLoop ()
  else
    SayCurrentGuiTableControl ()
  endif

EndFunction

/*
 * Braille functions
 */

int Function BrailleAddObjectGuiCheckBoxName (int nType)
var
  string name

  let name = g_sGuiCheckBoxText
  if (!StringIsBlank (name)) then
    BrailleAddString (name, g_nGuiComponentLeft, g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

Int Function BrailleAddObjectGuiCheckBoxState (int nType)
var
  int state

  let state = g_bGuiCheckBoxState
  if (state) then
    BrailleAddString (BrailleGetStateString(CTRL_CHECKED), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  else
    BrailleAddString (BrailleGetStateString(CTRL_UNCHECKED), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction


/*
 **********************************************************************
 ** GuiPasswordField functions
 **********************************************************************
*/

void function SayCurrentGuiPasswordFieldCharacter ()
  /* the whole purpose of this function is to speak the masked character in password fields */
  var string sChar = StringLeft (StringTrimLeadingBlanks (GetTextBetween (g_nGuiComponentLeft, g_nGuiComponentLeft+g_nGuiComponentWidth)), 1)
  var int nCharValue = GetCharacterValue (sChar)
  if ((nCharValue == 42) || (nCharValue == 59738)) then
    SayString ("*")
    return
  endif
  SayCharacter ()
endFunction

/*
 **********************************************************************
 ** GuiTextField functions
 **********************************************************************
*/

/*
 * ResetGuiTextField
 */

void Function ResetGuiTextField ()

  g_sGuiTextFieldText = ""
  g_sGuiTextFieldIcon = ""
  g_sGuiTextFieldTooltip = ""

  g_bGuiTextFieldNumerical = false
  g_nGuiTextAttachedToButton = 0
  g_bGuiTextFieldHighlighted = false
  g_bGuiTextFieldRequired = false
  g_bGuiTextFieldIsHotspot = false

  g_bInputFieldButtonActivated = false
  g_sInputFieldButtonTooltip = ""
  g_sInputFieldPromptText = ""

  g_nHistoryEntries = 0
  g_nHistoryCurIndex = 0
  g_bHistoryIsActive = false
  g_sHistoryCurEntry = ""

EndFunction

/*
 * GetCurrentGuiTextField
 */
int Function GetCurrentGuiTextField ()
Var
  object oCollHistoryList,
  int bChangeable,
  int x1, int y1, int x2, int y2,
  object oLabel,
  string s1,
  string s

  if (g_bGuiTextFieldIsValid) then
    return (TRUE)
  endif

  /* ROM 2010/01/15 - handling of history added */
  g_nHistoryEntries = 0
  g_nHistoryCurIndex = 0
  g_sHistoryCurEntry = ""
  g_bHistoryIsActive = g_oGuiComponent.HistoryIsActive
  if (g_bHistoryIsActive) then
    oCollHistoryList = g_oGuiComponent.HistoryList
    g_sHistoryCurEntry = g_oGuiComponent.HistoryCurEntry
    g_nHistoryCurIndex = g_oGuiComponent.HistoryCurIndex
    g_nHistoryCurIndex = g_nHistoryCurIndex + 1
    g_nHistoryEntries = oCollHistoryList.Count
    oCollHistoryList = oNull
  endif

  if (IsPCCursor ()) then
    let x1 = g_nGuiComponentLeft
    let x2 = g_nGuiComponentLeft+g_nGuiComponentWidth
    let y1 = g_nGuiComponentTop
    ; let y2 = g_nGuiComponentTop+g_nGuiComponentHeight
    let y2 = GetWindowBottom (GetAppMainWindow (GetFocus ()))
    SaveCursor ()
    JawsCursor ()
    if (IsCursorInRect (x1-16, y1-16, x2, y2)) then
      MoveTo (x1-16, y1)
    endif
    RestoreCursor ()
  endif

  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    g_sLeftLabelText = g_oGuiComponent.LabelText
    g_sGuiTextFieldText = g_oGuiComponent.Text
    g_bInputFieldButtonActivated = g_oGuiComponent.FindButtonActivated
    g_sInputFieldButtonTooltip = g_oGuiComponent.ButtonTooltip
    g_sInputFieldPromptText = g_oGuiComponent.PromptText
    g_bGuiTextFieldIsValid = true
    return
  endif

  let g_bGuiTextFieldNumerical = g_oGuiComponent.Numerical

  if (g_nGuiComponentType == GUI_TC_PASSWORDFIELD) then
    SaveCursor ()
    PcCursor ()
    let g_sGuiTextFieldText = GetChunk ()
    RestoreCursor ()
  else
    let g_sGuiTextFieldText = g_oGuiComponent.Text
    if (!StringIsBlank (g_sGuiComponentAccText)) then
      let g_sGuiTextFieldText = g_sGuiComponentAccText
    endif
  endif

  if (g_bGuiTextFieldNumerical) then
    let g_sGuiTextFieldText = g_oSAPGUISession.AsStdNumberFormat (g_sGuiTextFieldText)
  endif

  let g_sGuiTextFieldTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiTextFieldTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiTextFieldTooltip
    endif
  endif

  let bChangeable =  g_oGuiComponent.Changeable
  let g_bGuiTextFieldReadOnly = FALSE
  if (bChangeable==FALSE) then
    let g_bGuiTextFieldReadOnly = TRUE
  endif

  let g_bGuiTextFieldHighlighted = g_oGuiComponent.Highlighted
  let g_bGuiTextFieldRequired = g_oGuiComponent.Required
  let g_bGuiTextFieldIsHotspot = g_oGuiComponent.IsHotspot

  let g_sGuiTextFieldIcon = g_oGuiComponent.IconName

  /*
   * Check labels if they are actually buttons (radio buttons or checkboxes)
   */
  let g_nGuiTextAttachedToButton = 0
  let oLabel = g_oGuiComponent.LeftLabel
  if (!oLabel) then
    let oLabel = g_oGuiComponent.RightLabel
  endif
  if (oLabel) then
    var int nType = oLabel.typeAsNumber
    if (nType == GUI_TC_RADIOBUTTON) then
      GetGuiRadioButton (oLabel, g_sGuiRadioButtonText, g_bGuiRadioButtonState, g_nGuiRadioButtonGroupPos, g_nGuiRadioButtonGroupCount)
      g_nGuiTextAttachedToButton = nType
    elif (nType ==GUI_TC_CHECKBOX) then
      GetGuiCheckBox (oLabel, g_sGuiCheckBoxText, g_bGuiCheckBoxState)
      g_nGuiTextAttachedToButton = nType
    endif
  endif

  let g_bGuiTextFieldIsValid = TRUE

  return (TRUE)

EndFunction


/*
 * SayGuiTextField
 */
Void Function SayCurrentGuiTextField ()
Var
  string info,
  string sLabel

  /* ABAP list */
  if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    SayCurrentABAPListElement ()

    if (ShouldItemSpeak (OT_ITEM_STATE)) then
      if (g_bGuiTextFieldHighlighted) then
        Say (msgStateHighlighted, OT_ITEM_STATE)
      endif
    endif

    if (g_bGuiTextFieldIsHotspot) then
      Say (msgHasHotspot, OT_CONTROL_TYPE)
    endif

    return
  endif

  /* ROM 2010/01/15 - speak current history list entry if history is active */
  if (g_bHistoryIsActive && (g_nHistoryCurIndex > 0)) then
    info = g_sHistoryCurEntry
    Say (info, OT_CONTROL_NAME)
    info = FormatString (msgItemPosition, IntToString(g_nHistoryCurIndex), IntToString(g_nHistoryEntries))
    Say (info, OT_POSITION)
    return
  endif

  info = ""
  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    if (g_bInputFieldButtonActivated) then
      info = g_sLeftLabelText + cscSpace + g_sInputFieldButtonTooltip
      IndicateControlType (WT_BUTTON, info, "")
      SayTutorialHelp (WT_BUTTON, false)
      return
    endif

    if (!StringIsBlank (g_sInputFieldPromptText)) then
      info = g_sLeftLabelText + cscSpace + g_sInputFieldPromptText
    else
      info = g_sLeftLabelText
    endif
    IndicateControlType (WT_EDIT, info, g_sGuiTextFieldText)

    if (StringIsBlank (g_sInputFieldPromptText)) then
      SayTutorialHelp (WT_EDIT, false)
    endif

    return
  endif

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    ; let info = g_sLeftLabelText+cscSpace+g_sRightLabelText+cscSpace
    let sLabel = SayLabelText ()
  endif

  let info = ""
  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop))    then
      if (ShouldItemSpeak (OT_ITEM_STATE)) then
        if (g_bGuiTextFieldHighlighted!=FALSE) then
          let info = info + cscSpace + msgStateHighlighted + cscSpace
        endif
        if (g_bGuiTextFieldReadOnly && StringIsBlank (g_sGuiTextFieldIcon)) then
          let info = info + cscSpace + msgStateReadOnly+cscSpace
        endif
        if (g_bGuiTextFieldRequired!=FALSE) then
          let info = info + cscSpace + msgStateRequired+cscSpace
        endif
        if (!StringIsBlank (info)) then
          Say (info, OT_ITEM_STATE)
        endif
        let info = ""
      endif
      if g_nGuiComponentType==GUI_TC_PASSWORDFIELD then
        let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_PASSWORDEDIT)) + cscSpace
      elif g_nGuiComponentType==GUI_TC_CTEXTFIELD then
        let info = info+msgGuiCTextField+cscSpace
      else
        if (g_bGuiTextFieldIsHotspot == FALSE) then
          ; tg : 06.07.2004 : changed to detect selection operator icons = != <> ...
          ;if (StringIsBlank (g_sLeftLabelText) && StringIsBlank (g_sRightLabelText) && !StringIsBlank (g_sGuiTextFieldIcon)) then
          if (!StringIsBlank (g_sGuiTextFieldIcon)) then
            let info = info + msgGuiIcon + cscSpace
          else
            let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT)) + cscSpace
          endif
        else
          if (!StringIsBlank (g_sGuiTextFieldIcon)) then
            let info = info + msgGuiIcon + cscSpace + msgHasHotspot + cscSpace
          else
            let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT)) + cscSpace + msgHasHotspot + cscSpace
          endif
        endif
      endif

      Say (info, OT_CONTROL_TYPE)
      let info = ""

      /*
       * add button information if this edit is attached to one
       */
      if (g_nGuiTextAttachedToButton != 0) then
        if (g_nGuiTextAttachedToButton == GUI_TC_RADIOBUTTON) then
          info = info + msgLabelHasType + cscSpace + smmStripMarkup (smmGetStartMarkupForControlType (WT_RADIOBUTTON)) + cscSpace
          Say (info, OT_CONTROL_TYPE)
          if (ShoulditemSpeak (OT_ITEM_STATE)) then
            if (g_bGuiRadioButtonState) then
              let info = msgGuiRadioButtonSelected
            else
              let info = msgGuiRadioButtonNotSelected
            endif
            Say (info, OT_ITEM_STATE)
          endif
          if (ShouldItemSpeak (OT_ITEM_NUMBER) && (g_nGuiRadioButtonGroupPos != 0) && (g_nGuiRadioButtonGroupCount != 0)) then
            let info = FormatString (msgGuiRadioButtonPosition, IntToString(g_nGuiRadioButtonGroupPos), IntToString(g_nGuiRadioButtonGroupCount))
            Say (info, OT_ITEM_NUMBER)
          endif
        elif (g_nGuiTextAttachedToButton == GUI_TC_CHECKBOX) then
          info = info + msgLabelHasType + cscSpace + smmStripMarkup (smmGetStartMarkupForControlType (WT_CHECKBOX)) + cscSpace
          Say (info, OT_CONTROL_TYPE)
          if (ShoulditemSpeak (OT_ITEM_STATE)) then
            if (g_bGuiCheckBoxState) then
              IndicateControlState (WT_CHECKBOX, CTRL_CHECKED)
            else
              IndicateControlState (WT_CHECKBOX, CTRL_UNCHECKED)
            endif
          endif
        endif
      endif /* attached to button */

    endif
  endif

  let info = ""
  if (g_sGuiTextFieldText!=cscNull) then
    let info = info + g_sGuiTextFieldText+cscSpace
  else
    if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
      info = info + msgBlank
    endif
  endif

  Say (info, OT_DIALOG_TEXT)

  SayRightLabelText ()

  let info = ""
  if (ShoulditemSpeak (OT_TOOL_TIP)) then
    /* ROM 2010/08/18: avoid announcement of tooltip if it is the same as LeftLabel/AccLabel(s) */
    let info = TrimString (g_sGuiTextFieldTooltip)
    if (StringCompare (TrimString(sLabel), info, false) != 0) then
      Say (info, OT_TOOL_TIP)
    endif
  endif

  if (g_bIsStepLoop) then
    SayCurrentStepLoop ()
  else
    SayCurrentGuiTableControl ()
  endif

  if (g_bGuiTextFieldIsHotspot) then
    Say (msgHotspotTutor, OT_TUTOR, false)
  endif

  if (ShouldItemSpeak (OT_TUTOR)) then
    if (!g_bGuiTextFieldReadOnly)
      SayTutorialHelp (WT_EDIT, false)
      /* ROM: announcing tutor message for single line edits would not be useful as up/down arrow leaves the edit */
      ; else SayTutorialHelp (WT_READONLYEDIT, false)
    endif
  endif

EndFunction

/* for saying correct entry in history */

void function UpdateAndSayGuiTextField ()
  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()
endfunction

/*
 * GuiText Braille functions
 */

int Function BrailleAddObjectGuiTextFieldText (int nType)
var
  int x, int y

  /* ROM 2010/01/15 - here and in other Braille functions: added handling of current history list entry if history is active */
  if (g_bHistoryIsActive && (g_nHistoryCurIndex > 0)) then
    BrailleAddString (g_sHistoryCurEntry, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    return true
  endif

  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    if (g_bInputFieldButtonActivated) then
      BrailleAddString (g_sInputFieldButtonTooltip, 0, 0, 0)
      BrailleAddString (BrailleGetSubTypeString (WT_BUTTON), 0, 0, 0)
      return true
    endif
  endif

  if (g_bGuiTextFieldIsHotspot) then
    BrailleAddString (msgBrlIsHotspot,   getCursorCol (), getCursorRow (), getCharacterAttributes ())
  endif

  ; if (g_sGuiTextFieldText != cscNull) then
    if (CaretVisible ()) then
      ; PerformScript RouteBrailleToActiveCursor ()
      /* BrailleAddTextBetween (g_nGuiComponentLeft, g_nGuiComponentLeft+g_nGuiComponentWidth) */
      var int nLeftOffset = 0, int nRightOffset = 0
      var string sText = GetTextBetween (g_nGuiComponentLeft, g_nGuiComponentLeft+g_nGuiComponentWidth)

      if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
        ; if (!g_bInputFieldButtonActivated) then
          BrailleAddFocusItem ()
        ; endif
      else
        if (!StringIsBlank (StringLeft (g_sGuiTextFieldText, 1))) then
          sText = StringTrimLeadingBlanks (sText)
        endif
        if (StringCompare (g_sGuiTextFieldText, sText, true) != 0) then
          while ((nLeftOffset < 4) && (StringLeft (g_sGuiTextFieldText, 1) != StringLeft (sText, 1)))
            nLeftOffset = nLeftOffset + 1
            sText = GetTextBetween (g_nGuiComponentLeft+nLeftOffset, g_nGuiComponentLeft+g_nGuiComponentWidth-nRightOffset)
            if (!StringIsBlank (StringLeft (g_sGuiTextFieldText, 1))) then
              sText = StringTrimLeadingBlanks (sText)
            endif
          endwhile
          while ((nRightOffset < 4) && (StringRight (g_sGuiTextFieldText, 1) != StringRight (sText, 1)))
            nRightOffset = nRightOffset + 1
            sText = GetTextBetween (g_nGuiComponentLeft+nLeftOffset, g_nGuiComponentLeft+g_nGuiComponentWidth-nRightOffset)
          endwhile
        endif

        BrailleAddTextBetween (g_nGuiComponentLeft+nLeftOffset, g_nGuiComponentLeft+g_nGuiComponentWidth-nRightOffset)
        ; BrailleAddField (false)
        ; BrailleAddFocusItem ()
      endif
    else
      if (g_nGuiComponentType == GUI_TC_PASSWORDFIELD) then
        sText = StringTrimLeadingBlanks (GetTextBetween (g_nGuiComponentLeft, g_nGuiComponentLeft+g_nGuiComponentWidth))
        BrailleAddString (sText, getCursorCol (), getCursorRow (), getCharacterAttributes ())
      else
        if ((IsInputField () != GUI_IF_INPUTFIELDCONTROL) || !g_bInputFieldButtonActivated) then
          BrailleAddString (g_sGuiTextFieldText, getCursorCol (), getCursorRow (), getCharacterAttributes ())
        endif
      endif
    endif
  ; endif

  ; ROM 2009/11/11 :
  ; - icon type added
  if (!StringIsBlank (g_sGuiTextFieldIcon)) then
    BrailleAddString (msgBrlIcon, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    if (!StringIsBlank (g_sGuiTextFieldTooltip)) then
      BrailleAddString (g_sGuiTextFieldTooltip,  getCursorCol (), getCursorRow (), getCharacterAttributes ())
    endif
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiTextFieldState (int nType)
Var
  string info

  if (g_bHistoryIsActive && (g_nHistoryCurIndex > 0)) then
    return FALSE
  endif

  let info = ""
  if (g_nGuiTextAttachedToButton != 0) then
    if (g_nGuiTextAttachedToButton == GUI_TC_RADIOBUTTON) then
      BrailleAddObjectGuiRadioButtonState (WT_CUSTOM_CONTROL_BASE + GUI_WT_RADIOBUTTON)
      BrailleAddObjectGuiRadioButtonPosition (WT_CUSTOM_CONTROL_BASE + GUI_WT_RADIOBUTTON)
    elif (g_nGuiTextAttachedToButton == GUI_TC_CHECKBOX) then
      BrailleAddObjectGuiCheckBoxState (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
    endif
  endif

  let info = ""
  if (StringIsBlank (g_sGuiTextFieldIcon)) then
    /*
     * ROM - read only status handled for type (2009/10/19)
     */
    ; if (g_bGuiTextFieldReadOnly!=FALSE) then
    ;   let info = info + msgBrlStateReadOnly
    ; else
    if (g_bGuiTextFieldHighlighted!=FALSE) then
      let info = info + msgBrlStateHighlighted+cscSpace
    endif
    if (g_bGuiTextFieldRequired!=FALSE) then
      let info = info + msgBrlStateRequired
    endif
  ; endif
  endif

  if (StringRight(info,1)==cscSpace) then
    let info = StringLeft(info,StringLength(info)-1 )
  endif

  ; ROM 2009/11/11 - right label brailled now on the right side of text field text

  if (!StringIsBlank (info)) then
    BrailleAddString (info, 0, 0, 0)
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiTextFieldPosition (int nType)
Var
  string info

  if (!g_bHistoryIsActive || (g_nHistoryCurIndex < 1)) then
    return FALSE
  endif

  let info = FormatString (msgItemPosition, IntToString(g_nHistoryCurIndex), IntToString(g_nHistoryEntries))
  BrailleAddString (info, 0, 0, 0)

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiSimpleContainer - StepLoop
 **********************************************************************
*/

Int Function GetCurrentStepLoop ()
var
  int     colIdx,
  int     rowIdx,
  int      bIsSteploopInTable,
  string  thisStepLoopId

  let g_bIsStepLoop = FALSE
  if (!g_nSapGuiSteploopMode) then
    return TRUE ; // steploop recognition mode is off
  endif


  if (g_oGuiComponent.Parent.TypeAsNumber == GUI_TC_SIMPLECONTAINER) then
    if (g_oGuiComponent.Parent.IsStepLoop) then
      bIsSteploopInTable = g_oGuiComponent.Parent.IsStepLoopinTableStructure
      if (!bIsSteploopInTable) then
        g_bIsStepLoop = false
        return
      endif
      let g_bIsStepLoop = TRUE
      let g_iLoopColCount = g_oGuiComponent.Parent.LoopCurrentColCount
      if (g_iLoopColCount == 0) then
        let g_iLoopColCount = g_oGuiComponent.Parent.LoopColCount ; fallback  for older SAPGUIs
      endif
      let g_iLoopRowCount = g_oGuiComponent.Parent.LoopRowCount

      let colIdx = g_oGuiComponent.Parent.LoopCurrentCol+1
      if (colIdx != g_iLoopCurrentCol) then
        let g_bNewColumn = TRUE
      else
        let g_bNewColumn = FALSE
      endif
      let g_iLoopCurrentCol = colIdx

      let rowIdx = g_oGuiComponent.Parent.LoopCurrentRow+1
      if (rowIdx != g_iLoopCurrentRow) then
        let g_bNewRow = TRUE
      else
        let g_bNewRow = FALSE
      endif
      let g_iLoopCurrentRow = rowIdx

      if (StringCompare (g_sLeftLabelText, g_sStepLoopColTitle, false) != 0) then
        let g_bNewColumn = TRUE
      endif

      let g_sStepLoopColTitle = g_sLeftLabelText
      let thisStepLoopId = g_oGuiComponentParent.Id
      if (StringCompare (g_sStepLoopId, thisStepLoopId, true) != 0) then
        let g_bNewStepLoop = TRUE
        let g_bNewColumn = TRUE
      else
        let g_bNewStepLoop = FALSE
      endif
      let g_sStepLoopId = thisStepLoopId
    endif

  else
    let g_sStepLoopId = g_oGuiComponentParent.Id
    let g_sStepLoopColTitle = ""
    let g_bIsStepLoop = FALSE
    ; let g_bNewColumn = FALSE
    ; let g_bNewRow = FALSE
    let g_iLoopColCount     = -1
    let g_iLoopRowCount    = -1
    let g_iLoopCurrentCol    = -1
    let g_iLoopCurrentRow  = -1
  endif

  return TRUE

EndFunction


Void Function SayCurrentStepLoop ()
var
  string msg

  if (!g_nSapGuiSteploopMode) then
    return TRUE ; // steploop recognition mode is off
  endif

  if (g_nGuiComponentParentType == GUI_TC_SIMPLECONTAINER) then
    if (g_bIsStepLoop == TRUE) then
      if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
        if (g_bNewStepLoop == True) then
          let msg = msgStepLoop + cscSpace
          let msg = msg + FormatString(msgStepLoopRowsTotal, IntToString(g_iLoopRowCount))
          Say (msg, OT_CONTROL_TYPE)
        endif
      endif
      if (ShoulditemSpeak (OT_POSITION)) then
        if ((g_bNewColumn) || (StringIsBlank (g_sStepLoopColTitle))) then
          if ((g_iLoopCurrentCol > 0) && (g_iLoopColCount > 0)) then
            let msg = FormatString (msgTablePositionCols, IntToString(g_iLoopCurrentCol), IntToString(g_iLoopColCount))
            Say (msg, OT_POSITION)
          endif
        endif
        if (g_iLoopCurrentRow > 0 && g_iLoopRowCount > 0) then
          let msg = FormatString(msgTablePositionRows,IntToString(g_iLoopCurrentRow),IntToString(g_iLoopRowCount))
            Say (msg, OT_POSITION)
        endif
        if (g_iLoopCurrentRow == g_iLoopRowCount) then
          if (g_iLoopCurrentCol == g_iLoopColCount) then
            Say (msgStepLoopLastCell, OT_POSITION)
          elif (g_bNewRow) then
            Say (msgStepLoopLastRow, OT_POSITION)
          endif
        endif
      endif
    endif
  endif

EndFunction


/*
 **********************************************************************
 ** GuiButton functions
 **********************************************************************
*/

string Function SysTbBtnText (string sButtonName)
var string sButtonText

  let sButtonText = ""

  if (StringCompare (sButtonName, sBtnNameSave) == 0) then
    let sButtonText = msgBtnTextSave
  elif (StringCompare (sButtonName, sBtnNameBack) == 0) then
    let sButtonText = msgBtnTextBack
  elif (StringCompare (sButtonName, sBtnNameExit) == 0) then
    let sButtonText = msgBtnTextExit
  elif (StringCompare (sButtonName, sBtnNameCancel) == 0) then
    let sButtonText = msgBtnTextCancel
  elif (StringCompare (sButtonName, sBtnNamePrint) == 0) then
    let sButtonText = msgBtnTextPrint
  elif (StringCompare (sButtonName, sBtnNameFind) == 0) then
    let sButtonText = msgBtnTextFind
  elif (StringCompare (sButtonName, sBtnNameFindNext) == 0) then
    let sButtonText = msgBtnTextFindNext
  elif (StringCompare (sButtonName, sBtnNameFirstPage) == 0) then
    let sButtonText = msgBtnTextFirstPage
  elif (StringCompare (sButtonName, sBtnNamePreviousPage) == 0) then
    let sButtonText = msgBtnTextPreviousPage
  elif (StringCompare (sButtonName, sBtnNameNextPage) == 0) then
    let sButtonText = msgBtnTextNextPage
  elif (StringCompare (sButtonName, sBtnNameLastPage) == 0) then
    let sButtonText = msgBtnTextLastPage
  elif (StringCompare (sButtonName, sBtnNameCreateSession) == 0) then
    let sButtonText = msgBtnTextCreateSession
  elif (StringCompare (sButtonName, sBtnNameGenerateShortcut) == 0) then
    let sButtonText = msgBtnTextGenerateShortcut
  elif (StringCompare (sButtonName, sBtnNameStartAccCheck) == 0) then
    let sButtonText = msgBtnTextStartAccCheck
  elif (StringCompare (sButtonName, sBtnNameHelp) == 0) then
    let sButtonText = msgBtnTextHelp
  elif (StringCompare (sButtonName, sBtnNameOkCode) == 0) then
    let sButtonText = msgBtnTextOkCode
  elif (StringCompare (sButtonName, sBtnNameCommandField) == 0) then
    let sButtonText = msgBtnCommandField
  elif (StringCompare (sButtonName, sBtnNameLocalLayout) == 0) then ; ROM 2010/11/26 - wrong internal button name was used
    let sButtonText = msgBtnLocalLayout
  endif

  return sButtonText

EndFunction

/*
 * GetCurrentGuiButton
 */

int Function GetCurrentGuiButton ()
var
  int nIdx,
  object oFound,
  string sButtonName,
  string sSearchName,
  string sIconName,
  string sFoundTooltip,
  string sEditId,
  string sPath,
  string sCEditId
 
  if (g_bGuiButtonIsValid) then
    return (TRUE)
  endif

  let g_sGuiButtonText = TrimString (g_oGuiComponent.Text)
  if (!StringIsBlank (g_sGuiComponentAccText)) then
    let g_sGuiButtonText = g_sGuiComponentAccText
  endif

  let g_sGuiButtonTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiButtonTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiButtonTooltip
    endif
  endif

  ; let o = g_oGuiComponent.Parent
  ; let g_bGuiButtonParentIsToolbar = FALSE
  ; if (g_nGuiComponentParentType == GUI_TC_TOOLBAR) then
  ;   let g_bGuiButtonParentIsToolbar = TRUE
  ; endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    if (g_oGuiComponent.Parent.CurrentRow==-2) && (g_oGuiComponent.Parent.CurrentCol==-1) then
      let g_sGuiButtonText = msgGuiButtonTableSettings
      ; let g_sGuiButtonTooltip = msgGuiButtonTableSettings
    endif
  endif

  if (g_bIsSystemToolbar) then
    /* kludge for unavailable sys tb buttons */
    /*
     * ROM 2010/08/06:
     * 1. fixed: wrong tooltip was used
     * 2. refreshing the braille line seems to be necessary
     * 3. for signature theme: added some labels for unavailable buttons (in function SysTbBtnText)
     */
    if (!g_bGuiComponentChangeable && StringIsBlank (g_sGuiButtonText) && StringIsBlank (g_sGuiButtonTooltip)) then
      let g_sGuiButtonTooltip = SysTbBtnText (g_oGuiComponent.Name)
    endif
    BrailleRefresh ()
  endif

  if (g_nMultipleSelectionVerbosity != 0) then
    if (g_nGuiComponentType == GUI_TC_BUTTON) then
      sIconName = g_oGuiComponent.IconName
      if (StringCompare (sIconName, "B_MORE", true) == 0) then
        if (StringContains (CTXT_MULTIPLE_SELECTION_BUTTON, g_sGuiComponentTooltip)) then
          /* kludge for multiple selection buttons */
          sButtonName = g_oGuiComponent.Name
          sSearchName = StringChopLeft (sButtonName, 2)
          nIdx = StringContains (sSearchName, "_%")
          if (nIdx != 0)
            sSearchName = StringLeft (sSearchName, nIdx-1)
            nIdx = StringContains (g_sGuiComponentId, "/btn" + sButtonName)
            sPath = StringLeft (g_sGuiComponentId, nIdx)
            sCEditId = sPath + "ctxt" + sSearchName + "-HIGH"
            sEditId = sPath + "txt" + sSearchName + "-HIGH"
            oFound = g_oSAPGUISession.findById (sCEditId)
            if (!oFound) then
              oFound = g_oSAPGUISession.findById (sEditId)
            endif
            if (oFound) then
              sFoundTooltip = oFound.DefaultTooltip
              g_sGuiButtonText = g_sGuiButtonTooltip + cscSpace + sFoundTooltip
              g_sGuiButtonTooltip = ""
            endif
          endif
        endif
      endif
    endif
  endif

  /* rom 2017/12/13: kludge for "more" buttons in application and footer toolbar which are actually menubuttons */
  g_sGuiButtonType = "" 
  if (g_bIsApplicationToolbar || g_bIsFooter) then
    var string sTmpName = g_oGuiComponent.Name
    if (!StringCompare(sTmpName, sBtnNameMore, true) || !StringCompare(sTmpName, sBtnNameFooterMore)) then
      g_sGuiButtonType = sGuiMenu
    endif
  endif

  g_bGuiButtonEmphasized = false
  if (g_nUserInterfaceGuideline >= GUI_UI_GUIDELINE_BELIZE) then
    if (g_bIsFooter || (g_nGuiComponentParentType == GUI_TC_TOOLBAR))
      g_bGuiButtonEmphasized = g_oGuiComponent.Emphasized
    endif
  endif   

  let g_bGuiButtonIsValid = TRUE

  return (TRUE)

EndFunction

/*
 * ResetGuiButton
 */

void Function ResetGuiButton ()

  g_sGuiButtonTooltip = ""
  g_sGuiButtonText = ""
  g_sGuiButtonType = ""
  ; let g_bGuiButtonShouldSpeak = TRUE
  g_bGuiButtonIsTableSettings = FALSE
  g_bGuiButtonEmphasized = FALSE

  g_bGuiButtonIsValid = TRUE

  g_bGuiComponentChangeable = TRUE

EndFunction

/*
 * SayCurrentGuiButton
 */
Void Function SayCurrentGuiButton ()
Var
  string info,
  string sTooltip

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    SayLabelText ()
  endif

  let info = ""
  let sTooltip = ""
  if (!StringIsBlank (g_sGuiButtonText)) then
    if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
      var string sTmpName = StringSegment (g_sGuiComponentId, "/", StringSegmentCount (g_sGuiComponentId, "/"))
      if (sTmpName==sBtnNameTableSettings) then
        Say (g_sGuiTableControlTitle, OT_CONTROL_NAME)
      endif
    endif

    info = g_sGuiButtonText

    if (ShoulditemSpeak (OT_TOOL_TIP)) then
      if (g_sGuiButtonTooltip != cscNull) then
        if (g_nUserInterfaceGuideline >= GUI_UI_GUIDELINE_BELIZE) then
          if (g_nGuiComponentParentType == GUI_TC_TOOLBAR) then
            var int nLength = StringLength (g_sGuiButtonText)
            if (StringCompare (g_sGuiButtonText, StringLeft (g_sGuiButtonTooltip, nLength), false) == 0)
              sTooltip = StringChopLeft (g_sGuiButtonTooltip, nLength)
            else
              sTooltip = g_sGuiButtonTooltip
            endif
          elif (StringCompare (g_sGuiButtonText, g_sGuiButtonTooltip, false) != 0) then
            sTooltip = g_sGuiButtonTooltip
          endif
        elif (StringCompare (g_sGuiButtonText, g_sGuiButtonTooltip, false) != 0) then
          sTooltip = g_sGuiButtonTooltip
        endif
      endif
    endif
  elif (!StringIsBlank (g_sGuiButtonTooltip)) then
    let info =  g_sGuiButtonTooltip
  endif
  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
    let info =""
  endif

  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    /* ROM 2017/12/15 - added announcement of more menubutton */
    if (!StringCompare (g_sGuiButtonType, sGuiMenu, true)) then
      info = smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTONMENU)) + cscSpace
    elif ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
      if (g_bGuiComponentChangeable == False) then
        let info = smmStripMarkup (smmGetStartMarkupForControlState (WT_BUTTON, CTRL_DISABLED)) + cscSpace
      elif (g_bGuiButtonEmphasized)
        /* only in Belize */
        info = info + msgStateHighlighted
      endif
      let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTON)) + cscSpace
    endif
  endif
  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_TYPE)
  endif

  SayRightLabelText ()

  if (g_bGuiButtonEmphasized) then
    /* only in Belize */
    if (!g_bIsFooter) then
      SayString (msgChangeModeButton)
    endif
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

  if (g_bIsStepLoop) then
    SayCurrentStepLoop ()
  else
    SayCurrentGuiTableControl ()
  endif

  if (ShouldItemSpeak (OT_TUTOR)) then
    SayTutorialHelp (WT_BUTTON,false)
  endif

EndFunction

int Function BrailleAddObjectGuiButtonName (int nType)
var
  string text

  let text = ""
  if (g_sGuiButtonText != cscNull) then
    let text = g_sGuiButtonText
  endif

  if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(g_sGuiButtonTooltip)) then
    var string s1 = TrimString (g_sGuiButtonText)
    var string s2 = TrimString (g_sGuiButtonTooltip)
    if (StringCompare (s1, s2, false) != 0) then
      text = s1 + cscSpace + BrailleGetSubtypeString (WT_TOOLTIP) + cscSpace + s2
    endif
  endif

  if (text != cscNull) then
    BrailleAddString (text, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiToolbar + GridView toolbar functions
 **********************************************************************
*/

int Function GetCurrentToolbar ()

  if (g_bToolbarIsValid) then
    return (TRUE)
  endif

  if (g_sGuiComponentSubType == sGuiToolbar) then
    let g_nToolbarFocusedButton = g_oGuiComponent.FocusedButton

    if (g_nToolbarFocusedButton != -1) then

      ; ROM - 2011/03/17 - apparently, wrong index used for state "checked" was used
      let g_bToolbarButtonChecked = g_oGuiComponent.GetButtonChecked (g_nToolbarFocusedButton)
      let g_bToolbarButtonEnabled = g_oGuiComponent.GetButtonEnabled (g_nToolbarFocusedButton)

      let g_sToolbarButtonText = g_oGuiComponent.GetButtonText (g_nToolbarFocusedButton)

    /* ROM - 2012/11/26 - property AccText is related to GUI object (toolbar/ALV) and not a specific button, so it should not override
     * button text - deleted checking AccText as alternative to button text */

      let g_sToolbarButtonType = g_oGuiComponent.GetButtonType (g_nToolbarFocusedButton)
      let g_sToolbarButtonTooltip = g_oGuiComponent.GetButtonTooltip (g_nToolbarFocusedButton)
      let g_sToolbarButtonIcon = g_oGuiComponent.GetButtonIcon (g_nToolbarFocusedButton)

    else
      ResetToolbar ()
    endif

  else ; ALV GridView ??? else same as if

    let g_nToolbarFocusedButton = g_iGuiGridToolbarFocusButton

    let g_bToolbarButtonChecked = g_oGuiComponent.GetToolbarButtonChecked (g_nToolbarFocusedButton)
    let g_bToolbarButtonEnabled = g_oGuiComponent.GetToolbarButtonEnabled (g_nToolbarFocusedButton)

    let g_sToolbarButtonText = g_oGuiComponent.GetToolbarButtonText (g_nToolbarFocusedButton)

    /* ROM - 2012/11/26 - property AccText is related to GUI object (toolbar/ALV) and not a specific button, so it should not override
     * button text - deleted checking AccText as alternative to button text */

    let g_sToolbarButtonType = g_oGuiComponent.GetToolbarButtonType (g_nToolbarFocusedButton)
    let g_sToolbarButtonTooltip = g_oGuiComponent.GetToolbarButtonTooltip (g_nToolbarFocusedButton)
    let g_sToolbarButtonIcon = g_oGuiComponent.GetToolbarButtonIcon (g_nToolbarFocusedButton)

  endif

  let g_bToolbarIsValid = TRUE

  return (TRUE)

EndFunction

void Function ResetToolbar ()

  let g_bToolbarIsValid = TRUE

  let g_nToolbarFocusedButton = -1
  let g_nToolbarButtonCount = 0

  let g_bToolbarButtonChecked = FALSE
  let g_bToolbarButtonEnabled = FALSE

  let g_sToolbarButtonText = ""
  let g_sToolbarButtonType = ""
  let g_sToolbarButtonTooltip = ""
  let g_sToolbarButtonIcon = ""

EndFunction

Void Function SayCurrentToolbar ()
var
  string info,
  string s1,
  string s2,
  string sTooltip

  if (!g_bGuiComponentSameAsPrevious) then
    IndicateControlType (WT_TOOLBAR, cscSpace, cscSpace)
  elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView)) then
    if (g_iGuiGridToolbarPreviousButton == -1) then
      IndicateControlType (WT_TOOLBAR, cscSpace, cscSpace)
    endif
  endif

  let info = ""
  let sTooltip = ""

  if (!StringIsBlank (g_sToolbarButtonText)) then
    let info = g_sToolbarButtonText + cscSpace
    if (ShoulditemSpeak (OT_TOOL_TIP)) then
      if (g_sToolbarButtonTooltip != cscNull) then
        let s1 = TrimString (g_sToolbarButtonText)
        let s2 = TrimString (g_sToolbarButtonTooltip)
        if (StringCompare (s1, s2, false) != 0) then
          let sTooltip = s2
        endif
      endif
    endif
  elif (!StringIsBlank (g_sToolbarButtonTooltip)) then
    let info =  g_sToolbarButtonTooltip + cscSpace
  endif
  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
    let info =""
  endif

  if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
    if (!g_bToolbarButtonEnabled) then
      let info = smmStripMarkup (smmGetStartMarkupForControlState (WT_BUTTON, CTRL_DISABLED)) + cscSpace
    endif
    if (StringCompare (sGuiButtonAndMenu, g_sToolbarButtonType) == 0) then
      let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_SPLITBUTTON)) + cscSpace
    elif (g_sToolbarButtonType == sGuiButton) then
      let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTON)) + cscSpace
      if (g_bToolbarButtonChecked!=FALSE) then
        let info = info +  msgGuiRadioButtonSelected + cscSpace
      endif
    elif (g_sToolbarButtonType == sGuiMenu) then
      let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTONMENU)) + cscSpace
    elif (g_sToolbarButtonType == sGuiGroup) then
      let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_RADIOBUTTON)) + cscSpace
      if (g_bToolbarButtonChecked) then
        let info = info + msgGuiRadioButtonSelected + cscSpace
      else
        let info = info + msgGuiRadioButtonNotSelected + cscSpace
      endif
    endif
    if (!StringIsBlank (info)) then
      Say (info, OT_CONTROL_TYPE)
      let info =""
    endif
  endif

  if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
    let s1 = StringLower (g_sToolbarButtonType)
    let s2 = StringLower (sGuiCheckBox)
    if (StringCompare (s1, s2) == 0) then

      IndicateControlType (WT_TOGGLE_BUTTON, "")
      if (g_bToolbarButtonChecked) then
        IndicateControlState (WT_TOGGLE_BUTTON, CTRL_PRESSED)
      else
        IndicateControlState(WT_TOGGLE_BUTTON, 0, cmsgNotPressed_l )
      endif
    endif
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

EndFunction

int Function BrailleAddObjectToolbarItem (int nType)
var
  string msg,
  string s1,
  string s2

  msg = ""
  if (g_sToolbarButtonText != cscNull) then
    msg = g_sToolbarButtonText
  endif

  if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(g_sToolbarButtonTooltip)) then
    s1 = TrimString (g_sToolbarButtonText)
    s2 = TrimString (g_sToolbarButtonTooltip)
    if (StringCompare (s1, s2, false) != 0) then
      msg = s1 + cscSpace + BrailleGetSubtypeString (WT_TOOLTIP) + cscSpace + s2
    endif
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  let msg = ""
  if (StringCompare (sGuiButtonAndMenu, g_sToolbarButtonType) == 0) then
    let msg = BrailleGetSubTypeString (WT_SPLITBUTTON)
  elif (g_sToolbarButtonType == sGuiButton) then
    let msg = BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_BUTTON)
  elif (g_sToolbarButtonType == sGuiMenu) then
    let msg = BrailleGetSubTypeString (WT_BUTTONMENU)
  elif (g_sToolbarButtonType == sGuiGroup) then
    let msg = BrailleGetSubTypeString (WT_RADIOBUTTON)
  else
    let s1 = StringLower (g_sToolbarButtonType)
    let s2 = StringLower (sGuiCheckBox)
    if (s1 == s2) then
      /* let msg = BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_CHECKBOX) */
      let msg = BrailleGetSubtypeString (WT_TOGGLE_BUTTON)
    endif
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectToolbarItemState (int nType)
var
  string msg,
  string s1,
  string s2

  let s1 = StringLower (g_sToolbarButtonType)
  let s2 = StringLower (sGuiCheckBox)
  if ((s1 == s2) || (s1 == sGuiGroup)) then /* ROM 2012/01/23 - added radio button */
    let msg = BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_CHECKBOX)
    if (g_bToolbarButtonChecked) then
      BrailleAddString (BrailleGetStateString (CTRL_CHECKED), GetCursorCol(), GetCursorRow(), 0)
    else
      BrailleAddString (BrailleGetStateString (CTRL_UNCHECKED), GetCursorCol(), GetCursorRow(), 0)
    endif
  endif
  if (!g_bToolbarButtonEnabled) then
    BrailleAddString (BrailleGetStateString (CTRL_DISABLED), GetCursorCol (), GetCursorRow (), 0)
  endif

  return true

EndFunction

/*
 **********************************************************************
 * ABAP lists
 **********************************************************************
 */

void Function GetCurrentABAPListElement ()

  let g_sLstLabelText = g_oGuiComponent.Text

  if (!StringIsBlank (g_sLstContainerType)  )then

    let g_nTreeNo = g_oGuiComponent.GetListProperty("TreeNo")
    let g_nNodeLevelNo = g_oGuiComponent.GetListProperty("NodeLevelNo")
    let g_nNodeNo = g_oGuiComponent.GetListProperty("NodeNo")

    let g_nNodeChildrenTotal = g_oGuiComponent.GetListProperty("NodeChildrenTotal")
    let g_nNodeRealChildrenTotal = g_oGuiComponentParent.GetListPropertyNonRec ("NodeChildrenTotal")
    let g_bNodeExpandable = g_oGuiComponent.GetListProperty("NodeExpandable")
    let g_nNodeMultipleRows = g_oGuiComponent.GetListProperty("NodeMultipleRows")
    let g_bNodeMarked = g_oGuiComponent.GetListProperty("NodeMarked")
    let g_sNodeName = g_oGuiComponent.GetListProperty("NodeName")

    let g_sLstContainerTitle = g_oGuiComponent.GetListProperty("ContainerTitle")
    let g_sLstLabelType = g_oGuiComponent.GetListProperty("LabelType")

    if (!StringIsBlank (g_oGuiComponent.GetListProperty("FieldWithEllipsis"))) then
      let g_sLstLabelText = g_sLstLabelText  + "..."
    endif
    if (!StringIsBlank (g_sGuiComponentAccText)) then
      let g_sLstLabelText = g_sGuiComponentAccText
    endif

    let g_sAccTextOnRequest = g_oGuiComponent.AccTextOnRequest

    let g_sLstFieldHeader = g_oGuiComponent.GetListProperty("FieldHeader")
    let g_sLstFieldSuperHeader = g_oGuiComponent.GetListProperty("FieldSuperHeader")

    let g_nLstRowNo = g_oGuiComponent.GetListProperty("RowNo")
    let g_nLstRowsTotal = g_oGuiComponent.GetListProperty("RowsTotal")
    let g_sLstRowType =  g_oGuiComponent.GetListProperty("RowType")

    let g_nLstColNo =  g_oGuiComponent.GetListProperty("ColumnNo")
    let g_nLstColsTotal = g_oGuiComponent.GetListProperty("ColumnsTotal")

    let g_sLstListErrorMessage= g_oGuiComponent.GetListProperty("ListErrorMessage")

    let g_nLstContainerInputFields =  g_oGuiComponent.GetListProperty("ContainerInputFields")

    let g_nLstTableGroupsTotal = g_oGuiComponent.GetListProperty("TableGroupsTotal")
    let g_nLstGroupNo = g_oGuiComponent.GetListProperty("GroupNo")
    let g_nLstSubGroupNo = g_oGuiComponent.GetListProperty("SubGroupNo")
    let g_nLstGroupHeaderRows = g_oGuiComponent.GetListProperty("GroupHeaderRows")
    let g_nLstGroupHeaderValues = g_oGuiComponent.GetListProperty("GroupHeaderValues")

    let g_nLstTableNo = g_oGuiComponent.GetListProperty("TableNo")
    let g_nLstTreeNo = g_oGuiComponent.GetListProperty("TreeNo")
    let g_nLstTextboxNo = g_oGuiComponent.GetListProperty("TextBoxNo")

    let g_sLstTableHierarchical = g_oGuiComponent.GetListProperty("TableHierarchical")
    if ((g_sLstTableHierarchical == "2") || (g_sLstTableHierarchical == "A")) then
      let g_nLstColumns2LevelALV = g_oGuiComponent.GetListProperty("Columns2LevelALV")
    else
      let g_nLstColumns2LevelALV = 0
    endif

    let g_nLstSubordinateColumns = g_oGuiComponent.GetListProperty("SubordinateColumns")
    let g_nLstSubgroupsTotal = g_oGuiComponent.GetListProperty("SubgroupsTotal")
    let g_nLstSuperColumnsTotal = g_oGuiComponent.GetListProperty("SuperColumnsTotal")
    let g_nLstRowInputFields = g_oGuiComponent.GetListProperty("RowInputFields")
    let g_nLstLineCount = g_oGuiComponent.GetListProperty("RowMultipleRows")
    let g_nLstLineNo = g_oGuiComponent.GetListProperty("FieldPhysRowNo")

    let g_sLstLastRowText = g_sLstRowText
    let g_sLstRowText = g_oGuiComponent.RowText

    let g_bLstColorIndex = g_oGuiComponent.ColorIndex
    let g_bLstColorIntensified = g_oGuiComponent.ColorIntensified
    let g_bLstColorInverse = g_oGuiComponent.ColorInverse

    let g_bLstLabelIsIcon = false
    if !StringIsBlank(g_oGuiComponent.IconName) then
      let g_bLstLabelIsIcon = true
    endif
  endif

EndFunction

void Function ResetABAPListElement ()

  let g_nTreeNo = 0
  let g_nNodeLevelNo = 0
  let g_nNodeNo = 0

  let g_nNodeChildrenTotal = 0
  let g_bNodeExpandable = false
  let g_nNodeMultipleRows = 0
  let g_bNodeMarked = false
  let g_sNodeName = ""

  let g_sLstContainerTitle = ""
  let g_sLstLabelType = ""

  let g_sLstLabelText = ""

  let g_sLstFieldHeader = ""
  let g_sLstFieldSuperHeader = ""

  let g_nLstRowNo = -1
  let g_nLstRowsTotal = 0
  let g_sLstRowType =  ""

  let g_nLstColNo =  -1
  let g_nLstColsTotal = 0

  let g_sLstListErrorMessage= ""

  let g_nLstContainerInputFields =  0

  let g_nLstTableGroupsTotal = 0
  let g_nLstGroupNo = 0
  let g_nLstSubGroupNo = 0
  let g_nLstGroupHeaderRows = 0
  let g_nLstGroupHeaderValues = 0

  let g_nLstTableNo = -1
  let g_nLstTreeNo = -1
  let g_nLstTextboxNo = -1

  let g_sLstTableHierarchical = ""
  let g_nLstColumns2LevelALV = 0

  let g_nLstSubordinateColumns = 0
  let g_nLstSubgroupsTotal = 0
  let g_nLstSuperColumnsTotal = 0
  let g_nLstRowInputFields = 0
  let g_nLstLineCount = 0
  let g_nLstLineNo = 0

  let g_sLstRowText = ""
  let g_sLstLastRowText = ""

  let g_bLstColorIndex = 0
  let g_bLstColorIntensified = 0
  let g_bLstColorInverse = 0

  let g_bLstLabelIsIcon = FALSE

EndFunction

void Function SayCurrentABAPListElement ()
var
  string info,
  string sColumnTypeModifier,
  string sFieldTypeModifier,
  string sElementType

  let info = ""

  /*
   *  TEXTBOX
   */
  if (g_sLstContainerType == CT_TEXTBOX)  then
    let sFieldTypeModifier = ""
    if (g_bLstColorIndex==CI_READONLY) then
      ; let sFieldTypeModifier = msgTreeTypeText -- ROM 2009/11/10 - suppress announcement of "text" in text boxes
    elif (g_bLstColorIndex==CI_THRESHOLD) then
      let sFieldTypeModifier = msgLstFieldModifierThreshold
    elif (g_bLstColorIndex==CI_NEGATIVE) then
      let sFieldTypeModifier = msgLstFieldModifierNegative
    endif

    if (g_nLstLastTextboxNo != g_nLstTextboxNo) then
      Say (msgLstTextbox, OT_CONTROL_TYPE)
      if (!StringIsBlank (g_sLstContainerTitle)) then
        let info = msgLstContainerTitle + cscSpace + g_sLstContainerTitle + cscSpace
      endif
      let  g_nLstLastTextboxNo = g_nLstTextboxNo
      Say (info, OT_CONTROL_NAME)
      let info = ""
    endif
    /* The following line causes trouble if container title and label text are incidentally the same... */
    /* if (g_sLstContainerTitle != g_sLstLabelText) then */
    if (!StringIsBlank (sFieldTypeModifier)) then
      Say (sFieldTypeModifier, OT_ITEM_STATE)
    endif
    /* ROM 2010/11/11 - special announcement of empty fields */
    if (!StringIsBlank (g_sLstLabelText)) then
      Say (g_sLstLabelText, OT_DIALOG_TEXT)
    else
      Say (msgBlank, OT_DIALOG_TEXT)
    endif
    /* endif */
    let g_nLstLastTableNo = -1
    let g_nLstLastTreeNo = -1
  endif

  /*
   *  FREETEXT
   */
  if (g_sLstContainerType == CT_FREETEXT) then
    if (g_bLstLabelIsIcon) then
      Say (msgGuiIcon, OT_CONTROL_TYPE)
    else
      Say (msgLstFreeText, OT_CONTROL_TYPE)
    endif
    if (!StringIsBlank (g_sLstLabelText)) then
      Say (g_sLstLabelText, OT_DIALOG_TEXT)
    else
      if (!g_bLstLabelIsIcon) then
        Say (msgBlank, OT_DIALOG_TEXT)
      endif
    endif

    let g_nLstLastTableNo = -1
    let g_nLstLastTreeNo = -1
    let g_nLstLastTextBoxNo = -1
  endif

  /*
   * TREE
   */
  if (g_sLstContainerType == CT_TREE) then

    if (g_nLstLastTreeNo != g_nLstTreeNo) then
      let info = msgTreeABAPListTree
      if (g_nTreeNo > 0) then
        let info = info + cscSpace + msgLstNumber + cscSpace + intToString(g_nTreeNo) + cscSpace
      endif
      let g_nLstLastTreeNo = g_nLstTreeNo
      Say (info, OT_CONTROL_TYPE)
    endif

    if (g_nNodeLevelNo > 0) then
      let info = msgTreeLevel  + cscSpace + intToString(g_nNodeLevelNo) + cscSpace
      Say (info, OT_ITEM_NUMBER)
    endif

    if (g_bNodeMarked) then
      let info = msgTreeNodeMarked
      Say (info, OT_ITEM_STATE)
    endif

    let info = ""
    if ((StringCompare (g_sLstLabelText, g_sNodeName, false) != 0) && (g_sLstLabelText != "4") && (g_sLstLabelText != "5")) then
      if (g_bLstLabelIsIcon == TRUE) then
        Say (msgGuiIcon, OT_CONTROL_TYPE)
      endif
      if (!StringIsBlank (g_sLstLabelText)) then
        let info = g_sLstLabelText + cscSpace
      else
        let info = msgBlank + cscSpace
      endif
      Say (info, OT_CONTROL_NAME)
    else
      /* ROM 2011/08/01 - when located on expand/collapse symbol, announce the actual label (4 or 5) and the node name as tooltip */
      let info = g_sLstLabelText + cscSpace
      Say (info, OT_CONTROL_NAME)
      if (StringCompare (g_sLstLabelText, g_sNodeName, false) != 0) then
        let info = g_sNodeName + cscSpace
        Say (info, OT_TOOL_TIP)
      endif
    endif

    if (g_bNodeExpandable) then
      Say (smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_CLOSED)), OT_ITEM_STATE)
    else
      if (g_nNodeRealChildrenTotal != 0) then
        Say (smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_OPENED)), OT_ITEM_STATE)
      endif
    endif

    if (g_bNodeExpandable || (g_nNodeRealChildrenTotal == 0)) then
      let info = msgTreeEntry + cscSpace + FormatString (msgItemPosition, IntToString(g_nNodeNo), IntToString(g_nNodeChildrenTotal))
      Say (info, OT_POSITION)
    else
      if (g_nNodeChildrenTotal == 1) then
        let info = IntToString(g_nNodeChildrenTotal) + cscSpace + msgTreeEntry + cscSpace
      else
        let info = IntToString(g_nNodeChildrenTotal) + cscSpace + msgTreeEntries + cscSpace
      endif
      Say (info, OT_POSITION)
    endif

    if (g_nNodeMultipleRows > 0) then
      let info = msgLstWith + cscSpace + IntToString(g_nNodeMultipleRows) + cscSpace + msgLstRows
      Say (info, OT_POSITION)
    endif

    let info = ""

    let g_nLstLastTableNo = -1
    let g_nLstLastTextBoxNo = -1

  endif

  /*
   * TABLE
   */
  if (g_sLstContainerType == CT_TABLE) || ((g_sLstContainerType!=CT_TREE) && (g_sLstContainerType!=CT_FREETEXT) && (g_sLstContainerType!=CT_TEXTBOX)) then

    let info = ""
    let sColumnTypeModifier = ""
    if (g_bLstColorIndex==CI_KEY) then
      let sColumnTypeModifier = msgLstColumnModifierKey
    endif

    let sFieldTypeModifier = ""
    if (g_bLstColorIndex==CI_READONLY) then
      if (!StringIsBlank (g_sLstLabelType)) then  /* ROM 2009/11/10 - do not announce list elements of type label as "read-only edit" */
        let sFieldTypeModifier = msgStateReadOnly
      endif
    elif (g_bLstColorIndex==CI_THRESHOLD) then
      let sFieldTypeModifier = msgLstFieldModifierThreshold
    elif (g_bLstColorIndex==CI_NEGATIVE) then
      let sFieldTypeModifier = msgLstFieldModifierNegative
    endif

    /* if (g_sLstLabelType == LT_GROUPHEADER) then */
    /*   let info = info + "!!DEBUG!!" + cscSpace + msgLstGroupHeader + cscSpace + g_sLstLabelText + cscSpace */
    /* endif */

    /* announce general table info if entering a new table */
    if (g_nLstLastTableNo != g_nLstTableNo) then

      let info = msgLstTable + cscSpace
      if (g_nLstTableNo > 0) then
        let info = info + msgLstNumber + cscSpace + IntToString(g_nLstTableNo) + cscSpace
      endif
      let info = info + g_sLstContainerTitle  + cscSpace
      if (!StringIsBlank (g_sLstTableHierarchical)) then
        if (g_sLstTableHierarchical == "A") then
          let info = info + cscSpace + msgLstALVlikeHierarchy + cscSpace
        else
          if (g_sLstTableHierarchical == "2") then
            let info = info + FormatString (msgLst2HierarchyLevels, IntToString(g_nLstTableGroupsTotal)) + cscSpace
          elif (g_sLstTableHierarchical == "3") then
            let info = info + FormatString (msgLst3HierarchyLevels, IntToString(g_nLstTableGroupsTotal)) + cscSpace
          endif
        endif
      endif
      if (!StringIsBlank (info)) then
        Say (info, OT_CONTROL_TYPE)
        let info = ""
      endif

      let info = IntToString(g_nLstRowsTotal) + cscSpace + msgLstRows + cscSpace
      if (g_sLstLabelType == LT_SUPERCOLUMNHEADER) then
        let info = info + IntToString(g_nLstSuperColumnsTotal) + cscSpace + msgLstColumns + cscSpace
      else
        let info = info + IntToString(g_nLstColsTotal) + cscSpace + msgLstColumns + cscSpace
      endif
      Say (info, OT_ITEM_NUMBER)

      let g_nLstLastTableNo = g_nLstTableNo
      let g_nLstLastTreeNo = -1
      let g_nLstLastTextBoxNo = -1

    else
      /* are we on a table title */
      if (g_sLstLabelType == LT_TITLE) then
        if (!StringIsBlank (g_sLstContainerTitle)) then
          let info = info + msgTableControl + cscSpace + g_sLstContainerTitle
        else
          let info = info + msgTableControl + cscSpace + IntToString(g_nLstTableNo)
        endif
        Say (info, OT_CONTROL_TYPE)
        let info = ""
      endif
    endif

    /* Enter Table Title */
    ;if (g_sLstContainerType == CT_TABLE) then
    ;  let info = g_sLstContainerTitle + cscSpace + msgTitle
    ;endif

    /* Enter Super Column Header */
    if (g_sLstLabelType == LT_SUPERCOLUMNHEADER) then
      let info = g_sLstLabelText + cscSpace + msgLstHeader +cscSpace
      let info = info + IntToString(g_nLstSubordinateColumns) + cscSpace + msgSubordinateColumns + cscSpace
      Say (info, OT_CONTROL_TYPE)
      let info = msgLstColumn + cscSpace + IntToString(g_nLstColNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstSuperColumnsTotal) + cscSpace
      Say (info, OT_POSITION)
    endif

    let info = ""

    /* Enter Column Header */
    if (g_sLstLabelType == LT_NORMALHEADER) then
      Say (g_sLstFieldSuperHeader, OT_CONTROL_TYPE)
      let info = g_sLstLabelText + cscSpace + msgLstHeader + cscSpace
      Say (info, OT_CONTROL_TYPE)
      let info = msgLstColumn + cscSpace + IntToString(g_nLstColNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstColsTotal) + cscSpace
      if (g_nLstLineCount > 1) then
        let info = info + cscSpace + msgLine + cscSpace + IntToString(g_nLstLineNo)+ cscSpace + msgLstOf + cscSpace + IntToString(g_nLstLineCount)
      endif
      Say (info, OT_POSITION)
      let info = ""
    endif

    /* Enter Group (Header) */
    /* if ((!StringIsBlank (g_sLstGroupNo)) && (StringIsBlank (g_sAccTextOnRequest))) then */
    if (((g_sLstLabelType == LT_GROUPLABEL) || (g_sLstLabelType == LT_GROUPHEADER) || (g_sLstContainerType == CT_GROUP))) then
      if ((g_nLstColumns2LevelALV != 0) && (g_nLstColsTotal == 0)) then
        let g_nLstColsTotal = g_nLstColumns2LevelALV
      endif
      if (StringIsBlank (g_sLstFieldHeader) && StringIsBlank (g_sLstLabelText)) then
        if ((g_nGuiComponentType == GUI_TC_CHECKBOX) && (g_nLstColNo == 1)) then
          let info = msgLstRowSelection
        endif
      else
        if ((g_sLstLabelType == LT_GROUPHEADER) || StringIsBlank (g_sLstFieldHeader)) then
          let info = g_sLstLabelText + cscSpace + msgLstGroupHeader + cscSpace
        else
          let info = g_sLstFieldHeader + cscSpace + msgLstGrouplabel + cscSpace + g_sLstLabelText + cscSpace
        endif
      endif
      Say (info, OT_CONTROL_TYPE)
      let info = ""
      if (g_nGuiComponentType == GUI_TC_CHECKBOX) then
        let sElementType = smmStripMarkup (smmGetStartMarkupForControlType (WT_CHECKBOX)) + cscSpace
        if (g_bGuiCheckBoxState) then
          let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_CHECKED)) + cscSpace
        else
          let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_UNCHECKED)) + cscSpace
        endif
        Say (sElementType, OT_CONTROL_TYPE)
        let sElementType = ""
      endif
      if ((g_nLstGroupNo > 0) && (g_nLstLastGroupNo != g_nLstGroupNo)) then
        let g_nLstLastGroupNo = g_nLstGroupNo
        let info = msgLstGroup + cscSpace
        if (g_nLstSubgroupsTotal == 1) then
          let info = info + msglstWith + cscSpace + IntToString(g_nLstSubgroupsTotal) + cscSpace + msgLstSubgroup + cscSpace
        elif (g_nLstSubgroupsTotal > 1) then
          let info = info + msglstWith + cscSpace + IntToString(g_nLstSubgroupsTotal) + cscSpace + msgLstSubgroups + cscSpace
        endif
        Say (info, OT_CONTROL_TYPE)
        let info = msglstGroup + cscSpace +  IntToString(g_nLstGroupNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstTableGroupsTotal) + cscSpace
        Say (info, OT_POSITION)
      endif
      if ((g_nLstColNo > 0) && (g_nLstLastColumnNo != g_nLstColNo)) then
        let info = msgLstColumn + cscSpace + IntToString(g_nLstColNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstColsTotal) + cscSpace
        /* Say (info, OT_POSITION) */
      endif
      let info = ""
    else
      let g_nLstLastGroupNo = -1
    endif

    /* Sub- Group (Header) */
    if (g_sLstContainerType == CT_SUBGROUP) then
      if ((g_sLstLabelType == LT_SUBGROUPLABEL) || StringIsBlank (g_sLstFieldHeader)) then
        let info = g_sLstLabelText + cscSpace + msgLstSubGroupHeader + cscSpace
      else
        let info = g_sLstFieldHeader + cscSpace + msgLstSubGroupLabel + cscSpace + g_sLstLabelText + cscSpace
      endif
      Say (info, OT_CONTROL_TYPE)
      if (g_nLstLastSubGroupNo != g_nLstSubGroupNo) then
        let g_nLstLastSubGroupNo = g_nLstSubGroupNo
        let info = msgLstSubgroup + cscSpace + IntToString(g_nLstSubGroupNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstSubGroupsTotal) +cscSpace
        Say (info, OT_POSITION)
      endif
      if ((g_nLstColNo > 0) && (g_nLstLastColumnNo != g_nLstColNo)) then
        let info = msgLstColumn + cscSpace + IntToString(g_nLstColNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstColsTotal) + cscSpace
        Say (info, OT_POSITION)
      endif
      let info = ""
    else
      let g_nLstLastSubGroupNo = -1
    endif

    /* Enter Text Field in Standard Line */
    /* if ((g_sLstContainerType == CT_ROW) && (StringIsBlank (g_sLstRowType))) then */
    if (g_sLstContainerType == CT_ROW) then
      if (g_nLstLastColumnNo != g_nLstColNo) then
        if (StringIsBlank (g_sLstFieldHeader) && StringIsBlank (g_sLstFieldSuperHeader) && StringIsBlank (g_sLstLabelText)) then
          if ((g_nGuiComponentType == GUI_TC_CHECKBOX) && (g_nLstColNo == 1)) then
            Say (msgLstRowSelection, OT_CONTROL_TYPE)
          endif
        else
          Say (g_sLstFieldSuperHeader, OT_CONTROL_TYPE)
          Say (g_sLstFieldHeader, OT_CONTROL_TYPE)
        endif
      endif
      if (g_bLstLabelIsIcon == TRUE) then
        Say (msgGuiIcon, OT_CONTROL_TYPE)
      else
        /* ROM 2009/11/10 - leave type announcement empty for ABAP list elements of type label */
        ; if (g_nGuiComponentType == GUI_TC_LABEL) then
          ; let sElementType = smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT)) /* standard type (GUI_TC_LABEL) */
          ; if (!g_bGuiGridCellChangeable && (g_bLstColorIndex!=CI_READONLY)) then
            ; let sFieldTypeModifier = sFieldTypeModifier + msgStateReadOnly
          ; endif
        let sElementType = msgGuiLabel ; by default, this message is empty -> no speech annoucement
        if ((g_nGuiComponentType == GUI_TC_CTEXTFIELD) || (g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CHECKBOX)) then
          if (!g_bGuiComponentChangeable) then
            let sElementType = smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_DISABLED)) + cscSpace
          endif
          if (g_nGuiComponentType == GUI_TC_CHECKBOX) then
            let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlType (WT_CHECKBOX)) + cscSpace
            if (g_bGuiCheckBoxState) then
              let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_CHECKED)) + cscSpace
            else
              let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_UNCHECKED)) + cscSpace
            endif
          else
            let sElementType = sElementType + smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT)) + cscSpace
          endif
        endif
        let info = sFieldTypeModifier + cscSpace + sElementType + cscSpace
      endif
      if (!StringIsBlank (info)) then
        Say (info, OT_CONTROL_TYPE)
      endif
      info = ""
      if (!StringIsBlank (g_sLstLabelText)) then
        let info = g_sLstLabelText + cscSpace
      else
        if (g_nGuiComponentType != GUI_TC_CHECKBOX) then
          info = msgBlank + cscSpace
        endif
      endif
      Say (info, OT_DIALOG_TEXT)
      if ((g_nLstRowNo != 0) && (g_nLstLastRowNo != g_nLstRowNo)) then
        let info = msgLstRow + cscSpace + IntToString(g_nLstRowNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstRowsTotal) + cscSpace
        Say (info, OT_POSITION)
      endif
      if (!StringIsBlank (sColumnTypeModifier)) then
        Say (sColumnTypeModifier, OT_ITEM_STATE)
      endif
      if (g_nLstLastColumnNo != g_nLstColNo) then
        let info = msgLstColumn + cscSpace + IntToString(g_nLstColNo) + cscSpace + msgLstOf + cscSpace + IntToString(g_nLstColsTotal)
        Say (info, OT_POSITION)
      endif
      if (g_nLstLineCount > 1) then
        let info = msgLine + cscSpace + IntToString(g_nLstLineNo)+ cscSpace + msgLstOf + cscSpace + IntToString(g_nLstLineCount)
        Say (info, OT_POSITION)
      endif
      /*   if (!StringIsBlank (g_sLstContainerTitle)) then
       *     let info = msgTableControl + cscSpace + g_sLstContainerTitle
       *     Say (info, OT_CONTROL_TYPE)
       *   endif
       */
      let info = ""
    endif

     /* Special Rows */
    if (StringLength(g_sLstRowType) == 1) then

      if ((g_nLstLastRowNo != g_nLstRowNo) || (StringCompare (g_sLstLastRowText, g_sLstRowText, false) != 0)) then
        let info = g_sLstFieldSuperHeader + cscSpace + g_sLstFieldHeader  + cscSpace
        /* let info = info + msgInsertedLine + cscSpace */
        Say (info, OT_CONTROL_TYPE)

        if (g_sLstRowType == RT_U) then
          let info = msgInsertedLineTypeSubSummation + cscSpace
        elif (g_sLstRowType == RT_S) then
          let info = msgInsertedLineTypeSummation + cscSpace
        elif (g_sLstRowType == RT_I) then
          let info = msgInsertedLineTypeText + cscSpace
        endif

        let info = info + msgLine + cscSpace
        Say (info, OT_ITEM_STATE)

        let info = g_sLstRowText + cscSpace
        Say (info, OT_DIALOG_TEXT)

        /*
         * if (!StringIsBlank (sFieldTypeModifier)) then
         *   Say (sFieldTypeModifier, OT_ITEM_STATE)
         * endif
         */

        if (!StringIsBlank (g_sLstContainerTitle)) then
          let info = msgTableControl + cscSpace + g_sLstContainerTitle
          Say (info, OT_CONTROL_TYPE)
        endif

        let info = ""
      endif
    endif /* special rows */

  endif  /* end of  CT_TABLE */

  let g_nLstLastColumnNo = g_nLstColNo
  let g_nLstLastRowNo = g_nLstRowNo

EndFunction

/*
 **********************************************************************
 ** GuiLabel functions
 **********************************************************************
*/

/*
 * GetCurrentGuiLabel
 */

int Function GetCurrentGuiLabel ()
Var
  string s,
  int y

  if (g_bGuiLabelIsValid) then
    return TRUE
  endif

  let g_sGuiLabelText =  g_oGuiComponent.Text
  if (!StringIsBlank (g_sGuiComponentAccText)) then
    let g_sGuiLabelText = g_sGuiComponentAccText
  endif

  let g_sGuiLabelTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiLabelTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiLabelTooltip
    endif
  endif

  let g_bGuiLabelIsHotspot = g_oGuiComponent.IsHotspot
  let g_bGuiLabelHighlighted = g_oGuiComponent.Highlighted

  /*   let g_bLstIsListElement = g_oGuiComponent.IsListElement
   *   let g_sLstContainerType  = g_oGuiComponent.GetListProperty("ContainerType")
   */

  if ((g_bLstIsListElement != FALSE) && (!StringIsBlank (g_sLstContainerType))) then

    /*
    *     GetCurrentABAPListElement ()
    */

  else  /* regular label */

    let g_sGuiLabelIcon = g_oGuiComponent.IconName
    let g_bGuiLabelIsSymbolFont = g_oGuiComponent.IsSymbolFont

    ; ROM: outcommented following lines, tooltip already set before (2010/08/20)
    ; let g_sGuiLabelTooltip = g_sGuiComponentTooltip
    ; if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
      ; if (!CompareStrings (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip)) then
        ; let g_sGuiLabelTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiLabelTooltip
      ; endif
    ; endif

    if ((g_bGuiLabelIsSymbolFont != 0) && (StringIsBlank (g_sGuiLabelTooltip))) then
      let g_sGuiLabelTooltip = cscSpace + msgTreeNode + cscSpace
      if (g_sGuiLabelText == "5") then
        let g_sGuiLabelTooltip = g_sGuiLabelTooltip + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_OPENED))
      elif (g_sGuiLabelText == "4") then
        let g_sGuiLabelTooltip = g_sGuiLabelTooltip + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_CLOSED))
      endif
    endif

    let g_bGuiLabelIsValid = TRUE

  endif

  let g_bGuiLabelIsValid = TRUE

  return TRUE

EndFunction

/*
 * ResetGuiLabel
 */

Void Function ResetGuiLabel ()

  let g_sGuiLabelText = ""
  let g_sGuiLabelTooltip = ""
  let g_sGuiLabelIcon = "" ; ROM - added 2010/11/11 - just to be sure icon name is reset, too...
  let g_sGuiLabelAccText = ""
  let g_sGuiLabelAccTextOnRequest = ""
  let g_nGuiLabelCaretPosition = 0
  let g_bGuiLabelHighlighted = FALSE
  let g_bGuiLabelIsHotspot = FALSE

  let g_bGuiLabelIsValid = TRUE

EndFunction

/*
 * SayCurrentGuiLabel
 */

void Function SayCurrentGuiLabel ()
Var
  string info,
  string sLabel,
  string sTooltip,
  string sElementType

  let info = ""
  let sTooltip = ""
  let sLabel = ""

  let sLabel = TrimString (g_sGuiLabelText)
  let sTooltip = TrimString (g_sGuiLabelTooltip)

  /* ABAP list */
  if ((g_bLstIsListElement != FALSE) && (!StringIsBlank (g_sLstContainerType))) then

    SayCurrentABAPListElement ()

    if (ShouldItemSpeak (OT_ITEM_STATE)) then
      if (g_bGuiLabelHighlighted) then
        Say (msgStateHighlighted, OT_ITEM_STATE)
      endif
    endif

    if (g_bGuiLabelIsHotspot) then
      Say (msgHasHotspot, OT_CONTROL_TYPE)
    endif

  else /* regular label */

    if ((g_nGuiComponentParentType == GUI_TC_TABLECONTROL) && (g_bNewColumn == TRUE)) then
      if (!StringIsBlank (g_sGuiComponentParentColumnName)) then
        Say (g_sGuiComponentParentColumnName, OT_CONTROL_NAME)
      endif
    endif

    if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
      if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
        if (g_bGuiLabelIsHotspot == FALSE) then
          if (!StringIsBlank (g_sGuiLabelIcon)) then
            let info = info + cscSpace + cscSpace + msgGuiIcon+cscSpace
          else
            let info = info + cscSpace + msgGuiLabel+cscSpace
          endif
        else
          /* let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_LINK)) + cscSpace */
          if (!StringIsBlank (g_sGuiLabelIcon)) then
            let info = info + cscSpace + msgGuiIcon + cscSpace + msgHasHotspot + cscSpace
          else
            let info = info + cscSpace + msgIsHotspot + cscSpace
          endif
          if (g_bGuiLabelIsSymbolFont != 0) then
            let info = info + cscSpace+msgALVSymbol+cscSpace
          endif
        endif
      endif
      if (!StringIsBlank (info)) then
        Say (info, OT_CONTROL_TYPE)
        let info = ""
      endif
    endif

    if (ShoulditemSpeak (OT_TOOL_TIP) == FALSE) then
      if (!StringIsBlank (sLabel)) then
        let info = info + sLabel + cscSpace
      elif (sTooltip != cscNull) then
        let info = info + sTooltip + cscSpace
        let sTooltip = ""
      endif
    else
      if (!StringIsBlank (sLabel)) then
        let info = info + sLabel + cscSpace
      endif
    endif

    if (g_nSapGuiAccVerbosity > 0) then
      if (g_sGuiLabelAccText != cscNull) then
        if (g_sGuiLabelAccText != sLabel) then
          let info = info + g_sGuiLabelAccText + cscSpace
        endif
      endif
      if ((g_nSapGuiAccVerbosity > 0) && (g_sGuiLabelAccTextOnRequest != cscNull)) then
        let info = info + g_sGuiLabelAccTextOnRequest + cscSpace
      endif
    endif
    if (!StringIsBlank (info)) then
      Say (info, OT_DIALOG_TEXT)
      let info = ""
    endif

    if (ShouldItemSpeak (OT_ITEM_STATE)) then
      if (g_bGuiLabelHighlighted) then
        Say (msgStateHighlighted, OT_ITEM_STATE)
      endif
    endif

  endif /* ABAP list OR label */

  if (ShouldItemSpeak (OT_TOOL_TIP)) then
    if (!StringIsBlank (sTooltip)) then
      if (StringCompare (sLabel, sTooltip, false) != 0) then
        Say (sTooltip, OT_TOOL_TIP)
      endif
    endif
  endif

  if (g_bIsStepLoop) then
    SayCurrentStepLoop ()
  else
    SayCurrentGuiTableControl ()
  endif

  if (g_bGuiLabelIsHotspot) then
    Say (msgHotspotTutor, OT_TUTOR, false)
  endif

EndFunction

/*
 * Braille functions for GuiLabel
 */


Int Function BrailleAddObjectGuiLabelType (int nType)
Var
  string info

  let info = ""

  if (g_bLstIsListElement && !StringIsBlank (g_sLstContainerType)) then
    /* ABAP list */
    if ((g_sLstContainerType == CT_TEXTBOX) || (g_sLstContainerType == CT_FREETEXT)) then
      /* TEXTBOX or FREETEXT */
      if (g_bLstLabelIsIcon) then
        info = msgBrlIcon
      else
        info = msgBrlLabel
      endif
    elif (g_sLstContainerType == CT_TREE) then
      /* TREE */
      let info = msgBrlLstTree
    elif (g_sLstContainerType == CT_LIST) then
      /* LIST */
      let info = msgBrlLstContainerList
    else
      /* TABLE, GROUP, SUBGROUP, ROW */
      let info = msgBrlLstTable
    endif
  else
    if (StringLength(g_sGuiLabelIcon)>0) then
      let info = msgBrlIcon
    else
      let info = msgBrlLabel
    endif
  endif

  if (g_bGuiLabelIsHotspot) then
    let info = info + cscSpace + msgBrlIsHotspot
  endif

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction


int Function BrailleAddObjectGuiLabelInfo (int nType)
var
  string msg,
  string sTableTitle

  let msg = ""

  if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    /* ABAP list */
    if ((g_sLstContainerType == CT_TEXTBOX) || (g_sLstContainerType == CT_FREETEXT)) then
      /* TEXTBOX or FREETEXT */
      /*   let msg = g_sLstContainerType
       *   BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
       */
    elif (g_sLstContainerType == CT_TREE) then
      /* TREE */
      let msg = intToString (g_nNodeLevelNo)
      BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
      return (TRUE)
    elif (g_sLstContainerType == CT_LIST) then
      /* LIST */
      let msg = g_sLstContainerType
      BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
    else
      /* --- TABLE, GROUP, SUBGROUP, ROW --- */
      let sTableTitle = ""
      if (!StringIsBlank (g_sLstContainerTitle)) then
        let sTableTitle = g_sLstContainerTitle
      else
        let sTableTitle = IntToString(g_nLstTableNo)
      endif
      if (!StringIsBlank (sTableTitle)) then
        BrailleAddString (sTableTitle, GetCursorCol(), GetCursorRow(), 0)
      endif

      /* stop here if we are on the title of the table */
      if (g_sLstLabelType == LT_TITLE) then
        return (TRUE)
      endif

      /* group information */
      if (g_nLstGroupNo > 0) then
        let msg = FormatString (msgBrlLstGroupInfo, IntToString(g_nLstGroupNo))
        BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
      endif
      if (g_nLstSubGroupNo > 0) then
        let msg = FormatString (msgBrlLstSubGroupInfo, IntToString(g_nLstSubGroupNo))
        BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
      endif

      /* position in table */
      let msg = ""
      if ((g_sLstLabelType == LT_NORMALHEADER) || (g_sLstLabelType == LT_SUPERCOLUMNHEADER) || (g_sLstLabelType == LT_GROUPHEADER)) then
        let msg = formatString (msgBrlLstNormalHeaderInfo, IntToString(g_nLstColNo))
      elif ((g_nLstRowNo > 0) && (g_nLstColNo > 0)) then
        let msg = formatString (msgBrlLstTablePosInfo, IntToString(g_nLstRowNo), IntToString(g_nLstColNo))
      endif
      /* let msg = msg + " DEBUG[" + g_sLstLabelType + "|" + g_sLstContainerType + "/" + g_sLstRowType + "]" */
      if (!StringIsBlank (msg)) then
        BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
      endif

      /* super column header information */
      let msg = ""
      if (!StringIsBlank (g_sLstFieldSuperHeader)) then
        let msg = "[" + g_sLstFieldSuperHeader + "]"
      endif
      BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)
      /* column header information */
      let msg = ""
      if (!StringIsBlank (g_sLstFieldHeader)) then
        let msg = g_sLstFieldHeader
      endif
      BrailleAddString (msg, GetCursorCol(), GetCursorRow(), 0)

    endif
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiLabelContents (int nType)
var
  string name,
  string info,
  string sFieldType

  if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    /* ABAP list */
    /* type */
    if (g_sLstContainerType == CT_LIST) then
      ; TODO
      let sFieldType = g_sLstContainerType
      BrailleAddString (sFieldType, GetCursorCol(), GetCursorRow(), 0)
    elif (g_sLstContainerType == CT_TREE) then
      let sFieldType = ""
    elif (g_sLstLabelType == LT_TITLE) then
      return TRUE
    else
      let sFieldType = ""
      if (g_bLstColorIndex == CI_READONLY) then
        if (StringIsBlank (g_sLstLabelType)) then
          let sFieldType = msgBrlLabel
        elif ((g_sLstContainerType != CT_TEXTBOX) && (g_sLstContainerType != CT_FREETEXT)) then
          let sFieldType = msgBrlStateReadOnly  ; ROM: 2009/10/19 - avoid space after read-only state marker
        endif
      elif (g_bLstColorIndex == CI_THRESHOLD) then
        let sFieldType = msgBrlLstFieldModifierThreshold + cscSpace
      elif (g_bLstColorIndex == CI_NEGATIVE) then
        let sFieldType = msgBrlLstFieldModifierNegative + cscSpace
      elif (g_bLstColorIndex == CI_KEY) then
        let sFieldType = msgBrlALVIsColumnKey + cscSpace
      endif
      /* let sFieldType = sFieldType + "[ " + IntToString(g_bLstColorIndex) + " ] DEBUG!"  */
      if (g_sLstLabelType == LT_NORMALHEADER) then
        let sFieldType = sFieldType + msgBrlLstNormalHeaderType
      elif (g_sLstLabelType == LT_SUPERCOLUMNHEADER) then
        let sFieldType = sFieldType + msgBrlLstSuperColumnHeaderType
      elif ((g_sLstLabelType == LT_GROUPLABEL) || (g_sLstLabelType == LT_GROUPHEADER) || (g_sLstContainerType == CT_GROUP)) then
        if ((g_sLstLabelType == LT_GROUPHEADER) || StringIsBlank (g_sLstFieldHeader)) then
          let sFieldType = sFieldType + msgBrlLstGroupHeaderType
        endif
      elif (g_sLstContainerType == CT_SUBGROUP) then
        if ((g_sLstLabelType == LT_SUBGROUPLABEL) || StringIsBlank (g_sLstFieldHeader)) then
          let sFieldType = sFieldType + msgBrlLstGroupHeaderType
        endif
      elif (g_sLstContainerType == CT_ROW) then
        /*  if (g_bLstLabelIsIcon) then
         *  let sFieldType = sFieldType + msgBrlIcon */
        if (!g_bLstLabelIsIcon) then
          if ((g_nGuiComponentType == GUI_TC_LABEL) && !StringIsBlank (g_sLstLabelType)) then
            if (!g_bGuiGridCellChangeable && (g_bLstColorIndex!=CI_READONLY)) then
              let sFieldType = sFieldType + msgBrlStateReadOnly ; ROM: 2009/10/19 - avoid space after read-only state marker
            endif
            let sFieldType = sFieldType + BrailleGetSubTypeString (WT_EDIT)
          endif
        endif
      endif
      if (!StringIsBlank (sFieldType)) then
        BrailleAddString (sFieldType, GetCursorCol(), GetCursorRow(), 0)
      endif
    endif
  endif

  /* label text */
  if (g_nGuiComponentType == GUI_TC_LABEL) then
    let name = ""
    if (!StringIsBlank (g_sGuiLabelText)) then
      let name = g_sGuiLabelText
    elif (!StringIsBlank (g_sGuiLabelTooltip)) then
      let name = g_sGuiLabelTooltip
    endif
    ; if (g_bLstLabelIsIcon == TRUE) then
    if (!StringIsBlank (g_sGuiLabelIcon)) then
      let name = msgBrlIcon + cscSpace + name
    endif
    if (StringIsBlank (name) == FALSE) then
      BrailleAddString (name, GetCursorCol(), GetCursorRow(), 0)
    endif
  elif (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    if ((g_nGuiComponentType == GUI_TC_CTEXTFIELD) || (g_nGuiComponentType == GUI_TC_TEXTFIELD)) then
      BrailleAddObjectGuiTextFieldState (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
      let name = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
      /* ROM: 2009/10/19 - add read-only state to control type (also for other control types) */
      if (g_bGuiTextFieldReadOnly!=FALSE) then
        let name = msgBrlStateReadOnly + name
      endif
      BrailleAddString (name, 0, 0, 0)
      BrailleAddObjectGuiTextFieldText (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
    elif (g_nGuiComponentType == GUI_TC_CHECKBOX) then
      let name = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
      if (!g_bGuiComponentChangeable) then
        let name = msgBrlStateReadOnly + name
      endif
      BrailleAddString (name, 0, 0, 0)
      BrailleAddObjectGuiCheckboxName (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
      BrailleAddObjectGuiCheckboxState (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
      BrailleAddObjectGuiComponentState (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
    endif
  endif

  if (g_bLstIsListElement && (g_sLstContainerType == CT_TREE)) then
    let info = ""
    if (g_bNodeExpandable) then
      ; let info = msgBrlTVNodeClosed + cscSpace
      let info = BrailleGetStateString (CTRL_COLLAPSED)
    else
      if (g_nNodeRealChildrenTotal != 0) then
        ; let info = BrailleGetStateString (CTRL_OPENED)
        let info = BrailleGetStateString (CTRL_EXPANDED)
      endif
    endif
    if (g_bNodeExpandable || (g_nNodeRealChildrenTotal == 0))  then
      let info = info + FormatString (msgItemPosition, IntToString(g_nNodeNo), IntToString(g_nNodeChildrenTotal))
    else
      if (g_nNodeChildrenTotal == 1) then
        let info = info + cscSpace + IntToString(g_nNodeChildrenTotal) + cscSpace + msgTreeEntry
      else
        let info = info + cscSpace + IntToString(g_nNodeChildrenTotal) + cscSpace + msgTreeEntries + cscSpace
      endif
    endif
    BrailleAddString (info, GetCursorCol(), GetCursorRow(), 0)
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiLabelState (int nType)
var
  string name

  let name = ""


  if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
    /* ABAP list */
  else
    /* regular label */
    if (g_bGuiLabelHighlighted) then
      let name = msgBrlStateHighlighted
      BrailleAddString (name, GetCursorCol(), GetCursorRow(), 0)
    endif

    let name = ""
    if (g_sGuiLabelAccText != g_sGuiLabelText) then
      let name = g_sGuiLabelAccText
    endif

    if ((g_nSapGuiAccVerbosity > 0) && (g_sGuiLabelAccTextOnRequest != cscNull)) then
      let name = name + cscSpace + g_sGuiLabelAccTextOnRequest
    endif

    if (StringIsBlank (name) == FALSE) then
      BrailleAddString (name, GetCursorCol(), GetCursorRow(), 0)
    endif
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiOkCodeField functions
 **********************************************************************
*/

/*
 * GetCurrentGuiOkCodeField
*/

int Function GetCurrentGuiOkCodeField ()

  if (g_bGuiOkCodeFieldIsValid) then
    return (TRUE)
  endif

  let g_bGuiOkCodeFieldIsValid = TRUE

  return (TRUE)

EndFunction

void Function ResetGuiOkCodeField ()

  let g_bGuiOkCodeFieldIsValid = TRUE

EndFunction

Void Function SayCurrentGuiOkCodeField ()

  IndicateControlType (WT_EDITCOMBO, msgGuiOkCodeField)

EndFunction

/*
 **********************************************************************
 ** GuiVHViewSwitch functions
 **********************************************************************
*/

/*
 * GetCurrentGuiVHViewSwitch
*/

int Function GetCurrentGuiVHViewSwitch ()

  if (g_bGuiVHViewSwitchIsValid) then
    return (TRUE)
  endif

  let g_bGuiVHViewSwitchIsValid = TRUE

  return (TRUE)

EndFunction

void Function ResetGuiVHViewSwitch ()

  let g_bGuiVHViewSwitchIsValid = TRUE

EndFunction

Void Function SayCurrentGuiVHViewSwitch ()

  IndicateControlType (WT_COMBOBOX, msgGuiVHViewSwitchName)

EndFunction

/*
 **********************************************************************
 ** GuiComboBox functions
 **********************************************************************
*/

/*
 * GetCurrentGuiComboBox
*/

int Function GetCurrentGuiComboBox  ()
Var
  string sKey,
  string sValue,
  int bChangeable,
  string s,
  string sTooltip,
  int y

  if (g_bGuiComboBoxIsValid) then
    return TRUE
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if (g_sGuiComponentSubType == sGuiComboBox) then
      g_sLeftLabelText = g_oGuiComponent.LabelText
      g_sGuiComboBoxText = g_oGuiComponent.Text
      g_nGuiComboboxEntries = g_oGuiComponent.Entries.Count

      g_bGuiComboboxIsListboxActive = g_oGuiComponent.IsListboxActive
      if (g_bGuiComboboxIsListboxActive) then
        var string sSelected = g_oGuiComponent.Selected
        ; sValue = g_oGuiComponent.Entries.Item(StringToInt(sSelected)-1).Value
        ; g_nGuiComboboxPos = g_oGuiComponent.Entries.Item(StringToInt(sSelected)-1).Pos
        sValue = g_oGuiComponent.CurListboxEntry.Value
        g_nGuiComboboxPos = g_oGuiComponent.CurListboxEntry.Pos
        g_sGuiComboboxCurListboxEntry =  sValue
        g_sGuiComboBoxText = ""
      else
        g_nGuiComboboxPos = 0
        g_sGuiComboboxCurListboxEntry = ""
      endif

      g_bGuiComboBoxIsValid = true
      return
    endif
  endif

  let g_sGuiComboBoxTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiComboBoxTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiComboBoxTooltip
    endif
  endif

  let g_sGuiComboboxText = g_oGuiComponent.Text
  if (!StringIsBlank (g_sGuiComponentAccText)) then
    let g_sGuiComboboxText = g_sGuiComponentAccText
  endif

  let bChangeable =  g_oGuiComponent.Changeable
  let g_bGuiComboboxReadOnly= FALSE
  if (bChangeable==FALSE) then
    let g_bGuiComboboxReadOnly= TRUE
  endif

  let g_bGuiComboboxHighlighted = g_oGuiComponent.Highlighted
  let g_nGuiComboboxEntries = g_oGuiComponent.Entries.Count
  let g_bGuiComboboxRequired = g_oGuiComponent.Required

  let g_bGuiComboboxIsListboxActive = g_oGuiComponent.IsListboxActive
  if (g_bGuiComboboxIsListboxActive) then
    let sValue = g_oGuiComponent.CurListboxEntry.Value
    let g_nGuiComboboxPos = g_oGuiComponent.CurListboxEntry.pos

    let sKey = ""
    /* ROM 2011/12/09 - added check against new property "ShowKeys" */
    if (g_oGuiComponent.ShowKey || g_oSAPGUISession.ShowDropdownKeys || StringIsBlank(sValue)) then
      let sKey = g_oGuiComponent.CurListboxEntry.Key
    endif
    if ((!StringIsBlank(sKey)) && (StringCompare (sKey, sValue, true) != 0)) then
      let g_sGuiComboboxCurListboxEntry =  sKey + cscSpace + sValue
    else
      let g_sGuiComboboxCurListboxEntry =  sValue
    endif
  else
    let g_nGuiComboboxPos = 0
    let g_sGuiComboboxCurListboxEntry = ""
  endif

  let g_bFlushing = g_oGuiComponent.Flushing

  if (g_nGuiComponentParentType == GUI_TC_TOOLBAR) then
    let g_bGuiComboBoxParentIsToolbar = TRUE
  else
    let g_bGuiComboBoxParentIsToolbar = FALSE
  endif

  let g_bGuiComboBoxIsValid = TRUE

  return TRUE

EndFunction

void Function ResetGuiCombobox ()

  let g_sGuiComboboxTooltip = ""
  let g_sGuiComboboxText = ""
  let g_sGuiComboboxCurListboxEntry = ""
  let g_bGuiComboboxParentIsToolbar = false
  let g_bGuiComboboxIsListboxActive = false
  let g_bGuiComboboxReadOnly = false
  let g_bGuiComboboxRequired = false
  let g_bGuiComboboxHighlighted = false
  let g_nGuiComboboxEntries = -1
  let g_nGuiComboboxPos = -1
  let g_bFlushing = false

  let g_bGuiComboboxIsValid = true

EndFunction

/*
 * SayCurrentGuiComboBox
 */

Void Function SayCurrentGuiComboBox  ()
Var
  string info,
  string sTooltip,
  string sLabel

  if g_bGuiComboBoxParentIsToolbar then
    return
  endif

  let info = ""
  let sTooltip = ""

  if (g_bGuiComboboxIsListboxActive) then
    let info = g_sGuiComboboxCurListboxEntry
    if (StringIsBlank (info)) then
      let info = msgNotSelected
    endif
  else
    if (g_bGuiComponentSameAsPrevious) then
      let info = g_sGuiComboboxText
    else
      let sLabel = ""
      if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
        let sLabel = SayLabelText ()
      endif

      if (!StringIsBlank (sLabel)) then
        if (ShoulditemSpeak (OT_TOOL_TIP)) then
          if (StringCompare (sLabel, g_sGuiComboBoxTooltip, false) != 0) then
            if (StringCompare (info, g_sGuiComboBoxTooltip, false) != 0) then
              let sTooltip = g_sGuiComboBoxTooltip
            endif
          endif
        endif
      elif (!StringIsBlank (g_sGuiComboBoxTooltip)) then
        Say (g_sGuiComboBoxTooltip, OT_CONTROL_NAME)
      endif

      if (ShouldItemSpeak (OT_ITEM_STATE)) then
        if (g_bGuiComboboxReadOnly!=FALSE) then
          let info = info + msgStateReadOnly+cscSpace
        endif
        if (g_bGuiComboboxRequired!=FALSE) then
          let info = info + msgStateRequired+cscSpace
        endif
         if (g_bGuiComboboxHighlighted!=FALSE) then
          let info = info + cscSpace + msgStateHighlighted + cscSpace
        endif
     endif

      if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
        if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
          let info = info + cscSpace + msgGuiComboBox
        endif
      endif

      if (!StringIsBlank (g_sGuiComboboxText)) then
        let info = info + cscSpace + g_sGuiComboBoxText
      else
        let info = info + cscSpace + msgNotSelected
      endif

      ; if (!StringIsBlank (g_sRightLabelText)) then
      ;   let info = info + cscSpace + g_sRightLabelText
      ; endif
    endif
  endif

  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
  endif

  if (ShoulditemSpeak (OT_ITEM_NUMBER)) then
    let info = ""
    if (g_nGuiComboboxPos != 0) then
      let info = FormatString (msgGuiComboboxPosition, IntToString(g_nGuiComboboxPos), IntToString(g_nGuiComboboxEntries))
    else
      if ((!g_bGuiComponentSameAsPrevious) || (g_bGuiComboboxIsListboxActive && g_bGuiComboboxRequired)) then
        if (g_nGuiComboboxEntries != 1) then
          let info = FormatString (msgGuiComboboxCount, IntToString (g_nGuiComboboxEntries))
        else
          let info = FormatString (msgGuiComboboxSingleEntry, IntToString (g_nGuiComboboxEntries))
        endif
      endif
    endif
    if (!StringIsBlank (info)) then
      Say (info, OT_ITEM_NUMBER)
    endif
  endif

  SayRightLabelText ()

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

  if (!g_bGuiComponentSameAsPrevious) then
    if (g_bIsStepLoop) then
      SayCurrentStepLoop ()
    else
      SayCurrentGuiTableControl ()
    endif
  endif

  BrailleRefresh ()

EndFunction

Int Function BrailleAddObjectGuiComboboxValue (int nType)
var
  string info

  if (g_bGuiComboboxIsListboxActive) then
    let info = g_sGuiComboboxCurListboxEntry
  else
    let info = g_sGuiComboBoxText
  endif

  let info = StringTrimLeadingBlanks (info)
  let info = StringTrimTrailingBlanks (info)

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return true

EndFunction


Int Function BrailleAddObjectGuiComboBoxState (int nType)
Var
  string info

  let info = ""
  /* ROM: 2009/10/19 - read-only state now handled as part of the control type */
  ; if (g_bGuiComboboxReadOnly!=FALSE) then
  ;   let info = info + msgBrlStateReadOnly + cscSpace
  ; endif
  if (g_bGuiComboboxRequired!=FALSE) then
      let info = info + msgBrlStateRequired
  endif
  if (g_bGuiComboboxHighlighted!=FALSE) then
    let info = info + msgBrlStateHighlighted+cscSpace
  endif

  let info = StringTrimLeadingBlanks (info)
  let info = StringTrimTrailingBlanks (info)

  ; if (StringRight(info,1)==cscSpace) then
  ;   let info = StringLeft(info,StringLength(info)-1 )
  ; endif

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

Int Function BrailleAddObjectGuiComboboxPosition (int nType)
var
  string info

  let info = ""
  if (g_nGuiComboboxPos != 0) then
    let info = FormatString (msgGuiComboboxPosition, IntToString(g_nGuiComboboxPos), IntToString(g_nGuiComboboxEntries))
  else
    if (g_nGuiComboboxEntries != 1) then
      let info = FormatString (msgGuiComboboxCount, IntToString (g_nGuiComboboxEntries))
    else
      let info = FormatString (msgGuiComboboxSingleEntry, IntToString (g_nGuiComboboxEntries))
    endif
  endif

  let info = StringTrimLeadingBlanks (info)
  let info = StringTrimTrailingBlanks (info)

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiComboboxType (int nType)

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
    BrailleAddString (BrailleGetSubtypeString(WT_COMBOBOX), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
    return true
  endif

  BrailleAddString (BrailleGetSubtypeString(nType), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  return true
EndFunction

/*
 **********************************************************************
 ** GuiRadioButton functions
 **********************************************************************
*/

int Function GetGuiRadioButton (object oGuiComponent, string ByRef sText, int ByRef bState, int ByRef nGroupPos, int ByRef nGroupCount)

  sText = TrimString (oGuiComponent.Text)
  if (!StringIsBlank (g_sGuiComponentAccText)) then /* accText takes precedence */
    sText = g_sGuiComponentAccText
  endif

  bState = oGuiComponent.Selected

  nGroupPos = oGuiComponent.GroupPos
  nGroupCount = oGuiComponent.GroupCount

  return true

EndFunction

int Function GetCurrentGuiRadioButton ()

  if (g_bGuiRadioButtonIsValid) then
    return TRUE
  endif

  GetGuiRadioButton (g_oGuiComponent, g_sGuiRadioButtonText, g_bGuiRadioButtonState,
    g_nGuiRadioButtonGroupPos, g_nGuiRadioButtonGroupCount)

  let g_bFlushing = g_oGuiComponent.Flushing

  let g_sGuiRadioButtonTooltip = g_sGuiComponentTooltip
  if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
    if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
      let g_sGuiRadioButtonTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiRadioButtonTooltip
    endif
  endif

  if (StringIsBlank (g_sGuiRadioButtonText) && !StringIsBlank (g_sGuiRadioButtonTooltip)) then
    let g_sGuiRadioButtonText = g_sGuiRadioButtonTooltip
  endif


  let g_bGuiRadioButtonIsValid = TRUE

  return TRUE

EndFunction

int Function ResetGuiRadioButton ()

  g_sGuiRadioButtonText = ""
  g_bGuiRadioButtonState = false
  g_nGuiRadioButtonGroupPos = 0
  g_nGuiRadioButtonGroupCount = 0

  g_sGuiRadioButtonTooltip = ""
  g_sGuiRadioButtonText = ""

  g_bFlushing = false

  g_bGuiRadioButtonIsValid = TRUE

  return TRUE

EndFunction

/*
 * SayCurrentGuiRadioButton
 */

Void Function SayCurrentGuiRadioButton ()
Var
  string type,
  string text,
  string state,
  string info,
  string sTooltip,
  string s

  if ((g_bNewColumn == True) || ((g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && !g_bIsStepLoop)) then
    SayLabelText ()
  endif

  let text = g_sGuiRadioButtonText
  if (g_bGuiRadioButtonState) then
    let state = msgGuiRadioButtonSelected
  else
    let state = msgGuiRadioButtonNotSelected
  endif

  let sTooltip = ""
  if (!StringIsBlank (text)) then
    let info = text + cscSpace
    if (ShoulditemSpeak (OT_TOOL_TIP)) then
      if (g_sGuiRadioButtonTooltip != cscNull) then
        let s = TrimString (g_sGuiRadioButtonTooltip)
        if (StringCompare (s, text, false) != 0) then
          let sTooltip = s
        endif
      endif
    endif
  elif (!StringIsBlank (g_sGuiRadioButtonTooltip)) then
    let info =  g_sGuiRadioButtonTooltip + cscSpace
  endif
  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
  endif

  if (!g_bGuiComponentChangeable) then
    /* let info = info + msgStateDisabled + cscSpace */
    let info = smmStripMarkup (smmGetStartMarkupForControlState (WT_RADIOBUTTON, CTRL_DISABLED)) + cscSpace
    Say (info, OT_CONTROL_TYPE)
  endif

  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    ; let info = info + smmStripMarkup (smmGetStartMarkupForControlType (WT_RADIOBUTTON)) + cscSpace
    IndicateControlType (WT_RADIOBUTTON, cscSpace, cscSpace)
  endif
  if (ShoulditemSpeak (OT_ITEM_STATE)) then
    ; let info = info + state + cscSpace
    Say (state, OT_ITEM_STATE)
  endif

  if ((ShouldItemSpeak (OT_ITEM_NUMBER)) && (g_nGuiRadioButtonGroupPos != 0) && (g_nGuiRadioButtonGroupCount != 0)) then
    let text = FormatString (msgGuiRadioButtonPosition, IntToString(g_nGuiRadioButtonGroupPos), IntToString(g_nGuiRadioButtonGroupCount))
    ; let info = info + text
    Say (text, OT_ITEM_NUMBER)
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

  if (!g_bGuiComponentSameAsPrevious) then
    if (g_bIsStepLoop) then
      SayCurrentStepLoop ()
    else
      SayCurrentGuiTableControl ()
    endif
  endif

EndFunction


Int Function BrailleAddObjectGuiRadioButtonName (int nType)
  var
    string name

  if (!StringIsBlank (g_sGuiRadioButtonText)) then
    let name = g_sGuiRadioButtonText
  elif (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    if (!StringIsBlank (g_sGuiComponentParentColumnName)) then
      let name = g_sGuiComponentParentColumnName
    endif
  endif

  if (name != cscNull) then
    BrailleAddString (name, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction


Int Function BrailleAddObjectGuiRadioButtonState (int nType)
var
  int state

  let state = g_bGuiRadioButtonState
  if (state) then
    BrailleAddString (BrailleGetStateString(CTRL_CHECKED), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  else
    BrailleAddString (BrailleGetStateString(CTRL_UNCHECKED), g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

Int Function BrailleAddObjectGuiRadioButtonPosition (int nType)
var
  string info

  let info = ""

  if ((g_nGuiRadioButtonGroupPos != 0) && (g_nGuiRadioButtonGroupCount != 0)) then
    let info = FormatString (msgGuiRadioButtonPosition, IntToString(g_nGuiRadioButtonGroupPos), IntToString(g_nGuiRadioButtonGroupCount))
  endif

  let info = StringTrimLeadingBlanks (info)
  let info = StringTrimTrailingBlanks (info)

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiTableControl
 **********************************************************************
*/

; ROM 2010/07/29 - cleaned: handling of column tooltips in table controls (previously not available)
Void Function GetGuiTableControlAttributes ()
Var
  string sColTitle,
  string sTooltip,
  string sTmp,
  ; ROM 2010/10/20 - deleted unused variables
  object oGuiElement,
  int idx,
  int row

  let g_iGuiTableControlRowOffset = 0

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    let g_sGuiTableControlTitle = g_oGuiComponentParent.Text
    let row = g_oGuiComponentParent.CurrentRow+1
    let g_iGuiTableControlRowOffset = g_oGuiComponentParent.VerticalScrollbar.Position

    let oGuiElement = g_oGuiComponentParent.Rows.ElementAt(row-1)
    let g_bTableRowSelectable = oGuiElement.Selectable

    if (g_iGuiTableControlCurRow != row) then
      let g_bNewRow = TRUE
    else
      let g_bNewRow = FALSE
    endif
    let g_iGuiTableControlCurRow = row

    let idx = g_oGuiComponentParent.CurrentCol
    if (g_iGuiTableControlCurCol != idx+1) then
      let g_bNewColumn = TRUE
    else
      let g_bNewColumn = FALSE
    endif

    let sTooltip = ""
    let sColTitle = ""
    if (idx >= 0) then
      let oGuiElement = g_oGuiComponentParent.Columns.ElementAt(idx)
      let sColTitle = TrimString (oGuiElement.Title)
      let g_bCurColIsSelected = oGuiElement.Selected

      ; ROM 2010/10/20 - access the column tooltip a different way
      let sTooltip = TrimString (oGuiElement.Tooltip)
      let sTmp = oGuiElement.DefaultTooltip
      if (!StringIsBlank (sTmp)) then
        let sTooltip = sTmp + cscSpace + sTooltip
      endif
      let sTmp = TrimString (oGuiElement.AccTooltip)
      if (!StringIsBlank (sTmp)) then
        let sTooltip = sTmp + cscSpace + sTooltip
      endif

      ; ROM 2010/10/20 - deleted unused properties

      let oGuiElement = oNull
    else
      let g_bCurColIsSelected = FALSE
      let sColTitle = ""
    endif
    let g_iGuiTableControlCurCol = idx+1

    let g_sGuiComponentParentColumnTooltip = sTooltip
    if (StringIsBlank (sColTitle)) then
      let sColTitle = sTooltip
    endif

    if (StringCompare (sColTitle, g_sGuiComponentParentColumnName, false) != 0) then
      let g_sGuiComponentParentColumnName = sColTitle
      let g_bNewColumn = True
    endif

    if (g_oGuiComponentParent.TableFieldName != g_sGuiTableControlName) then
      let g_sGuiTableControlName = g_oGuiComponentParent.TableFieldName
      let g_iGuiTableControlColCount = g_oGuiComponentParent.Columns.Count
      let g_iGuiTableControlRowCount = g_oGuiComponentParent.RowCount
      let g_bNewTable = True
    else
      let g_bNewTable = False
    endif

    g_iGuiTableControlVisibleRowCount = g_oGuiComponentParent.VisibleRowCount

    if (g_iGuiTableControlRowOffset >= (g_iGuiTableControlRowCount-2*g_iGuiTableControlVisibleRowCount)) then
      var int i = 0
      var int nEmptyLines = 0
      var int nRowCount = 0
      var object oRow = oNull
      while (i < g_iGuiTableControlVisibleRowCount)
        oRow = g_oGuiComponentParent.Rows.ElementAt(i)
        nRowCount = oRow.Count
        if (nRowCount == 0) then
          nEmptyLines = nEmptyLines + 1   
        endif
        i = i + 1
      endwhile
      if (nEmptyLines > 0) then
        g_iGuiTableControlVisibleRowCount = g_iGuiTableControlVisibleRowCount - nEmptyLines
      endif
    endif

    let g_bCurRowIsSelected = False
    if (row > 0) then
      let oGuiElement = g_oGuiComponentParent.Rows.ElementAt(row-1)
      let g_bCurRowIsSelected = oGuiElement.Selected
      let oGuiElement = oNull
    else
      let g_bCurRowIsSelected = FALSE
    endif
  else
    let g_iGuiTableControlCurRow = -1
    let g_iGuiTableControlCurCol = -1
    let g_bNewColumn = False
    let g_bNewTable = False
    let g_bNewRow = False
    let g_bCurColIsSelected = False
    let g_bCurRowIsSelected = False
    let g_sGuiTableControlName = ""
    let g_sGuiComponentParentColumnName = ""
    let g_sGuiComponentParentColumnTooltip = ""
  endif

endFunction

Void Function SayCurrentGuiTableControl ()
Var
  string msg

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    if (g_bNewColumn && !StringIsBlank (g_sGuiComponentParentColumnTooltip)) then
      if (StringCompare (g_sGuiComponentParentColumnName, g_sGuiComponentParentColumnTooltip, false) != 0) then
        Say (g_sGuiComponentParentColumnTooltip, OT_TOOL_TIP)
      endif
    endif
    if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
      if (g_bNewTable==True) then
        let msg = msgTableControl + cscSpace + g_sGuiTableControlTitle + cscSpace
        let msg = msg + FormatString(msgTableVisibleTotalRows, IntToString(g_iGuiTableControlRowCount),IntToString(g_iGuiTableControlVisibleRowCount))
        Say (msg, OT_CONTROL_TYPE)
      endif
    endif
    if (ShoulditemSpeak (OT_POSITION)) then
      if ((g_bNewColumn) && (g_iGuiTableControlColCount>0) && (g_iGuiTableControlCurCol>0)) then
        let msg = FormatString (msgTablePositionCols,IntToString(g_iGuiTableControlCurCol),IntToString(g_iGuiTableControlColCount))
        Say (msg, OT_POSITION)
        let msg = ""
        if (ShouldItemSpeak (OT_SELECTED_ITEM)) then
          if (g_bCurColIsSelected) then
            let msg = msgLstColumn + cscSpace + msgItemsSelected
            Say (msg, OT_SELECTED_ITEM)
          endif
        endif
        let msg = ""
      endif
      if ((g_bNewRow) && ((g_iGuiTableControlRowCount>0) || (g_iGuiTableControlVisibleRowCount>0)) && (g_iGuiTableControlCurRow>0)) then
        if (g_iGuiTableControlVisibleRowCount > 0) then
          let msg = FormatString(msgTablePositionRows,IntToString(g_iGuiTableControlCurRow+g_iGuiTableControlRowOffset),IntToString(g_iGuiTableControlRowCount))
          let msg =msg + cscSpace + FormatString(msgTablePositionVisibleRows,IntToString(g_iGuiTableControlCurRow),IntToString(g_iGuiTableControlVisibleRowCount))
        else
          let msg = FormatString(msgTablePositionRows,IntToString(g_iGuiTableControlCurRow+g_iGuiTableControlRowOffset),IntToString(g_iGuiTableControlRowCount))
        endif
        Say (msg, OT_POSITION)
        let msg = ""
        if (ShouldItemSpeak (OT_SELECTED_ITEM)) then
          if (g_bCurRowIsSelected) then
            let msg = msgLstRow +cscSpace + msgItemsSelected
          elif (g_bTableRowSelectable!=False) then
            let msg = msgTableRowSelectable + cscSpace
          endif
          Say (msg, OT_SELECTED_ITEM)
          let msg = ""
        endif

        if ((g_iGuiTableControlCurRow == g_iGuiTableControlVisibleRowCount) || (g_iGuiTableControlCurRow == g_iGuiTableControlRowCount)) then
          if (g_iGuiTableControlCurCol == g_iGuiTableControlColCount) then
            Say (msgTableLastVisibleCell, OT_POSITION)
          elif (g_bNewRow) then
            Say (msgTableLastVisibleRow, OT_POSITION)
          endif
        endif
      endif
    endif
  endif

EndFunction

/*
 * Table reading scripts
 */
Script SayCell ()
Var
  string msg,
  string sFieldTypeModifier,
  string sColumnTypeModifier

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    ResetGuiComponent ()
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      ResetGuiComponent ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  /*
   * ... removed obsolete code from here (columns are announced as part of the SayCurrent... functions) ...
   */

  if (g_sLstContainerType == CT_TABLE) || ((g_sLstContainerType!=CT_TREE) && (g_sLstContainerType!=CT_FREETEXT) && (g_sLstContainerType!=CT_TEXTBOX)) then

    ResetGuiComponent ()

    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()

    let msg = msgLstTable + cscSpace + msgLstNumber + cscSpace + IntToString(g_nLstTableNo) + cscSpace + g_sLstContainerTitle  + cscSpace + msgLstWith + cscSpace
    if (!StringIsBlank (g_sLstTableHierarchical)) then
      if (g_sLstTableHierarchical == "2") then
        let msg = msg + msgLst2HierarchyLevels + cscSpace
      elif (g_sLstTableHierarchical == "3") then
        let msg = msg + msgLst3HierarchyLevels + cscSpace
      endif
    endif
    let msg = msg + IntToString(g_nLstRowsTotal) + cscSpace + msgLstRows + cscSpace
    let msg = msg + IntToString(g_nLstColsTotal) + cscSpace + msgLstColumns + cscSpace
    if (!StringIsBlank (g_sLstTableHierarchical)) then
      let msg = msg + IntToString(g_nLstTableGroupsTotal) + cscSpace + msgLstGroups + cscSpace
    endif
    let msg = msg + cscSpace + cscSpace + cscSpace

    Say (msg, OT_JAWS_MESSAGE)

    return

  endif

  PerformScript SayCell ()

EndScript

Script PriorCell ()
var
  int idx,
  object oGuiElement

  if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    SayCurrentScriptKeyLabel ()
    if ((g_iGuiTableControlColCount > 0) && (g_iGuiTableControlCurCol > 1)) then
      ; TypeKey ("Shift+Tab")
      PerformScript ShiftTab ()
      Delay (2)
    endif
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  elif (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      SayCurrentScriptKeyLabel ()
      if ((g_iGuiGridColumnCount > 0) && (g_iGuiGridCurColumn > 1)) then
        ; TypeKey ("Shift+Tab")
        PerformScript ShiftTab ()
        Delay (2)
      endif
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  /* if (g_nGuiComponentType == GUI_TC_LABEL) then */
  if (!StringIsBlank(g_sLstContainerType)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  PerformScript priorCell ()

EndScript

Script NextCell ()

  if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    SayCurrentScriptKeyLabel ()
    if ((g_iGuiTableControlColCount > 0) && (g_iGuiTableControlCurCol < g_iGuiTableControlColCount)) then
      ; TypeKey ("Tab")
      PerformScript Tab ()
      Delay (2)
    endif
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  elif (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      /* saystring ("debug next cell") */
      SayCurrentScriptKeyLabel ()
      if ((g_iGuiGridColumnCount > 0) && (g_iGuiGridCurColumn < g_iGuiGridColumnCount)) then
        /* TypeKey ("RightArrow") */
        PerformScript Tab ()
        Delay (2)
      endif
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  /* if (g_nGuiComponentType == GUI_TC_LABEL) then */
  if (!StringIsBlank(g_sLstContainerType)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  PerformScript nextCell ()

EndScript

Script DownCell ()

  if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    return
  endif

  /* if (g_nGuiComponentType == GUI_TC_LABEL) then */
  if (!StringIsBlank(g_sLstContainerType)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    SayCurrentScriptKeyLabel ()
    if ((g_iGuiTableControlColCount > 0) && (g_iGuiTableControlCurRow < g_iGuiTableControlVisibleRowCount)) then
      ; TypeKey ("DownArrow")
      PerformScript NextLine ()
      Delay (2)
    endif
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  elif (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      SayCurrentScriptKeyLabel ()
      if ((g_iGuiGridColumnCount > 0) && (g_iGuiGridCurRow < g_iGuiGridRowCount)) then
        ; TypeKey ("DownArrow")
        PerformScript NextLine ()
        Delay (2)
      endif
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  PerformScript downCell ()

EndScript

Script UpCell ()

  if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    return
  endif

  /* if (g_nGuiComponentType == GUI_TC_LABEL) then */
  if (!StringIsBlank(g_sLstContainerType)) then
    SayCurrentScriptKeyLabel ()
    TypeCurrentScriptKey ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    SayCurrentScriptKeyLabel ()
    if ((g_iGuiTableControlColCount > 0) && (g_iGuiTableControlCurRow > 1)) then
      ; TypeKey ("UpArrow")
      PerformScript PriorLine ()
      Delay (2)
    endif
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  elif (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      SayCurrentScriptKeyLabel ()
      if ((g_iGuiGridColumnCount > 0) && (g_iGuiGridCurRow < g_iGuiGridRowCount)) then
        ; TypeKey ("UpArrow")
        PerformScript PriorLine ()
        Delay (2)
      endif
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  PerformScript upCell ()

EndScript

Script SayWord ()

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    ; ResetGuiComponent ()

    UpdateCurrentGuiComponent ()
    let g_bNewColumn = TRUE
    SayCurrentGuiComponent ()

    return
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
      UpdateCurrentGuiComponent ()
      let g_bNewColumn = TRUE
      SayCurrentGuiComponent ()
      return
    endif
  endif

  PerformScript SayWord ()

EndScript

Void Function ResetGuiTableControl ()

  let g_sGuiTableControlTitle = ""
  let g_iGuiTableControlCurRow = -1
  let g_iGuiTableControlCurCol = -1
  let g_iGuiTableControlRowOffset = 0
  let g_sGuiComponentParentColumnName = ""
  let g_sGuiComponentParentColumnTooltip = ""
  let g_bNewColumn = True

  let g_sGuiTableControlName = ""
  let g_iGuiTableControlColCount = 0
  let g_iGuiTableControlRowCount = 0
  let g_iGuiTableControlVisibleRowCount = 0
  let g_bNewTable = True

EndFunction

/*
 * Braille functions used for TableControl and APO Grid
 */

Int Function BrailleAddObjectGuiTableControlInfo (int nType)
var
  string msg

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    if (g_iGuiTableControlCurRow < 0) then
      let msg = g_sGuiTableControlTitle
    else
      let msg = FormatString (msgBrlTableInfo, g_sGuiTableControlTitle, IntToString(g_iGuiTableControlCurRow+g_iGuiTableControlRowOffset), IntToString(g_iGuiTableControlCurCol))
    endif
    if (!StringIsBlank (msg)) then
      ; BrailleAddString (msg, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
      BrailleAddString (msg, 0, 0, 0)
    endif
  elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
    let msg = FormatString (msgBrlTableInfo, g_sGuiCtrlApoGridTitle,
      IntToString (g_nGuiCtrlApoGridCurrentRow), IntToString(g_nGuiCtrlApoGridCurrentColumn))
    if (!StringIsBlank (msg)) then
      BrailleAddString (msg, 0, 0, 0)
    endif
  endif

  return TRUE

EndFunction

int Function BrailleAddObjectGuiTableControlColumn (int nType)

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    if (!StringIsBlank (g_sGuiComponentParentColumnName)) then
      ; BrailleAddString (g_sGuiComponentParentColumnName, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop, 0)
      BrailleAddString (g_sGuiComponentParentColumnName, 0, 0, 0)
    endif
  elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
    BrailleAddString (g_sGuiCtrlApoGridColumnHeader, 0, 0, 0)
  endif

  return TRUE

EndFunction

Int Function BrailleAddObjectGuiTableControlCell (int nType)
var
  string msg

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiCtrlApoGrid)) then
    if (!CaretVisible ()) then
      let msg = g_sGuiCtrlApoGridCellValue
      BrailleAddString (msg, 0, 0, 0)
    endif
  endif

  if (g_nGuiComponentType == GUI_TC_TEXTFIELD) then
    BrailleAddObjectGuiTextFieldState (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
    /* ROM: 2009/10/19 - add read-only state to control type (also for other control types) */
    if (g_bGuiTextFieldReadOnly!=FALSE) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
    BrailleAddObjectGuiTextFieldText (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
  elif (g_nGuiComponentType == GUI_TC_CHECKBOX) then
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
    if (!g_bGuiComponentChangeable) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
    BrailleAddObjectGuiCheckboxName (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
    BrailleAddObjectGuiCheckboxState (WT_CUSTOM_CONTROL_BASE + GUI_WT_CHECKBOX)
  elif (g_nGuiComponentType == GUI_TC_COMBOBOX) then
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_COMBOBOX)
    if (!g_bGuiComponentChangeable) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
    BrailleAddObjectGuiComboboxValue (WT_CUSTOM_CONTROL_BASE + GUI_WT_COMBOBOX)
  elif (g_nGuiComponentType == GUI_TC_CTEXTFIELD) then
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_CTEXTFIELD)
    if (g_bGuiTextFieldReadOnly!=FALSE) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
    BrailleAddObjectGuiTextFieldText (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
  elif (g_nGuiComponentType == GUI_TC_PASSWORDFIELD) then
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_PASSWORDFIELD)
    if (g_bGuiTextFieldReadOnly!=FALSE) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
    BrailleAddObjectGuiTextFieldText (WT_CUSTOM_CONTROL_BASE + GUI_WT_TEXTFIELD)
  elif (g_nGuiComponentType == GUI_TC_BUTTON) then
    BrailleAddObjectGuiButtonName (WT_CUSTOM_CONTROL_BASE + GUI_WT_BUTTON)
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_BUTTON)
    if (!g_bGuiComponentChangeable) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
  elif (g_nGuiComponentType == GUI_TC_RADIOBUTTON) then
    BrailleAddObjectGuiButtonName (WT_CUSTOM_CONTROL_BASE + GUI_WT_RADIOBUTTON)
    BrailleAddObjectGuiRadioButtonState (WT_CUSTOM_CONTROL_BASE + GUI_WT_RADIOBUTTON)
    let msg = BrailleGetSubtypeString (WT_CUSTOM_CONTROL_BASE + GUI_WT_RADIOBUTTON)
    if (!g_bGuiComponentChangeable) then
      let msg = msgBrlStateReadOnly + msg
    endif
    BrailleAddString (msg, 0, 0, 0)
  elif (g_nGuiComponentType == GUI_TC_LABEL) then
    BrailleAddObjectGuiLabelContents (WT_CUSTOM_CONTROL_BASE + GUI_WT_LABEL)
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiShell
 ** ROM 2011/07/14 - code restructured - using subroutines for each component
 **********************************************************************
*/

/*
 **********************************************************************
 ** General GuiShell functions
 **********************************************************************
*/

void function GetCurrentGuiShell ()
var
  int nIntegrationType

  if (g_bGuiShellIsValid) then
    return
  endif

  if (IsSAPGUISessionBusy (2, TRUE)) then
    ResetGuiComponent ()
    return
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then

    ; g_sGuiComponentPreviousSubType = g_sGuiComponentSubType
    ; g_sGuiComponentSubType = g_oGuiComponent.SubType
    g_nGuiShellBrowserControlType = g_oGuiComponent.GetBrowserControlType ; ROM: new - SAPGUI 7.70 and later

    if (g_sGuiComponentSubType == sGuiGridView) then

      /* GuiGridView ALV */
      GetCurrentGuiGridView ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiTree) then

      /* GuiTree */
      GetCurrentGuiTree ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiCalendar) then

      /* GuiCalendar */
      GetCurrentGuiCalendar ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiOfficeIntegration) then

      /* GuiOfficeIntegration */
      let nIntegrationType = g_oGuiComponent.HostedApplication
      if (nIntegrationType != GUI_SI_UNKNOWN) then
        GuiShellIntegration (nIntegrationType)
      else
        /* ROM: actually, this case does not make sense */
        if (!StringIsBlank (g_sGuiComponentAccDescription)) then
          g_sOfficeIntegrationMessage = g_sGuiComponentAccDescription
        else
          g_sOfficeIntegrationMessage = msgOfficeContainerIsEmpty
        endif
      endif
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiHtmlViewer) then

      /*
      * ROM: new - SAPGUI 7.70 and later
      * BrowserControlType can be 0|1 -> 0==IE, 1==EdgeChromium
      * see also definition of GUI_SI_BROWSERCONTROL_IE/EDGE constants in sapfront.jsh
      */
      let nIntegrationType = g_nGuiShellBrowserControlType + GUI_SI_BROWSERCONTROL_IE

      GuiShellIntegration (nIntegrationType)

      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiToolbar) then

      /* GuiToolbar */
      let g_bToolbarIsValid = FALSE
      GetCurrentToolbar ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiPicture) then

      /* GuiCtrlPicture */
      let g_bGuiPictureIsValid = FALSE
      GetCurrentGuiPicture ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiTextEdit) then

      /* GuiTextedit */
      let g_bGuiTextEditIsValid = FALSE
      GetCurrentGuiTextEdit ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiCtrlApoGrid) then

      /* ApoGrid */
      let g_bGuiCtrlApoGridIsValid = FALSE
      GetCurrentGuiCtrlApoGrid ()
      let g_bGuiShellIsValid = TRUE

    elif (g_sGuiComponentSubType == sGuiAbapEditor) then

      /* AbapEditor */
      let g_bGuiAbapEditorIsValid = false
      GetCurrentGuiAbapEditor ()
      let g_bGuiShellIsValid = true

    endif

    BrailleRefresh ()

  endif

endFunction

void function SayCurrentGuiShell ()

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then

    if (!g_bGuiComponentSameAsPrevious) then
      if (g_sGuiComponentSubType != sGuiOfficeIntegration) then
        if (!StringIsBlank (g_sGuiComponentAccDescription)) then
          Say (g_sGuiComponentAccDescription, OT_TOOL_TIP)
          BrailleMessage (g_sGuiComponentAccDescription)
        endif
      else
        if (!StringIsBlank (g_sOfficeIntegrationMessage)) then
          Say (g_sOfficeIntegrationMessage, OT_TOOL_TIP)
          BrailleMessage (g_sOfficeIntegrationMessage)
        endif
      endif
      BrailleRefresh ()
    endif

    if (g_sGuiComponentSubType == sGuiGridView) then
      SayCurrentGuiGridView ()
    elif (g_sGuiComponentSubType== sGuiTree) then
      SayCurrentGuiTree ()
    elif (g_sGuiComponentSubType == sGuiCalendar) then
      SayCurrentGuiCalendar ()
    elif (g_sGuiComponentSubType == sGuiToolbar) then
      SayCurrentToolbar ()
    elif (g_sGuiComponentSubType == sGuiPicture) then
      SayCurrentGuiPicture ()
    elif (g_sGuiComponentSubType == sGuiTextEdit) then
      SayCurrentGuiTextEdit (0)
    elif (g_sGuiComponentSubType == sGuiCtrlApoGrid) then
      SayCurrentGuiCtrlApoGrid ()
    endif

  endif

endFunction

void function ResetGuiShell ()

  let g_bGuiShellIsValid = True
  let g_sGuiComponentSubType = ""
  let g_sGuiComponentPreviousSubType = ""
  let g_sOfficeIntegrationMessage = ""
  let g_nGuiShellBrowserControlType = GUI_SI_UNKNOWN

  ResetGuiGridView ()
  ResetGuiTree ()
  ResetGuiCalendar ()
  ResetToolbar ()
  ResetGuiPicture ()
  ResetGuiTextEdit ()
  ResetGuiAbapEditor ()

endFunction

/*
 **********************************************************************
 ** GuiGridView
 **********************************************************************
*/

void function GetCurrentGuiGridView ()
var
  object oSelColumns,
  int nCount,
  int nCellColumn,
  int nCellRow,
  int nRow1,
  int nRow2,
  int i,
  int j,
  int bFound,
  string s,
  string sCellColumn,
  string sColTitle,
  string sColTooltip,
  string sColLongTitle,
  string sSelColumn,
  string sSelRows

  let g_sGuiGridTitle = g_oGuiComponent.Title
  let g_iGuiGridRowCount = g_oGuiComponent.RowCount
  let g_iGuiGridColumnCount = g_oGuiComponent.ColumnCount
  let g_iGuiGridVisibleRowCount = g_oGuiComponent.VisibleRowCount
  let g_sGuiGridSelectionMode = g_oGuiComponent.SelectionMode

  let g_iGuiGridToolbarPreviousButton = g_iGuiGridToolbarFocusButton
  let g_iGuiGridToolbarFocusButton = g_oGuiComponent.GetToolbarFocusButton ()
  if (g_iGuiGridToolbarFocusButton != -1) then
    /* located on toolbar area of ALV */
    let g_bToolbarIsValid = FALSE
    GetCurrentToolbar ()
    let g_iGuiGridCurRow = -1
    let g_iGuiGridCurColumn = -1
    let g_sGuiGridCurColumn = ""
    /* return */
  else
    /* within table area of ALV */

    ResetToolbar () ; ROM - 2010/10/20 reset

    let sCellColumn = g_oGuiComponent.CurrentCellColumn
    let g_sGuiGridCurColumn = sCellColumn
    let nCellColumn = g_oGuiComponent.GetColumnPosition (sCellColumn)
    let nCellRow = g_oGuiComponent.CurrentCellRow

    let g_bNewColumn = FALSE
    let g_bNewRow = FALSE
    let g_bForceReadCell = FALSE

    if (g_iGuiGridCurColumn != nCellColumn+1) then
      let g_bNewColumn = TRUE
    endif
    if (g_iGuiGridCurRow != nCellRow+1) then
      let g_bNewRow = TRUE
    endif
    let g_iGuiGridCurRow = nCellRow + 1
    let g_iGuiGridCurColumn = nCellColumn + 1

    /* ROM 2018/07/23 - handling of history added */
    g_nHistoryEntries = 0
    g_nHistoryCurIndex = 0
    g_sHistoryCurEntry = ""
    g_bHistoryIsActive = g_oGuiComponent.HistoryIsActive(nCellRow, sCellColumn)
    if (g_bHistoryIsActive) then
      g_sHistoryCurEntry = g_oGuiComponent.HistoryCurEntry(nCellRow, sCellColumn)
      g_nHistoryCurIndex = g_oGuiComponent.HistoryCurIndex(nCellRow, sCellColumn)
      g_nHistoryCurIndex = g_nHistoryCurIndex + 1
      g_nHistoryEntries = g_oGuiComponent.HistoryList(nCellRow, sCellColumn).Count
    endif

    let g_sGuiGridPreviousCellType = g_sGuiGridCellType
    let g_sGuiGridPreviousCellProperty = g_sGuiGridCellProperty
    let g_sGuiGridCellProperty = ""
    let g_sGuiGridCellType = g_oGuiComponent.GetCellType (nCellRow, sCellColumn)
    let g_sGuiGridValue = g_oGuiComponent.GetCellValue (nCellRow, sCellColumn)

    ; !!!!! object does not support this ....
    ; let g_iGuiGridBoolState = g_oGuiComponent.GetCellCheckBoxChecked (nCellRow, sCellColumn)

    let sColTitle = g_oGuiComponent.GetDisplayedColumnTitle (sCellColumn)
    let sColTitle = StringTrimLeadingBlanks (sColTitle)
    let sColTitle = StringTrimTrailingBlanks (sColTitle)

    let sColTooltip = g_oGuiComponent.GetColumnTooltip(sCellColumn)
    let sColTooltip = StringTrimLeadingBlanks (sColTooltip)
    let sColTooltip = StringTrimTrailingBlanks (sColTooltip)

    ;Trying to retrieve the longest column title - KK
    If (g_oGuiComponent.GetColumnTitles(sCellColumn)) then
      Let j = 0
      Let nCount = g_oGuiComponent.GetColumnTitles(sCellColumn).count
      Let sColLongTitle = ""
      While (j < nCount)
        If (StringLength (g_oGuiComponent.GetColumnTitles(sCellColumn).item(j)) > StringLength (sColLongTitle)) then
          Let sColLongTitle = g_oGuiComponent.GetColumnTitles(sCellColumn).item(j)
        EndIf
        Let j = j + 1
      EndWhile
      Let sColLongTitle = TrimString (sColLongTitle)
    EndIf

    If (StringIsBlank (sColTooltip)) then
      Let sColTooltip = sColLongTitle
    EndIf

    If (StringIsBlank (sColTitle)) then
      let sColTitle = sColTooltip
      let sColTooltip = ""
    else
      if (StringCompare (sColTooltip, sColTitle, false) == 0) then
        let sColTooltip = ""
      endif
    endif

    if StringLength(g_oGuiComponent.GetCellIcon(nCellRow, sCellColumn)) then
      if (g_sGuiGridCellType != sGuiButton) then
        let g_sGuiGridCellType = sGuiIcon
      endif
      let g_sGuiGridValue = g_oGuiComponent.GetCellTooltip(nCellRow, sCellColumn)
    endif
    let g_sCellTooltip = g_oGuiComponent.GetCellTooltip(nCellRow, sCellColumn)

    let i = g_oGuiComponent.IsCellSymbol (nCellRow, sCellColumn)
    if (i != FALSE) then
      if (g_sGuiGridCellType != sGuiButton) then
        let g_sGuiGridCellType = sGuiSymbol
      endif
      let g_sGuiGridValue = g_oGuiComponent.GetSymbolInfo(g_sGuiGridValue)
    endif

    let g_bGuiGridCellHasF4Help = g_oGuiComponent.HasCellF4Help (nCellRow, sCellColumn)
    if (g_bGuiGridCellHasF4Help) then
      if (g_sGuiGridCellType == sGuiNormal) then
        let g_sGuiGridCellType = sGuiCTextField
      endif
    endif

    let g_sCellColorInfo = ""
    let i = g_oGuiComponent.GetCellColor (nCellRow, sCellColumn)
    if (i != 0) then
      let g_sCellColorInfo = g_oGuiComponent.GetColorInfo(i)
      if (StringIsBlank (g_sCellColorInfo)) then
        let g_sCellColorInfo = FormatString (msgStateColorNumber, IntToString (i-1))
      endif
    endif

    let g_bIsCellHotspot = g_oGuiComponent.IsCellHotspot (nCellRow, sCellColumn)
    if (g_bIsCellHotspot) then 
      let g_sGuiGridCellProperty = g_sGuiGridCellProperty + cscSpace + sIsHotspotProperty
    endif

    /* Detecting whether a cell is a link or a hotspot is now possible */
    let g_bIsCellLink = FALSE
    if (g_oGuiComponent.GetCellHotspotType (nCellRow, sCellColumn) == sGuiGridViewLink) then
      let g_bIsCellLink = TRUE
    endif

    let g_iTotalRowLevel = g_oGuiComponent.GetRowTotalLevel(nCellRow)
    /* row expander for grouped total columns */
    let g_bTotalRowExpanded = FALSE
    let i = g_oGuiComponent.isCellTotalExpander (nCellRow, sCellColumn)
    if (i  != FALSE) then
      let g_sGuiGridCellType = sGuiExpander
      if (g_iTotalRowLevel > 0) then
        let i = g_oGuiComponent.isTotalRowExpanded(nCellRow)
        if (i  != FALSE) then
          let g_bTotalRowExpanded = TRUE
        endif
      endif
    endif

    /* for column state */
    let g_bGuiGridColIsKey = g_oGuiComponent.IsColumnKey (sCellColumn)
    let g_bGuiGridColIsFiltered = g_oGuiComponent.IsColumnFiltered (sCellColumn)
    let g_sGuiGridColIsSorted = g_oGuiComponent.GetColumnSortType (sCellColumn)
    let g_sGuiGridColTotalType = g_oGuiComponent.GetColumnTotalType (sCellColumn)
    let g_sGuiGridColOperationType = g_oGuiComponent.GetColumnOperationType (sCellColumn)

    let g_bGuiGridCellChangeable = g_oGuiComponent.GetCellChangeable (nCellRow, sCellColumn)

    ;Also added a condition to check the prevLongTitle and currLongTitle are equal - KK
    if ((StringCompare (sColTitle, g_sGuiGridColumnTitle, false) != 0) || (StringCompare (sColLongTitle, g_sGuiGridColumnLongTitle, false) != 0)) then
      let g_sGuiGridColumnTitle= sColTitle
      let g_sGuiGridColumnTooltip = sColTooltip
      Let g_sGuiGridColumnLongTitle = sColLongTitle
      let g_bNewColumn = TRUE
    endif

    let g_bCurColIsSelected = false
    let g_bCurRowIsSelected = false

    let oSelColumns = g_oGuiComponent.selectedColumns
    if (oSelColumns) then
      let i = oSelColumns.count - 1
      while (i>=0)
        let sSelColumn = oSelColumns.elementAt(i)
        if (StringCompare (sSelColumn, sCellColumn) == 0) then
          let g_bCurColIsSelected = true
          let i = 0
        endif
        let i = i - 1
      endwhile
    endif
    let oSelColumns = oNull

    let sSelRows = g_oGuiComponent.selectedRows
    if (!StringIsBlank (sSelRows)) then
      let bFound = false
      let i = 1
      let s = StringSegment (sSelRows, ",", i)
      while (!StringIsBlank (s) && !bFound)
        if (StringContains (s, "-")) then
          let nRow1 = StringToInt (StringSegment (s, "-", 1))
          let nRow2 = StringToInt (StringSegment (s, "-", 2))
          if ((nRow1 <= nCellRow) && (nCellRow <= nRow2)) then
            let g_bCurRowIsSelected = true
            let bFound = true
          endif
        else
          let nRow1 = StringToInt (s)
          if (nRow1 == nCellRow) then
            let g_bCurRowIsSelected = true
            let bFound = true
          endif
        endif
        let i = i + 1
        let s = StringSegment (sSelRows, ",", i)
      endwhile
    endif

    if (g_sGuiGridCellType == sGuiCheckbox) then
      if (g_sGuiGridValue == sStateChecked) then
        let g_bGuiCheckBoxState = True
      else
        let g_bGuiCheckBoxState = False
      endif
    elif (g_sGuiGridCellType == sGuiValueList) then
      g_nGuiGridListBoxCount = g_oGuiComponent.GetCellListBoxCount (nCellRow, sCellColumn)
      g_nGuiGridListBoxCurIndex = g_oGuiComponent.GetCellListBoxCurIndex (nCellRow, sCellColumn)
    endif

    /* to make sure types and properties are communicated to the user even when not changing columns */
    if (StringCompare (g_sGuiGridCellType, g_sGuiGridPreviousCellType) != 0) then
      let g_bForceReadCell = TRUE
    elif (StringCompare (g_sGuiGridCellProperty, g_sGuiGridPreviousCellProperty) != 0) then
      let g_bForceReadCell = TRUE
    endif

  endif

endFunction

void function SayCurrentGuiGridView ()
var
  string info,
  string msg,
  string type,
  string state,
  string sTooltip

  let info = ""
  let sTooltip = ""

  if (g_bHistoryIsActive && (g_nHistoryCurIndex > 0)) then
    info = g_sHistoryCurEntry
    Say (info, OT_CONTROL_NAME)
    info = FormatString (msgItemPosition, IntToString(g_nHistoryCurIndex), IntToString(g_nHistoryEntries))
    Say (info, OT_POSITION)
    return
  endif

  if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
    if (g_bGuiComponentSameAsPrevious == FALSE) then
      if (g_bGuiComponentChangeable) then
        let info = msgALV + cscSpace + g_sGuiGridTitle + cscSpace
      else
        let info = msgStateReadOnly + msgALV + cscSpace + g_sGuiGridTitle + cscSpace
      endif
      if (g_iGuiGridRowCount != 0) then
        let info = info + FormatString(msgTableVisibleTotalRows, IntToString(g_iGuiGridVisibleRowCount),IntToString(g_iGuiGridRowCount))
        Say (info, OT_CONTROL_TYPE)
      else
        Say (info, OT_CONTROL_TYPE)
        let info = msgEmptyTable
        Say (info, OT_CONTROL_TYPE)
      endif

      if (!StringIsBlank (g_sGuiGridSelectionMode)) then
        if (StringCompare (g_sGuiGridSelectionMode, sSelModeRowsAndColumns) == 0) then
          let info = msgSelModeRowsAndColumns
        elif (StringCompare (g_sGuiGridSelectionMode, sSelModeSingleRow) == 0) then
          let info = msgSelModeSingleRow
        elif (StringCompare (g_sGuiGridSelectionMode, sSelModeMultipleRows) == 0) then
          let info = msgSelModeMultipleRows
        elif (StringCompare (g_sGuiGridSelectionMode, sSelModeFree) == 0) then
          let info = msgSelModeFree
        endif
        Say (info, OT_ITEM_STATE)
      endif
    endif
    let info = ""
  endif

  if (g_iGuiGridToolbarFocusButton == -1) then
    /* within table area of ALV */
    if (g_iGuiGridToolbarPreviousButton != -1) then
      Say (msgEndOfToolbar, OT_CONTROL_GROUP_NAME)
    endif
    if ((g_bNewColumn==True) || (!g_bGuiComponentSameAsPrevious)) then
      /* ROM - 2009/11/10 - annoucement of title (when navigating on header row) */
      if ((g_iGuiGridCurRow == 0) && (!g_bGuiComponentSameAsPrevious || g_bNewRow)) then
        Say (msgALVHeader, OT_CONTROL_NAME)
      endif
      Say (g_sGuiGridColumnTitle, OT_CONTROL_NAME)
      if (ShoulditemSpeak (OT_TOOL_TIP)) then
        let sTooltip = g_sGuiGridColumnTooltip
      endif
      /* column state */
      if (g_bGuiGridColIsKey != 0) then
        let info = msgALVIsColumnKey + cscSpace
      endif
      if (g_bGuiGridColIsFiltered != 0) then
        let info = msgALVIsColumnFiltered + cscSpace
      endif
      if (g_sGuiGridColIsSorted != sGuiNone) then
        ; ROM 2010/08/20 - speech has to be localized
        ; let info = msgALVIsColumnSorted + cscSpace + g_sGuiGridColIsSorted + cscSpace
        let info = msgALVIsColumnSorted
        if (g_sGuiGridColIsSorted == sGuiAscending) then
          let info = msgALVIsColumnSortedAsc + cscSpace + info + cscSpace
        else
          let info = msgALVIsColumnSortedDesc + cscSpace + info + cscSpace
        endif
      endif
      if (g_sGuiGridColTotalType != sGuiNone) then
        if (g_sGuiGridColOperationType == sGuiNone) then
          if (g_sGuiGridColTotalType == sGuiTotal) then
            let info = info + cscSpace + msgALVColumnTypeTotal
          elif (g_sGuiGridColTotalType == sGuiSubtotal) then
            let info = info + cscSpace + msgALVColumnTypeSubtotal
          endif
        endif

        if (g_sGuiGridColOperationType != sGuiNone) then
          if (g_sGuiGridColOperationType == sGuiMean) then
            info = info + cscSpace + msgALVColumnOperationTypeMean
          elif (g_sGuiGridColOperationType == sGuiMinimum) then
            info = info + cscSpace + msgALVColumnOperationTypeMinimum
          elif (g_sGuiGridColOperationType == sGuiMaximum) then
            info = info + cscSpace + msgALVColumnOperationTypeMaximum
          endif
        endif
      endif
      if (!StringIsBlank (sTooltip)) then
        Say (sTooltip, OT_TOOL_TIP)
      endif
      if (!StringIsBlank (info)) then
        Say (info, OT_ITEM_STATE)
        let info = ""
      endif
    endif

    let info = ""
    let sTooltip = ""
    let type  = ""
    let state = ""

    /* ROM - 2009/11/10 - suppress duplicate annoucement of title (when navigating on header row) */
    if ((g_bNewColumn || g_bForceReadCell || (!g_bGuiComponentSameAsPrevious)) && (g_iGuiGridCurRow != 0)) then

      if (ShoulditemSpeak (OT_ITEM_STATE)) then
        if ((!g_bGuiGridCellChangeable) && g_bGuiComponentChangeable) then
          if (g_sGuiGridCellType != sGuiButton) then ; possibly add other non-interactive UI elements here
            let type = msgStateReadOnly
          endif
        endif
      endif

      if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
        if (g_sGuiGridCellType == sGuiButton) then
          let type = type + cscSpace  + smmGetStartMarkupForControlType (WT_BUTTON)
        elif (g_sGuiGridCellType == sGuiCheckBox) then
          let type = type + cscSpace  + smmGetStartMarkupForControlType (WT_CHECKBOX)
        elif (g_sGuiGridCellType == sGuiRadioButton) then
          let type = type + cscSpace  + smmGetStartMarkupForControlType (WT_RADIOBUTTON)
        elif ((g_sGuiGridCellType == sGuiNormal) || (g_sGuiGridCellType == sGuiExpander))  then
          let type = type + cscSpace + smmGetStartMarkupForControlType (WT_EDIT)
        elif (g_sGuiGridCellType == sGuiValueList) then
          let type = type + cscSpace  + msgGuiComboBox
        elif (g_sGuiGridCellType == sGuiCTextfield) then
          let type = type + cscSpace  + msgGuiCTextField
        elif (g_sGuiGridCellType == sGuiIcon) then
          let type = type + cscSpace + msgGuiIcon
        elif (g_sGuiGridCellType == sGuiSymbol) then
          let type = type + cscSpace + msgALVSymbol
        else
          let type = type + cscSpace + g_sGuiGridCellType
        endif

        /* Links and hotspots in ALV can now be distinguished */
        if (g_bIsCellHotspot) then
          if (g_bIsCellLink) then
            if (!StringIsBlank (g_sGuiGridCellType)) then
              let type = type + cscSpace + msgHasLink
            else
              let type = type + cscSpace + msgIsLink
            endif
          elif (!StringIsBlank (g_sGuiGridCellType)) then
            let type = type + cscSpace + msgHasHotspot
          else
            let type = type + cscSpace + msgIsHotspot
          endif
        endif
      endif

      Say (type, OT_CONTROL_TYPE, TRUE)

    endif /* new column */

    /*
     * now read the ALV value
     */
    /* ROM - 2009/11/10 - suppress duplicate annoucement of title (when navigating on header row) */
    if (g_iGuiGridCurRow != 0) then
      if (((g_sGuiGridCellType != sGuiCheckBox) && (g_sGuiGridCellType != sGuiRadioButton)) || g_bForceReadCell) then
        if (!StringIsBlank (g_sGuiGridValue)) then
          ; ROM - 2014/08/15  - avoid reading "x" for checkboxes and radiobuttons (i.e. when g_bForceReadCell==true)
          if (((g_sGuiGridCellType != sGuiCheckBox) && (g_sGuiGridCellType != sGuiRadioButton)) || (g_sGuiGridValue != sStateChecked)) then
            Say (g_sGuiGridValue, OT_CONTROL_NAME)
          endif
          if (StringCompare (g_sCellTooltip, g_sGuiGridValue, false) != 0) then
            let sTooltip = g_sCellTooltip
          endif
        elif (!StringIsBlank (g_sCellTooltip)) then
          Say (g_sCellTooltip, OT_CONTROL_NAME)
        elif (StringIsBlank (g_sGuiGridValue) && StringIsBlank (g_sCellTooltip)) then
          ; ROM - 2014/08/15  - avoid reading "blank" for checkboxes and radiobuttons (i.e. when g_bForceReadCell==true)
          if ((g_sGuiGridCellType != sGuiCheckBox) && (g_sGuiGridCellType != sGuiRadioButton)) then
            Say (msgBlank, OT_CONTROL_NAME)
          endif
        endif
        if (ShouldItemSpeak (OT_POSITION)) then
          if ((g_sGuiGridCellType == sGuiValueList) && (g_nGuiGridListBoxCurIndex > -1)) then
            info = FormatString (msgGuiComboboxPosition, IntToString(g_nGuiGridListBoxCurIndex+1), IntToString(g_nGuiGridListBoxCount))
            Say (info, OT_POSITION)
          endif
        endif
      endif

      if (!StringIsBlank (sTooltip)) then
        Say (sTooltip, OT_TOOL_TIP)
      endif

      if (g_bGuiGridCellHasF4Help && (g_sGuiGridCellType != sGuiCTextField)) then
        Say (msgGuiHasF4Help, OT_CONTROL_TYPE)
      endif

      if (ShoulditemSpeak (OT_ITEM_STATE)) then
        if (g_sGuiGridCellType == sGuiCheckBox)  then
          if (g_bGuiCheckBoxState) then
            let state = smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_CHECKED)
          else
            let state = smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_UNCHECKED)
          endif
          Say (state, OT_ITEM_STATE, TRUE)
        elif (g_sGuiGridCellType == sGuiRadioButton)  then
          if (g_sGuiGridValue == "X") then
            let state = msgGuiRadioButtonSelected
          else
            let state = msgGuiRadioButtonNotSelected
          endif
          Say (state, OT_ITEM_STATE)
        endif
        let state = ""
      endif ; should speak item_state

      if (g_iTotalRowLevel > 0) then
        Say (msgInsertedLineTypeSummation, OT_ITEM_STATE)
      endif

      if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
        if (g_sGuiGridCellType == sGuiExpander)  then
          let info = g_sGuiGridCellType + cscSpace + msgTreeLevel + cscSpace + IntToString(g_iTotalRowLevel)
          Say (info, OT_CONTROL_TYPE)
        endif
      endif

      if (ShoulditemSpeak (OT_ITEM_STATE)) then
        if (g_sGuiGridCellType == sGuiExpander)  then
          if (g_bTotalRowExpanded) then
            let state = state + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_OPENED))
          else
            let state = state + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_CLOSED))
          endif
          Say (state, OT_ITEM_STATE)
        endif
      endif

      if ((g_nSapGuiAccVerbosity > 0) && (!StringIsBlank (g_sCellColorInfo))) then
        if (StringCompare (g_sCellColorInfo, sTooltip, false) != 0) then
          Say (g_sCellColorInfo, OT_ITEM_STATE)
        endif
      endif
    endif /* not on row header */

    if (ShoulditemSpeak (OT_POSITION)) then
      ; if ((g_iGuiGridColumnCount > 0) && g_bNewColumn) then
      if ((g_iGuiGridColumnCount > 0) && (g_iGuiGridCurColumn > 0) && g_bNewColumn) then
        let msg = FormatString(msgALVPositionColumns,IntToString(g_iGuiGridCurColumn),IntToString(g_iGuiGridColumnCount))
        Say (msg, OT_POSITION)
        if (g_bCurColIsSelected) then
          Say (msgLstColumn + cscSpace + msgItemsSelected, OT_SELECTED_ITEM)
        endif
      endif
      if ((g_iGuiGridRowCount > 0) && g_bNewRow && (g_iGuiGridCurRow != 0)) then
        let msg = FormatString(msgALVPositionRows,IntToString(g_iGuiGridCurRow),IntToString(g_iGuiGridRowCount))
        Say (msg, OT_POSITION)
        if (g_bCurRowIsSelected) then
          Say (msgLstRow + cscSpace + msgItemsSelected, OT_SELECTED_ITEM)
        endif
      endif
      if ((g_iGuiGridCurRow == g_iGuiGridRowCount) && (g_iGuiGridRowCount > 0)) then
        if ((g_iGuiGridCurColumn == g_iGuiGridColumnCount) && (g_iGuiGridColumnCount > 0)) then
          Say (msgALVLastVisibleCell, OT_POSITION)
        elif (g_bNewRow) then
         Say (msgALVLastVisibleRow, OT_POSITION)
        endif
      endif
    endif
  else
    /* within toolbar area of the ALV */
    SayCurrentToolbar ()
  endif

endFunction

void function ResetGuiGridView ()

  g_sGuiGridTitle = ""
  g_sGuiGridValue = ""
  g_sGuiGridColumnTitle = ""
  g_sGuiGridColumnTooltip = ""
  g_iGuiGridRowCount = -1
  g_iGuiGridCurRow = -1
  g_sGuiGridCurColumn = ""
  g_iGuiGridToolbarFocusButton = -1
  g_iGuiGridToolbarPreviousButton = -1
  g_sGuiGridCellType = ""
  g_sGuiGridPreviousCellType = ""
  g_sGuiGridCellProperty = ""
  g_sGuiGridPreviousCellProperty = ""
  g_sGuiGridSelectionMode = ""
  g_bGuiGridCellHasF4Help = false
  g_bCurColIsSelected = false
  g_bCurRowIsSelected = false

  g_nGuiGridListBoxCount = -1
  g_nGuiGridListBoxCurIndex = -1

  g_nHistoryEntries = 0
  g_nHistoryCurIndex = 0
  g_bHistoryIsActive = false
  g_sHistoryCurEntry = ""

  g_bNewColumn = TRUE
  g_bNewRow = TRUE
  g_bForceReadCell = FALSE
  g_bIsCellHotspot = FALSE
  g_bIsCellLink = FALSE
  g_iIsDisabled = FALSE
  g_iIsEditable = FALSE

endFunction

/*
 * Braille function for GuiGridView
 */
int function BrailleAddObjectGuiGridViewInfo (int nType)
var
  string msg

  let msg = ""
  if (!g_bGuiComponentChangeable) then
    ; ROM: 2009/10/19 - let msg = msgBrlStateReadOnly + cscSpace
  endif

  if (g_iGuiGridRowCount < 0) then
    let msg = msg + g_sGuiGridTitle
  else
    if (g_iGuiGridCurRow != 0) then /* ROM 2009/11/10 - added info when navigagting header */
      let msg = msg + FormatString (msgBrlTableInfo, g_sGuiGridTitle, intToString(g_iGuiGridCurRow), intToString(g_iGuiGridCurColumn))
    else
      ; let msg = msg + g_sGuiGridTitle + cscSpace + FormatString (msgBrlALVHeaderInfo, IntToString(g_iGuiGridCurColumn)) + cscSpace + msgBrlALVHeader
      if (g_iGuiGridCurColumn > 0) then
        msg = msg + g_sGuiGridTitle + cscSpace + FormatString (msgBrlALVHeaderInfo, IntToString(g_iGuiGridCurColumn)) + cscSpace + msgBrlALVHeader
      else
        msg = msg + g_sGuiGridTitle + cscSpace + FormatString (msgBrlALVHeaderInfo, "") + cscSpace + msgBrlALVHeader
      endif
    endif
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiGridViewColumn (int nType)
Var
  string info

  if (!StringIsBlank (g_sGuiGridColumnTitle)) then

    BrailleAddString (g_sGuiGridColumnTitle, 0 ,0 ,0)

    if (g_bGuiGridColIsKey != 0) then
      let info = info + msgBrlALVIsColumnKey
    endif
    if (g_bGuiGridColIsFiltered != 0) then
      if (!StringIsBlank (info)) then
        let info = info + cscPeriod
      endif
      let info = info + msgBrlALVIsColumnFiltered
    endif

    if (g_sGuiGridColIsSorted != sGuiNone) then
      if (!StringIsBlank (info)) then
        let info = info + cscPeriod
      endif
      if (g_sGuiGridColIsSorted == sGuiAscending) then
        let info = info + msgBrlALVIsColumnSortedAsc
      else
        let info = info + msgBrlALVIsColumnSortedDesc
      endif
    endif

    if ((g_sGuiGridColTotalType != sGuiNone) || g_sGuiGridColOperationType != sGuiNone) then
      if (!StringIsBlank (info)) then
        info = info + cscPeriod
      endif

      if (g_sGuiGridColOperationType == sGuiNone) then
        if (g_sGuiGridColTotalType == sGuiTotal) then
          let info = info + msgBrlALVColumnTypeTotal
        elif (g_sGuiGridColTotalType == sGuiSubtotal) then
          let info = info + msgBrlALVColumnTypeSubtotal
        endif
      else
        let info = info + cscSpace
        if (g_sGuiGridColOperationType == sGuiMean) then
          let info = info + msgBrlALVColumnOperationTypeMean
        elif (g_sGuiGridColOperationType == sGuiMinimum) then
          let info = info + msgBrlALVColumnOperationTypeMinimum
        elif (g_sGuiGridColOperationType == sGuiMaximum) then
          let info = info + msgBrlALVColumnOperationTypeMaximum
        endif
      endif
    endif

    BrailleAddString (info, 0 ,0 ,0)

  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiGridViewRow (int nType)
Var
  string msg

  if (g_iTotalRowLevel > 0) then
    BrailleAddString (msgBrInsertedLineTypeSummation, 0 ,0 ,0)
  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiGridViewCell (int nType)
var
  string msg

  let msg = ""
  /* ROM 2009/11/10 - no cell content to add when being on header row */
  if (g_iGuiGridCurRow == 0) then
    return TRUE
  endif

  if (!g_bGuiGridCellChangeable && g_bGuiComponentChangeable) then
    if (g_sGuiGridCellType != sGuiButton) then ; possibly add other non-interactive UI elements here
      let msg = msgBrlStateReadOnly
    endif
  endif
  if (g_sGuiGridCellType == sGuiButton) then
    let msg = msg + BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_BUTTON)
  elif (g_sGuiGridCellType == sGuiCheckBox) then
    let msg = msg + BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_CHECKBOX)
  elif (g_sGuiGridCellType == sGuiRadioButton) then
    let msg = msg + BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_RADIOBUTTON)
  elif (g_sGuiGridCellType == sGuiValueList) then
    let msg = msg + BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_COMBOBOX)
  elif (g_sGuiGridCellType == sGuiCTextfield) then
    let msg = msg + BrailleGetSubTypeString (WT_CUSTOM_CONTROL_BASE+GUI_WT_CTEXTFIELD)
  elif (g_sGuiGridCellType == sGuiIcon) then
    let msg = msg + msgBrlIcon
  elif (g_sGuiGridCellType == sGuiSymbol) then
    let msg = msg + msgBrlALVSymbol
  elif ((g_sGuiGridCellType == sGuiNormal) || (g_sGuiGridCellType == sGuiExpander)) then
    let msg = msg + msgBrlALVTextField
  endif

  /* Links and hotspots in ALV can now be distinguished */
  if (g_bIsCellHotspot) then
    if (g_bIsCellLink) then
      if (!StringIsBlank (msg)) then
        let msg = msg + cscSpace + BrailleGetSubTypeString (WT_LINK)
      else
        let msg = BrailleGetSubTypeString (WT_LINK)
      endif
    elif (!StringIsBlank (msg)) then
      let msg = msg + cscSpace + msgBrlIsHotspot
    else
      let msg = msgBrlIsHotspot
    endif
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0, 0, 0)
  endif

  msg = ""

  if (g_bHistoryIsActive && (g_nHistoryCurIndex > 0)) then
    msg = g_sHistoryCurEntry
    msg = msg + cscSpace + FormatString (msgItemPosition, IntToString(g_nHistoryCurIndex), IntToString(g_nHistoryEntries))
    BrailleAddString (msg, getCursorCol (), getCursorRow (), getCharacterAttributes ())
    return TRUE
  endif

  if (CaretVisible () && (g_nObjectTypeCode == WT_MULTILINE_EDIT)) then
    BrailleAddFocusItem ()
    return TRUE
  endif

  if ((g_sGuiGridCellType != sGuiCheckBox) && (g_sGuiGridCellType != sGuiRadioButton)) then
    if (!StringIsBlank (g_sGuiGridValue)) then
      BrailleAddString (g_sGuiGridValue, 0, 0, 0)
    else
      if (!StringIsBlank (g_sCellTooltip)) then
        BrailleAddString (g_sCellTooltip, 0, 0, 0)
      endif
    endif
    if (g_sGuiGridCellType == sGuiValueList) then
      if (g_nGuiGridListBoxCurIndex > -1) then
        msg = FormatString (msgGuiComboboxPosition, IntToString(g_nGuiGridListBoxCurIndex+1), IntToString(g_nGuiGridListBoxCount))
        BrailleAddString (msg, 0, 0, 0)
      endif
    endif
  else ; sGuiCheckBox || sGuiRadioButton
    if (g_sGuiGridValue == "X") then
      let msg = BrailleGetStateString (CTRL_CHECKED)
    else
      let msg = BrailleGetStateString (CTRL_UNCHECKED)
    endif

    BrailleAddString (msg, 0, 0, 0)
  endif

  if (g_sGuiGridCellType == sGuiExpander)  then
    let msg  = msg + msgBrlALVExpander+ cscSpace + msgBrlTreeLevel + cscSpace + IntToString(g_iTotalRowLevel) + cscSpace
    if (g_bTotalRowExpanded) then
      let msg = msg + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_OPENED))
    else
      let msg = msg + smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_CLOSED))
    endif
    BrailleAddString (msg, 0, 0, 0)
  endif

  return TRUE

endFunction

/*
 **********************************************************************
 ** GuiTree
 **********************************************************************
*/

/*
 * Helper function to collect full node information
 * Returns whole node information in g_sAllItemsText
 */

void function GetCurrentGuiTreeFullNode (object oFocus)
  var
    int i,
    int iTreeType,
    int iCurType,
    int bIsEditable,
    int bCurState,
    int nCount,
    string sTemp,
    string sCurItem,
    string sState,
    string sCurTitle,
    string sCurType,
    string sCurValue,
    string sCurTooltip,
    string sCurState,
    string sCurImage,
    object oColumnNames

  iTreeType = oFocus.GetTreeType
  if (iTreeType == GUI_TREETYPE_SIMPLE) then
    return
  endif

  if (iTreeType == GUI_TREETYPE_LIST) then
    var string sNodeKey = oFocus.GetFocusedNodeKey ()
    if (StringLength(sNodeKey) == 0) then
        sNodeKey = oFocus.TopNode
    endif

    nCount = oFocus.GetListTreeNodeItemCount (sNodeKey)
    i = 1
    while (i <= nCount)
      sCurItem = IntToString (i)

      sCurValue = oFocus.getItemText (sNodeKey, sCurItem)
      sCurTooltip = oFocus.getItemTooltip (sNodeKey, sCurItem)
      sCurImage = oFocus.getAbapImage (sNodeKey, sCurItem)
      sTemp = ""
      if (StringIsBlank (sCurValue)) then
        sCurValue = sCurTooltip
      endif

      if (StringIsBlank (sCurValue)) then
        sCurValue = msgBlank
      endif
      
      if (!StringIsBlank(sCurImage) && (sCurImage != "@@")) then
        sCurValue = sCurValue + cscSpace + msgGuiIcon
      endif
      if (StringCompare (sCurValue, sCurTooltip, false) != 0) then
        sCurValue = sCurValue + cscSpace + sCurTooltip
      endif

      sTemp = sCurValue

      if (StringIsBlank (g_sAllItemsText)) then
        g_sAllItemsText = sTemp
      else
        g_sAllItemsText = g_sAllItemsText + "|" + sTemp
      endif
      i = i + 1
    endWhile
    return
  endif
  
  ; collect the column items
  i = 0
  oColumnNames = oFocus.getColumnNames()
  if (!oColumnNames) then
    return
  endif

  nCount = oColumnNames.count
  while (i < nCount)
    sCurItem = oColumnNames.item(i)

    sCurValue = oFocus.getItemText (g_sKey, sCurItem)
    sCurTooltip = oFocus.getItemTooltip (g_sKey, sCurItem)
    sCurImage = oFocus.getAbapImage (g_sKey, sCurItem)

    sCurValue = TrimString (sCurValue)
    sCurTooltip = TrimString (sCurTooltip)
    if (StringCompare (sCurValue, sCurTooltip, false) != 0) then
      if (StringIsBlank (sCurValue)) then
        sCurValue = sCurTooltip
        sCurTooltip = ""
      endif
      if (!StringIsBlank(sCurImage) && (sCurImage != "@@")) then
        sCurValue = sCurValue + cscSpace + msgGuiIcon
      endif
      if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(sCurTooltip)) then
        sCurValue = sCurValue + cscSpace + sCurTooltip
      endif
    endif
    sCurTitle = oFocus.getColumnTitleFromName (sCurItem)
    bIsEditable = oFocus.getIsEditable (g_sKey,sCurItem)

    sCurType = ""
    sCurState = ""
    bCurState = false
    iCurType = oFocus.getItemType (g_sKey, sCurItem)
    if (iCurType == GUI_TREEITEMPTYPE_HIERARCHY) then
      sCurType = msgTreeTypeHierarchy
    elif (iCurType == GUI_TREEITEMPTYPE_IMAGE) then
      sCurType = msgTreeTypeImage
    elif (iCurType == GUI_TREEITEMPTYPE_TEXT) then
      sCurType = msgTreeTypeText
    elif (iCurType == GUI_TREEITEMPTYPE_BOOL) then
      bCurState = oFocus.GetCheckBoxState (g_sKey,sCurItem)
      sCurState = smmStripMarkup (smmGetStartMarkupForControlType (WT_CHECKBOX))
      if (bCurState == true) || (bCurState == -1) then
        sCurState = sCurState + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_CHECKED))
      else
        sCurState = sCurState + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_UNCHECKED))
      endif
    elif (iCurType == GUI_TREEITEMPTYPE_BUTTON) then
      sCurType = smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTON))
    elif (iCurType == GUI_TREEITEMPTYPE_LINK) then
      sCurType = smmStripMarkup (smmGetStartMarkupForControlType (WT_LINK))
    endif

    if (StringIsBlank (sCurValue)) then
      sCurValue = msgBlank
    endif
    sTemp = sCurTitle + cscSpace + sCurType + cscSpace + sCurValue
    if (!StringIsBlank (sCurState)) then
      sTemp = sTemp + cscSpace + sCurState
    endif

    if (StringIsBlank (g_sAllItemsText)) then
      g_sAllItemsText = sTemp
    else
      g_sAllItemsText = g_sAllItemsText + "|" + sTemp
    endif

    i = i + 1
  endwhile

  oColumnNames = oNull

endFunction

void function ToggleGuiTreeFullNode ()
  if (g_bAllItemsTextToggle) then
    g_bAllItemsTextToggle = false
  else
    g_bAllItemsTextToggle = true
  endif
  ; sayinteger(g_bAllItemsTextToggle)
endFunction

void function GetCurrentGuiTree ()
var
  int i,
  int j,
  int iNodeStyle,
  int iItemStyle,
  int nCount,
  string s,
  string sParent,
  string sColumnKey,
  object oNodes

  g_bForceReadNodeInfo = false

  g_sItemText = ""
  let g_iGuiCtrlTreeType = g_oGuiComponent.GetTreeType ()
  let g_iGuiCtrlTreeSelectionMode = g_oGuiComponent.GetSelectionMode ()
  ; let g_sKey = g_oGuiComponent.SelectedItemNode () ; probably an exception...

  g_sKey = g_oGuiComponent.GetFocusedNodeKey()
 
  if (StringLength(g_sKey) == 0) then
    let g_sKey = g_oGuiComponent.TopNode
  endif

  if (StringLength(g_sKey) == 0) then
    let g_bGuiShellIsValid = TRUE
    return
  endif

  let oNodes = g_oGuiComponent.GetSelectedNodes()
  let g_iNodesCount = oNodes.Count

  /* ROM 2011/03/29 - g_sFocusedNodeKey can be assigned by any means */
  let g_sFocusedNodeKey = g_oGuiComponent.GetFocusedNodeKey()
  if (!StringIsBlank (g_sFocusedNodeKey)) then
    let g_sFocusedNodeText = g_oGuiComponent.GetNodeTextByKey(g_sFocusedNodeKey)
  endif

  let g_bNodeIsSelected = false
  if (g_iNodesCount > 0) then
    let i = 0
    while ((i <= g_iNodesCount-1) && (g_bNodeIsSelected == false))
      if (g_sFocusedNodeKey == oNodes.Item(i)) then
        let g_bNodeIsSelected = true
      endif
      let i = i + 1
    endwhile
  endif
  let oNodes = oNull

  let g_sNodeText = g_oGuiComponent.GetNodeTextByKey(g_sKey)
  let g_sNodeTooltip = g_oGuiComponent.GetNodeTooltip(g_sKey)
  if (StringIsBlank (g_sNodeText)) then
    let g_sNodeText = g_sNodeTooltip
    let g_sNodeTooltip = ""
  endif

  let iNodeStyle = g_oGuiComponent.GetNodeStyle (g_sKey)
  if (iNodeStyle != 0) then
    let g_sNodeStyle = g_oGuiComponent.GetStyleDescription (iNodeStyle)
    if (StringIsBlank (g_sNodeStyle)) then
      let g_sNodeStyle = FormatString (msgStateColorNumber, IntToString (iNodeStyle))
    endif
  else
    let g_sNodeStyle = ""
  endif

  let g_iNodeLevel = g_oGuiComponent.GetHierarchyLevel(g_sKey)

  let g_iIsFolder = g_oGuiComponent.IsFolder (g_sKey)
  let g_iIsFolderExpanded = g_oGuiComponent.IsFolderExpanded (g_sKey)
  let g_iIsFolderExpandable = g_oGuiComponent.IsFolderExpandable (g_sKey)

  ; ROM 2012/11/02 - use new method GetIsDisabled to identify disabled nodes
  let g_iIsDisabled = g_oGuiComponent.GetIsDisabled (g_sFocusedNodeKey, "")

  let s = g_oGuiComponent.TopNode
  if ((StringCompare (g_sKey, s, true) != 0) && (g_iNodeLevel != 0)) then
    let sParent = g_oGuiComponent.GetParent(g_sKey)
  endif

  let g_iSubLevelCount = g_oGuiComponent.GetNodeChildrenCount(g_sKey)
  if ((StringCompare (g_sKey, s, true) != 0) && (g_iNodeLevel != 0)) then
    let g_iCurLevelCount = g_oGuiComponent.GetNodeChildrenCount(sParent)
  else
    let g_iCurLevelCount = g_oGuiComponent.GetNodesCol().Count
  endif
  let g_iCurPosition = g_oGuiComponent.GetNodeIndex(g_sKey)

  let g_iItemType = -1
  let g_iColumnIndex = -1
  let g_iColumnCount = -1
  let g_bNewTreeColumn = (g_bGuiComponentSameAsPrevious == false)
  let g_sColumnTitle = ""

  ;Handling for Column trees with single node selection - KK
  /* rom 2018/02/02: removed code to full node text - this is done now on request (also did not work as expected) */
  ; if ((g_iGuiCtrlTreeType != GUI_TREETYPE_LIST) && (g_iGuiCtrlTreeSelectionMode == GUI_SM_SINGLE_NODE)) then ; ROM 2009/11/06: not for list tree views

  if ((g_iGuiCtrlTreeSelectionMode == GUI_SM_SINGLE_ITEM) || (g_iGuiCtrlTreeSelectionMode == GUI_SM_MULTIPLE_ITEM)) then

    sColumnKey = g_oGuiComponent.SelectedItemColumn ()
    if ((g_sColumnKey != sColumnKey) || !g_bGuiComponentSameAsPrevious) then
      let g_bNewTreeColumn = true
    endif
    let g_sColumnKey = sColumnKey

    if ((StringLength(g_sNodeText)==0) && (StringLength(g_sColumnKey)==0)) then
      if (g_oGuiComponent.GetColumnNames().Count>0) then
        sColumnKey  = g_oGuiComponent.GetColumnNames().Item(0)
        g_bForceReadNodeInfo = true
        /* let g_bNewTreeColumn = False */
      endif
    endif

    if (StringLength(sColumnKey)>0) then

      if (g_iGuiCtrlTreeType == GUI_TREETYPE_COLUMN) then
          let g_sColumnTitle = g_oGuiComponent.GetColumnTitleFromName(sColumnKey)
          let g_iColumnIndex = g_oGuiComponent.GetColumnIndexFromName(sColumnKey)
          let g_iColumnCount = g_oGuiComponent.GetColumnNames.Count
      endif

      ; tg : to change to detect icons in type text
      g_iItemType = g_oGuiComponent.GetItemType (g_sKey,sColumnKey)
      g_sItemText = g_oGuiComponent.GetItemText (g_sKey,sColumnKey)
      g_sItemIcon = g_oGuiComponent.GetAbapImage (g_sKey,sColumnKey)

      let g_iIsDisabled = g_oGuiComponent.GetIsDisabled (g_sKey, sColumnKey)

      if (g_iItemType == GUI_TREEITEMPTYPE_BOOL) then
        ; ROM 2012/11/02 - use new method GetIsEditable to identify disabled (readonly) checkbox items
        let g_iCheckBoxState = g_oGuiComponent.GetCheckBoxState (g_sKey,sColumnKey)
        let g_iIsEditable = g_oGuiComponent.GetIsEditable (g_sKey,sColumnKey)
      endif

      let iItemStyle = g_oGuiComponent.GetItemStyle (g_sKey, sColumnKey)

      if (iItemStyle != 0) then
        let g_sItemStyle = g_oGuiComponent.GetStyleDescription (iItemStyle)
        if (StringIsBlank (g_sItemStyle)) then
          let g_sItemStyle = FormatString (msgStateColorNumber, IntToString (iItemStyle))
        endif
      else
        let g_sItemStyle = ""
      endif

      let g_sItemTooltip = g_oGuiComponent.GetItemTooltip(g_sKey,sColumnKey)
      if (StringIsBlank (g_sItemText)) then
        ; ROM 2011/02/16 - if text is empty, it is supposedly an icon/image
        if ((g_iItemType == GUI_TREEITEMPTYPE_TEXT) && !StringIsBlank(g_sItemTooltip)) then
          let g_iItemType = GUI_TREEITEMPTYPE_IMAGE
        endif
        let g_sItemText = g_sItemTooltip
        let g_sItemTooltip = ""
      endif
    endif
  else /* (g_iGuiCtrlTreeSelectionMode != GUI_SM_SINGLE_ITEM) && (g_iGuiCtrlTreeSelectionMode != GUI_SM_MULTIPLE_ITEM) */
    /* ROM 2009/11/19 - reset column key */
    let g_sColumnKey = ""
  endif
  /* ROM 2009/11/19 - handling of title of first column */
  let nCount = g_oGuiComponent.GetColumnNames().Count
  if (StringIsBlank (g_sColumnTitle) && (nCount != 0) && !StringIsBlank (g_sColumnKey)) then
    let s = g_oGuiComponent.GetColumnNames().Item(0)
    let g_sColumnTitle = g_oGuiComponent.GetColumnTitleFromName(s)
    if (StringIsBlank (g_sColumnTitle)) then
      let g_sColumnTitle = g_oGuiComponent.GetHierarchyTitle ()
    endif
  endif

  /*
  * ROM 2011/03/29 - workaround for initial selection of column trees:
  * Problem: When JAWS is active, the node does not get selected on entering the tree initially - but then
  * keyboard navigation is not possible until a node is actually selected.
  * Workaround: select the focused node if no item is selected
  */
  /*
  *ROM: 2022/10/28 - the following workaround seems to be obsolete now - can be possibly removed
  if (!g_bGuiComponentSameAsPrevious && StringIsBlank(sColumnKey) && !StringIsBlank (g_sFocusedNodeKey)) then
    g_oGuiComponent.SelectNode (g_sFocusedNodeKey)
  endif
  */

  g_sAllItemsText = ""
  if (StringIsBlank (g_sColumnKey)) then
    ;if (g_bAllItemsTextToggle || (g_iGuiCtrlTreeSelectionMode == GUI_SM_SINGLE_NODE)) then
    if (g_bAllItemsTextToggle) then
      ; BrailleClearMessage ()
      GetCurrentGuiTreeFullNode (g_oGuiComponent) ; returns g_sAllItemsText
      ; BrailleRefresh ()
    endif
  endif

endfunction

void function SayCurrentGuiTree ()
var
  string s,
  string s1,
  string s2,
  string sTreeType,
  string sNodeState,
  string sPosition,
  string sItemType,
  string sItemState, /* ROM 2012/01/30 - holds now all item state info */
  string sTooltip

  let sTooltip = ""
  let s = ""

  if (StringLength(g_sKey) == 0) then
    return
  endif

  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    if (g_iGuiCtrlTreeType == GUI_TREETYPE_SIMPLE) then
      let sTreeType = msgTreeSimple
    elif (g_iGuiCtrlTreeType == GUI_TREETYPE_LIST) then
      let sTreeType = msgTreeList
    elif (g_iGuiCtrlTreeType == GUI_TREETYPE_COLUMN) then
      ;Adding text to indicate node selection - KK
      if (g_iGuiCtrlTreeSelectionMode == GUI_SM_SINGLE_NODE) then
        let sTreeType = msgTreeColumn+cscSpace+msgTreeNodeSelection
      else
        let sTreeType = msgTreeColumn
        if (ShouldItemSpeak (OT_TOOL_TIP)) then
          let sTreeType = sTreeType+cscSpace+msgTreeSingleNodeTutor
        endif
      EndIf
    endif
  endif

  if (g_iIsFolderExpanded==FALSE) then
    if (g_iIsFolderExpandable) then
      if ShoulditemSpeak (OT_ITEM_STATE) then
        ; let sNodeState = msgTreeNodeClosed
        let sNodeState = smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_CLOSED))
      endif
    endif
    if ShoulditemSpeak (OT_ITEM_NUMBER) then
      let sPosition = FormatString(msgItemPosition,IntToString(g_iCurPosition ),IntToString(g_iCurLevelCount))
    endif
  else
    if ShoulditemSpeak (OT_ITEM_STATE) then
      ; let sNodeState = msgTreeNodeOpen
      let sNodeState = smmStripMarkup (smmGetStartMarkupForControlState (WT_TREEVIEW, CTRL_OPENED))
    endif

    if ShoulditemSpeak (OT_ITEM_NUMBER) then
      if (g_iSubLevelCount==1) then
        let sPosition = IntToString(g_iSubLevelCount)+cscSpace+msgTreeEntry
      elif (g_iSubLevelCount>-1) then
        let sPosition = IntToString(g_iSubLevelCount)+cscSpace+msgTreeEntries
      endif
    endif
  endif

  if (g_bGuiComponentSameAsPrevious==False) then
    if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
      Say (sTreeType, OT_CONTROL_TYPE)
    endif
  else
    if (g_iGuiCtrlTreePreviousLevel != g_iNodeLevel) then
      if (ShoulditemSpeak (OT_ITEM_NUMBER)) then
        let s = msgTreeLevel + cscSpace + IntToString(g_iNodeLevel) + cscSpace
        Say (s, OT_ITEM_NUMBER)
        let s = ""
      endif
    endif
  endif
  let g_iGuiCtrlTreePreviousLevel = g_iNodeLevel

  ; if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    if (g_iItemType == GUI_TREEITEMPTYPE_HIERARCHY) then
      let sItemType = msgTreeTypeHierarchy
    elif (g_iItemType == GUI_TREEITEMPTYPE_IMAGE) then
      let sItemType = msgTreeTypeImage
    elif (g_iItemType == GUI_TREEITEMPTYPE_TEXT) then
      let sItemType = msgTreeTypeText
    elif (g_iItemType == GUI_TREEITEMPTYPE_BOOL) then
      let sItemType = smmStripMarkup (smmGetStartMarkupForControlType (WT_CHECKBOX))
      if (!g_iIsEditable) then
        let sItemState = smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_DISABLED))
      endif
      if (g_iCheckBoxState == True) || (g_iCheckBoxState == -1) then
        let sItemState = sItemState + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_CHECKED))
      else
        let sItemState = sItemState + cscSpace + smmStripMarkup (smmGetStartMarkupForControlState (WT_CHECKBOX, CTRL_UNCHECKED))
      endif
    elif (g_iItemType == GUI_TREEITEMPTYPE_BUTTON) then
      let sItemType = smmStripMarkup (smmGetStartMarkupForControlType (WT_BUTTON))
    elif (g_iItemType == GUI_TREEITEMPTYPE_LINK) then
      let sItemType = smmStripMarkup (smmGetStartMarkupForControlType (WT_LINK))
    endif
  ; endif

  ; tg : no way to find out itemtype Icon !?!

  if ((g_bNewTreeColumn) && (g_iGuiCtrlTreeType == GUI_TREETYPE_COLUMN)) then
    if (!StringIsBlank (g_sColumnTitle)) then
      if (!g_bForceReadNodeInfo) then
        s = msgTreeItemColumn + cscSpace + g_sColumnTitle + cscSpace
      else
        s = g_sColumnTitle + cscSpace
      endif
    endif
  endif
  if (StringLength(sItemType)>0) then
    if (!StringIsBlank (g_sItemText)) then
      let s = s + sItemType + cscSpace + g_sItemText
    else
      ; ROM 2011/07/14 - only announce empty cells for certain cell types or if column title is empty
      let s = s + sItemType
      if ((g_iItemType == GUI_TREEITEMPTYPE_IMAGE) || (g_iItemType == GUI_TREEITEMPTYPE_TEXT)) then
        let s = s + cscSpace + msgBlank
      endif
    endif
    if (g_iItemType == GUI_TREEITEMPTYPE_BOOL) then
      let s = s + cscSpace + sItemState
    endif
  endif
  ; if ((StringLength (sItemType) == 0) || g_bForceReadNodeInfo) then
  if ((StringLength (sItemType) == 0) || g_bForceReadNodeInfo || !g_bNewTreeColumn) then ; not reading node info when navigating between columns
    if (StringLength (sItemType) == 0) then
      let s = s + cscSpace + g_sNodeText
    elif (!StringIsBlank(g_sItemText) && (StringCompare (g_sNodeText, g_sItemText, true) != 0))
      let s = s + cscSpace + g_sNodeText
    endif
    let s = s + cscSpace + sNodeState + cscSpace + sPosition
  endif
  if (!StringIsBlank (s)) then
    Say (s, OT_CONTROL_NAME)
    let s = ""
  endif

  if (ShoulditemSpeak (OT_TOOL_TIP)) then
    if (g_iItemType < 0) then
      if (!StringIsBlank (g_sNodeTooltip)) then
        let s1 = TrimString (g_sNodeText)
        let s2 = TrimString (g_sNodeTooltip)
        if (StringCompare (s1, s2, false) != 0) then
          let sTooltip = s2
        endif
      endif
    else /* g_iItemType >= 0) */
      if (!StringIsBlank (g_sItemTooltip)) then
        let s1 = TrimString (g_sItemText)
        let s2 = TrimString (g_sItemTooltip)
        if (StringCompare (s1, s2, false) != 0) then
          let sTooltip = s2
        endif
      endif
      if (!StringIsBlank (g_sItemIcon) && (g_sItemIcon != "@@")) then
        if ((g_iItemType != GUI_TREEITEMPTYPE_BUTTON) && (g_iItemType != GUI_TREEITEMPTYPE_BOOL)) then
          sTooltip = msgGuiIcon + cscSpace + sTooltip
        else
          sTooltip = sTooltip
        endif
      endif
    endif
  endif

  /* speak color info */
  if (g_nSapGuiAccVerbosity > 0) then
    if (g_iItemType < 0) then
      if (!StringIsBlank (g_sNodeStyle)) then
        Say (g_sNodeStyle, OT_ITEM_STATE)
      endif
    else
      if (!StringIsBlank (g_sItemStyle)) then
        Say (g_sItemStyle, OT_ITEM_STATE)
      endif
    endif
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif
  let s = ""

  if (ShoulditemSpeak (OT_POSITION)) then
    if ((g_iColumnIndex > 0) && g_bNewTreeColumn) then
      let s = FormatString(msgTablePositionCols, IntToString(g_iColumnIndex), IntToString(g_iColumnCount))
      Say (s, OT_POSITION)
    endif
    let s = ""
  endif

  if (g_iNodesCount>0) then
    if ((g_iGuiCtrlTreeSelectionMode == GUI_SM_MULTIPLE_NODE) || (g_iGuiCtrlTreeSelectionMode == GUI_SM_MULTIPLE_ITEM)) then
      ; Say number of selected nodes

      if (g_bNodeIsSelected) then
        let s = msgItemsSelected
      else
        let s = msgItemsNotSelected
      endif
      Say (s, OT_SELECTED_ITEM)

      if ((g_iNodesCount>1) && ShoulditemSpeak (OT_SELECTED_ITEM)) then
        let s = FormatString(msgTreeSelectedNodeCount, IntToString(g_iNodesCount))
        Say (s, OT_SELECTED_ITEM)
        /*
        if (!StringIsBlank (g_sFocusedNodeText)) then
          let s = s + g_sFocusedNodeText
        endif
       */
      endif
    endif
  endif

  if (StringIsBlank (g_sColumnKey) && !StringIsBlank(g_sAllItemsText)) then
    var string sTemp = ""
    var int nCount = StringSegmentCount (g_sAllItemsText, "|")
    var int i = 0
    while (i < nCount)
      sTemp = StringTrimTrailingBlanks (StringTrimLeadingBlanks (StringSegment (g_sAllItemsText, "|", i+1)))
      if (StringIsBlank (sTemp)) then
        sTemp = msgBlank
      endIf
      ; Say (sTemp, OT_NO_DISABLE, false)
      SayString (sTemp)
      i = i + 1
    endwhile

    ; BrailleClearMessage ()
    BrailleRefresh ()
  endif

  ; SayGuiTreeNodeFullText ()

endFunction

void function ResetGuiTree ()

  g_iGuiCtrlTreePreviousLevel = -1
  g_iGuiCtrlTreeType = -1
  g_iGuiCtrlTreeSelectionMode = -1
  g_sNodeText = ""
  g_sNodeTooltip = ""
  g_sNodeStyle = ""
  g_sItemText = ""
  g_sItemTooltip = ""
  g_sItemStyle = ""
  g_iItemType = -1
  g_iNodeLevel = -1
  g_iCurLevelCount = -1
  g_iSubLevelCount = -1
  g_iCurPosition = -1
  g_sColumnKey = ""
  g_sColumnTitle = ""
  g_iColumnIndex = -1
  g_iColumnCount = -1
  g_bNewTreeColumn = 1
  g_sKey = ""
  g_sItemIcon = ""
  g_bTotalRowExpanded = FALSE
  g_bIsCellHotspot = FALSE
  g_bIsCellLink = FALSE
  g_bForceReadNodeInfo = false
  ; g_bAllItemsTextToggle = true
  g_sAllItemsText = ""
endFunction

/*
 * Braille functions for GuiTree
*/
int function BrailleAddObjectGuiTreeLevel (int nType)
var
  string msg

  let msg = IntToString(g_iNodeLevel)

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiTreeType (int nType)
var
  string msg

  if (g_iGuiCtrlTreeType == GUI_TREETYPE_SIMPLE) then
    let msg = msgBrlTreeSimple
  elif (g_iGuiCtrlTreeType == GUI_TREETYPE_LIST) then
    let msg = msgBrlTreeList
  elif (g_iGuiCtrlTreeType == GUI_TREETYPE_COLUMN) then
    let msg = msgBrlTreeColumn
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiTreeValue (int nType)
var
  string msg

  if (g_iItemType==-1) then
    msg = g_sNodeText
    if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(g_sNodeTooltip)) then
      var string s1 = TrimString (g_sNodeText)
      var string s2 = TrimString (g_sNodeTooltip)
      if (StringCompare (s1, s2, false) != 0) then
        msg = s1 + cscSpace + BrailleGetSubtypeString (WT_TOOLTIP) + cscSpace + s2
      endif
    endif
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return TRUE

endFunction

int function BrailleAddObjectGuiTreeState (int nType)
var
  string msg,
  string sNodeState,
  string sPosition

  ; if (StringLength(g_sKey) == 0) then
    ; return FALSE
  ; endif

  if (g_iIsFolderExpanded==FALSE) then
    if (g_iIsFolderExpandable) then
      ; let sNodeState = BrailleGetStateString (CTRL_COLLAPSED)
      let sNodeState = BrailleGetStateString (CTRL_CLOSED)
      if (StringIsBlank (sNodeState)) then
        let sNodeState = msgBrlTVNodeClosed
      endif
    endif
    let sPosition = FormatString(msgItemPosition,IntToString(g_iCurPosition ),IntToString(g_iCurLevelCount))
  else
    ; let sNodeState = BrailleGetStateString(CTRL_EXPANDED)
    let sNodeState = BrailleGetStateString (CTRL_OPENED)
    if (g_iSubLevelCount==1) then
      let sPosition = IntToString(g_iSubLevelCount)+cscSpace+msgTreeEntry
    elif (g_iSubLevelCount>-1) then
      let sPosition = IntToString(g_iSubLevelCount)+cscSpace+msgTreeEntries
    endif
  endif

  let msg = sNodeState + cscSpace + sPosition

  if (g_iNodesCount>1) then
    let msg = msg + cscSpace + FormatString(msgTreeSelectedNodeCount, IntToString(g_iNodesCount))
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return true

endFunction

int function BrailleAddObjectGuiTreeItemType (int nType)
var
  int nCheckBoxState,
  string msg,
  string sItemType,
  string sCheckBoxState

  if (StringLength(g_sKey) == 0) then
    return true
  endif

  if (!StringIsBlank(g_sAllItemsText)) then
    ; BrailleAddString (g_sAllItemsText, 0, 0, 0)
    return true
  endif

  if (g_iItemType<0) then
    return true
  endif

  if (g_iItemType==0) then
    let sItemType = msgBrlTVHierarchy
  elif (g_iItemType==1) then
    let sItemType = msgBrlTVImage
  elif (g_iItemType==2) then
    ; let sItemType = BrailleGetSubTypeString(WT_CUSTOM_CONTROL_BASE+GUI_WT_TEXTFIELD)
    let sItemType = msgBrlTreeTypeText
  elif (g_iItemType==3) then
    let sItemType = BrailleGetSubTypeString(WT_CUSTOM_CONTROL_BASE+GUI_WT_CHECKBOX)
    if (g_iCheckBoxState == True) || (g_iCheckBoxState == -1) then
      let nCheckBoxState = CTRL_CHECKED
    else
      let nCheckBoxState = CTRL_UNCHECKED
    endif
    if (!g_iIsEditable) then
      let nCheckBoxState = nCheckBoxState | CTRL_DISABLED;
    endif
    sCheckBoxState = BrailleGetStateString (nCheckBoxState)
  elif (g_iItemType==4) then
    let sItemType = BrailleGetSubTypeString(WT_CUSTOM_CONTROL_BASE+GUI_WT_BUTTON)
  elif (g_iItemType==5) then
    let sItemType = BrailleGetSubTypeString (WT_LINK)
  endif

  /* ROM 2009/11/19 - show column title before actual item */
  if (!StringIsBlank (g_sColumnTitle)) then
    let msg = g_sColumnTitle + cscSpace + sItemType
  else
    let msg = sItemType
  endif

  if (!StringIsBlank (sCheckBoxState)) then
    let msg = msg  + cscSpace + sCheckBoxState
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0 ,0 ,0)
  endif

  return true

endFunction

int function BrailleAddObjectGuiTreeItemText (int nType)
  var string s1 = TrimString (g_sItemText)
  var string s2 = TrimString (g_sItemTooltip)
  var string sItemText = s1

  if (!StringIsBlank(g_sAllItemsText)) then
    BrailleAddString (g_sAllItemsText, 0, 0, 0)
    return true
  endif

  if (!StringIsBlank (g_sItemIcon) && (g_sItemIcon != "@@")) then
    if ((g_iItemType != GUI_TREEITEMPTYPE_BUTTON) && (g_iItemType != GUI_TREEITEMPTYPE_BOOL)) then
      sItemText = sItemText + cscSpace + msgBrlIcon
    endif
  endif
  if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(s2)) then
    if (StringCompare (s1, s2, false) != 0) then
      sItemText = sItemText + cscSpace + s1 + cscSpace + BrailleGetSubtypeString (WT_TOOLTIP) + cscSpace + s2
    endif
  endif

  if (!StringIsBlank (sItemText)) then
    BrailleAddString (sItemText, 0 ,0 ,0)
  else
    if ((g_iItemType == GUI_TREEITEMPTYPE_IMAGE) || (g_iItemType == GUI_TREEITEMPTYPE_TEXT)) then
      BrailleAddString (msgBlank, 0, 0, 0)
    endif
  endif

  if (g_iColumnIndex > 0) then
    BrailleAddString (FormatString(msgTablePositionCols, IntToString(g_iColumnIndex), IntToString(g_iColumnCount)), 0, 0, 0)
  endif

  return true

endFunction

/*
 **********************************************************************
 ** GuiCalendar
 **********************************************************************
*/

void function GetCurrentGuiCalendar ()
var
  string sFocusDate

  sFocusDate = g_oGuiComponent.FocusDate
  g_iCalDay = g_oGuiComponent.GetDay(sFocusDate)
  g_iCalMonth = g_oGuiComponent.GetMonth(sFocusDate)
  g_iCalYear = g_oGuiComponent.GetYear(sFocusDate)
  g_sCalWeekday = g_oGuiComponent.GetWeekDay(sFocusDate)
  g_iCalWeekNumber = g_oGuiComponent.GetWeekNumber(sFocusDate)
  g_sCalTooltip = g_oGuiComponent.GetDateTooltip(sFocusDate)
  ; g_iCalPreviousElement = g_iCalFocusedElement
  g_iCalFocusedElement = g_oGuiComponent.FocusedElement
  g_sCalToday = g_oGuiComponent.Today

  g_sCalSelectionInterval = g_oGuiComponent.SelectionInterval

  g_sCalFocusDate = sFocusDate

endFunction

void function SayCurrentGuiCalendar ()
var
  int nStartDate, int nEndDate, int nFocusDate,
  string sDate4Speech,
  string sCompareDate

   if (g_iCalFocusedElement == 1) then
      IndicateControlType (WT_BUTTON, msgCalendarButton, "")
   elif (!g_bGuiComponentSameAsPrevious) then
    if (g_iCalFocusedElement == 0) then
      IndicateControlType (WT_DATETIME, "", "")
    elif (g_iCalFocusedElement == 2)
        Say (msgCalendarNavigator, OT_CONTROL_GROUP_NAME)
    endif
  endif

  sDate4Speech = SysGetDate (GetUserLocaleInfo (LOCALE_SLONGDATE), g_iCalMonth, g_iCalDay, g_iCalYear)
  sDate4Speech = sDate4Speech + cscSpace + msgCalendarWeekNumber + cscSpace + IntToString(g_iCalWeekNumber)

  if (g_sCalFocusDate == g_sCalToday) then
    Say (msgCalendarToday, OT_CONTROL_NAME)
  endif

  Say (sDate4Speech, OT_CONTROL_NAME)

  nStartDate = StringToInt (StringSegment (g_sCalSelectionInterval, ",", 1))
  nEndDate   = StringToInt (StringSegment (g_sCalSelectionInterval, ",", 2))
  nFocusDate = StringToInt (g_sCalFocusDate)

  if ((nFocusDate >= nStartDate) && (nFocusDate <= nEndDate)) then
    Say (cmsgSelected, OT_SELECT)
  endif

  if (ShouldItemSpeak (OT_TOOL_TIP) || StringIsBlank (sDate4Speech)) then
    if (!StringIsBlank (g_sCalTooltip)) then
      sCompareDate = StringLeft (sDate4Speech, StringLength (g_sCalTooltip))
      ; to prevent double speaking of date info from the date tooltip
      if (StringCompare (sCompareDate, g_sCalTooltip, false) != 0) then ; to prevent double speaking of date info
        Say (g_sCalTooltip, OT_TOOL_TIP)
      endif
    endif
  endif

  if (ShouldItemSpeak (OT_TUTOR) && (g_sCalPreviouslyAnnounced != g_sGuiComponentId)) then
    if (g_iCalFocusedElement == 1) then
      SayTutorialHelp (WT_BUTTON, false)
    elif (g_iCalFocusedElement == 2)
      SayTutorialHelp (WT_COMBOBOX, false)
    else
      SayTutorialHelp(GetObjectSubTypeCode(), false)
    endif
    g_sCalPreviouslyAnnounced = g_sGuiComponentId
  endif

endFunction

void function ResetGuiCalendar ()

  g_iCalDay = -1
  g_iCalMonth = -1
  g_iCalYear = -1
  g_iCalWeekNumber = -1
  ; g_iCalPreviousElement = -1
  g_iCalFocusedElement = -1
  g_sCalWeekday = ""
  g_sCalFocusDate = ""
  g_sCalToday = ""
  g_sCalSelectionInterval = ""
  g_sCalPreviouslyAnnounced = ""

endFunction

void function UpdateAndSayGuiCalender ()

  if (g_bFocusChanged) then
    return
  endif

  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()

endFunction

int function BrailleAddObjectGuiCalendar (int nType)
var
  string msg

  if (g_iCalFocusedElement == 0) then
    BrailleAddString (BrailleGetSubtypeString (WT_DATETIME), 0, 0, 0)
  elif (g_iCalFocusedElement == 1) then
    BrailleAddString (msgCalendarButton, 0, 0, 0)
    BrailleAddString (BrailleGetSubtypeString (WT_BUTTON), 0 , 0, 0)
  elif (g_iCalFocusedElement == 2) then
    BrailleAddString (msgBrlCalendarNavigator, 0 , 0, 0)
  endif

  if (g_sCalFocusDate == g_sCalToday) then
    BrailleAddString (msgCalendarToday, 0 ,0 ,0)
  endif
  BrailleAddString (g_sCalWeekday, 0 ,0 ,0)

  msg = SysGetDate (GetUserLocaleInfo (LOCALE_SSHORTDATE), g_iCalMonth, g_iCalDay, g_iCalYear)
  BrailleAddString (msg, 0 ,0 ,0)

  msg = msgCalendarWeekNumber + cscSpace + IntToString(g_iCalWeekNumber)
  BrailleAddString (msg, 0 ,0 ,0)

  return TRUE

endFunction

/*
 **********************************************************************
 * GuiPicture
 **********************************************************************
 */

int Function GetCurrentGuiPicture ()

  if (g_bGuiPictureIsValid) then
    return (TRUE)
  endif

  let g_sGuiPictureAltText = g_oGuiComponent.AltText
  let g_sGuiPictureIcon = g_oGuiComponent.Icon
  let g_sGuiPictureUrl = g_oGuiComponent.Url

  let g_bGuiPictureIsValid = TRUE

  return TRUE

EndFunction

void Function ResetGuiPicture ()

  let g_sGuiPictureIcon = ""
  let g_sGuiPictureUrl = ""
  let g_sGuiPictureAltText = ""

  let g_bGuiPictureIsValid = TRUE

EndFunction

void Function SayCurrentGuiPicture ()
var
  string info

  let info = ""
  if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
    if (!StringIsBlank (g_sGuiPictureAltText)) then
      let info = info + cscSpace + g_sGuiPictureAltText
    elif (!StringIsBlank (g_sGuiPictureIcon)) then
      let info = info + cscSpace + g_sGuiPictureIcon
    endif
    let info = info + cscSpace + msgGuiPicture
  endif

  Say (info, OT_CONTROL_TYPE)

EndFunction

Int Function BrailleAddObjectGuiPicture (int nType)
var
  string sInfo

  /* ROM 2009/11/09 - function slightly updated - as alternative picture text is allowed be stored in AccDescription */

  let sInfo = ""

  if (!StringIsBlank (g_sGuiPictureAltText)) then
    let sInfo = g_sGuiPictureAltText
  elif (!StringIsBlank (g_sGuiPictureIcon)) then
    let sInfo = g_sGuiPictureIcon
  elif (!StringIsBlank (g_sGuiComponentAccText)) then
    let sInfo = g_sGuiComponentAccText
  elif (!StringIsBlank (g_sGuiComponentAccDescription)) then
    let sInfo = g_sGuiComponentAccDescription
  endif

  if (!StringIsBlank (sInfo)) then
    BrailleAddString (sInfo, 0, 0, 0)
  endif

  return TRUE

EndFunction

/*
 * GuiCtrlTextEdit
 */

int Function GetCurrentGuiTextEdit ()

  var
  int nLine,
  int nColumn

  if (g_bGuiTextEditIsValid) then
    return
  endif

  if  ((CheckCurrentObject() == 1) && (g_nObjectTypeCode == WT_TOOLBAR)) then
    ResetGuiTextEdit ()
    return
  endif

  Let nLine = g_oGuiComponent.CurrentLine()
  Let nColumn = g_oGuiComponent.CurrentColumn()
  Let g_iGuiTextEditFirstVisibleLine = g_oGuiComponent.FirstVisibleLine()
  Let g_iGuiTextEditLastVisibleLine = g_oGuiComponent.LastVisibleLine()
  Let g_iGuiTextEditLineCount = g_oGuiComponent.LineCount()

  If (nLine > 0) then
    let g_sGuiTextEditLineText = g_oGuiComponent.GetLineText (nLine)
    else
      let g_sGuiTextEditLineText = GetLine ()
  EndIf


  Let g_iGuiTextEditCurrentLine = nLine
  Let g_iGuiTextEditCurrentColumn = nColumn
  ; checking to see if any text is selected - KK
  /* The selected text values are obtained in the GetCurrentGuiTextEditSelection method - KK
  If ((g_oGuiComponent.SelectionEndLine() != nLine) && (g_oGuiComponent.SelectionEndColumn() != nColumn)) then
    Let g_iGuiTextEditSelectionStartLine = g_oGuiComponent.SelectionStartLine()
    Let g_iGuiTextEditSelectionStartColumn = g_oGuiComponent.SelectionStartColumn()
    Let g_iGuiTextEditSelectionEndLine = g_oGuiComponent.SelectionEndLine()
    Let g_iGuiTextEditSelectionEndColumn = g_oGuiComponent.SelectionEndColumn()
    Let g_sGuiTextEditSelectedText = g_oGuiComponent.SelectedText()
  EndIf
  */

  Let g_bGuiTextEditIsCommentLine = g_oGuiComponent.IsCommentLine (nLine)
  Let g_bGuiTextEditIsProtectedLine = g_oGuiComponent.IsProtectedLine (nLine)
  Let g_bGuiTextEditIsBreakPointLine = g_oGuiComponent.IsBreakpointLine (nLine)
  Let g_bGuiTextEditIsSelectedLine = g_oGuiComponent.IsSelectedLine (nLine)
  Let g_bGuiTextEditIsHighlightedLine = g_oGuiComponent.IsHighlightedLine (nLine)

  let g_bGuiTextEditIsValid = TRUE

EndFunction

void Function ResetGuiTextEdit ()

  let g_sGuiTextEditLineText = ""
  Let g_iGuiTextEditFirstVisibleLine = 0
  Let g_iGuiTextEditLastVisibleLine = 0
  Let g_iGuiTextEditLineCount = 0
  Let g_iGuiTextEditCurrentLine = 0
  Let g_iGuiTextEditCurrentColumn = 0
  Let g_iGuiTextEditSelectionStartLine = 0
  Let g_iGuiTextEditSelectionStartColumn = 0
  Let g_iGuiTextEditSelectionEndLine = 0
  Let g_iGuiTextEditSelectionEndColumn = 0
  Let g_sGuiTextEditSelectedText = ""
  Let g_bGuiTextEditIsCommentLine = false
  Let g_bGuiTextEditIsProtectedLine = false
  Let g_bGuiTextEditIsBreakPointLine = false
  Let g_bGuiTextEditIsSelectedLine = false
  Let g_bGuiTextEditIsHighlightedLine = false
  let g_bGuiTextEditIsValid = TRUE
  Let g_iLineWithBreakpointID  = 0

EndFunction

void Function SayCurrentGuiTextEdit (int bLine)
; the bLine param is for specifying if the function call is for announcing full info or only line specific info in which case, the control type announcement is ignored - KK
var
  string info,
  string brlmsg

  let info = ""
  If (bLine == false) then
    SayCurrentGuiBox ()
    SayLabelText () ; 2015/05/19 - rom - added speaking a potential label, but this is actually currently not set by anyone (instead it's AccDescription)
    if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
      if (ShoulditemSpeak (OT_ITEM_STATE)) then
        if (!g_bGuiComponentChangeable) then
          let info = msgStateReadOnly
        endif
      endif
      let info = info + cscSpace + msgGuiTextEdit
    endif
  EndIf

  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_TYPE)
    let info = info + cscSpace + BrailleGetSubTypeString(WT_MULTILINE_EDIT)
    BrailleMessage (info)
  endif

  if (!StringIsBlank (g_sGuiTextEditLineText)) then
    Say (g_sGuiTextEditLineText, OT_DIALOG_TEXT)
  endif

  Let info = ""
  If ((g_iGuiTextEditCurrentLine && g_iGuiTextEditLineCount) > 0) then
    Let info = msgLine+cscSpace+FormatString (msgItemPosition, IntToString(g_iGuiTextEditCurrentLine), IntToString(g_iGuiTextEditLineCount))
  EndIf

  If (g_bGuiTextEditIsCommentLine) then
    Let info = info+cscSpace+msgTextEditorComment
  EndIf

  If (g_bGuiTextEditIsProtectedLine) then
    Let info = info+cscSpace+msgTextEditorProtected
  EndIf

  If (g_bGuiTextEditIsBreakPointLine) then
    Let info = info+cscSpace+msgTextEditorBreakpoint
  EndIf

  If (g_bGuiTextEditIsSelectedLine) then
    Let info = info+cscSpace+msgTextEditorSelected
  EndIf

  If (!StringIsBlank (info)) then
    Say (info, OT_TOOL_TIP)
  EndIf

  If (g_bGuiTextEditIsBreakPointLine) then
    if (g_iLineWithBreakpointID != 0) then
      UnscheduleFunction (g_iLineWithBreakpointID)
    endif
    let g_iLineWithBreakpointID = ScheduleFunction ("BrailleLineWithBreakpoint", 4)
  EndIf

EndFunction

string Function GetCurrentGuiTextEditSelection ()
var
  object oGuiFocus,
  string sSelText

  if (IsSAPGUISessionBusy (5, FALSE)) then
    return ""
  endif

  let oGuiFocus = GetSAPGUIFocus ()

  let sSelText = oGuiFocus.SelectedText ()

  let oGuiFocus = oNull
  ExitSAPGUIFrame ()

  return (sSelText)

EndFunction

/* no longer used. properties are obtained in the SayCurrentGuiTextEdit function - KK
void Function SayTextEditColorInfo ()
var
  int nBgColor,
  int nFgColor,
  string info

  let nBgColor = GetColorBackground ()
  let nFgColor = GetColorText ()

  let info = ""
  if (nFgColor == 16711680) then ; blue
    let info = msgTextEditorComment
  elif (nFgColor == 8421504) then ; grey
    let info = msgTextEditorProtected
  endif
  if (nBgColor == 65535) then ; yellow
    let info = info + msgTextEditorBreakpoint
  endif

  if (!StringIsBlank (info)) then
    Say (info, OT_ITEM_STATE)
  endif

EndFunction
*/

Script SayTextEditStatusLine ()
var
  int bFound,
  handle hFocusWin,
  handle hWin

  let bFound = false
  let hFocusWin = GetFocus ()

; say (GetWindowClass(hWin), OT_JAWS_MESSAGE)

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    let hWin = GetFirstWindow (GetParent (hFocusWin))
  else
    let hWin = GetFirstWindow (hFocusWin)
  endif

  while (hWin && !bFound)
    if (StringContains (GetWindowClass (hWin), "statusbar32")) then
      let bFound = true
    else
      let hWin = GetNextWindow (hWin)
    endif
  endwhile

  if (bFound) then
    Say (GetWindowText (hWin, false), OT_STATUS)
  endif

EndScript

/*
 ************************************************************************************************************
 **  GuiCtrlAbapEditor
 ************************************************************************************************************
*/

int Function GetCurrentGuiAbapEditor ()
var
  object oBookmarkColl,
  object oNext,
  string s,
  int nNext,
  int nBookmarks,
  int i,
  int nDelay,
  int nLine,
  int nColumn

  if (g_bGuiAbapEditorIsValid) then
    return true
  endif

  let g_bGuiAbapEditorIsAutoCompleteOpen = g_oGuiComponent.IsAutoCompleteOpen ()
  if (g_bGuiAbapEditorIsAutoCompleteOpen) then
    let g_nGuiAbapEditorAutoCompleteCount = g_oGuiComponent.GetAutoCompleteEntryCount ()
    let g_nGuiAbapEditorAutoCompleteIndex = g_oGuiComponent.GetSelectedAutoComplete ()
    let g_sGuiAbapEditorAutoCompleteText = g_oGuiComponent.GetAutoCompleteEntryText (g_nGuiAbapEditorAutoCompleteIndex)
    let nDelay = g_oGuiComponent.GetAutoCompleteTooltipDelay ()
    let nDelay = (nDelay / 100) + 2
    let g_nGuiAbapEditorAutoCompleteDelay = nDelay
    let g_bGuiAbapEditorIsValid = true
    let g_sGuiAbapEditorAutoCompleteTooltip = ""
    let g_sGuiAbapEditorAutoCompleteIcon = g_oGuiComponent.GetAutoCompleteIconType (g_nGuiAbapEditorAutoCompleteIndex)
    let s = g_oGuiComponent.GetAutoCompleteSubIconType (g_nGuiAbapEditorAutoCompleteIndex)
    if (!StringIsBlank (s)) then
      let g_sGuiAbapEditorAutoCompleteIcon = g_sGuiAbapEditorAutoCompleteIcon + cscSpace + s
    endif
    ScheduleFunction ("GetCurrentGuiAbapEditorTooltipText", nDelay)
    return true
  endif

  let nLine = g_oGuiComponent.GetCursorLinePosition ()
  let nColumn = g_oGuiComponent.GetCursorColumnPosition ()
  let g_nGuiAbapEditorCursorLine = nLine
  let g_nGuiAbapEditorCursorColumn = nColumn

  let g_nGuiAbapEditorLineCount = g_oGuiComponent.GetLineCount ()

  let g_sGuiAbapEditorLine = g_oGuiComponent.GetLineText (nLine)
  let g_bGuiAbapEditorIsBookmark = g_oGuiComponent.IsBookmark (nLine)
  let g_bGuiAbapEditorIsBreakpointSet = g_oGuiComponent.IsBreakpointSet (nLine)
  let g_bGuiAbapEditorIsLineModified = g_oGuiComponent.IsLineModified (nLine)
  Let g_bGuiAbapEditorIsCommentLine = g_oGuiComponent.IsLineComment (nLine)

  let g_bGuiAbapEditorIsLineCollapsed = g_oGuiComponent.IsLineCollapsed (nLine)
  let g_nGuiAbapEditorBlockStartLine = g_oGuiComponent.GetStructureBlockStartLine (nLine)
  let g_nGuiAbapEditorBlockEndLine = g_oGuiComponent.GetStructureBlockEndLine (nLine)

  let oBookmarkColl = g_oGuiComponent.GetNumberedBookmarks (nLine)
  let nBookmarks = oBookmarkColl.Count
  let i = 0
  let g_sGuiAbapEditorBookmarkList = ""
  while (i < nBookmarks)
    let nNext = oBookmarkColl.Item(i)
    let g_sGuiAbapEditorBookmarkList = g_sGuiAbapEditorBookmarkList + IntToString(nNext) + " "
    let i = i + 1
  endwhile
  if (!StringIsBlank(g_sGuiAbapEditorBookmarkList)) then
    let g_sGuiAbapEditorBookmarkList = StringChopRight (g_sGuiAbapEditorBookmarkList, 1)
  endif

  let g_bGuiAbapEditorIsValid = true

  return true

EndFunction

void Function GetCurrentGuiAbapEditorTooltipText ()
var
  object oFocus

  ; let g_sGuiAbapEditorAutoCompleteTooltip = ""
  if (IsSAPGUISessionBusy (1, FALSE)) then
    return
  endif

  let oFocus = GetSAPGUIFocus ()
  if (oFocus.IsAutoCompleteTooltipVisible ()) then
    let g_sGuiAbapEditorAutoCompleteTooltip = oFocus.GetCurrentTooltipText ()
  endif

  let oFocus = oNull
  ExitSAPGUIFrame ()

EndFunction

void Function GetCurrentGuiAbapEditorToolbar ()
var
  object oFocus,
  int i,
  string s

  if (IsSAPGUISessionBusy (1, FALSE)) then
    return
  endif

  let g_sGuiAbapEditorAutoCompleteToolbarHelp = ""
  let oFocus = GetSAPGUIFocus ()
  let i = 0
  let s = oFocus.GetAutoCompleteToolbarButtonTooltip (i)
  while (!StringIsBlank (s))
    let g_sGuiAbapEditorAutoCompleteToolbarHelp = g_sGuiAbapEditorAutoCompleteToolbarHelp
      + FormatString (msgTextEditorAutoCompleteToolbar, IntToString(i+1), s) + cscBufferNewLine
    let i = i + 1
    let s = oFocus.GetAutoCompleteToolbarButtonTooltip (i)
  endwhile

  let oFocus = oNull
  ExitSAPGUIFrame ()

EndFunction

void Function ResetGuiAbapEditor ()

  let g_nGuiAbapEditorCursorLine = -1
  let g_nGuiAbapEditorCursorColumn = -1
  let g_nGuiAbapEditorLineCount = -1

  let g_sGuiAbapEditorLine = ""
  let g_bGuiAbapEditorIsBookmark = false
  let g_bGuiAbapEditorIsBreakpointSet = false
  let g_bGuiAbapEditorIsLineModified = false
  Let g_bGuiAbapEditorIsCommentLine = false

  let g_bGuiAbapEditorIsLineCollapsed = false
  let g_nGuiAbapEditorBlockStartLine = -1
  let g_nGuiAbapEditorBlockEndLine = -1

  let g_sGuiAbapEditorBookmarkList = ""

  let g_bGuiAbapEditorIsAutoCompleteOpen = false
  let g_nGuiAbapEditorAutoCompleteIndex = -1
  let g_nGuiAbapEditorAutoCompleteCount = -1
  let g_sGuiAbapEditorAutoCompleteText = ""
  let g_sGuiAbapEditorAutoCompleteTooltip = ""
  let g_sGuiAbapEditorAutoCompleteIcon = ""
  let g_sGuiAbapEditorAutoCompleteToolbarHelp = ""

  let g_bGuiAbapEditorIsValid = true

EndFunction

void Function SayCurrentGuiAbapEditor ()
var
  string info

  let info = ""
  if (ShouldItemSpeak (OT_CONTROL_TYPE)) then
    if (ShoulditemSpeak (OT_ITEM_STATE)) then
      if (!g_bGuiComponentChangeable) then
        let info = msgStateReadOnly
      endif
    endif
    let info = info + cscSpace + msgGuiAbapEditor
  endif

  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_TYPE)
  endif

  if (!StringIsBlank (g_sGuiAbapEditorLine) || g_bGuiAbapEditorIsAutoCompleteOpen) then
    SayCurrentGuiAbapEditorLine ()
  endif

EndFunction

void Function BrailleLineWithBreakpoint ()

  let g_iLineWithBreakpointID = 0
  BrailleClearMessage ()
  BrailleMessage (msgTextEditorBreakpoint)

EndFunction

void Function SayCurrentGuiAbapEditorLine ()
var
  string s

  if (g_bGuiAbapEditorIsAutoCompleteOpen) then
    Say (g_sGuiAbapEditorAutoCompleteText, OT_CONTROL_NAME)
    Say (g_sGuiAbapEditorAutoCompleteIcon, OT_CONTROL_TYPE)
    let s = FormatString (msgItemPosition, IntToString(g_nGuiAbapEditorAutoCompleteIndex+1), IntToString(g_nGuiAbapEditorAutoCompleteCount))
    Say (s, OT_ITEM_NUMBER)
    return
  endif

  Say (g_sGuiAbapEditorLine, OT_DIALOG_TEXT)

  if (g_bGuiAbapEditorIsBookmark) then
    Say (msgTextEditorBookmark, OT_TOOL_TIP)
  endif
  if (!StringIsBlank(g_sGuiAbapEditorBookmarkList)) then
    let s = FormatString (msgTextEditorNumberedBookmark, g_sGuiAbapEditorBookmarkList)
    Say (s, OT_TOOL_TIP)
  endif
  if (g_bGuiAbapEditorIsBreakpointSet) then
    Say (msgTextEditorBreakpoint, OT_TOOL_TIP)
    if (g_iLineWithBreakpointID != 0) then
      UnscheduleFunction (g_iLineWithBreakpointID)
    endif
    let g_iLineWithBreakpointID = ScheduleFunction ("BrailleLineWithBreakpoint", 4)
  endif
  if (g_nGuiAbapEditorCursorLine == g_nGuiAbapEditorBlockStartLine) then
    if (g_bGuiAbapEditorIsLineCollapsed) then
      Say (msgTextEditorCollapsedLine, OT_TOOL_TIP)
    else
      Say (msgTextEditorBlockStartLine, OT_TOOL_TIP)
    endif
  endif
  if (g_nGuiAbapEditorCursorLine == g_nGuiAbapEditorBlockEndLine) then
    Say (msgTextEditorBlockEndLine, OT_TOOL_TIP)
  endif

  if (g_bGuiAbapEditorIsCommentLine) then
    Say (msgTextEditorComment, OT_TOOL_TIP)
  EndIf



  let s = FormatString (msgTextEditorLineNumber,
    IntToString(g_nGuiAbapEditorCursorLine), IntToString(g_nGuiAbapEditorLineCount))
  Say (s, OT_POSITION)

  if (g_bGuiAbapEditorIsLineModified) then
    Say (msgTextEditorModified, OT_TOOL_TIP)
  endif

EndFunction

string Function GetCurrentGuiAbapEditorSelection ()
var
  object oGuiFocus,
  string sSelText

  if (IsSAPGUISessionBusy (5, FALSE)) then
    return ""
  endif

  let oGuiFocus = GetSAPGUIFocus ()

  let sSelText = oGuiFocus.GetSelectedText ()

  let oGuiFocus = oNull
  ExitSAPGUIFrame ()

  return (sSelText)

EndFunction

void Function SayCurrentGuiAbapEditorNewSelection ()
var
  int nIndex,
  string s,
  string sMsg,
  string sSelBefore,
  string sSelAfter,
  string sSelNew

  let s = GetCurrentGuiAbapEditorSelection ()
  let sSelBefore = StringReplaceChars (s, "\n\r", " ")

  TypeCurrentScriptKey ()
  ; SayCurrentScriptKeyLabel ()
  Pause ()

  let s = GetCurrentGuiAbapEditorSelection ()
  let sSelAfter = StringReplaceChars (s, "\n\r", " ")

  let s = ""
  let sMsg = ""

  if (StringIsBlank (sSelBefore)) then
    let sMsg = cmsgSelected
    let sSelNew = sSelAfter
  elif (StringIsBlank (sSelAfter)) then
    let sMsg = cmsgUnselected
    let sSelNew = sSelBefore
  elif (StringLength (sSelAfter) > StringLength (sSelBefore)) then
    let sMsg = cmsgSelected
    let nIndex = StringContains (sSelAfter, sSelBefore)
    if (nIndex > 1) then
      let sSelNew = StringLeft (sSelAfter, nIndex-1)
    else
      let sSelNew = StringChopLeft (sSelAfter, StringLength (sSelBefore))
    endif
  else
    let sMsg = cmsgUnselected
    let nIndex = StringContains (sSelBefore, sSelAfter)
    if (nIndex > 1) then
      let sSelNew = StringLeft (sSelBefore, nIndex-1)
    else
      let sSelNew = StringChopLeft (sSelBefore, StringLength (sSelAfter))
    endif
  endif

  if (!StringIsBlank (sSelNew)) then
    Say (sMsg + cscSpace + sSelNew, OT_SELECT)
  else
    Say (msgBlank, OT_SELECT)
  endif

EndFunction

void Function SayCurrentGuiAbapEditorBlock (int nType)
var
  int nLineNo,
  object oGuiFocus,
  string s,
  string sLine

  if (IsSAPGUISessionBusy (5, FALSE)) then
    return ""
  endif

  let oGuiFocus = GetSAPGUIFocus ()

  if (nType == 1) then /* announce the start of block */
    let nLineNo = g_nGuiAbapEditorBlockStartLine
  elif (nType == 2) then /* announce the end of block */
    let nLineNo = g_nGuiAbapEditorBlockEndLine
  endif

  if (nLineNo < 0) then
    Say (msgTextEditorNoBlock, OT_STATUS)
  endif

  let sLine = oGuiFocus.GetLineText (nLineNo)

  let oGuiFocus = oNull
  ExitSAPGUIFrame ()

  Say (sLine, OT_DIALOG_TEXT)
  let s = FormatString (msgTextEditorLineNumber,
    IntToString(nLineNo), IntToString(g_nGuiAbapEditorLineCount))
  Say (s, OT_POSITION)

EndFunction

Script SayStartLine ()

  TypeCurrentScriptKey ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorBlock (1)
    return
  endif

  SayCurrentScriptKeyLabel ()

EndScript

Script SayEndLine ()
  TypeCurrentScriptKey ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorBlock (2)
    return
  endif

  SayCurrentScriptKeyLabel ()

EndScript

void Function HandleAutoCompletion ()

  if (g_iAutoCompletionID != 0) then
    UnscheduleFunction (g_iAutoCompletionID)
    let g_iAutoCompletionID = 0
  endif

  if (g_bAutoCompletionProcessed) then
    return
  endif

  UpdateCurrentGuiComponent ()
  if (g_bGuiAbapEditorIsAutoCompleteOpen) then
    let g_bAutoCompletionProcessed = true
    Say (msgTextEditorAutoComplete + cscSpace +cmsg41_L, OT_JAWS_MESSAGE)
    SayCurrentGuiAbapEditorLine ()
  endif

EndFunction

void Function ShowAutoCompletionQuickinfo ()

  if (StringIsBlank(g_sGuiAbapEditorAutoCompleteTooltip)) then
    GetCurrentGuiAbapEditorTooltipText ()
  endif
  if (StringIsBlank(g_sGuiAbapEditorAutoCompleteTooltip)) then
    Say (msgTextEditorQuickInfoUnavailable, OT_STATUS)
    return
  endif

  if (UserBufferIsActive ()) then
    UserBufferDeactivate ()
  endif
  UserBufferClear ()
  UserBufferAddText (g_sGuiAbapEditorAutoCompleteTooltip)
  UserBufferAddText (cMsgBuffExit)
  UserBufferActivate ()
  JAWSTopOfFile ()
  SayAll ()

EndFunction

Script AutoCompletionQuickinfo ()
var
  int nDelay

  if ((MenusActive ()) || (InHJDialog ())) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    return
  endif

  if !((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    return
  endif

  let nDelay = 1
  if (StringIsBlank (g_sGuiAbapEditorAutoCompleteTooltip)) then
    let nDelay = g_nGuiAbapEditorAutoCompleteDelay
  endif

  ScheduleFunction ("ShowAutoCompletionQuickinfo", nDelay)

EndScript

Void Function ShowAutoCompletionToolbarHelp ()

  GetCurrentGuiAbapEditorToolbar ()
  if (StringIsBlank (g_sGuiAbapEditorAutoCompleteToolbarHelp)) then
    Say (msgTextEditorToolbarUnavailable, OT_STATUS)
    return
  endif

  if (UserBufferIsActive ()) then
    UserBufferDeactivate ()
  endif
  UserBufferClear ()
  UserBufferAddText (g_sGuiAbapEditorAutoCompleteToolbarHelp)
  UserBufferAddText (cMsgBuffExit)
  UserBufferActivate ()
  JAWSTopOfFile ()
  SayAll ()

EndFunction

Script AutoCompletionToolbarHelp ()

  if ((MenusActive ()) || (InHJDialog ())) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    return
  endif

  if !((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    return
  endif

  ScheduleFunction ("ShowAutoCompletionToolbarHelp", 2)

EndScript

void Function PressAutoCompletionToolbarButton ()
var
  int nButton,
  int bPressed,
  string sKey,
  string sTooltip,
  object oAbapEditor

  let g_iAutoCompletionToolbarID = 0
  if (IsSAPGUISessionBusy (0, FALSE)) then
    let g_iAutoCompletionToolbarID = ScheduleFunction ("PressAutoCompletionToolbarButton", 2)
    return
  endif

  if (StringLeft (StringRight (g_sCurrentAccessKey, 2), 1) != "+") then
    return
  endif

  let sKey = StringRight (g_sCurrentAccessKey, 1)
  let nButton = StringToInt (sKey)
  if ((nButton < 1) || (nButton > 9)) then
    return
  endif

  ; Say (sKey, OT_JAWS_MESSAGE)

  let oAbapEditor = GetSAPGUIFocus ()
  let sTooltip = oAbapEditor.GetAutoCompleteToolbarButtonTooltip (nButton-1)
  let bPressed = oAbapEditor.IsAutoCompleteToolbarButtonPressed (nButton-1)

  let oAbapEditor = oNull
  ExitSAPGUIFrame ()

  if (StringIsBlank (sTooltip)) then
    return
  endif

  IndicateControlType (WT_TOGGLE_BUTTON, sTooltip)
  if (bPressed) then
    IndicateControlState (WT_TOGGLE_BUTTON, CTRL_PRESSED)
  else
    IndicateControlState(WT_TOGGLE_BUTTON, 0, cmsgNotPressed_l )
  endif

/*
  Say (sTooltip, OT_CONTROL_NAME)
  Say (msgGui2StateButton, OT_CONTROL_TYPE)
  if (bPressed) then
    Say (msgGuiRadioButtonSelected, OT_ITEM_STATE)
  else
    Say (msgGuiRadioButtonNotSelected, OT_ITEM_STATE)
  endif
*/

EndFunction

void Function SayBookmarkStatus ()
var
  int nChar,
  string s,
  string sKey

  let g_iBooknmarkStatusID = 0

  if (StringLeft (StringRight (g_sCurrentAccessKey, 2), 1) != "+") then
    return
  endif

  let sKey = StringRight (g_sCurrentAccessKey, 1)
  let nChar = GetCharacterValue (sKey)

  if ((nChar < 48) || (nChar > 57)) then
    if (sKey != "M") then
      return
    endif
  endif

  UpdateCurrentGuiComponent ()
  if (!g_bGuiAbapEditorIsBookmark && StringIsBlank(g_sGuiAbapEditorBookmarkList)) then
    Say (msgTextEditorNoBookmark, OT_TOOL_TIP)
    return
  endif

  if (g_bGuiAbapEditorIsBookmark) then
    Say (msgTextEditorBookmark, OT_TOOL_TIP)
  endif
  if (!StringIsBlank(g_sGuiAbapEditorBookmarkList)) then
    let s = FormatString (msgTextEditorNumberedBookmark, g_sGuiAbapEditorBookmarkList)
    Say (s, OT_TOOL_TIP)
  endif

EndFunction

/*
 **  end of section for GuiCtrlAbapEditor
*/

/*
 ************************************************************************************************************
 **  GuiSimpleContainer - if container for LabelLists - LabelTrees - LabelTextBoxes   **
 ************************************************************************************************************
*/
/*
 * GetCurrentGuiContainer
 */
Void Function GetCurrentGuiContainer ()

  if (g_bGuiContainerIsValid) then
    return
  endif

  let g_sLstContainerType = g_oGuiComponent.GetListProperty("ContainerType")

  let g_nLstListTablesTotal = g_oGuiComponent.GetListProperty("ListTablesTotal")
  let g_nLstListTreesTotal = g_oGuiComponent.GetListProperty("ListTreesTotal")
  let g_nLstListTextBoxesTotal = g_oGuiComponent.GetListProperty("ListTextBoxesTotal")
  let g_sLstListInputType = g_oGuiComponent.GetListProperty("ListInputType")

  let g_nLstLastTableNo = -1
  let g_nLstLastTreeNo = -1
  let g_nLstLastTextBoxNo = -1

  let g_bGuiContainerIsValid = TRUE

EndFunction

Void Function ResetGuiContainer ()

  let g_sLstContainerType = ""

  let g_nLstListTablesTotal = 0
  let g_nLstListTreesTotal = 0
  let g_nLstListTextBoxesTotal = 0
  let g_nLstLastTableNo = -1
  let g_nLstLastTreeNo = -1
  let g_nLstLastTextBoxNo = -1
  let g_nLstLastColumnNo = -1
  let g_nLstLastRowNo = -1
  let g_nLstLastGroupNo = -1
  let g_nLstLastSubGroupNo = -1

  let g_sLstListInputType = ""

  let g_bGuiContainerIsValid = TRUE

EndFunction

/*
 * SayCurrentGuiContainer
 */
Void Function SayCurrentGuiContainer ()
Var
  string info

  if (g_sLstContainerType == CT_LIST) then
    let info = msgLstContainerList
    if (!StringIsBlank (g_sLstListInputType) && ShouldItemSpeak (OT_CONTROL_TYPE)) then

      Say (info, OT_JAWS_MESSAGE)
      let info = ""

      if (g_sLstListInputType != LIT_NONE) then
        if (g_sLstListInputType == LIT_CHECKBOXES) then
          let info = msgLstWith + cscSpace + msgLstCheckboxes  + cscSpace
        elif (g_sLstListInputType == LIT_EDITFIELDS) then
          let info = msgLstWith + cscSpace + msgLstEditfields + cscSpace
        elif (g_sLstListInputType == LIT_ALL) then
          let info = msgLstWith + cscSpace + msgLstCheckboxesAndEditfields + cscSpace
        endif
      endif
      if (g_nLstListTablesTotal > 0) then
        if (StringLength(info) == 0) then
          let info = info + msgLstContainerList + cscSpace + msgLstWith + cscSpace
        else
          ; let info = info + msgAnd  + cscSpace
        endif
        if (g_nLstListTablesTotal == 1) then
          let info = info + IntToString(g_nLstListTablesTotal) + cscSpace + msgLstTable + cscSpace
        else
          let info = info + IntToString(g_nLstListTablesTotal) + cscSpace + msgLstTables + cscSpace
        endif
      endif
      if (g_nLstListTreesTotal > 0) then
        if (StringLength(info) == 0) then
          let info = info + msgLstContainerList + cscSpace + msgLstWith + cscSpace
        else
          ; let info = info + msgAnd  + cscSpace
        endif
        if (g_nLstListTreesTotal == 1) then
          let info = info + IntToString(g_nLstListTreesTotal) + cscSpace + msgLstTree + cscSpace
        else
          let info = info + IntToString(g_nLstListTreesTotal) + cscSpace + msgLstTrees + cscSpace
        endif
      endif
      if (g_nLstListTextBoxesTotal > 0) then
        if (StringLength(info) == 0) then
          let info = info + msgLstContainerList + cscSpace + msgLstWith + cscSpace
        else
          ; let info = info + msgAnd  + cscSpace
        endif
        if (g_nLstListTextBoxesTotal == 1) then
          let info = info + IntToString(g_nLstListTextBoxesTotal) + cscSpace + msgLstTextbox + cscSpace
        else
          let info = info + IntToString(g_nLstListTextBoxesTotal) + cscSpace + msgLstTextboxes + cscSpace
        endif
      endif

      if (!StringIsBlank (info)) then
        Say (info, OT_JAWS_MESSAGE)
      endif

    endif
  endif

EndFunction

/* ROM 2012/11/26 - function BrailleAddObjectGuiContainer merged with BrailleAddObjectContainer */

/*
 **********************************************************************
 ** GuiSplitterShell/GuiDockShell functions
 **********************************************************************
*/

void function ResetGuiSplitterShell ()

  g_nGuiSplitterShellType = -1
  g_nGuiSplitterShellWidth1 = -1
  g_nGuiSplitterShellWidth2 = -1
  g_nGuiSplitterShellHeight1 = -1
  g_nGuiSplitterShellHeight2 = -1
  g_sGuiSplitterShellDescription1 = ""
  g_sGuiSplitterShellDescription2 = ""

  g_bGuiSplitterShellIsValid = true

endFunction

void function GetCurrentGuiSplitterShell ()
var
  int nPosSplitter = 0,
  int nTotalSize = 0,
  int nType = -1,
  int nSashIndex = 0,
  object oChild1,
  object oChild2,
  object oMainWindow

  if (g_bGuiSplitterShellIsValid) then
    return
  endif

  g_nGuiSplitterShellType = -1
  g_nGuiSplitterShellWidth1 = -1
  g_nGuiSplitterShellWidth2 = -1
  g_nGuiSplitterShellHeight1 = -1
  g_nGuiSplitterShellHeight2 = -1
  g_sGuiSplitterShellDescription1 = ""
  g_sGuiSplitterShellDescription2 = ""

  if (g_nGuiComponentType == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER)
    nType = g_oGuiComponent.IsVertical
    if (g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER) then
      if (nType != 0) then
        nType = SDT_SPLITHORIZONTAL
      else
        nType = SDT_SPLITVERTICAL
      endif
    endif
  else
    if (g_oGuiComponent.DockerIsVertical) then
      nType = SDT_DOCKSHELLVERTICAL
    else
      nType = SDT_DOCKSHELLHORIZONTAL
    endif
  endif

  g_nGuiSplitterShellType = nType

  if ((nType == SDT_SPLITVERTICAL) || (nType == SDT_SPLITCOMBINED) || (nType == SDT_DOCKSHELLVERTICAL)) then ; nType>0
  
    /* calculate width ratio */

    if (nType == SDT_DOCKSHELLVERTICAL) then
      nPosSplitter = g_oGuiComponent.DockerPixelSize
      g_nGuiSplitterShellWidth1 = (nPosSplitter * 100) / g_oSAPGUIFrame.Width
      g_nGuiSplitterShellWidth2 = 100 - g_nGuiSplitterShellWidth1
    else
      ; nTotalSize = g_oGuiComponent.Width
      nSashIndex = g_oGuiComponent.FocusedVerticalSash + 1
      oChild1 = g_oGuiComponent.Children.ElementAt(nSashIndex)
      oChild2 = g_oGuiComponent.Children.ElementAt(nSashIndex+1)

      nTotalSize = oChild1.Width + oChild2.Width
      g_nGuiSplitterShellWidth1 = (oChild1.Width * 100) / nTotalSize
      g_nGuiSplitterShellWidth2 = 100 - g_nGuiSplitterShellWidth1
      g_sGuiSplitterShellDescription1 = oChild1.AccDescription
      g_sGuiSplitterShellDescription2 = oChild2.AccDescription

      if (nType == SDT_SPLITCOMBINED) then
        ; nTotalSize = g_oGuiComponent.Height
        /* calculate height ratio */
        nSashIndex = g_oGuiComponent.FocusedHorizontalSash + 1
        var int nRowSize = g_oGuiComponent.GetRowSize(nSashIndex)
        var int nColSize = g_oGuiComponent.GetColSize(nSashIndex)

        oChild1 = g_oGuiComponent.Children.ElementAt(nSashIndex)
        oChild2 = g_oGuiComponent.Children.ElementAt(nSashIndex+1)

        nTotalSize = oChild1.Height + oChild2.Height
        g_nGuiSplitterShellHeight1 = (oChild1.Height * 100) / nTotalSize
        g_nGuiSplitterShellHeight2 = 100 - g_nGuiSplitterShellHeight1

      endif
    endif
  else ; SDT_SPLITHORIZONTAL / SDT_DOCKSHELLHORIZONTAL
    if (nType == SDT_DOCKSHELLHORIZONTAL) then
      nPosSplitter = g_oGuiComponent.DockerPixelSize
      g_nGuiSplitterShellHeight1 = (nPosSplitter * 100) / g_oSAPGUIFrame.Height
      g_nGuiSplitterShellHeight2 = 100 - g_nGuiSplitterShellHeight1
    else
      nSashIndex = g_oGuiComponent.FocusedHorizontalSash + 1
      ; nTotalSize = g_oGuiComponent.Height
      oChild1 = g_oGuiComponent.Children.ElementAt(nSashIndex)
      oChild2 = g_oGuiComponent.Children.ElementAt(nSashIndex+1)

      nTotalSize = oChild1.Height + oChild2.Height
      g_nGuiSplitterShellHeight1 = (oChild1.Height * 100) / nTotalSize
      g_nGuiSplitterShellHeight2 = 100 - g_nGuiSplitterShellHeight1
      g_sGuiSplitterShellDescription1 = oChild1.AccDescription
      g_sGuiSplitterShellDescription2 = oChild2.AccDescription
    endif
  endif

  ; GetGuiSplitterShell (g_oGuiComponent, g_nGuiSplitterShellType, g_nGuiSplitterShellPos1, g_nGuiSplitterShellPos2)

  g_bGuiSplitterShellIsValid = true

endFunction

void function SayCurrentGuiSplitterShell ()
var
  string msg = ""

  if (ShoulditemSpeak (OT_CONTROL_TYPE) && !g_bGuiComponentSameAsPrevious) then
    if (g_nGuiSplitterShellType == SDT_SPLITHORIZONTAL) then
      msg = msgGuiSplitterHorizontal + cscSpace + msgGuiSplitter
    elif (g_nGuiSplitterShellType == SDT_SPLITVERTICAL) then
      msg = msgGuiSplitterVertical + cscSpace + msgGuiSplitter
    elif (g_nGuiSplitterShellType == SDT_SPLITCOMBINED) then
      msg = msgGuiSplitterCombined + cscSpace + msgGuiSplitter
    elif (g_nGuiSplitterShellType == SDT_DOCKSHELLHORIZONTAL) then
      msg = msgGuiDockShellHorizontal
    else
      msg = msgGuiDockShellVertical
    endif
    Say (msg, OT_CONTROL_TYPE)
  endif

  if (ShoulditemSpeak (OT_POSITION)) then
    if (g_nGuiSplitterShellType == SDT_SPLITHORIZONTAL) then
      msg = FormatString (msgGuiSplitterHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellHeight2))
    elif ((g_nGuiSplitterShellType == SDT_SPLITVERTICAL) || (g_nGuiSplitterShellType == SDT_SPLITCOMBINED)) then
      msg = FormatString (msgGuiSplitterVerticalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellWidth1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellWidth2))
      if (g_nGuiSplitterShellType == SDT_SPLITCOMBINED) then
        msg = msg + cscSpace + FormatString (msgGuiSplitterHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellHeight2))
      endif
    elif (g_nGuiSplitterShellType == SDT_DOCKSHELLHORIZONTAL) then
      msg = FormatString (msgGuiDockShellHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1))
    else ; SDT_DOCKSHELLVERTICAL
      msg = FormatString (msgGuiDockShellVerticalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellWidth1))
    endif
    Say (msg, OT_POSITION)
  endif

endFunction

int function BrailleAddObjectGuiSplitterShellPosition (int nType)
var
  string msg = ""

  if (g_nGuiSplitterShellType == SDT_SPLITHORIZONTAL) then
    msg = FormatString (msgBrlGuiSplitterHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellHeight2))
  elif ((g_nGuiSplitterShellType == SDT_SPLITVERTICAL) || (g_nGuiSplitterShellType == SDT_SPLITCOMBINED)) then
    msg = FormatString (msgBrlGuiSplitterVerticalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellWidth1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellWidth2))
    if (g_nGuiSplitterShellType == SDT_SPLITCOMBINED) then
      msg = msg + cscSpace + FormatString (msgBrlGuiSplitterHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1), g_sGuiSplitterShellDescription2, IntToString(g_nGuiSplitterShellHeight2))
    endif
  elif (g_nGuiSplitterShellType == SDT_DOCKSHELLHORIZONTAL) then
    msg = FormatString (msgBrlGuiDockShellHorizontalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellHeight1))
  else ; SDT_DOCKSHELLVERTICAL
      msg = FormatString (msgBrlGuiDockShellVerticalPos, g_sGuiSplitterShellDescription1, IntToString(g_nGuiSplitterShellWidth1))
  endif

  if (!StringIsBlank (msg)) then
    BrailleAddString (msg, 0, 0, 0)
  endif

  return true

endFunction

/*
 **********************************************************************
 ** OTFPreview functions
 **********************************************************************
*/

void function SayCurrentOTFPreview ()

  /* simply announce OTF preview along with the Window title */
  Say (msgOTFPreviewType, OT_CONTROL_TYPE)
  Say (g_sAppMainWindowTitle, OT_CONTROL_NAME)

endFunction

/*
 **********************************************************************
 * BrailleAddObjectContainer is used to braille messages for GuiContainer as well as GuiUserArea (i.e. print preview)
 **********************************************************************
 */
int function BrailleAddObjectContainer (int nType)

  if ((g_nGuiComponentType == GUI_TC_USERAREA) && g_bIsOTFPreview) then
    BrailleAddString (msgOTFPreviewType, 0, 0, 0)
    BrailleAddString (g_sAppMainWindowTitle, 0, 0, 0)
  else
    /* has to be list container */
    BrailleAddString (msgBrlLstContainerList, 0, 0, 0)
  endif

  return true

endFunction

/*
 **********************************************************************
 ** APO Grid functions
 **********************************************************************
*/

void Function ResetGuiCtrlApoGrid ()

  let g_nGuiCtrlApoGridColumnCount = 0
  let g_nGuiCtrlApoGridRowCount = 0
  let g_nGuiCtrlApoGridVisibleColumnCount = 0
  let g_nGuiCtrlApoGridVisibleRowCount = 0

  let g_nGuiCtrlApoGridCurrentColumn = 0
  let g_nGuiCtrlApoGridCurrentRow = 0

  let g_nGuiCtrlApoGridFixedRowsBottom = 0
  let g_nGuiCtrlApoGridFixedRowsTop = 0
  let g_nGuiCtrlApoGridFixedColumnsLeft = 0
  let g_nGuiCtrlApoGridFixedColumnsRight = 0

  let g_bGuiCtrlApoGridCellChangeable = false

  let g_sGuiCtrlApoGridCellFormat = ""
  let g_sGuiCtrlApoGridCellValue = ""
  let g_sGuiCtrlApoGridCellTooltip = ""

  let g_sGuiCtrlApoGridColumnHeader = ""
  let g_sGuiCtrlApoGridRowHeader = ""
  let g_sGuiCtrlApoGridTitle = ""

  let g_bGuiCtrlApoGridIsValid = TRUE

  let g_bNewColumn = false
  let g_bNewRow = false
  let g_bForceReadCell = false

  let g_bCurColIsSelected = false
  let g_bCurRowIsSelected = false
  let g_bCurCellIsSelected = false

EndFunction

void Function GetCurrentGuiCtrlApoGrid ()
var
  int  nColumn,
  int  nRow,
  int  i,
  string s1,
  string s2,
  string info,
  object oGC

  if (g_bGuiCtrlApoGridIsValid) then
    return
  endif

  /* DEBUG: for testing purposes only */
  let nColumn = g_oGuiComponent.CurrentCellColumn
  let nRow    = g_oGuiComponent.CurrentCellRow

  let g_bNewColumn = false
  let g_bNewRow = false
  let g_bForceReadCell = false

  if (nRow != g_nGuiCtrlApoGridCurrentRow) then
    let g_bNewRow = true
  endif
  if (nColumn != g_nGuiCtrlApoGridCurrentColumn) then
    let g_bNewColumn = true
  endif

  /* column/row numbers are 0-based - headers and fixed columns/rows are included */
  let g_nGuiCtrlApoGridCurrentColumn = nColumn  /* +1 (index is 0-based) -1 (header) */
  let g_nGuiCtrlApoGridCurrentRow = nRow /* +1 (index is 0-based) -1 (header) */

  let g_nGuiCtrlApoGridColumnCount = g_oGuiComponent.ColumnCount - 1
  let g_nGuiCtrlApoGridRowCount = g_oGuiComponent.RowCount - 1
  let g_nGuiCtrlApoGridVisibleColumnCount = g_oGuiComponent.VisibleColumnCount
  let g_nGuiCtrlApoGridVisibleRowCount = g_oGuiComponent.VisibleRowCount
  let g_nGuiCtrlApoGridFixedRowsBottom = g_oGuiComponent.FixedRowsBottom
  let g_nGuiCtrlApoGridFixedRowsTop = g_oGuiComponent.FixedRowsTop
  let g_nGuiCtrlApoGridFixedColumnsLeft = g_oGuiComponent.FixedColumnsLeft
  let g_nGuiCtrlApoGridFixedColumnsRight = g_oGuiComponent.FixedColumnsRight

  let g_bGuiCtrlApoGridCellChangeable = g_oGuiComponent.GetCellChangeable (nColumn, nRow)
  let g_sGuiCtrlApoGridCellFormat = g_oGuiComponent.GetCellFormat (nColumn, nRow)
  let g_sGuiCtrlApoGridCellValue = g_oGuiComponent.GetCellValue (nColumn, nRow)
  let g_sGuiCtrlApoGridCellTooltip = g_oGuiComponent.GetCellTooltip (nColumn, nRow)

  let g_sGuiCtrlApoGridTitle = g_oGuiComponent.GetCellValue (0, 0)

  let g_sGuiCtrlApoGridRowHeader = ""
  let g_sGuiCtrlApoGridColumnHeader = ""
  if (g_nGuiCtrlApoGridFixedRowsTop > 0) then
    let g_sGuiCtrlApoGridColumnHeader = g_oGuiComponent.GetCellValue (nColumn, 0)
  endif
  if (g_nGuiCtrlApoGridFixedColumnsLeft > 0) then
    let g_sGuiCtrlApoGridRowHeader = g_oGuiComponent.GetCellValue (0, nRow)
  endif

  let g_bGuiCtrlApoGridIsValid = TRUE

  let g_bCurColIsSelected = g_oGuiComponent.IsColSelected (nColumn)
  let g_bCurRowIsSelected = g_oGuiComponent.IsRowSelected (nRow)
  let g_bCurCellIsSelected = g_oGuiComponent.IsCellSelected (nColumn, nRow)

EndFunction

void Function SayCurrentGuiCtrlApoGrid ()
var
  string info,
  string tooltip

  ; if (CaretVisible ()) then
    ; return
  ; endif

  let info = ""
  let tooltip = ""
  if (!g_bGuiComponentSameAsPrevious) then
    let info = msgGuiCtrlApoGrid + cscSpace
    if (!StringIsBlank (g_sGuiCtrlApoGridTitle)) then
      let info = info + g_sGuiCtrlApoGridTitle + cscSpace
    endif
    if (g_nGuiCtrlApoGridRowCount != 0) then
      let info = info + FormatString (msgTableVisibleTotalRows, IntToString(g_nGuiCtrlApoGridVisibleRowCount), IntToString (g_nGuiCtrlApoGridRowCount))
    else
      let info = info + msgEmptyTable
    endif
    Say (info, OT_CONTROL_TYPE)
  endif

  if ((g_bNewColumn == true) || (!g_bGuiComponentSameAsPrevious)) then
    let info = g_sGuiCtrlApoGridColumnHeader
    Say (info, OT_CONTROL_NAME)
    let info = smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT))
    if (!g_bGuiCtrlApoGridCellChangeable) then
      let info = msgStateReadOnly + cscSpace + info
    endif
    Say (info, OT_CONTROL_TYPE)
  endif

  if ((g_bNewRow == true) || (!g_bGuiComponentSameAsPrevious)) then
    let info = g_sGuiCtrlApoGridRowHeader
    Say (info, OT_CONTROL_NAME)
    let info = smmStripMarkup (smmGetStartMarkupForControlType (WT_EDIT))
    if (!g_bGuiCtrlApoGridCellChangeable) then
      let info = msgStateReadOnly + cscSpace + info
    endif
    Say (info, OT_CONTROL_TYPE)
  endif

  let info = g_sGuiCtrlApoGridCellValue
  let tooltip = g_sGuiCtrlApoGridCellTooltip

  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
    if (StringCompare (info, tooltip, false) != 0) then
      Say (tooltip, OT_TOOL_TIP)
    endif
  else
    if (!StringIsBlank (tooltip)) then
      Say (tooltip, OT_CONTROL_NAME)
    else
      Say (msgBlank, OT_CONTROL_NAME)
    endif
  endif

  if (g_bCurCellIsSelected && !g_bCurColIsSelected && !g_bCurRowIsSelected) then
    Say (msgItemsSelected, OT_SELECTED_ITEM)
  endif

  let info = ""
  let tooltip = ""

  if ((g_bNewColumn == true) || (!g_bGuiComponentSameAsPrevious)) then
    let info = FormatString (msgTablePositionCols,
      IntToString(g_nGuiCtrlApoGridCurrentColumn),
      IntToString(g_nGuiCtrlApoGridColumnCount))
    Say (info, OT_POSITION)
    if (g_bCurColIsSelected) then
      Say (msgItemsSelected, OT_SELECTED_ITEM)
    endif
  endif

  if ((g_bNewRow == true) || (!g_bGuiComponentSameAsPrevious)) then
    let info = FormatString (msgTablePositionRows,
      IntToString(g_nGuiCtrlApoGridCurrentRow),
      IntToString(g_nGuiCtrlApoGridRowCount))
    Say (info, OT_POSITION)
    if (g_bCurRowIsSelected) then
      Say (msgItemsSelected, OT_SELECTED_ITEM)
    endif
  endif

  if (g_nGuiCtrlApoGridCurrentRow == g_nGuiCtrlApoGridRowCount) then
    if (g_nGuiCtrlApoGridCurrentColumn == g_nGuiCtrlApoGridColumnCount) then
      Say (msgGuiCtrlApoGridLastCell, OT_POSITION)
    elif (g_bNewRow) then
      Say (msgGuiCtrlApoGridLastRow, OT_POSITION)
    endif
  endif

EndFunction


/*
 **********************************************************************
 ** GuiBox functions
 **********************************************************************
*/


void Function ResetGuiBox ()

  let g_sGuiBoxText = ""
  let g_sGuiBoxSpeakText = ""
  let g_sGuiBoxTooltip = ""
  let g_bGuiBoxShouldSpeak = FALSE
  let g_bGuiBoxIsValid = TRUE

EndFunction

int Function GetCurrentGuiBox ()
var
  object oParentFrame = oNull,
  object oGrandParentFrame = oNull,
  string sNewText,
  string sOuterGroupLevel1,
  string sOuterGroupLevel2,
  string sInnerGroup

  let g_bGuiBoxIsValid = TRUE

  let sOuterGroupLevel1 = ""
  let sOuterGroupLevel2 = ""
  let sInnerGroup = ""

  let g_sGuiBoxText = ""
  let g_sGuiBoxTooltip = ""

  /*
   * Handling is a bit different now from those in the other controls - compile the whole string to be read
   * in the Get... routine and just use it as output in the SayCurrentGuiBox function
   */

  let oParentFrame = g_oGuiComponent.parentFrame
  if (!oParentFrame) then
    let g_sGuiBoxSpeakText = ""
    return FALSE
  endif

  ;
  ; ROM: added for nested groups: announcement of potentially enclosing groups up to a nesting level of 3
  ;
  oGrandParentFrame = oParentFrame.ParentFrame
  if (oGrandParentFrame.TypeAsNumber == GUI_TC_BOX) then
    sOuterGroupLevel1 = oGrandParentFrame.Text
    if (oGrandParentFrame.ParentFrame.TypeAsNumber == GUI_TC_BOX) then
      sOuterGroupLevel2 = oGrandParentFrame.ParentFrame.Text
    endif
  endif

  sInnerGroup = oParentFrame.text
  if (!StringIsBlank (sOuterGroupLevel1)) then
    /* let sNewText = sTmp + cscSpace + msgSubgroup + cscSpace + sNewText */
    sNewText = FormatString (msgSubgroup, sInnerGroup, sOuterGroupLevel1)
    if (!StringIsBlank (sOuterGroupLevel2)) then
      /* let sNewText = sTmp + cscSpace + msgSubgroup + cscSpace + sNewText */
      sNewText = sNewText + cscSpace + FormatString (msgSubgroup, "", sOuterGroupLevel2)
    endif
  else
    sNewText = msgBeginOfGroup + cscSpace + sInnerGroup
  endif

  if ((!StringIsBlank (sInnerGroup) || !StringIsBlank (sOuterGroupLevel1) || !StringIsBlank (sOuterGroupLevel2))
    && (StringCompare (sNewText, g_sGuiBoxSpeakText) != 0)) then
    g_sGuiBoxSpeakText = sNewText
    g_bGuiBoxShouldSpeak = TRUE
    g_sGuiBoxTooltip = TrimString (oParentFrame.Tooltip)
  else
    g_bGuiBoxShouldSpeak = FALSE
  endif

  g_sGuiBoxText = sInnerGroup /* ROM: added for Braille support */

  oParentFrame = oNull
  oGrandParentFrame = oNull

  return TRUE

EndFunction

void Function SayCurrentGuiBox ()
var
  string info

  if (g_bGuiBoxIsValid == FALSE) then
    return
  endif

  /* let info = msgBeginOfGroup */

  let info = ""
  if (g_sGuiBoxSpeakText != cscNull) then
    let info = g_sGuiBoxSpeakText
  endif

  if (g_bGuiBoxShouldSpeak) then
    if (!StringIsBlank (info)) then
      Say (info, OT_CONTROL_GROUP_NAME)
    endif
    if (!StringIsBlank (g_sGuiBoxTooltip)) then
      Say (g_sGuiBoxTooltip, OT_TOOL_TIP)
    endif
  endif

EndFunction

void Function CheckForGroupEnd ()
var
  string info

  /* announce the end of a group of elements */

  let info = ""
  if (!g_bGuiComponentSameAsPrevious) then
    if ((g_hPreviousRealWindow != g_hRealWindow) || g_bWindowTitleChanged) then
      return
    endif
    if (!StringIsBlank (g_sGuiComponentPreviousFrameId) && StringIsBlank (g_sGuiComponentFrameId)) then
      Say (msgEndOfGroup, OT_CONTROL_GROUP_NAME)
    endif
    if ((g_nGuiComponentPreviousParentType == GUI_TC_TABLECONTROL) && (g_nGuiComponentParentType != GUI_TC_TABLECONTROL)) then
      Say (msgEndOfTable, OT_CONTROL_GROUP_NAME)
    elif ((g_nGuiComponentPreviousType == GUI_TC_GUISHELL) && (g_sGuiComponentPreviousSubType == sGuiGridView)) then
      Say (msgEndOfTable, OT_CONTROL_GROUP_NAME)
    endif
    if (!g_bIsFooter && (g_nGuiComponentPreviousParentType == GUI_TC_TOOLBAR) && (g_nGuiComponentParentType != GUI_TC_TOOLBAR)) then
      Say (msgEndOfToolbar, OT_CONTROL_GROUP_NAME)
    endif
  endif

EndFunction

/*
 **********************************************************************
 ** GuiTab functions
 **********************************************************************
*/

int Function GetCurrentGuiTab ()
var
  int bCompIsMemberOfTab,
  int nTabSearchLimit,
  int nType,
  int i,
  object oComponentParent,
  object oAllTabs,
  object oGuiTab,
  string s

  if (g_bGuiTabIsValid) then
    return TRUE
  endif

  let g_sGuiTabtext = ""
  let g_sGuiTabTooltip = ""
  let g_sGuiComponentParentTabText = ""
  let g_iGuiTabCurrentIndex = 0
  let g_iGuiTabTotalCount = 0

  let s = ""

  if (g_nGuiComponentType == GUI_TC_TAB) then

    let oGuiTab = g_oGuiComponentParent.selectedTab

    if (StringCompare (oGuiTab.id, g_sGuiComponentId, true) == 0) then
      let g_bGuiTabIsSelected = TRUE
    else
      let g_bGuiTabIsSelected = FALSE
    endif

    if (!StringIsBlank (g_sGuiComponentAccText)) then
      let g_sGuiTabText = g_sGuiComponentAccText
    else
      let g_sGuiTabText = g_oGuiComponent.text
    endif
    let g_sGuiTabTooltip = g_sGuiComponentTooltip
    if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
      if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
        let g_sGuiTabTooltip = g_sGuiComponentAccTooltip + cscSpace + g_sGuiTabTooltip
      endif
    endif

    if (StringIsBlank (g_sGuiTabText) && !StringIsBlank (g_sGuiTabTooltip)) then
      let g_sGuiTabText = g_sGuiTabTooltip
    endif

    let oAllTabs = oGuiTab.Parent.Children
    if (oAllTabs) then
      let g_iGuiTabTotalCount = oAllTabs.Length
      let i = 0
      while (i < g_iGuiTabTotalCount)
        let oGuiTab =oAllTabs.Item(i)
        let s = oGuiTab.Id
        if (StringCompare (s, g_sGuiComponentId, true) == 0) then
          let g_iGuiTabCurrentIndex = i + 1
          let i = g_iGuiTabTotalCount /* stop searching */
        endif
        let i = i + 1
      endwhile
    endif

  else
    let bCompIsMemberOfTab= False
    let oComponentParent = g_oGuiComponentParent

    /* try to determine the tab page */
    let nTabSearchLimit = 0
    if (g_nGuiComponentType != GUI_TC_TAB) then
      while (oComponentParent && (bCompIsMemberOfTab == False) && (nTabSearchLimit < 4))
        let oComponentParent = oComponentParent.Parent
        let nType = oComponentParent.TypeAsNumber
        if (nType == GUI_TC_TAB) then
          let s = oComponentParent.AccText
          if (!StringIsBlank (s)) then
            let g_sGuiComponentParentTabText = s
          else
            let g_sGuiComponentParentTabText = oComponentParent.text
          endif
          let s = oComponentParent.AccTooltip
          if (!StringIsBlank (s)) then
            let g_sGuiTabTooltip = s
          else
            let g_sGuiTabTooltip = oComponentParent.Tooltip
          endif

          if (StringIsBlank (g_sGuiComponentParentTabText) && !StringIsBlank (g_sGuiTabTooltip)) then
            let g_sGuiComponentParentTabText = g_sGuiTabTooltip
          endif

          let bCompIsMemberOfTab = True
        endif
        let nTabSearchLimit = nTabSearchLimit + 1
      endwhile
    endif
    if (!bCompIsMemberOfTab) then
      let g_sGuiComponentParentTabText = ""
      let g_sGuiComponentPreviousTabText = ""
    endif

  endif

  let oAllTabs = oNull
  let oGuiTab = oNull

  let g_bGuiTabIsValid = TRUE

  return TRUE

EndFunction

void Function SayCurrentGuiTab ()
var
  string info,
  string s1,
  string s2,
  string sTooltip

  let info = ""
  let sTooltip = ""
  if (!StringIsBlank (g_sGuiTabText)) then
    let info = g_sGuiTabText
  endif
  if (StringIsBlank (info)) then
    let info = g_sGuiTabTooltip
  else
    if (ShoulditemSpeak (OT_TOOL_TIP)) then
      if (g_sGuiTabTooltip != cscNull) then
        let s1 = TrimString (info)
        let s2 = TrimString (g_sGuiTabTooltip)
        if (StringCompare (s1, s2, false) != 0) then
          let sTooltip = s2
        endif
      endif
    endif
  endif

  Say (info, OT_CONTROL_NAME)
  let info = ""

  if (ShoulditemSpeak (OT_CONTROL_TYPE)) then
    IndicateControlType (WT_TABCONTROL, cscSpace, cscSpace)
    ; let info = info + cscSpace + smmStripMarkup (smmGetStartMarkupForControlType (WT_TABCONTROL))
  endif
  if (ShouldItemSpeak (OT_ITEM_STATE)) then
    if (g_bGuiTabIsSelected) then
      let info = msgGuiTabSelected
    else
      let info = msgGuiTabNotSelected
    endif
    Say (info, OT_ITEM_STATE)
  endif

  if (ShouldItemSpeak (OT_ITEM_NUMBER) && (g_iGuiTabCurrentIndex > 0)) then
    let info = FormatString(msgItemPosition,IntToString(g_iGuiTabCurrentIndex),IntToString(g_iGuiTabTotalCount))
    Say (info, OT_ITEM_NUMBER)
  endif

  if (!StringIsBlank (sTooltip)) then
    Say (sTooltip, OT_TOOL_TIP)
  endif

EndFunction

Void Function SayCurrentGuiTabPage ()
Var
  string info,
  string s1,
  string s2,
  string sTooltip

  let sTooltip = ""

  if ((!StringIsBlank (g_sGuiComponentParentTabText)) && (StringCompare (g_sGuiComponentPreviousTabText, g_sGuiComponentParentTabText) != 0)) then
    let info = g_sGuiComponentParentTabText
    if (StringIsBlank (info)) then
      let info = g_sGuiTabTooltip
    else
      if (ShoulditemSpeak (OT_TOOL_TIP)) then
        if (g_sGuiTabTooltip != cscNull) then
          let s1 = TrimString (info)
          let s2 = TrimString (g_sGuiTabTooltip)
          if (StringCompare (s1, s2, false) != 0) then
            let sTooltip = s2
          endif
        endif
      endif
    endif

    let g_sGuiComponentPreviousTabText = g_sGuiComponentParentTabText
    Say (info, OT_CONTROL_GROUP_NAME)
    ; ROM 2009/11/10 - prevent JAWS from chattering highlighted text above focus point
    IndicateControlType (WT_DIALOG_PAGE, cscSpace, cscSpace)

    if (!StringIsBlank (sTooltip)) then
      Say (sTooltip, OT_TOOL_TIP)
    endif
  endif

EndFunction


int function BrailleAddObjectGuiTabValue (int nType)

  var string s1 = TrimString (g_sGuiTabText)
  var string s2 = TrimString (g_sGuiTabTooltip)

  if (!StringIsBlank (s1)) then
    BrailleAddString (s1, getCursorCol (), getCursorRow (), 0)
  endif

  if ((g_nTooltipsBrailleMode != 0) && !StringIsBlank(s2)) then
    if (StringCompare (s1, s2, false) != 0) then
      s2 = BrailleGetSubtypeString (WT_TOOLTIP) + cscSpace + s2
      BrailleAddString (s2, 0, 0, 0)
    endif
  endif

  return TRUE

endFunction


int Function BrailleAddObjectGuiTabState (int nType)

  if (g_bGuiTabIsSelected) then
    BrailleAddString (BrailleGetStateString(CTRL_CHECKED), getCursorCol(), getCursorRow(), 0)
  else
    BrailleAddString (BrailleGetStateString(CTRL_UNCHECKED), getCursorCol(), getCursorRow(), 0)
  endif

  return TRUE

EndFunction

Int Function BrailleAddObjectGuiTabPosition (int nType)
var
  string info

  let info = ""

  if (g_iGuiTabCurrentIndex > 0) then
    let info = FormatString (msgItemPosition, IntToString(g_iGuiTabCurrentIndex), IntToString(g_iGuiTabTotalCount))
  endif

  let info = StringTrimLeadingBlanks (info)
  let info = StringTrimTrailingBlanks (info)

  if (!StringIsBlank (info)) then
    BrailleAddString (info, g_nGuiComponentLeft+(g_nGuiComponentWidth/2), g_nGuiComponentTop+(g_nGuiComponentHeight/2), 0)
  endif

  return TRUE

EndFunction

/*
 **********************************************************************
 ** GuiStatusbar functions
 ** ROM 2018/05/04:
 ** added functions for focsued status bar element (StatusPane)
 **********************************************************************
*/

object Function GetGuiStatusBar ()
var
  int     bFound,
  int     i,
  int     nChildren,
  int     nType,
  object oWndFrame,
  object oWndStatus,
  object oChildren

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    return (oNull)
  endif

  ; let g_hGuiStatusBar = hNull
  if (!IsSAPGUISessionActive ()) then
    return oNull
  endif

  /* find main window */
  let oChildren = g_oSAPGUISession.Children
  if (!oChildren) then
    return
  endif
  let i = 0
  let bFound = false
  let nChildren = oChildren.Count
  while (!bFound && (i < nChildren))
    let oWndFrame = oChildren.Item(i)
    let nType = oWndFrame.TypeAsNumber
    if (nType == GUI_TC_MAINWINDOW) then
      let bFound = true
    endif
    let i = i + 1
  endwhile

  let oChildren = oNull
  if (!bFound) then
    let oWndFrame = oNull
    return
  endif

  let oWndStatus = oWndFrame.findByName (sSapGuiStatusbarName, sSapGuiStatusbarType)
  let g_hGuiStatusBar = oWndStatus.handle

  let oWndFrame = oNull

  return (oWndStatus)

EndFunction

void Function HandleGuiStatusBarMessage ()
var
  int     bFoundMessageType,
  int     nElapsed,
  object oStatusBar,
  string sMessageType,
  string sText,
  string sTextOut

  if (g_iStatusbarID != 0) then
    UnscheduleFunction (g_iStatusbarID)
  endif
  g_iStatusbarID = 0

  if (IsSAPGUISessionBusy (0, FALSE)) then
    ; let g_iStatusbarID = ScheduleFunction ("HandleGuiStatusBarMessage", 4)
    return
  endif

  oStatusBar = GetGuiStatusBar ()

  sText = oStatusBar.text
  sMessageType = oStatusBar.messageType
  oStatusBar = oNull

  if (StringIsBlank (sText)) then
    g_sGuiStatusBarLastMessage = ""
    return
  endif

  nElapsed = (GetTickCount () - g_nGuiStatusBarLastUpdate)
  g_nGuiStatusBarLastUpdate = GetTickCount ()

  if (nElapsed < 1000) then ; to check if status message was already spoken
    if (!StringCompare (sText, g_sGuiStatusBarLastMessage, false)) then
      return
    endif
  endif
  g_sGuiStatusBarLastMessage = sText

  bFoundMessageType = TRUE
  if (sMessageType == sStatusBarMessageSuccess) then
    Say (msgStatusBarMessageSuccess, OT_SCREEN_MESSAGE)
  elif (sMessageType == sStatusBarMessageError) then
    Say (msgStatusBarMessageError, OT_SCREEN_MESSAGE)
  elif (sMessageType == sStatusBarMessageWarning) then
    Say (msgStatusBarMessageWarning, OT_SCREEN_MESSAGE)
  elif (sMessageType == sStatusBarMessageAbort) then
    Say (msgStatusBarMessageAbort, OT_SCREEN_MESSAGE)
  elif (sMessageType == sStatusBarMessageInformation) then
    ; do nothing
  else
    bFoundMessageType = FALSE
  endif

  if (bFoundMessageType && (SubString (sText, 2, 3) == cScColon)) then
    sTextOut = StringChopLeft (sText, 2)
  else
    sTextOut = sText
  endif

  Say (sTextOut, OT_SCREEN_MESSAGE)

  if (g_bGuiStatusPaneHasDetails == 1) then
    Say (msgStatusBarDetails, OT_HELP)
  endif

EndFunction

void function GetCurrentGuiStatusPane ()
var
  string sName

  if (g_bGuiStatusPaneIsValid) then
    return
  endif

  g_bGuiStatusPaneIsLink = false
  g_bGuiStatusPaneIsInfoArea = false

  sName = g_oGuiComponent.Name
  if (StringCompare (sName, sStatusPaneLinkName, true) == 0) then
    g_bGuiStatusPaneIsLink = true
  elif (StringCompare (sName, sStatusPaneMessageName, true) != 0) then
    g_bGuiStatusPaneIsInfoArea = true
  endif
  g_sGuiStatusPaneName = sName

  g_sGuiStatusPaneText = g_oGuiComponent.Text
  g_sGuiStatusPaneTooltip = g_oGuiComponent.Tooltip
 
  g_bGuiStatusPaneHasDetails = g_oGuiComponent.Parent.MessageHasLongText

  g_bGuiStatusPaneIsValid = true

  return true

endfunction

void function ResetGuiStatusPane ()
  g_bGuiStatusPaneIsValid = false
  g_sGuiStatusPaneName = ""
  g_sGuiStatusPaneText = ""
  g_sGuiStatusPaneTooltip = ""
  g_bGuiStatusPaneIsLink = false
  g_bGuiStatusPaneIsInfoArea = false
  g_bGuiStatusPaneHasDetails = -1
endfunction

void function SayCurrentGuiStatusPane ()
var
  string info = ""

  if (!g_bGuiStatusPaneIsInfoArea) then
    if (g_bGuiStatusPaneHasDetails == -1) then
      Say (msgNoStatusBarMessage, OT_HELP)
    endif 
 
    if (g_bGuiStatusPaneIsLink) then
      IndicateControlType (WT_LINK, cscNull, cscNull)
    endif
  endif

  if (!StringIsBlank (g_sGuiStatusPaneText)) then
    info = g_sGuiStatusPaneText
  endif

  if (g_bGuiStatusPaneIsInfoArea) then
    if (StringCompare (g_sGuiStatusPaneName, sStatusPaneButtonMenu, true) == 0) then
      IndicateControlType (WT_BUTTONMENU, cscNull, cscNull)
    endif
  endif

  if (!StringIsBlank (g_sGuiStatusPaneTooltip) && (StringCompare (g_sGuiStatusPaneText, g_sGuiStatusPaneTooltip, false) != 0)) then
    info = info + cscSpace + g_sGuiStatusPaneTooltip
  endif

  if (!StringIsBlank (info)) then
    Say (info, OT_CONTROL_NAME)
  endif

  if (!g_bGuiStatusPaneIsInfoArea) then
    if (g_bGuiStatusPaneHasDetails == 1) then
      Say (msgStatusBarDetails, OT_HELP)
    endif
  endif

endFunction

/*
 **********************************************************************
 ** Event handlers
 **********************************************************************
*/

/*
 * Autostart event
 */

void function SwitchVirtualOff ()
  ; Refresh ()
  SetJCFOption (OPT_VIRTUAL_PC_CURSOR, 0)
  PcCursor ()
  Pause ()
  RouteBrailleToPC ()
  BrailleRefresh ()
endFunction

Void Function AutoStartEvent ()
var
  handle hFocusWin,
  handle hAppWin,
  int nWinCode,
  int nTmp,
  int xl, int xr,
  int yt, int yb

  InitSAPUtils ()

  Pause ()
  Pause ()

  GetSAPGUISession ()
  if (IsSAPGUISessionActive ()) then
    if (IsSAPGUISessionBusy (5, TRUE)) then
      say (msgSapGuiSessionBusy, OT_JAWS_MESSAGE)
      return
    endif
    g_oSAPGUISession.EnableJawsEvents ()
    /* ExitSAPGUISession () */
  endif

  ResetGuiComponent ()

  SetJCFOption (OPT_MSAA_MODE, 1) ; experimental setting...
  ; 2016/02/01 (rom) SetJCFOption (OPT_VIRTUAL_PC_CURSOR, 0)
  Refresh (true)
  Pause ()

  ; let g_nObjectTypeCode = GetObjectSubtypeCode ()
  let g_nObjectTypeCode = GetCurrentSubtypeCode ()

  let g_iTextInputID = 0
  let g_iComboboxInputID = 0
  let g_iWindowRedrawID  = 0
  let g_iSelectedID = 0
  let g_iStatusbarID = 0
  ; let g_iSchedulerID = 0
  let g_iWindowTitleID = 0
  let g_iPopupWindowID = 0
  let g_iAutoCompletionID = 0
  let g_iAutoCompletionToolbarID = 0
  let g_iBooknmarkStatusID = 0
  let g_iLineWithBreakpointID = 0

  let g_bAutoCompletionProcessed = false

  let g_nGuiComponentLastUpdate = 0

  let g_bTypeEchoDisabled = false

  let g_bRealWindowFocusChanged = false
  let g_bFocusChanged = false

  let g_hCurrentWindow = hNull
  let g_sAppMainWindowTitle = ""

  let g_nPrevBrailleRestriction = GetBrailleRestriction ()

  ; to get window handle of GuiStatusBar
  GetGuiStatusBar ()
  g_nGuiStatusBarLastUpdate = 0
  g_sGuiStatusBarLastMessage = ""

  ; switch off virtual pc cursor mode in case it is active
  if (IsVirtualPCCursor ()) then
    ; ScheduleFunction ("SwitchVirtualOff", 4)
    SwitchVirtualOff ()
  endif

  let hFocusWin = GetFocus ()
  let hAppWin = GetAppMainWindow (hFocusWin)
  let xl = GetWindowLeft (hAppWin)+1
  let xr = GetWindowRight (hAppWin)-1
  let yt = GetWindowTop (hAppWin)+16
  let yb = GetWindowBottom (hAppWin)-1

  SaveCursor ()
  JawsCursor ()

  if ((GetCursorCol () < xl) || (GetCursorCol () > xr) || (GetCursorRow () < yt) || (GetCursorRow () > yb)) then
    RouteJawsToPc ()
  endif

  let nWinCode = GetWindowSubtypeCode (GetTopLevelWindow (GetCurrentWindow ()))
  if (nWinCode == WT_TASKBAR) then
    RouteJawsToPc ()
  endif

  UpdateCurrentGuiComponent ()
  if ((g_nGuiComponentType == GUI_TC_OKCODEFIELD) || (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH)) then
    MoveTo (GetCursorCol (), GetCursorRow ()+16)
  endif

  RestoreCursor ()

  SayCurrentGuiComponent ()

/*   RomDebugStart ("c:\\temp\\sapfront.log")  */

EndFunction


/*
 * Autofinish event
 */

Void Function AutoFinishEvent ()

  ResetGuiComponent ()

  ExitSAPGUI ()

  let g_sPreviousConfiguration = ""

/*   RomDebugStop ()  */

EndFunction


/*
 * KeypressedEvent
 */

void Function KeyPressedEvent (int nKey, string strKeyName, int nIsBrailleKey, int nIsScriptKey)
var
  string sWinClass,
  handle hWinSwitch,
  handle hWinParent

  ; let g_nObjectTypeCode = GetWindowSubtypeCode (GetCurrentWindow ())

  let g_bHandledByNavigationKey = false
  if (nKey == kiCtrlSpace) then
    let g_bAutoCompletionProcessed = false
  endif

  if (g_iTextInputID != 0) then
    UnscheduleFunction (g_iTextInputID)
  endif
  let g_iTextInputID = 0

  let g_bFocusChanged = FALSE

  if ((nKey == kiContext) || (nKey == kiContextLShftF10) || (nKey == kiContextRShftF10)) then
    ; HACK! - To be changed later
    ResetGuiComponent ()
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  let hWinParent = GetParent (GetFocus ())
  let sWinClass = GetWindowClass (hWinParent)
  if ((StringCompare (sWinClass, sTextEditClass, true) == 0) || (StringCompare (sWinClass, sAbapEditorClass, true) == 0)) then
    if (g_bGuiAbapEditorIsAutoCompleteOpen) then
      if (nKey & kiAltMask) then /* ALT key pressed */
        if (g_iAutoCompletionToolbarID != 0) then
          UnscheduleFunction (g_iAutoCompletionToolbarID)
          let g_iAutoCompletionToolbarID = 0
        endif
        let g_sCurrentAccessKey = strKeyName
        let g_iAutoCompletionToolbarID = ScheduleFunction ("PressAutoCompletionToolbarButton", 4)
      endif
    else
      if (nKey & kiCtrlAltMask) then /* Ctrl+Alt */
        if (g_iBooknmarkStatusID != 0) then
          UnscheduleFunction (g_iBooknmarkStatusID)
        endif
        let g_sCurrentAccessKey = strKeyName
        let g_iBooknmarkStatusID = ScheduleFunction ("SayBookmarkStatus", 4)
      endif
    endif
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  let hWinSwitch = findTopLevelWindow (cwnSapTaskSwitch, cscNull)
  if (hWinSwitch && IsWindowVisible (hWinSwitch)) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    Return
  EndIf

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    ResetGuiComponent ()
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiCalendar)) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    if ((nKey == kiEnter) || (nKey == kiSpaceBar)) then
      if (g_iCalFocusedElement != 1) then ; if not on the calendar button
        ScheduleFunction ("UpdateAndSayGuiCalender", 2)
      endif
    elif ((g_iCalFocusedElement != 2) && (StringContains (strKeyName, "Arrow") || StringContains ("0123456789", strKeyName))) then
      ScheduleFunction ("UpdateAndSayGuiCalender", 2)
    endif
    return
  endif

  if ((nKey == kiEnter) || (nKey == kiF2) || (nKey == kiF3) || (nKey == kiF8) || (nKey == kiF9) || (nKey == kiEsc)) then
    if (g_iWindowRedrawID != 0) then
      UnscheduleFunction (g_iWindowRedrawID)
    endif
    /* let g_hCurrentWindow = GetFocus () */
    let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 4)
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  if ((g_nObjectTypeCode == WT_EDITCOMBO) || (g_nObjectTypeCode == WT_EDIT)) then
    if (!StringContains (strKeyName, "Tab")) then
      if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
        KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
        if (g_bHistoryIsActive) then
          ScheduleFunction ("UpdateAndSayGuiTextField", 2)
        endif
        return
      elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
        if (g_iComboboxInputID != 0) then
          UnscheduleFunction (g_iComboboxInputID)
        endif
        g_iComboboxInputID = ScheduleFunction ("HandleComboboxInput", 2)
        return
      endif
    endif
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  if (nIsScriptKey && (nKey != kiBackspace) && (nKey != kiDelete)) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    return
  endif

  if (g_nGuiComponentType == GUI_TC_PASSWORDFIELD) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    ScheduleFunction ("SayCurrentGuiPasswordFieldCharacter", 1)
    return
  endif

  if (nKey == kiSpaceBar) then
    /* let g_hCurrentWindow = GetFocus () */
    if ((g_nGuiComponentType == GUI_TC_CHECKBOX) || (g_nGuiComponentType == GUI_TC_RADIOBUTTON)
        || ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView) && ((g_sGuiGridCellType == sGuiCheckbox)) || (g_sGuiGridCellType == sGuiRadioButton))
        || ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiToolbar))
        || ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTree) && (g_iItemType == 3))) then
      if (g_iSelectedID != 0) then
        UnscheduleFunction (g_iSelectedID)
      endif
      let g_iSelectedID = ScheduleFunction ("HandleSelected", 4)
      KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
      return
    elif ((g_nGuiComponentType == GUI_TC_TAB) || (g_nGuiComponentType == GUI_TC_BUTTON)) then
      SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
      if (g_iWindowRedrawID != 0) then
        UnscheduleFunction (g_iWindowRedrawID)
      endif
      let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 4)
      KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
      return
    else
      SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
      GetCurrentGuiComponent ()
    endif
  endif

  if ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD)|| (g_nGuiComponentType == GUI_TC_PASSWORDFIELD)) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    g_iTextInputID = ScheduleFunction ("HandleTextFieldInput", 1)
    return
  elif (CaretVisible () && (g_nGuiComponentType == GUI_TC_GUISHELL) &&
    ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid))) then
    KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
    let g_iTextInputID = ScheduleFunction ("HandleTextFieldInput", 1)
    return
  elif (g_nGuiComponentType == GUI_TC_COMBOBOX) then
    if (g_iComboboxInputID != 0) then
      UnscheduleFunction (g_iComboboxInputID)
    endif
    let g_iComboboxInputID = ScheduleFunction ("HandleComboboxInput", 2)
  else
    if ((nKey == kiEnter) || (nKey == kiF2) || (nKey == kiF3) || (nKey == kiF8) || (nKey == kiEsc)) then
      if (g_iWindowRedrawID != 0) then
        UnscheduleFunction (g_iWindowRedrawID)
      endif
      let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 4)
      KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)
      return
    endif

    if ((nKey != kiLeftCtrlShift7) && (nKey != kiRightCtrlShift7)) then
      ScheduleFunction ("SayCurrentGuiComponent", 2)
    endif

  endif

  KeyPressedEvent (nKey,strKeyName,nIsBrailleKey,nIsScriptKey)

EndFunction

/*
 * Handle text field input
 */

void Function HandleTextFieldInput ()

  let g_iTextInputID = 0

  if (IsKeyWaiting ()) then
    return
  endif

  UpdateCurrentGuiComponent ()

  if (!g_bGuiComponentSameAsPrevious && !g_bFocusChanged) then
    SayCurrentGuiComponent ()
  endif

  if (CaretVisible ()) then
    PerformScript RouteBrailleToActiveCursor ()
  endif

EndFunction

/*
 * Handle combobox input
 */

void Function HandleComboboxInput ()

  if (g_iComboboxInputID != 0) then
    UnscheduleFunction (g_iComboboxInputID)
  endif
  let g_iComboboxInputID = 0

  ; SayCurrentScriptKeyLabel ()

  if (g_nGuiComponentType == GUI_TC_COMBOBOX) then
    UpdateCurrentGuiComponent ()
    SayCurrentGuiCombobox ()
  elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
    UpdateCurrentGuiComponent ()
    ; SayString ("*")
    SayCurrentGuiCombobox ()
  else
    /* this is unlikely to become true ... */
    UpdateCurrentGuiComponent ()
    SayCurrentGuiShell ()
  endif

  return

EndFunction

/*
 * Handle object update / redraw of window after a keyboard event
 */

void Function HandleWindowRedraw ()

  if (g_iWindowRedrawID != 0) then
    UnscheduleFunction (g_iWindowRedrawID)
  endif
  let g_iWindowRedrawID = 0

  /* ROM: 2009/10/20 - to stabilize output on screen updates */
  if (IsSAPGUISessionBusy (1, TRUE)) then
    return
  endif

  /* ROM 2011/06/21 - this should prevent JAWS from chattering too much */

  UpdateCurrentGuiComponent ()
  ; if (!g_bHandledByNavigationKey && !g_bGuiComponentSameAsPrevious) then
  if (!g_bHandledByNavigationKey) then
    ScheduleFunction ("SayCurrentGuiComponent", 2)
    ; let g_bWindowTitleChanged = false
  endif

  BrailleRefresh () /* ROM: 2009/10/20 - to stabilize contents on the braille display */

EndFunction

/*
 * This handles checkbox state changes
 */

Void Function HandleSelected ()

  if (g_iSelectedID != 0) then
    UnscheduleFunction (g_iSelectedID)
  endif
  let g_iSelectedID = 0

  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, OFF)
  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()

  BrailleRefresh ()

EndFunction

/*
 * Speak window title
 */
void Function HandleWindowTitle ()

  GetSAPGUIFrame ()
  if ((DialogActive () == ACTIVE) && (g_hRealWindow == g_hPreviousRealWindow) && (g_oSAPGUIFrame.typeAsNumber == GUI_TC_MODALWINDOW)) then
    ; ROM 2010/02/25 - handling of those modal dialog windows where the window handle does not change
    ; StopSpeech ()
    let g_bIsPopupDialog = g_oSAPGUIFrame.IsPopupDialog
    let g_sPopupDialogText = g_oSAPGUIFrame.PopupDialogText

    ; if ((g_bIsPopupDialog || !StringIsBlank(g_sPopupDialogText)) && (DialogActive () == ACTIVE)) then
    ; ROM 2018/11/19 - reverted to only use IsPopupDialog property to determine if PopupDialogText should be announced
    if (g_bIsPopupDialog) then
      SayWindowTypeAndText (g_hRealWindow)
      if (g_iPopupWindowID != 0) then
        UnscheduleFunction (g_iPopupWindowID)
      endif
      g_iPopupWindowID = ScheduleFunction ("SayPopupWindowText", 2)
      ; UpdateCurrentGuiComponent ()
    endif
    PerformScript SayWindowTitle ()
  else
    var handle hFocusWin = GetCurrentWindow()
    if (GetAppMainWindow(hFocusWin) == GetTopLevelWindow(hFocusWin)) then
      PerformScript SayWindowTitle ()
    endif
  endif
  ExitSAPGUIFrame ()

  if (g_iWindowTitleID != 0) then
    UnscheduleFunction (g_iWindowTitleID)
  endif
  let g_iWindowTitleID = 0

EndFunction

/*
 * ROM: 2009/10/20 - To update output when the user uses the mouse to navigate
 */

void Function HandleMouseNavigation ()
  if (g_nMouseNavigationId != 0) then
    UnscheduleFunction (g_nMouseNavigationId)
  endif
  let g_nMouseNavigationId = 0

  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()

EndFunction

void Function SayPopupWindowText ()
  if (g_iPopupWindowID != 0) then
    UnscheduleFunction (g_iPopupWindowID)
  endif
  let g_iPopupWindowID = 0

  Say (g_sPopupDialogText, OT_DIALOG_TEXT)

EndFunction

/*
 * HandleCustomWindows
 *
 */

int Function HandleCustomWindows (handle hWnd)
var
  int iSEM,
  int nGuiComponentType,
  handle hCurrentWindow,
  handle hPreviousWindow,
  handle hTopLevelWindow,
  handle hWinParent,
  object oFocus,
  string sGuiComponentSubType,
  string sGuiComponentPrevSubType,
  string sWinClass

  /* these lines were commneted so that on sreen change, the scripts still reads the first element. LNB */

  ;if (g_iWindowRedrawID != 0) then
    ;UnscheduleFunction (g_iWindowRedrawID)
  ; endif

  let hCurrentWindow = GetCurrentWindow ()
  let hPreviousWindow = g_hCurrentWindow
  let g_hCurrentWindow = hCurrentWindow

  /*
   * ROM: 2012/07/06 - special handling got text editor
   */
  if (hCurrentWindow == hPreviousWindow) then
    let hWinParent = GetParent (hCurrentWindow)
    let sWinClass = GetWindowClass (hWinParent)
    if (StringCompare (sWinClass, sTextEditClass, true) == 0) then
      return (TRUE)
    endif
  endif

  let g_iWindowRedrawID = 0

  if (g_bFocusChanged) then
    /* bit of a hack to prevent uttering multiple times on focus-in an IE control */
    if (g_nGuiComponentType == GUI_TC_GUISHELL) then
      if ((g_sGuiComponentSubType == sGuiHtmlViewer) || (g_sGuiComponentSubType == sGuiOfficeIntegration)) then
        let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 2)
        return TRUE
      endif
    endif
  endif

  let g_bFocusChanged = TRUE
  ; if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    let sGuiComponentPrevSubType = g_sGuiComponentSubType
  ; endif

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    ResetGuiComponent ()
    return FALSE
  endif

  /*
  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    ResetGuiComponent ()
    let iSEM = GetScreenEcho ()
    SetJcfOption (GUI_OPT_SCREEN_ECHO, ECHO_HIGHLIGHTED)
    let g_iCurScreenEchoMode = iSEM
    return FALSE
  else
    let iSEM = GetScreenEcho ()
    if (g_iCurScreenEchoMode != iSEM) then
      SetJcfOption (GUI_OPT_SCREEN_ECHO, g_iCurScreenEchoMode)
    endif
  endif
  */

  let g_nObjectTypeCode = GetCurrentSubtypeCode ()
  ; if (!g_nObjectTypeCode) then
    ; let g_nObjectTypeCode = GetObjectSubTypeCode ()
  ; endif

  if (IsSAPGUIActive ()) then

/*     ResetGuiComponent ()
 *     UpdateCurrentGuiComponent ()
 */
    GetSAPGUIFrame ()
    let oFocus = GetSAPGUIFocus ()
    if (!oFocus) then
      if !((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
        ResetGuiComponent ()
      endif
      ExitSAPGUIFrame ()
      return false
    endif
    let nGuiComponentType = oFocus.typeAsNumber
    let sGuiComponentSubType = oFocus.subType
    let oFocus = oNull
    ExitSAPGUIFrame ()

/*     if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTree) && (g_iItemType == 3)) then
 *       return TRUE
 *     endif
 */

    if ((sGuiComponentPrevSubType==sGuiTextEdit) && (StringCompare(sGuiComponentSubType,sGuiTextEdit, true) != 0)) then
      if (GetBrailleMode () == BRL_MODE_STRUCTURED) then
        SetBrailleRestriction (g_nPrevBrailleRestriction)
      endif
    endif

    if (nGuiComponentType != GUI_TC_UNKNOWN) then
      if (g_nObjectTypeCode == WT_EDIT) then
        if (nGuiComponentType == GUI_TC_STATUSPANE) then
          UpdateCurrentGuiComponent ()
          ScheduleFunction ("SayCurrentGuiComponent", 2)
          return true
        endif
      endif

      if (nGuiComponentType == GUI_TC_OKCODEFIELD) then
        ; ResetGuiComponent () - outcommented to prevent double announcement of toolbar
        UpdateCurrentGuiComponent ()
        SayCurrentGuiComponent ()
        return TRUE
      endif

      if (nGuiComponentType == GUI_TC_GUISHELL) then
        if (g_bRealWindowFocusChanged) then
          /* ROM - 2011/07/22 - workaround: in some circumstances, the internal JAWS logic does not speak dialogs windows as they pop up */
          let g_bRealWindowFocusChanged = false
          let hTopLevelWindow = GetTopLevelWindow (hCurrentWindow)
          SayWindowTypeAndText (hTopLevelWindow)
          ; reset internal globals of JAWS
          let GlobalPrevReal = hTopLevelWindow
          let GlobalPrevRealname = GetWindowName (hTopLevelWindow)
          let GlobalPrevApp = GetAppMainWindow (hCurrentWindow)
          let GlobalPrevFocus = hCurrentWindow
        endif
        ; if (sGuiComponentSubType == sGuiTextEdit) then
        if ((sGuiComponentSubType == sGuiTextEdit) || (sGuiComponentSubType == sGuiGridView)) then
          if (g_nObjectTypeCode == WT_TOOLBAR) then
            if (sGuiComponentSubType == sGuiTextEdit) then
              SayCurrentGuiTextEdit (0)
            endif
            return FALSE
          endif
          ResetGuiComponent ()
          UpdateCurrentGuiComponent ()
          ; ScheduleFunction ("SayCurrentGuiShell", 4)
          SayCurrentGuiShell () ; 2015/05/19 - rom - changed to speak additional information, too (AccDescription)
          let g_nPrevBrailleRestriction = GetBrailleRestriction ()
          if (GetBrailleMode () == BRL_MODE_STRUCTURED) then
            SetBrailleRestriction (RestrictWindow)
          endif
          return TRUE
        elif (sGuiComponentSubType == sGuiAbapEditor) then
          UpdateCurrentGuiComponent ()
          if (hPreviousWindow == hCurrentWindow) then
            return TRUE
          endif
          if (IsParentWindow (hPreviousWindow, hCurrentWindow) || IsParentWindow (hCurrentWindow, hPreviousWindow)) then
            if (g_bGuiComponentSameAsPrevious) then
              return TRUE
            endif
          endif
          SayCurrentGuiAbapEditor ()
        elif (sGuiComponentSubType == sGuiPicture) then
          /* ROM 2010/08/05 - to prevent chattering pictures twice
           * in some cases the pictures is embedded in a "real" window is embedded, which results in an additional focus changed event
           */
          return TRUE
        endif
        if (sGuiComponentPrevSubType == sGuiPicture) then
          return TRUE
        endif
      endif

      if (g_iWindowRedrawID != 0) then
        UnscheduleFunction (g_iWindowRedrawID)
      endif
      let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 2)

      return TRUE

    endif
  endif

  return FALSE

EndFunction

int Function HandleCustomAppWindows (handle hWnd)

  if InHjDialog () && ! MenusActive () then
   ; Keep extra static text from chattering.
   IndicateControlType (WT_DIALOG, GetWindowName (hWnd), cscSpace)
   return TRUE
  endIf

  let g_bFocusChanged = TRUE
  let g_hCurrentWindow = hNull

  if (IsSAPGUIActive ()) then
    ExitSAPGUISession ()
    GetSAPGUISession ()
    ; GetSAPGUIFrame ()
    if (IsSAPGUISessionBusy (3, TRUE)) then
      say (msgSapGuiSessionBusy, OT_JAWS_MESSAGE)
      return FALSE
    endif

    GetGuiStatusBar ()

    let g_sStepLoopId = ""

    /* UpdateCurrentGuiComponent ()
    ; SayCurrentGuiComponent () */
    if (g_iWindowRedrawID != 0) then
      UnscheduleFunction (g_iWindowRedrawID)
    endif
    let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 2)
  endif

  return FALSE

EndFunction

int Function HandleCustomRealWindows (handle hWnd)

  let g_bFocusChanged = TRUE

  if (IsSAPGUIActive ()) then
    ; StopSpeech ()
    let g_sStepLoopId = ""

    GetGuiStatusBar ()

    /* ResetGuiComponent () */
    UpdateCurrentGuiComponent ()

    /* check for popup window and get dialog text */
    GetSAPGUIFrame ()
    let g_bIsPopupDialog = false
    let g_sPopupDialogText = ""
    if ((DialogActive () == ACTIVE) && (g_oSAPGUIFrame.typeAsNumber == GUI_TC_MODALWINDOW)) then
      ; ROM 2010/01/15 - always retrieve popup text as there are some popup dialogs where "IsPopupDialog" is false (is this wrong in SAPGUI?)
      let g_bIsPopupDialog = g_oSAPGUIFrame.IsPopupDialog
      let g_sPopupDialogText = g_oSAPGUIFrame.PopupDialogText
    endif
    ExitSAPGUIFrame ()

    ; if ((g_bIsPopupDialog || !StringIsBlank(g_sPopupDialogText)) && (DialogActive () == ACTIVE)) then
    ; ROM 2018/11/19 - reverted to only use IsPopupDialog property to determine if PopupDialogText should be announced
    if (g_bIsPopupDialog) then
      if (g_iPopupWindowID != 0) then
        UnscheduleFunction (g_iPopupWindowID)
      endif
      g_iPopupWindowID = ScheduleFunction ("SayPopupWindowText", 2)
    else
      StopSpeech() ; romdbg
    endif

    SayCurrentGuiBox ()
    ; ScheduleFunction ("SayCurrentGuiComponent", 4)
  endif

  return FALSE
EndFunction

void function ProcessSayRealWindowOnFocusChange (handle AppWindow, handle RealWindow, string RealWindowName, handle FocusWindow)
var
	handle hChild,
  handle hRealWindow,
  handle hTopLevelWindow,
  string sRealWindow,
  string sTopLevelWindow

  let g_bRealWindowFocusChanged = false
  if ((RealWindow == FocusWindow) && (GlobalPrevReal != RealWindow)) then
    let hRealWindow = GetRealTitleWindow (FocusWindow)
    let sRealWindow = GetWindowName (hRealWindow)
    if (StringIsBlank (sRealWindow)) then
      let hTopLevelWindow = GetTopLevelWindow (FocusWindow)
      let sTopLevelWindow = GetWindowName (hTopLevelWindow)
      if (GetWindowClass (hTopLevelWindow) == cWc_dlg32770) then
        let g_bRealWindowFocusChanged = true
        return
      endif
    endif
  endif

  ProcessSayRealWindowOnFocusChange (AppWindow, RealWindow, RealWindowName, FocusWindow)

endFunction

Void Function MenuModeEvent (handle WinHandle, int mode)
var
  int iSEM

  if (mode == MENU_INACTIVE) then
    if (GlobalMenuMode == MENU_ACTIVE) then
      /*
      let iSEM = GetScreenEcho ()
      if (g_iCurScreenEchoMode != iSEM) then
        SetJcfOption (GUI_OPT_SCREEN_ECHO, g_iCurScreenEchoMode)
      endif
      */
      let g_nObjectTypeCode = GetObjectSubtypeCode ()
      if (g_nObjectTypeCode != WT_UNKNOWN) then
        menuModeEvent (WinHandle, mode)
        ResetGuiComponent ()
        return
      endif
      menuModeEvent (WinHandle, mode)
      Delay (4)
      if (IsSAPGUIActive ()) then
        ResetGuiComponent ()
        SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
        UpdateCurrentGuiComponent ()
        SayCurrentGuiComponent ()
        let g_bFocusChanged = TRUE
      endif
      return
    endif
  elif (mode == MENU_ACTIVE) then
    /*
    if (GlobalMenuMode == MENU_INACTIVE) then
      let iSEM = GetScreenEcho ()
      SetJcfOption (GUI_OPT_SCREEN_ECHO, ECHO_HIGHLIGHTED)
      let g_iCurScreenEchoMode = iSEM
    endif
    */
  endif
  menuModeEvent (WinHandle, mode)
EndFunction

/*
 * rom 2017/11/17:
 * NewTextEvent is used to recognize new status messages. In later versions of SAPGUI this will become obsolete
 * because the "event" StatusBarUpdated will be released for every new status message, so this function might because
 * finally deleted.
 */

void function NewTextEvent (handle hwnd, string buffer, int nAttributes, int nTextColor, int nBackgroundColor, int nEcho, string sFrameName)

  if (hwnd == g_hGuiStatusBar) then
    if (IsSAPGUISessionBusy (1, FALSE)) then
      return
    endif

    if (g_iStatusbarID != 0) then
      UnscheduleFunction (g_iStatusbarID)
    endif
    let g_iStatusbarID = ScheduleFunction ("HandleGuiStatusBarMessage", 4)

    return

  endif

  /*
   * call regular NewtextEvent (rom: updated 2017/11/17)
   */
  NewTextEvent (hwnd, buffer, nAttributes, nTextColor, nBackgroundColor, nEcho, sFrameName)

EndFunction

void function TutorMessageEvent (handle hwndFocus, int nMenuMode)
var
  object oFocus,
  int nGuiComponentType,
  int nWindowsTypeCode,
  string sGuiComponentSubType

  if (MenusActive () || InHjDialog ()) then
    TutorMessageEvent (hwndFocus, nMenuMode)
    return
  endif

  nWindowsTypeCode = GetCurrentSubtypeCode ()

  GetSAPGUIFrame ()
  let oFocus = GetSAPGUIFocus ()
  let nGuiComponentType = oFocus.typeAsNumber
  let sGuiComponentSubType = oFocus.subType

  let oFocus = oNull
  ExitSAPGUIFrame ()

  if (nGuiComponentType == GUI_TC_BUTTON) then
    return
  endif

  if (nGuiComponentType == GUI_TC_GUISHELL) then
    if ((sGuiComponentSubType == sGuiToolbar) || (sGuiComponentSubType == sGuiGridView) || (sGuiComponentSubType == sGuiCalendar) || (sGuiComponentSubType == sGuiComboBox)) then
      return
    endif
  endif

  if ((nWindowsTypeCode == WT_EDIT) || (nWindowsTypeCode == WT_EDITCOMBO) || (nWindowsTypeCode == WT_BUTTON) || (nWindowsTypeCode == WT_MULTILINE_EDIT)) then
    if (IsInputField (nGuiComponentType, sGuiComponentSubType) == GUI_IF_INPUTFIELDCONTROL) then
      return
    endif
  endif
  if ((nWindowsTypeCode == WT_EDIT) && (nGuiComponentType == GUI_TC_STATUSPANE)) then
    return
  endif

  TutorMessageEvent (hwndFocus, nMenuMode)

EndFunction

void Function MouseButtonEvent (int nID, int x, int y)

  MouseButtonEvent (nID, x, y)

  if (g_nMouseNavigationId != 0) then
    UnscheduleFunction (g_nMouseNavigationId)
    let g_nMouseNavigationId = 0
  endif

  if (nID == WM_LBUTTONUP) then
    let g_nMouseNavigationId = ScheduleFunction ("HandleMouseNavigation", 4)
    return
  endif

EndFunction


/* ROM 2015/03/11
 * SayObjectTypeAndText and ActiveItemChangedEvent for handling the settings dialog box
 * Similar scripts are present in saplogon.jss
 * See also BrailleAddObjectName for braille output
 */

void function SayObjectTypeAndText (int nLevel)
var
  int i,
  int nType,
  int nState,
  int nControlId,
  int nContainerControlId,
  int nWinStyles,
  handle hCurWnd,
  handle hPriorWnd,
  handle hNextWnd,
  object oFocus,
  string sLabel,
  string info

  let nType = GetObjectSubTypeCode ()

  if (nType == WT_TABCONTROL) then
    ; RefreshWindow (GetFocus ())
    SayTabControl ()
    return
  endif

  if (nLevel != 0) then
    SayObjectTypeAndText (nLevel)
    return
  endif

  if (nType == WT_MULTILINE_EDIT) then
    hCurWnd = GetCurrentWindow ()
    hNextWnd = GetNextWindow (hCurWnd)
    hPriorWnd = GetPriorWindow (hCurWnd)
    if ((GetWindowSubTypeCode (hNextWnd) == WT_SPINBOX) && (GetWindowSubTypeCode (hPriorWnd) == WT_RADIOBUTTON) && StringIsBlank(GetObjectName ())) then
      sLabel = GetWindowName (hPriorWnd)
      Say (GetGroupBoxName (), OT_CONTROL_GROUP_NAME)
      oFocus = GetCurrentObject (0)
      nState = oFocus.accState(0)
      IndicateControlType (WT_SPINBOX, sLabel)
      if (nState & STATE_SYSTEM_READONLY) then
        IndicateControlState (WT_SPINBOX, CTRL_GRAYED)
      endif
      return
    endif
  elif (nType == WT_BUTTON) then
    /* ROM - added for play buttons and enhanced styled buttons */
    g_sPlayButtonLabel = ""
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    nWinStyles = GetWindowStyleBits (hCurWnd)
    if ((nWinStyles & WS_THICKFRAME) && (nWinStyles & BS_OWNERDRAW)) then
      info = GetObjectName ()
      info = info +cscSpace + msgStateHighlighted
      IndicateControlType (WT_BUTTON, info)
      return
    endif
    /* ROM - added for play buttons */
    nContainerControlId = GetControlID (GetParent (GetParent (hCurWnd)))
    if (nContainerControlId == CID_OPTIONS_CONTAINER) then
      if (IsPlayButton (nControlId)) then
        Say (GetGroupBoxName (), OT_CONTROL_GROUP_NAME)

        hPriorWnd = GetPriorWindow (hCurWnd)
        i = 0
        while ((GetWindowSubtypeCode(hPriorWnd) != WT_STATIC) && (i < 3))
          hPriorWnd = GetPriorWindow (hPriorWnd)
          i = i +1
        endWhile

        sLabel = GetWindowName (hPriorWnd)
        info = sLabel + cscSpace + GetWindowName (hCurWnd)
        IndicateControlType (WT_BUTTON, info)
        g_sPlayButtonLabel = info
        return
      endif
    endif
  endif

  SayObjectTypeAndText (nLevel)

endFunction

void function ActiveItemChangedEvent (handle hCurWnd, int nCurObjId, int nCurChildId,
  handle hPrevWnd, int nPrevObjId, int nPrevChildId)
var
  int nType,
  handle hWinParent,
  string sWinClass

  let nType = GetObjectSubTypeCode ()

  if ((nType == WT_TREEVIEWITEM) || (nType == WT_TREEVIEWITEM)) then
    if (!MenusActive ()) then
      StopSpeech ()
      SayObjectActiveItem (true)
      return
    endif
  elif (nType == WT_LISTBOXITEM) then
    StopSpeech ()
    UpdateCurrentGuiComponent ()
    ; SayString ("*")
    SayObjectActiveItem (true)
    return
  elif (nType == WT_COMBOBOX) then
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComboBox ()
      return
    endif
  else
    nType = GetObjectSubTypeCode (true, 1)
    if ((nType == WT_SYSTRAY) || (nType == WT_TOOLBAR)) then
      /* if not ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then */
      let hWinParent = GetParent (GetCurrentWindow ())
      let sWinClass = GetWindowClass (hWinParent)
      if (StringCompare (sWinClass, sTextEditClass, true) != 0) then
        if (StringCompare (sWinClass, sALVGridControlClass, true) == 0) then
          return
        endif
        if (StringCompare (sWinClass, sSysPagerClass, true) == 0) then
          return
        endif
        if (!IsSAPGUISessionBusy (0, FALSE) && (GetWindowSubTypeCode (hWinParent) == WT_DIALOG)) then
          return
        endif
      endif
    endif
  endif

  ActiveItemChangedEvent (hCurWnd, nCurObjId, nCurChildId, hPrevWnd, nPrevObjId, nPrevChildId)

endFunction

string function GetObjectPositionString (handle hwnd, int nObjType)
  if ((nObjType == WT_COMBOBOX) || (nObjType == WT_EDITCOMBO)) then
    var int currentItem = GetCurrentItem(hwnd)
     var int itemCount = GetItemCount(hwnd)
     if (itemCount <= 0)
        return cscNull
     endIf
     return (FormatString(cmsgPosInGroup1, IntToString(currentItem), IntToString(itemCount)))
  endIf
  return cscNull
endFunction

void function ValueChangedEvent (handle hwnd, int objId, int childId, int nObjType, string sObjName, string sObjValue,optional int bIsFocusObject)

  if ((nObjType == WT_EDIT || nObjType == WT_EDITCOMBO) && GetObjectSubtypeCode() == WT_EDITCOMBO) then
    if (!AutoCompleteSuggestionListIsVisible()) then
      var string sObjPosition = GetObjectPositionString (hWnd, WT_EDITCOMBO)
      Say(sObjValue, ot_line, smartMarkupDetection)
      if (!StringIsBlank(sObjPosition))
        Say(sObjPosition, OT_POSITION, smartMarkupDetection)
      endif
      return
    endif
  endif

  ValueChangedEvent (hwnd, objId, childId, nObjType, sObjName, sObjValue,bIsFocusObject)

endFunction

/*
 * Overriding SayObjectActiveItem is probably obsolete now as ActiveItemChangedEvent is used to prevent
 * JAWS from announcing things
 */
void Function SayObjectActiveItem ()
var
  handle hWinParent,
  string sWinClass

  let g_nObjectTypeCode = GetCurrentSubtypeCode ()
  ; if (!g_nObjectTypeCode) then
    ; let g_nObjectTypeCode = GetObjectSubTypeCode ()
  ; endif

  if ((g_nObjectTypeCode == WT_SYSTRAY) || (g_nObjectTypeCode == WT_TOOLBAR)) then
    /* if not ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then */
    let hWinParent = GetParent (GetCurrentWindow ())
    let sWinClass = GetWindowClass (hWinParent)
    if (StringCompare (sWinClass, sTextEditClass, true) != 0) then
      if (StringCompare (sWinClass, sALVGridControlClass, true) == 0) then
        return
      endif
      if (StringCompare (sWinClass, sSysPagerClass, true) == 0) then
        return
      endif
      if (!IsSAPGUISessionBusy (0, FALSE) && (GetWindowSubTypeCode (hWinParent) == WT_DIALOG)) then
        return
      endif
    endif
  endif

  SayObjectActiveItem ()

EndFunction

void Function SayHighLightedText (handle hwnd, string buffer)
var
  handle hCurWnd

  if ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentType == GUI_TC_GUISHELL) || (g_nGuiComponentType == GUI_TC_LABEL)) then
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiTree))) then
    return
  endif

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    return
  endif

  let hCurWnd = GetFocus ()
  if (hwnd != hCurWnd) then
    return
  endif

  SayHighlightedText (hwnd, buffer)

EndFunction

script SapStartRequest ()

  var object oFocus = GetSAPGUIFocus ()
  g_sStartRequestId = oFocus.Id
  oFocus = oNull

endScript

script SapEndRequest ()
var
  handle hWinParent,
  string sWinClass

  if ((UserBufferIsActive ()) || (MenusActive ()) | (InHJDialog ())) then
    return
  endif

  let hWinParent = GetParent (GetFocus ())
  let sWinClass = GetWindowClass (hWinParent)
  if ((StringCompare (sWinClass, sTextEditClass, true) == 0) || (StringCompare (sWinClass, sAbapEditorClass, true) == 0)) then
    ; if (g_bGuiAbapEditorIsAutoCompleteOpen) then
      if (!g_bAutoCompletionProcessed) then
        if (g_iAutoCompletionID != 0) then
          UnscheduleFunction (g_iAutoCompletionID)
        endif
        let g_iAutoCompletionID = ScheduleFunction ("HandleAutoCompletion", 4)
        return
      endif
    ; endif
  endif

  if (g_iWindowRedrawID != 0) then
    UnscheduleFunction (g_iWindowRedrawID)
  endif

  var object oFocus = GetSAPGUIFocus ()
  var string sId = oFocus.Id
  oFocus = oNull

  if ((g_sStartRequestId == sId) && !g_bFlushing) then
    return
  endif

  ; StopSpeech ()
  ResetGuiComponent ()
  ; UpdateCurrentGuiComponent ()
  ; ScheduleFunction ("SayCurrentGuiComponent", 2)
  g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 2)

EndScript

/*
 * rom: new in version 2.58 (2017/10/05) - announcement when history appears
 */

void function AnnounceHistoryOpened ()
var
  int bIsActive,
  int nEntries,
  object oFocus,
  string sEntries = ""

  if (!IsSAPGUIActive ()) then
    return
  endif

  oFocus = GetSAPGUIFocus ()
  if (!oFocus) then
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView)) then
    if ((g_iGuiGridCurColumn < 1) || (g_iGuiGridCurRow < 1)) then
      return
    endif
    bIsActive = oFocus.HistoryIsActive(g_iGuiGridCurRow-1, g_sGuiGridCurColumn)
    if (!bIsActive) then
      return
    endif
    nEntries = oFocus.HistoryList(g_iGuiGridCurRow-1, g_sGuiGridCurColumn).Count
  else
    bIsActive = oFocus.HistoryIsActive
    if (!bIsActive) then
      return
    endif
    nEntries = oFocus.HistoryList.Count
  endif
  oFocus = oNull
  ExitSAPGUIFrame ()

  ; if (g_nHistoryEntries > 1) then
  if (nEntries > 1) then
    sEntries = FormatString (msgHistoryCount, IntToString (nEntries))
  else
    sEntries = FormatString (msgHistorySingleEntry, IntToString (nEntries))
  endif

  Say (msgHistoryOpened, OT_ITEM_STATE, false)
  Say (sEntries, OT_ITEM_NUMBER, false)

  if (IsInputField ()) then
    ScheduleFunction ("UpdateAndSayGuiTextField", 2)
  endif
endfunction

script HistoryOpened ()

  ScheduleFunction ("AnnounceHistoryOpened", 2)

endScript

/* rom: new in version 2.59 - handle status bar after event */

script StatusBarUpdated ()
  if (g_iStatusbarID != 0) then
    UnscheduleFunction (g_iStatusbarID)
  endif

  /* reset details - will be set when StatusBarViewDetailsAvailable is trigegered*/
  g_bGuiStatusPaneHasDetails = -1

  g_iStatusbarID = ScheduleFunction ("HandleGuiStatusBarMessage", 4)
endScript

script StatusBarViewDetailsAvailable ()
  g_bGuiStatusPaneHasDetails = 1 /* announcement made during HandleGuiStatusBarMessage and when focused */
endScript

/*
 * rom: new in xSRX 58 - for announcement of deleting/adding lines in an ALV grid view
 */

script SapALVLineDeleted ()
  Say (msgTableRowDeleted, OT_STATUS)
endScript

script SapALVLineAdded ()
  Say (msgTableRowInserted, OT_STATUS)
endScript

/*
script SapFocusChanged ()
  PerformScript SapFocusChanged ()
  if ((g_iWindowRedrawID == 0) && (!g_bFocusChanged)) then
    let g_iWindowRedrawID = ScheduleFunction ("HandleWindowRedraw", 10)
  endif
EndScript
*/

int Function CheckCurrentObject ()

  let g_nObjectTypeCode = GetCurrentSubtypeCode ()
  ; if (!g_nObjectTypeCode) then
    ; let g_nObjectTypeCode = GetObjectSubTypeCode ()
  ; endif

  if ((g_nObjectTypeCode != WT_UNKNOWN) && (g_nObjectTypeCode != WT_SYSTRAY) && (g_nObjectTypeCode != WT_TOOLBAR) && (g_nObjectTypeCode != WT_DATETIME)) then
    return (0)
  endif

  return (1)

EndFunction

void Function SayStandardWindow ()
var
  string keyname,
  int TheTypeCode,
  handle hCurrentWindow,
  string sClass,
  string sMenuName,
  string sMessage

  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    if (g_bHistoryIsActive)
      return
    endif
  endif

  let keyname = GetCurrentScriptKeyName ()

  if (keyname == "UpArrow" || keyname == "DownArrow") then

    if (IsLeftButtonDown ()) then
      SelectingText(TRUE)
      pause ()
      SelectingText(false)
      return
    endIf
    if not IsPCCursor () then
      SayLine()
      return
    endIf
    let hCurrentWindow = GetCurrentWindow()
    let TheTypeCode = GetCurrentSubtypeCode () ; GetWindowSubTypeCode (hCurrentWindow)
    If ! TheTypeCode then
      Let TheTypeCode = GetObjectSubTypeCode ()
    EndIf
    if (TRUE == IsJavaWindow (hCurrentWindow)) then
      /*
      Because at the time JAWS processes the scripts, Java has not processed the
      keystroke for the following objects, the responsibility of speaking the object
      needs to be passed to either ActiveItemChangedEvent or ValueChangedEvent.
      */
      if (
        (WT_TABCONTROL == TheTypeCode)
        || (WT_UPDOWNSLIDER == TheTypeCode)
        || (WT_LEFTRIGHTSLIDER == TheTypeCode)
        || (WT_LEFTRIGHTSLIDER == TheTypeCode)
        || (WT_TREEVIEW == TheTypeCode)
        || (WT_TREEVIEWITEM == TheTypeCode)
      ) then
        return
      elif (TRUE == MenusActive ()) then
        return
      endIf
    endIf
    If (TheTypeCode == WT_TASKBAR) then
      SayWord ()
      Return
    endIf
    if (TheTypeCode == WT_UPDOWNSLIDER) || (TheTypeCode == WT_LEFTRIGHTSLIDER) then
      SayWord ()
      return
    endIf
    if theTypeCode==wt_edit_spinbox then
      Say(GetLine(),OT_LINE)
      return
    endIf
    if (theTypeCode == WT_EDITCOMBO || theTypeCode == WT_LISTBOX || theTypeCode == WT_COMBOBOX) then
      /*
      * announcement is now done in ValueChangedEvent or ActiveItemChangedEvent
      */
      ; if (GetScreenEcho () == ECHO_NONE) then
        ; SayLine ()
      ; endif
      ;sayWindow(globalFocusWindow,read_everything)
      return
    endIf
    if CaretVisible() then
      SayLine()
      return
    endIf
    If ((TheTypeCode == WT_MULTISELECT_LISTBOX) || (TheTypeCode == WT_EXTENDEDSELECT_LISTBOX)) then
      SayLine()
    endIf
    If ((TheTypeCode==WT_TREEVIEW) || (TheTypeCode==WT_TREEVIEWITEM)) Then
      SayTreeViewLevel ()
    endIf

  else /* LeftArrow / RightArrow */

    if ((IsLeftButtonDown()) || (IsRightButtonDown())) then
      SelectingText(TRUE)
      pause ()
      SelectingText(false)
      return
    endIf
    if not IsPCCursor() then
      SayCharacter()
      return
    endIf
    let hCurrentWindow = GetCurrentWindow()
    let TheTypeCode = GetCurrentSubtypeCode () ; GetWindowSubTypeCode (hCurrentWindow)
    If ! TheTypeCode then
      Let TheTypeCode = GetObjectSubTypeCode ()
    EndIf
    if (TRUE == IsJavaWindow (hCurrentWindow)) then
      /*
      Because at the time JAWS processes the scripts, Java has not processed the
      keystroke for the following objects, the responsibility of speaking the object
      needs to be passed to either ActiveItemChangedEvent or ValueChangedEvent.
      */
      if (
        (WT_TABCONTROL == TheTypeCode)
        || (WT_UPDOWNSLIDER == TheTypeCode)
        || (WT_LEFTRIGHTSLIDER == TheTypeCode)
        || (WT_LEFTRIGHTSLIDER == TheTypeCode)
        || (WT_TREEVIEW == TheTypeCode)
        || (WT_TREEVIEWITEM == TheTypeCode)
      ) then
        return
      elif (TRUE == MenusActive ()) then
        return
      endIf
    endIf
    If (TheTypeCode == WT_MENU) then
      If ! IsMSAAWindow (hCurrentWindow) then
        Let sMessage = GetWindowText (hCurrentWindow, true)
        If ! sMessage then
          Let sMessage = GetControlName ()
        EndIf
        Let sMenuName = GetMenuName ()
        If sMenuName then
          IndicateControlType (WT_MENU, sMenuName)
        Else
          SayLine ()
        EndIf
      EndIf
      MenuAccessKeyHelper()
      return
    endIf
    if (TheTypeCode == WT_CONTEXTMENU) then
     ;let sMessage = FormatString (cmsg5_L, GetWindowText (hCurrentWindow, true))
     ;SayMessage (ot_control_type, sMessage)"Context Menu"
     ;let sMessage = FormatString (cmsg3_L, GetWindowText (hCurrentWindow, true))
     ;SayMessage (ot_control_type, sMessage) ;"Menu"
     If ! IsMSAAWindow (hCurrentWindow) then
    		Let sMessage = GetWindowText (hCurrentWindow, true)
    		Let sMenuName = GetMenuName ()
    		IndicateControlType (WT_CONTEXTMENU, sMenuName)
     EndIf
     return
    endIf
    if (TheTypeCode == WT_TABCONTROL || TheTypeCode == WT_TASKBAR || TheTypeCode == WT_UPDOWNSLIDER || TheTypeCode == WT_LEFTRIGHTSLIDER) then
      SayWord()
      return
    endIf
    if CaretVisible() then
      SayCharacter()
      return
    else
      If (TheTypeCode == WT_MENU) then
        Let sMessage = GetWindowText (hCurrentWindow, true)
        IndicateControlType (WT_MENU, sMessage)
        MenuAccessKeyHelper ()
        return
      endIf
      if (TheTypeCode == WT_CONTEXTMENU) then
        Let sMessage = GetWindowText (hCurrentWindow, true)
        IndicateControlType (WT_CONTEXTMENU, sMessage)
        return
      endIf
      If (
        ((TheTypeCode == WT_TREEVIEW) || (TheTypeCode == WT_TREEVIEWITEM))
        && (MenusActive () == FALSE)
      ) then
        SayTreeViewLevel ()
      endIf
    endIf
    MenuAccessKeyHelper()

  endif

EndFunction

String Function ToggleSapGuiAccVerbosity (int nRetCurVal)

  if (not nRetCurVal) then
    let g_nSapGuiAccVerbosity = g_nSapGuiAccVerbosity + 1
  endif

  if (g_nSapGuiAccVerbosity > 1) then
    let g_nSapGuiAccVerbosity = 0
  endif

  if (g_nSapGuiAccVerbosity == 0) then
    return msgSapGuiAccVerbosityLow
  else
    return msgSapGuiAccVerbosityHigh
  endif

EndFunction

String Function ToggleSapGuiSteploopMode (int nRetCurVal)

  if (not nRetCurVal) then
    let g_nSapGuiSteploopMode = not g_nSapGuiSteploopMode
  endif

  if (g_nSapGuiSteploopMode) then
    return msgSapGuiModeOn
  else
    return msgSapGuiModeOff
  endif

EndFunction

/*
 **********************************************************************
 ** BrailleCallbackObjectIdentify
 **********************************************************************
*/

int Function BrailleCallbackObjectIdentify ()
var
  int nGuiTypeCode

  ; let g_nObjectTypeCode = GetCurrrentSubtypeCode ()
  ; GetWindowSubTypeCode does not work reliably anymore (JAWS 15+), as it returns the value of last known object and not WT_UNKNOWN
  ; thus g_nObjectTypeCode should be ignored

  if (!IsSAPGUIActive ()) then
    return BrailleCallbackObjectIdentify ()
  endif

  GetCurrentGuiComponent ()
  let nGuiTypeCode = g_nGuiComponentType

  if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
    ; GetCurrentGuiTableControl ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TABLECONTROL)
  endif

  if (nGuiTypeCode == GUI_TC_CHECKBOX) then
    GetCurrentGuiCheckbox ()
    if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
      /* we are on a list element -> braille like GuiLabel */
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_LABEL)
    endif
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_CHECKBOX)
  endif

  if (nGuiTypeCode == GUI_TC_RADIOBUTTON) then
    GetCurrentGuiRadioButton ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_RADIOBUTTON)
  endif

  if (nGuiTypeCode == GUI_TC_BUTTON) then
    GetCurrentGuiButton ()
    /* ROM 2017/12/15 - check for "more" menubutton */
    if (!StringCompare (g_sGuiButtonType, sGuiMenu, true)) then
      return (WT_BUTTONMENU)
    endif
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_BUTTON)
  endif

  if (nGuiTypeCode == GUI_TC_TEXTFIELD) then
    GetCurrentGuiTextField ()
    if (g_bLstIsListElement && (!StringIsBlank (g_sLstContainerType))) then
      /* we are on a list element -> braille like GuiLabel */
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_LABEL)
    endif
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TEXTFIELD)
  endif

  if (nGuiTypeCode == GUI_TC_CTEXTFIELD) then
    GetCurrentGuiTextField ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_CTEXTFIELD)
  endif

  if (nGuiTypeCode == GUI_TC_PASSWORDFIELD) then
    GetCurrentGuiTextField ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_PASSWORDFIELD)
  endif

  if ((nGuiTypeCode == GUI_TC_COMBOBOX) || ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox))) then
    GetCurrentGuiComboBox ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_COMBOBOX)
  endif

  if (nGuiTypeCode == GUI_TC_TAB) then
    GetCurrentGuiTab ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TAB)
  endif

  if (nGuiTypeCode == GUI_TC_GUISHELL) then
    ; g_bGuiTextFieldIsValid = false
    if (g_sGuiComponentSubType == sGuiInputField) then
      GetCurrentGuiTextField ()
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TEXTFIELD)
    endif
    GetCurrentGuiShell ()
    if (g_sGuiComponentSubType == sGuiTree) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_SHELL_TV)
    elif (g_sGuiComponentSubType == sGuiGridView) then
      if (g_nToolbarFocusedButton != -1) then
        return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TOOLBAR)
      endif
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_GRIDVIEW)
    elif (g_sGuiComponentSubType == sGuiCalendar) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_CALENDAR)
    elif (g_sGuiComponentSubType == sGuiPicture) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_PICTURE)
    elif (g_sGuiComponentSubType == sGuiToolbar) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TOOLBAR)
    elif (g_sGuiComponentSubType == sGuiCtrlApoGrid) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_TABLECONTROL)
    endif
  endif

  if (nGuiTypeCode == GUI_TC_LABEL) then
    GetCurrentGuiLabel ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_LABEL)
  endif

  if (nGuiTypeCode == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER || g_nGuiComponentType == GUI_TC_DOCKSHELL) then
    GetCurrentGuiSplitterShell ()
    return (WT_CUSTOM_CONTROL_BASE+GUI_WT_SPLITTERSHELL)
  endif

  if (nGuiTypeCode == GUI_TC_SIMPLECONTAINER) then
    GetCurrentGuiContainer ()
    if (g_sLstContainerType == CT_LIST) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_CONTAINER)
    endif
  endif

  if (nGuiTypeCode == GUI_TC_USERAREA) then
    if (g_bIsOTFPreview) then
      return (WT_CUSTOM_CONTROL_BASE+GUI_WT_CONTAINER)
    endif
  endif

  if (nGuiTypeCode == GUI_TC_STATUSPANE) then
    GetCurrentGuiStatusPane ()
    return (WT_STATUSBAR)
  endif

  return (BrailleCallbackObjectIdentify ())

EndFunction

int Function BrailleAddObjectName (int nType)
var
  handle hCurWnd,
  handle hPriorWnd,
  handle hNextWnd,
  object oMenuBar,
  string sLabel,
  string sAccName,
  string sAccKeys,
  string info

  if ((nType == WT_COMBOBOX) && (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH)) then
    BrailleAddString (msgGuiVHViewSwitchName, 0, 0, 0)
    return true
  endif

  if ((nType == WT_EDITCOMBO) && (g_nGuiComponentType == GUI_TC_OKCODEFIELD)) then
    BrailleAddString (msgBrlGuiOkCodeField, 0, 0, 0)
    return true
  endif

  if (g_bIsApplicationToolbar || g_bIsFooter) then
    if ((nType == WT_BUTTONMENU) && (g_nGuiComponentType == GUI_TC_BUTTON) && (g_sGuiButtonType == sGuiMenu)) then
      info = ""
      if (!StringIsBlank (g_sGuiButtonText)) then
        info = g_sGuiButtonText
      else
        info = g_sGuiButtonTooltip
      endif
      BrailleAddString (info, 0, 0, 0)
      return true
    endif
  endif

  if (nType == WT_MENUBAR) then
    let oMenuBar = GetCurrentObject (0)
    let sAccName = oMenuBar.accName(0)
    let sAccKeys = oMenuBar.accKeyboardShortcut(0)
    ; let sAccDesc = GetObjectDescription (true)
    ; let sAccHelp = GetObjectHelp ()
    BrailleAddString (sAccName, 0, 0, 0)
    BrailleAddString (sAccKeys, 0, 0, 0)
    let oMenuBar = oNull
    return true
  endif

  if (nType == WT_EDIT_SPINBOX) then
    /* ROM 2015/03/11 - this is for handling label-less spinboxes in the settings dialog */
    if (!StringIsBlank (GetObjectName ())) then
      return false
    endif
    hCurWnd = GetCurrentWindow ()
    hNextWnd = GetNextWindow (hCurWnd)
    hPriorWnd = GetPriorWindow (hCurWnd)
    if ((GetWindowSubTypeCode (hNextWnd) == WT_SPINBOX) && (GetWindowSubTypeCode (hPriorWnd) == WT_RADIOBUTTON)) then
      sLabel = GetWindowName (hPriorWnd)
      BrailleAddString (sLabel, GetCursorCol(), GetCursorRow(), 0)
      return true
    endif
  endif

  if (nType == WT_STATUSBAR) then
    if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
      /*
      if (!StringIsBlank (g_sGuiStatusPaneText)) then
        BrailleAddString (g_sGuiStatusPaneText, 0, 0, 0)
      endif
      if (!StringIsBlank (g_sGuiStatusPaneTooltip)) then
        BrailleAddString (g_sGuiStatusPaneTooltip, 0, 0, 0)
      endif
      */
      return true
    endif
  endif

  if (nType == WT_BUTTON) then
    if (!StringIsBlank (g_sPlayButtonLabel)) then
      BrailleAddString (g_sPlayButtonLabel, GetCursorCol(), GetCursorRow(), 0)
      return true
    endif
  endif

  return false

EndFunction

int Function BrailleAddObjectType (int nType)
var
  int nActualType,
  string sInfo

  if (IsInputField () == GUI_IF_INPUTFIELDCONTROL) then
    if (g_bInputFieldButtonActivated) then
      return true
    endif
  endif

  if (g_bIsFooter) then
    BrailleAddString (msgBrlFooter, 0, 0, 0)
  elif (g_nUserInterfaceGuideline < GUI_UI_GUIDELINE_BELIZE) then
    if (g_bIsCombinedToolbar) then
      BrailleAddString (BrailleGetSubTypeString (WT_TOOLBAR), 0, 0, 0)
    elif (g_bIsSystemToolbar) then
      BrailleAddString (msgBrlSystemToolbar, 0, 0, 0)
    elif (g_bIsApplicationToolbar) then
      BrailleAddString (msgBrlApplicationToolbar, 0, 0, 0)
    endif
  else /* Belize theme or newer */
    if (!g_bIsFooter && (g_nGuiComponentParentType == GUI_TC_TOOLBAR)) then
      BrailleAddString (BrailleGetSubTypeString (WT_TOOLBAR), 0, 0, 0)
    endif
  endif

  if (nType == WT_STATUSBAR) then
    if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
      if (!g_bIsFooter) then
        BrailleAddString (BrailleGetSubTypeString(WT_STATUSBAR), 0, 0, 0)
      endif
      if (g_bGuiStatusPaneIsLink) then
        BrailleAddString (BrailleGetSubTypeString(WT_LINK), 0, 0, 0)
      else
        if (g_bGuiStatusPaneIsInfoArea) then
          if (StringCompare (g_sGuiStatusPaneName, sStatusPaneButtonMenu, true) == 0) then
            BrailleAddString (BrailleGetSubTypeString(WT_BUTTONMENU), 0, 0, 0)
          endif
        endif
      endif
      return true
    endif
  endif

  /*
   * ROM: added 2009/10/19 for displaying read-only status along with type (without intefering space)
   */

  let nActualType = nType - WT_CUSTOM_CONTROL_BASE

  if ((nActualType != GUI_WT_CHECKBOX) && (nActualType != GUI_WT_RADIOBUTTON) &&
      (nActualType != GUI_WT_BUTTON) && (nActualType != GUI_WT_TEXTFIELD) &&
      (nActualType != GUI_WT_CTEXTFIELD) && (nActualType != GUI_WT_COMBOBOX) &&
      (nActualType != GUI_WT_PASSWORDFIELD) && (nActualType != GUI_WT_GRIDVIEW)) then
    return FALSE
  endif

  ; if (g_nGuiComponentType == GUI_TC_TEXTFIELD) then
  if (!g_bGuiComponentChangeable) then
    let sInfo = BrailleGetSubTypeString (nType)
    let sInfo = msgBrlStateReadOnly + sInfo
    BrailleAddString (sInfo, 0, 0, 0)
    return TRUE
  endif
  ; endif

  return FALSE

EndFunction

int function BrailleAddObjectValue (int nType)
var
  string info = ""

  if (nType == WT_STATUSBAR) then
    if (g_nGuiComponentType == GUI_TC_STATUSPANE) then
      info = g_sGuiStatusPaneText
      if (!StringIsBlank (g_sGuiStatusPaneTooltip) && (StringCompare (g_sGuiStatusPaneText, g_sGuiStatusPaneTooltip, false) != 0)) then
        info = info + cscSpace + g_sGuiStatusPaneTooltip
      endif
      BrailleAddString (info, 0, 0, 0)
      return true
    endif
  endif

  return false

endfunction

Script BrailleNextLine ()

  if (GetBrailleMode () == BRL_MODE_STRUCTURED) then
    NextLine ()
    if (!IsJawsCursor ()) then
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
    endif
    return
  endif

  PerformScript BrailleNextLine ()

EndScript

Script BraillePriorLine ()

  if (GetBrailleMode () == BRL_MODE_STRUCTURED) then
    PriorLine ()
    if (!IsJawsCursor ()) then
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
    endif
    return
  endif

  PerformScript BraillePriorLine ()

EndScript

Script BrailleRouting ()
var
  int x,
  int y,
  int cell

  /* TODO! Update handling of routing keys */

  let cell = GetLastBrailleRoutingKey ()
  let x = GetBrailleCellColumn (cell)
  let y = GetBrailleCellRow (cell)

  if ((x<=1) && (y<=1)) then
    return
  endif

  PerformScript BrailleRouting ()

  if (GetBrailleMode () == BRL_MODE_STRUCTURED) then
    if (g_nGuiComponentType != GUI_TC_UNKNOWN) then
      if (!IsJawsCursor () && !CaretVisible ()) then
        UpdateCurrentGuiComponent ()
        SayCurrentGuiComponent ()
      endif
    endif
  endif

EndScript

/*
 **********************************************************************
 ** Special keyboard scripts and functions
 **********************************************************************
*/

int function CheckExitToNWBC ()
var
  int bFound,
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

  let hFocus = GetFocus ()
  let hTopLevelWindow = GetTopLevelWindow (hFocus)
  let hAppWindow = GetAppMainWindow (hFocus)

  let sWindowClass = GetWindowClass (hTopLevelWindow)
  let sAppWindowClass = GetWindowClass (hAppWindow)

  /*
    * changed logic for cases when dialogs are running embedded in BC (2016-01-18 rom)
    * another case added: ((hTopLevelWindow!=hAppWindow) && (hAppWindow==sClassSapFrontend))
    */
  if ((StringCompare (sWindowClass, sClassSapFrontend, true) == 0) || (StringCompare (sAppWindowClass, sClassSapFrontend, true) == 0)) then
    return false
  endif

  /*
   * Performance Assistant is not owned by another window, just check the window class
   */
  if (StringCompare (sWindowClass, sClassDialogContainer, true) == 0) then
    return false
  endif

  if ((hTopLevelWindow != hAppWindow) && (GetWindowClass (hTopLevelWindow) == cWc_dlg32770)) then
    nLevel = 0
    while ((GetWindowClass (hAppWindow) == cWc_dlg32770) && (nLevel < 10))
      hAppWindow = GetAppMainWindow (hAppWindow)
      nLevel = nLevel + 1
    endwhile
    if (StringCompare (GetWindowClass (hAppWindow), sClassSapFrontend, true) == 0) then
      return false
    endif
    let hFound = FindWindow (hAppWindow, sClassSapFrontend)
    if (hFound) then
      return false
    endif
  endif

  ; Check parent windows  of focused window for SAP_FRONTEND_EMBEDDED
  let bFound = false
  if ((hTopLevelWindow != hAppWindow) && (GetWindowClass (hTopLevelWindow) == cWc_dlg32770)) then
    let hFound = FindWindow (hAppWindow, sClassSapEmbeddedFrontend)
      if (hFound) then
        let bFound = true
      endif
    endif

  if (!bFound) then
    let hRun = hFocus
    while (hRun && !bFound)
      let sWindowClass = GetWindowClass (hRun)
      let bFound = (StringCompare (sWindowClass, sClassSapEmbeddedFrontend, true) == 0)
      let hRun = GetParent (hRun)
    endwhile
  endif

  if (!bFound) then
    SwitchToConfiguration (sConfNWBC)
    return true
  endif

  return false

endFunction

Int Function HandleGeneralNavigationKey (int nDelay)

  let g_bHandledByNavigationKey = false

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    ResetGuiComponent ()
    return true
  endif

  Delay (nDelay, false)

  if (CheckExitToNWBC ()) then
    return true
  endif

  if (g_bFocusChanged) then
    return (false)
  endif

  let g_nObjectTypeCode = GetCurrentSubtypeCode ()

  ; ROM 2012/08/06 - removed this and other occurences of calls to GetObjectSubtypeCode as newer JAWS versions
  ; return an object type code of a previously focused object when encountering an unknown object.
  ; This was first observed in JAWS 12 but in JAWS 13 a refresh does not change the situation anymore.

  ; if (!g_nObjectTypeCode) then
    ; MSAARefresh ()
    ; let g_nObjectTypeCode = GetObjectSubtypeCode (true)
  ; endif

  if ((g_nObjectTypeCode != WT_UNKNOWN) && (g_nObjectTypeCode != WT_SYSTRAY) && (g_nObjectTypeCode != WT_TOOLBAR) && (g_nObjectTypeCode != WT_BUTTON)) then
    ; ResetGuiComponent ()
    return false
  endif

  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
  if (IsSAPGUIActive ()) then
    UpdateCurrentGuiComponent ()
    if (g_nGuiComponentType == GUI_TC_GUISHELL) then
      ; if ((g_sGuiComponentSubType == sGuiTextEdit) || (g_sGuiComponentSubType == sGuiAbapEditor) || (g_sGuiComponentSubType == sGuiCalendar)) then
      if ((g_sGuiComponentSubType == sGuiTextEdit) || (g_sGuiComponentSubType == sGuiAbapEditor)) then
        return true
      endif
    endif
    if ((g_nGuiComponentType == GUI_TC_UNKNOWN) || (g_nGuiComponentType == GUI_TC_OKCODEFIELD) || (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH)) then
      return false
    endif

    /*
    ; Change by LNB to Fix the problem of  double announcemnt for toolbar buttons
    if (g_bIsApplicationToolbar && g_nGuiComponentType == GUI_TC_BUTTON)  then
      if (!CompareStrings (g_sGuiComponentPreviousParentId, g_sGuiComponentParentId)) then
        if (g_bIsSystemToolbar) then
          Say (msgSystemToolbar, OT_CONTROL_GROUP_NAME)
        elif (g_bIsApplicationToolbar) then
          Say (msgApplicationToolbar, OT_CONTROL_GROUP_NAME)
        endif
        ; SayCurrentGuiButton ()
      endif
      return TRUE
    endif
    */

    if (g_nGuiComponentPreviousType == GUI_TC_OKCODEFIELD) then
      return true
    endif

    let g_bHandledByNavigationKey = true
    ScheduleFunction ("SayCurrentGuiComponent", 2)
  endif

  return true

EndFunction

/*
 * TabKey/ShiftTabKey
 */

Script OnAnyNavigationalKey ()
  TypeCurrentScriptKey ()
  HandleGeneralNavigationKey (0)
EndScript

Script TabKey ()
  PerformScript Tab ()
  HandleGeneralNavigationKey (2)
EndScript

Script ShiftTabKey ()
  PerformScript ShiftTab ()
  HandleGeneralNavigationKey (2)
EndScript

script Enter ()
  PerformScript Enter ()
  if (IsSAPGUIActive ()) then
    if ((g_nGuiComponentType != GUI_TC_COMBOBOX) && ((g_nGuiComponentType != GUI_TC_GUISHELL) || (g_sGuiComponentSubType != sGuiComboBox))) then
      return
    endif
      ; combobox
      UpdateCurrentGuiComponent ()
      SayCurrentGuiCombobox ()
  endif

endScript

Script RightAltTabKey ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (2)
EndScript

Script RightAltShiftTabKey ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (2)
EndScript

Script CtrlTab ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  ; PerformScript NextDocumentWindow ()
  HandleGeneralNavigationKey (2)
EndScript

Script CtrlShiftTab ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  ; PerformScript PreviousDocumentWindow ()
  HandleGeneralNavigationKey (2)
EndScript


/*
Script CtrlCursorUp ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)
EndScript

Script CtrlCursorDown ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)
EndScript

 ; tg : 16.06.2004 : replaces key assignment in Default.jkm for SayNext/PriorWord !?!
Script CtrlCursorLeft ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)
EndScript

Script CtrlCursorRight ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)
EndScript
*/

Script CtrlI ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)
EndScript

Script CtrlQ ()
var
  handle hWinParent,
  string sTooltip,
  object oGuiComponent

  TypeCurrentScriptKey ()
  ; SayCurrentScriptKeyLabel ()

  let g_nObjectTypeCode = GetWindowSubTypeCode (GetCurrentWindow ())
  if (!g_nObjectTypeCode) then
    let g_nObjectTypeCode = GetObjectSubTypeCode ()
  endif

  if ((g_nObjectTypeCode == WT_SYSTRAY) || (g_nObjectTypeCode == WT_TOOLBAR)) then
    let hWinParent = GetParent (GetCurrentWindow ())
    if (StringCompare (GetWindowClass (hWinParent), sTextEditClass, true) == 0) then
      return
    endif
  endif

  let sTooltip = ""
  if (g_nGuiComponentType != GUI_TC_UNKNOWN) then
    if (g_nGuiComponentType == GUI_TC_GUISHELL) then
      if (g_sGuiComponentSubType == sGuiGridView) then
        if (g_iGuiGridToolbarFocusButton == -1) then
          let sTooltip = g_sCellTooltip
          if (StringCompare (g_sCellTooltip, g_sGuiGridColumnTooltip, false) != 0) then
            let sTooltip = sTooltip + cscSpace + g_sGuiGridColumnTooltip
          endif
        else
          let sTooltip = sTooltip + cscSpace + g_sToolbarButtonTooltip
        endif
        if (!StringIsBlank (sTooltip)) then
          Say (sTooltip, OT_JAWS_MESSAGE)
        endif
        return
      endif
      if (g_sGuiComponentSubType == sGuiTree) then
        let sTooltip = g_sItemTooltip
        if (StringCompare (g_sItemTooltip, g_sNodeTooltip, false) != 0) then
          let sTooltip = sTooltip + cscSpace + g_sNodeTooltip
        endif
        if (!StringIsBlank (sTooltip)) then
          Say (sTooltip, OT_JAWS_MESSAGE)
        endif
        return
      endif
    endif
    let sTooltip = g_sGuiComponentTooltip
    if (!StringIsBlank (g_sGuiComponentAccTooltip)) then
      if (StringCompare (g_sGuiComponentTooltip, g_sGuiComponentAccTooltip, false) != 0) then
        let sTooltip = g_sGuiComponentAccTooltip + cscSpace + sTooltip
      endif
    endif
    if (!StringIsBlank (g_sGuiComponentParentColumnTooltip)) then
      let sTooltip = sTooltip + cscSpace + g_sGuiComponentParentColumnTooltip
    endif

    if (!StringIsBlank (sTooltip)) then
      Say (sTooltip, OT_JAWS_MESSAGE)
    endif
  endif

EndScript

Script ShiftCursorUp ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript selectPriorLine ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript selectPriorLine ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript selectPriorLine ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif

  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)

EndScript

Script ShiftCursorDown ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript selectNextLine ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript selectNextLine ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript selectNextLine ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif

  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (1)

EndScript

Script SelectToEndOfLine ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectToEndOfLine ()
EndScript

Script SelectFromStartOfLine ()
  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectFromStartOfLine ()
EndScript

Script SelectNextCharacter ()
  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectNextCharacter ()
EndScript

Script SelectPriorCharacter ()
  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectPriorCharacter ()
EndScript

Script SelectNextWord ()
  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectNextWord ()
EndScript

Script SelectPriorWord ()
  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorNewSelection ()
    return
  endif
  PerformScript SelectPriorWord ()
EndScript

Script AltCursorUp ()
var
  int bListActive

  let g_nObjectTypeCode = GetObjectSubTypeCode ()
  if (g_nObjectTypeCode != WT_UNKNOWN) then
    if (g_nObjectTypeCode == WT_EDITCOMBO) then
      if ((g_nGuiComponentType == GUI_TC_OKCODEFIELD) || (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH)) then
        Say (cmsg42_L, OT_JAWS_MESSAGE)
      endif
    endif
    PerformScript CloseListBox ()
    return
  endif

  let bListActive = g_bGuiComboboxIsListboxActive
  TypeCurrentScriptKey ()
  Delay (2)

  if (IsSAPGUIActive ()) then
    UpdateCurrentGuiComponent ()
    if (g_nGuiComponentType != GUI_TC_COMBOBOX) then
      SayCurrentScriptKeyLabel ()
      return
    endif
    ; GuiCombobox
    if (bListActive) then
      Say (cmsg42_L, OT_JAWS_MESSAGE) ; "close list box"
    endif
    ; let g_bGuiComboboxIsValid = FALSE
    ; GetCurrentGuiCombobox ()
    SayCurrentGuiCombobox ()
  endif
EndScript

Script AltCursorDown ()
  let g_nObjectTypeCode = GetObjectSubTypeCode ()
  if (g_nObjectTypeCode != WT_UNKNOWN) then
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView) && (g_sGuiGridCellType == sGuiValueList)) then
      TypeCurrentScriptKey ()
      Delay (2, TRUE)
      Say (cmsg41_L, OT_JAWS_MESSAGE) ; "open list box"
      SayCurrentGuiShell ()
      return
    endif
    if (g_nObjectTypeCode == WT_EDITCOMBO) then
      if ((g_nGuiComponentType == GUI_TC_OKCODEFIELD) || (g_nGuiComponentType == GUI_TC_VHVIEWSWITCH)) then
        Say (cmsg41_L, OT_JAWS_MESSAGE) ; "open list box"
      endif
    endif
    PerformScript OpenListBox ()
    return
  endif
  if (IsSAPGUIActive ()) then
    TypeCurrentScriptKey ()
    Delay (2, TRUE)
    UpdateCurrentGuiComponent ()
    if (g_nGuiComponentType == GUI_TC_COMBOBOX) then
      ; GuiCombobox
      Say (cmsg41_L, OT_JAWS_MESSAGE) ; "open list box"
      ; let g_bGuiComboboxIsValid = FALSE
      ; GetCurrentGuiCombobox ()
      SayCurrentGuiCombobox ()
    else
      SayCurrentScriptKeyLabel ()
    endif
    return
  endif

  PerformScript OpenListBox ()

EndScript

Script SelectCurrentItem ()
Var
  string s

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript SelectCurrentItem ()
    ; SayCurrentObject ()
    return
  endif

  if (IsSAPGUIActive ()) then

    if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then

      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Delay (2, FALSE)
      let g_sGuiComponentId = ""
      UpdateCurrentGuiComponent ()

      let s = msgLstColumn + cscSpace + g_sGuiComponentParentColumnName
      if (g_bCurColIsSelected) then
        let s = s + cscSpace + msgItemsSelected
      else
        let s = s + cscSpace + msgItemsNotSelected
      endif
      Say (s,OT_SELECTED_ITEM)

      return

    elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid))) then

      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Delay (2, FALSE)
      let g_sGuiComponentId = ""
      UpdateCurrentGuiComponent ()

      if (g_sGuiComponentSubType == sGuiGridView) then
        let s = msgLstColumn + cscSpace + g_sGuiGridColumnTitle
      else
        let s = msgLstColumn + cscSpace + g_sGuiCtrlApoGridColumnHeader
      endif

      if (g_bCurColIsSelected) then
        let s = s + cscSpace + msgItemsSelected
      else
        let s = s + cscSpace + msgItemsNotSelected
      endif
      Say (s, OT_SELECTED_ITEM)

      return

    elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
      TypeCurrentScriptKey ()
      if (g_iAutoCompletionID != 0) then
        UnscheduleFunction (g_iAutoCompletionID)
      endif
      let g_iAutoCompletionID = ScheduleFunction ("HandleAutoCompletion", 4)
    endif

  endif

  PerformScript SelectCurrentItem ()

EndScript

/* ROM: new in version 2.33 */

Script SelectAll ()
var
  int bSelectedAll,
  int nSelCols,
  int nFirstSelRow,
  int nLastSelRow,
  object oFocus,
  object oSelCols,
  string sSelRows

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript SelectAll ()
    ; SayCurrentObject ()
    return
  endif

  if (IsSAPGUIActive ()) then

    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView) && (g_iGuiGridToolbarFocusButton == -1)) then

      if (CaretVisible ()) then
        PerformScript SelectAll ()
        return
      endif

      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Pause ()

      if (IsSAPGUISessionBusy (10, true)) then
        Say (msgSapGuiSessionBusy, OT_ERROR)
        return
      endif

      let oFocus = GetSAPGUIFocus ()
      let sSelRows = oFocus.SelectedRows
      let oSelCols = oFocus.SelectedColumns
      let nSelCols = oSelCols.Count

      let bSelectedAll = false
      if (nSelCols == g_iGuiGridColumnCount) then
        if (!StringIsBlank (sSelRows) && (g_iGuiGridRowCount > 0)) then
          let nFirstSelRow = StringToInt (StringSegment (sSelRows, "-", 1))
          let nLastSelRow = StringToInt (StringSegment (sSelRows, "-", 2))
          if ((nLastSelRow-nFirstSelRow+1) == g_iGuiGridRowCount) then
            let bSelectedAll = true
          endif
        endif
      endif

      ; MessageBox (sSelRows + " : " + IntToString (nFirstSelRow) + "-" + IntToString (nLastSelRow) + " / " + IntToString (g_iGuiGridRowCount))

      let oFocus = oNull
      ExitSAPGUIFrame ()

      if (g_iGuiGridRowCount > 0) then
        if (bSelectedAll) then
          Say (cmsg215_L,OT_SELECT)
        else
          Say (cmsg214_L,OT_SELECT)
        endif
      endif

      UpdateCurrentGuiComponent ()
      return

    endif

  endif

  PerformScript SelectAll ()

EndScript

/* Info about selected rows  in ALV/TableControl  */

Script ShiftSpace ()
var
  int sayAllSwitch,
  string s

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    TypeCurrentScriptKey ()
    ; SayCurrentObject ()
    return
  endif

  if (IsSAPGUIActive ()) then

    if (g_nGuiComponentParentType == GUI_TC_TABLECONTROL) then
      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Delay (2, FALSE)

      if (g_bGuiComponentSameAsPrevious) then
        let sayAllSwitch = OFF
      endif
      SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)

      let g_sGuiComponentId = ""
      UpdateCurrentGuiComponent ()

      let s = FormatString (msgTablePositionRows, IntToString(g_iGuiTableControlCurRow), IntToString(g_iGuiTableControlRowCount))
      if (g_bCurRowIsSelected) then
        let s = s + cscSpace + msgItemsSelected
      else
        let s = s + cscSpace + msgItemsNotSelected
      endif
      Say (s, OT_SELECTED_ITEM)

      return

    elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && ((g_sGuiComponentSubType == sGuiGridView) || (g_sGuiComponentSubType == sGuiCtrlApoGrid))) then

      /* ALV / APO */

      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Delay (2, FALSE)

      if (g_bGuiComponentSameAsPrevious) then
        let sayAllSwitch = OFF
      endif
      SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)

      let g_sGuiComponentId = ""
      UpdateCurrentGuiComponent ()

      if (g_sGuiComponentSubType == sGuiGridView) then
        let s = FormatString(msgALVPositionRows,IntToString(g_iGuiGridCurRow),IntToString(g_iGuiGridRowCount))
      else
        let s = FormatString(msgTablePositionRows,IntToString(g_nGuiCtrlApoGridCurrentRow),IntToString(g_nGuiCtrlApoGridRowCount))
        let s = s + cscSpace + g_sGuiCtrlApoGridRowHeader + cscSpace
      endif

      if (g_bCurRowIsSelected) then
        let s = s + cscSpace + msgItemsSelected
      else
        let s = s + cscSpace + msgItemsNotSelected
      endif
      Say (s, OT_SELECTED_ITEM)

      return

    elif ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTree)) then

      /* tree */

      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      Delay (2, FALSE)

      if (g_bGuiComponentSameAsPrevious) then
        let sayAllSwitch = OFF
      endif
      SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)

      let g_sGuiComponentId = ""
      UpdateCurrentGuiComponent ()

      if (g_iNodesCount>0) then
        ; if ((g_iGuiCtrlTreeSelectionMode == GUI_SM_MULTIPLE_NODE) || (g_iGuiCtrlTreeSelectionMode == GUI_SM_MULTIPLE_ITEM)) then
          ; Say number of selected nodes

          if (g_bNodeIsSelected) then
            let s = msgItemsSelected
          else
            let s = msgItemsNotSelected
          endif
          Say (s, OT_SELECTED_ITEM)

          if ((g_iNodesCount>1) && ShoulditemSpeak (OT_SELECTED_ITEM)) then
            let s = FormatString(msgTreeSelectedNodeCount, IntToString(g_iNodesCount))
            Say (s, OT_SELECTED_ITEM)
          endif
        ; endif
      endif

      return

    endif

  endif

  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()

EndScript

Script JAWSBackspace ()
var
  string strChar

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    PerformScript JAWSBackspace ()
    return
  endif

  if (IsPCCursor () && CaretVisible ()) then
    if ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD)) then
      SaveCursor ()
      RouteInvisibleToPC ()
      InvisibleCursor ()
      PriorCharacter ()
      let strChar = GetCharacter ()
      if strChar == cScNull then
	      let strChar = msgBlank
      elif strChar == cScSpace then
	      let strChar = cMsgSpace1
      endif
      RestoreCursor ()
      Say (strChar, OT_CHAR)
      TypeKey (cksSapBackspace)
      return
    endif
  endif

  PerformScript JAWSBackspace ()
EndScript

Script SayNextLine ()
var
  int sayAllSwitch

  if (IsSAPGUIActive() && (g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
    NextLine ()
    return
  endif

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayNextLine ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript sayNextLine ()
    return
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if (g_sGuiComponentSubType == sGuiTextEdit) then
      NextLine ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiTextEdit (1)
      return
    elif (g_sGuiComponentSubType == sGuiGridView) then
      NextLine ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiGridView ()
      return
    endif
  endif

  NextLine ()

  let sayAllSwitch = ON
  if ((CheckCurrentObject () == 0)) then
    SayStandardWindow ()
    return
  endif

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorLine ()
    return
  endif

  if (g_bFlushing) then
    if (g_nGuiComponentType == GUI_TC_RADIOBUTTON)
      /* speak on after round trip */
      return
    endif
  endIf

  SayCurrentGuiComponent ()

EndScript

Script SayPriorLine ()
var
  int sayAllSwitch

  if (IsSAPGUIActive() && (g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiComboBox)) then
    PriorLine ()
    return
  endif

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayPriorLine ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    PerformScript sayPriorLine ()
    return
  endif

  if (g_nGuiComponentType == GUI_TC_GUISHELL) then
    if (g_sGuiComponentSubType == sGuiTextEdit) then
      PriorLine ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiTextEdit (1)
      return
    elif (g_sGuiComponentSubType == sGuiGridView) then
      PriorLine ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiGridView ()
      return
    endif
  endif

  PriorLine ()

  let sayAllSwitch = ON
  if ((CheckCurrentObject () == 0)) then
    SayStandardWindow ()
    return
  endif

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCurrentGuiAbapEditorLine ()
    return
  endif

  if (g_bFlushing) then
    if (g_nGuiComponentType == GUI_TC_RADIOBUTTON)
      /* speak on after round trip */
      return
    endif
  endIf

  SayCurrentGuiComponent ()

EndScript

Script SayPriorCharacter ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayPriorCharacter ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    PerformScript sayPriorCharacter ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript sayPriorCharacter ()
    return
  endif

  PriorCharacter ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCharacter ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    SayStandardWindow ()
    return
  endif

  Delay (1)
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
  if ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD)
    || (g_nGuiComponentType == GUI_TC_PASSWORDFIELD)) then
    SayCurrentGuiPasswordFieldCharacter ()
    return
  endif

  UpdateCurrentGuiComponent ()

   if (g_nGuiComponentType == GUI_TC_LABEL) then
    if (g_bGuiComponentSameAsPrevious) then
      SayCharacter ()
      return
    endif
  endif

  if (g_bFlushing) then
    if (g_nGuiComponentType == GUI_TC_RADIOBUTTON)
      /* speak on after round trip */
      return
    endif
  endIf

 SayCurrentGuiComponent ()

EndScript

Script SayNextCharacter ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayNextCharacter ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive ()) || (InHJDialog ())) then
    PerformScript sayNextCharacter ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript sayNextCharacter ()
    return
  endif

  NextCharacter ()


  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayCharacter ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    SayStandardWindow ()
    return
  endif

  Delay (1)
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, ON)
  if ((g_nGuiComponentType == GUI_TC_TEXTFIELD) || (g_nGuiComponentType == GUI_TC_CTEXTFIELD)
    || (g_nGuiComponentType == GUI_TC_PASSWORDFIELD)) then
    SayCurrentGuiPasswordFieldCharacter ()
    return
  endif

  UpdateCurrentGuiComponent ()

  if (g_nGuiComponentType == GUI_TC_LABEL) then
    if (g_bGuiComponentSameAsPrevious) then
      SayCharacter ()
      return
    endif
  endif

  if (g_bFlushing) then
    if (g_nGuiComponentType == GUI_TC_RADIOBUTTON)
      /* speak on after round trip */
      return
    endif
  endIf

  SayCurrentGuiComponent ()

EndScript

Script SayPriorWord ()
var
  int sayAllSwitch

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayPriorWord ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript sayPriorWord ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript sayPriorWord ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    PerformScript sayPriorWord ()
    return
  endif

  let sayAllSwitch = ON
  PriorWord ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayWord ()
    return
  endif

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)
  SayCurrentGuiComponent ()

EndScript

Script SayNextWord ()
var
  int sayAllSwitch

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript sayNextWord ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript sayNextWord ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript sayNextWord ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    PerformScript sayNextWord ()
    return
  endif

  let sayAllSwitch = ON
  NextWord ()

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    SayWord ()
    return
  endif

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)
  SayCurrentGuiComponent ()

EndScript

Script ControlUpArrow ()
var
  int sayAllSwitch

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript controlUpArrow ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript controlUpArrow ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript controlUpArrow ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    PerformScript controlUpArrow ()
    return
  endif

  let sayAllSwitch = ON
  TypeKey (cksSapControlUpArrow)

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)
  SayCurrentGuiComponent ()

EndScript

Script ControlDownArrow ()
var
  int sayAllSwitch

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript controlDownArrow ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript controlDownArrow ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript controlDownArrow ()
    return
  endif

  if ((CheckCurrentObject () == 0)) then
    PerformScript controlDownArrow ()
    return
  endif

  let sayAllSwitch = ON
  TypeKey (cksSapControlDownArrow)

  Delay (1)
  UpdateCurrentGuiComponent ()
  if (g_bGuiComponentSameAsPrevious) then
    let sayAllSwitch = OFF
  endif
  SetLocalOutputMode (OT_CONTROL_GROUP_NAME, sayAllSwitch)
  SayCurrentGuiComponent ()

EndScript

Script PageUpKey ()
  if (!IsPCCursor ()) then
    jawsPageUp ()
    return
  endif

  if (IsSAPGUIActive ()) then
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
      PerformScript jawsPageUp ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiTextEdit(1)
      return
    endif
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
      PerformScript jawsPageUp ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiAbapEditorLine ()
      return
    endif

    if ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentParentType == GUI_TC_TABLECONTROL)
        || (g_nGuiComponentType == GUI_TC_GUISHELL) || (g_nGuiComponentType == GUI_TC_LABEL)) then
      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      HandleGeneralNavigationKey (2)
      return
    endif
  endif
  jawsPageUp ()

EndScript

Script PageDownKey ()
  if (!IsPCCursor ()) then
    jawsPageDown ()
    return
  endif

  if (IsSAPGUIActive ()) then
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
      PerformScript jawsPageDown ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiTextEdit (1)
      return
    endif
    if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
      PerformScript jawsPageDown ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiAbapEditorLine ()
      return
    endif
    if ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentParentType == GUI_TC_TABLECONTROL)
        || (g_nGuiComponentType == GUI_TC_GUISHELL) || (g_nGuiComponentType == GUI_TC_LABEL)) then
      TypeCurrentScriptKey ()
      SayCurrentScriptKeyLabel ()
      HandleGeneralNavigationKey (2)
      return
    endif
  endif
  jawsPageDown ()

EndScript

Script HomeKey ()
  if (!IsPCCursor ()) then
    jawsHome ()
    return
  endif

  if (IsSAPGUIActive () && (g_nGuiComponentType == GUI_TC_GUISHELL)) then
    if (g_sGuiComponentSubType == sGuiTextEdit) then
      PerformScript JawsHome ()
      UpdateCurrentGuiComponent ()
      SayCharacter ()
      ;SayCurrentGuiTextEdit (1)
      return
    endif
    if (g_sGuiComponentSubType == sGuiToolbar) then
      PerformScript JawsHome ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  if (IsSAPGUIActive () && ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentType == GUI_TC_LABEL)
      || (g_nGuiComponentType == GUI_TC_TAB))) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentType == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER || g_nGuiComponentType == GUI_TC_DOCKSHELL) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  endIf

  jawsHome ()
EndScript

Script EndKey ()
  if (!IsPCCursor ()) then
    jawsEnd ()
    return
  endif

   if (IsSAPGUIActive () && (g_nGuiComponentType == GUI_TC_GUISHELL)) then
    if (g_sGuiComponentSubType == sGuiTextEdit) then
      PerformScript JawsEnd ()
      UpdateCurrentGuiComponent ()
      SayCharacter ()
      ;SayCurrentGuiTextEdit (1)
      return
    endif
    if (g_sGuiComponentSubType == sGuiToolbar) then
      PerformScript JawsEnd ()
      UpdateCurrentGuiComponent ()
      SayCurrentGuiComponent ()
      return
    endif
  endif

  if (IsSAPGUIActive () && ((g_nGuiComponentType == GUI_TC_COMBOBOX) || (g_nGuiComponentType == GUI_TC_LABEL)
      || (g_nGuiComponentType == GUI_TC_TAB))) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    HandleGeneralNavigationKey (2)
    return
  endif

  if (g_nGuiComponentType == GUI_TC_SPLITTERSHELL || g_nGuiComponentType == GUI_TC_SPLITTERCONTAINER || g_nGuiComponentType == GUI_TC_DOCKSHELL) then
    TypeCurrentScriptKey ()
    SayCurrentScriptKeyLabel ()
    UpdateCurrentGuiComponent ()
    SayCurrentGuiComponent ()
    return
  endIf

  jawsEnd ()
EndScript

Script TopOfFile ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript TopOfFile ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript TopOfFile ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    SayCurrentScriptKeyLabel ()
    JawsTopOfFile ()
    UpdateCurrentGuiComponent ()
    SayCurrentGuiTextEdit (1)
    return
  endif

  PerformScript TopOfFile()

EndScript

Script BottomOfFile ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript BottomOfFile ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript BottomOfFile ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    SayCurrentScriptKeyLabel ()
    JawsBottomOfFile ()
    UpdateCurrentGuiComponent ()
    SayCurrentGuiTextEdit (1)
    return
  endif

  PerformScript BottomOfFile()

EndScript

Script CtrlShiftF11 ()
  TypeCurrentScriptKey ()
  SayCurrentScriptKeyLabel ()
  HandleGeneralNavigationKey (4)
EndScript

Script SapViewSysTrayItems ()
  ; just invoke the ViewSysTrayItems script
  PerformScript ViewSysTrayItems ()
EndScript

Script SaySelectedText ()
var
  string sText,
  int bSpell

  let bSpell = IsSameScript ()

  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript SaySelectedText ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript SaySelectedText ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    let sText = GetCurrentGuiAbapEditorSelection ()
    if (!StringIsBlank (sText)) then
      if (bSpell) then
       Say (sText, OT_SPELL)
      else
        Say (sText, OT_USER_REQUESTED_INFORMATION)
      endif
    else
      Say (cmsgNothingSelected, OT_ERROR)
    endif
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    let sText = GetCurrentGuiTextEditSelection ()
    if (!StringIsBlank (sText)) then
      if (bSpell) then
       Say (sText, OT_SPELL)
      else
        Say (sText, OT_USER_REQUESTED_INFORMATION)
      endif
    else
      Say (cmsgNothingSelected, OT_ERROR)
    endif
    return
  endif

  ; PerformScript SaySelectedText ()

EndScript

; ROM 2011/02/28 - use standard shortcut JAWSKey+DownArrow to read current element or
; to read all text when within an text editor
Script SayAll ()
  if (!IsSAPGUIActive () || !IsPCCursor ()) then
    PerformScript SayAll ()
    return
  endif

  if ((UserBufferIsActive ()) || (MenusActive () == ACTIVE) || (InHJDialog ())) then
    PerformScript SayAll ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiTextEdit)) then
    PerformScript SayAll ()
    return
  endif

  if ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiAbapEditor)) then
    PerformScript SayAll ()
    return
  endif

  PerformScript SayCurrentElement ()

EndScript

/*
 **********************************************************************
 ** Misc scripts and stuff
 **********************************************************************
*/

Function Unknown (string TheName, int IsScript)
  ; do nothing
  return
EndFunction

void Function SayWarningMessage ()
var
  handle hwnd

  if (g_iWarningMessage != 0) then
    UnscheduleFunction (g_iWarningMessage)
  endif
  let g_iWarningMessage = 0
  let g_oGuiComponent = GetSAPGUIFocus ()
  if (!g_oGuiComponent) then
    if (!IsSAPGUIActive () || !IsSAPGUISessionActive ()) then
      ; try to avoid reading out passwords
      let hwnd = GetFocus ()
      if ((GetWindowTypeCode (hwnd) == WT_UNKNOWN) && (GetTopLevelWindow (hwnd) == GetAppMainWindow (hwnd))) then
        SayMessage (OT_JAWS_MESSAGE, msgSapGuiScriptsNotRunning)
      endif
    endif
    ResetGuiComponent ()
  endif

EndFunction

Script SayStatusMessage ()
var
  object oStatusBar,
  string sText

  let sText = ""
  let oStatusBar = GetGuiStatusBar ()
  if (oStatusBar) then
    let sText = oStatusBar.Text
  endIf

  let oStatusBar = oNull

  if (StringIsBlank (sText)) then
    Say (msgNoStatusBarMessage, OT_JAWS_MESSAGE)
    return
  endif

  BrailleMessage (sText)

  if (g_iStatusbarID != 0) then
    UnscheduleFunction (g_iStatusbarID)
  endif
  let g_iStatusbarID = ScheduleFunction ("HandleGuiStatusBarMessage", 2)

EndScript

Script SaySessionInfo ()
var
  object oSessionInfo,
  string sInfo,
  string sNext

  if (!IsSAPGUISessionActive ()) then
    GetSAPGUISession ()
    if (!IsSAPGUISessionActive ()) then
      if (g_iWarningMessage != 0) then
        UnscheduleFunction (g_iWarningMessage)
      endif
      let g_iWarningMessage = ScheduleFunction ("SayWarningMessage", 10)
      return
    endif
  endif

  let oSessionInfo = g_oSAPGUISession.Info
  let sInfo = ""

  let sNext = oSessionInfo.SystemName
  let sInfo = msgSessionInfoSystem + cscSpace + sNext
  let sNext = oSessionInfo.SessionNumber
  let sInfo = sInfo + cscSpace + sNext
  let sNext = oSessionInfo.Client
  let sInfo = sInfo + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.Client
  let sInfo = msgSessionInfoClient + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.User
  let sInfo = msgSessionInfoUser + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.Program
  let sInfo = msgSessionInfoProgram + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.Transaction
  let sInfo = msgSessionInfoTransaction + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.InterpretationTime
  let sInfo = msgSessionInfoInterpretationTime + cscSpace + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let sNext = oSessionInfo.RoundTrips
  let sInfo = msgSessionInfoRoundTrips + "/" + msgSessionInfoFlushes + cscSpace + sNext
  let sNext = oSessionInfo.Flushes
  let sInfo = sInfo + "/" + sNext
  Say (sInfo, OT_SCREEN_MESSAGE)

  let oSessionInfo = oNull

EndScript

Script SayCurrentElement ()

  Refresh (true)

  ResetGuiComponent ()

  ExitSAPGUISession ()
  GetSAPGUISession ()

  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()

  BrailleRefresh ()

EndScript

Script ScriptFileName ()
var
  string sNameAndVersion

  let sNameAndVersion = msgSapGuiAppName + cscSpace + SRX_REVISION
  ScriptAndAppNames (sNameAndVersion)

EndScript

Script RefreshScreen ()

  PerformScript refreshScreen ()

  ResetGuiComponent ()

  ExitSAPGUISession ()
  GetSAPGUISession ()

  UpdateCurrentGuiComponent ()
  SayCurrentGuiComponent ()

  BrailleRefresh ()

EndScript

Script ToggleDebug ()
  if (IsSameScript ()) then
    if (ToggleDebug ()) then
      Say ("Debug mode on", OT_DEBUG)
    else
      Say ("Debug mode off", OT_DEBUG)
    endif
  endif
EndScript

Script AdjustJAWSVerbosity ()
Var
  int nPriorSapGuiAccVerbosity,
  int nPriorSapGuiSteploopMode,
  string sList

  if (IsSpeechOff ()) then
    performScript adjustJAWSVerbosity() ; default
    return
  endIf
  if InHJDialog () then
    SayFormattedMessage (OT_error, cMSG337_L, cMSG337_S)
    return
endIf
  If (IsVirtualPCCursor ()) Then
    performScript adjustJAWSVerbosity() ; default
    return
  endIf

  ;Trying to ensure the option in Insert+V dialog is context sensitive, still appears when the focus is on GridView toolbar
/*  If (((g_nGuiComponentType != GUI_TC_GUISHELL) && (g_sGuiComponentSubType != sGuiGridView)) && (g_nGuiComponentParentType != GUI_TC_TABLECONTROL) && (g_bToolbarIsValid == true)) then
    performScript adjustJAWSVerbosity() ; default
    return
  EndIf*/

  ;save the current value
  let nPriorSapGuiAccVerbosity = g_nSapGuiAccVerbosity
  let nPriorSapGuiSteploopMode = g_nSapGuiSteploopMode

  ;Checking for GridView now as all globals will be reset When Insert+V dialog pops up
  Let g_bIsGridView = false
  If ((g_nGuiComponentType == GUI_TC_GUISHELL) && (g_sGuiComponentSubType == sGuiGridView)) then
    Let g_bIsGridView = true
    else
      Let g_bIsGridView = false
  EndIF

  JAWSVerbosityCore (sList)

  if ((nPriorSapGuiAccVerbosity != g_nSapGuiAccVerbosity) ||
      (nPriorSapGuiSteploopMode != g_nSapGuiSteploopMode)) then
    if saveApplicationSettings() then
      SayMessage (OT_JAWS_MESSAGE, msgAppSettingsSaved)
    else
      SayMessage (OT_ERROR, msgAppSettingsNotSaved)
    endIf
  endif
EndScript

script SayGuiTreeNodeFullText ()
var
  object oFocus

  if ((g_nGuiComponentType != GUI_TC_GUISHELL) || (g_sGuiComponentSubType != sGuiTree)) then
    SayFormattedMessage (OT_JAWS_MESSAGE, msgTreeNotValid)
    return
  endif

  /*
   * Note: this only seems to work in column trees and especially not in list trees
   */

  g_sAllItemsText = ""
  if (g_iGuiCtrlTreeSelectionMode != GUI_SM_SINGLE_NODE) then
    ToggleGuiTreeFullNode ()
    if (!g_bAllItemsTextToggle) then
      BrailleRefresh ()
      return
    endif
  endif

  SayCurrentGuiTree ()

  oFocus = GetSAPGUIFocus ()
  if (!oFocus) then
    return
  endif
  GetCurrentGuiTreeFullNode (oFocus)

  if (StringIsBlank (g_sColumnKey) && !StringIsBlank(g_sAllItemsText)) then
    var string sTemp = ""
    var int nCount = StringSegmentCount (g_sAllItemsText, "|")
    var int i = 0
    while (i < nCount)
      sTemp = StringTrimTrailingBlanks (StringTrimLeadingBlanks (StringSegment (g_sAllItemsText, "|", i+1)))
      if (StringIsBlank (sTemp)) then
        sTemp = msgBlank
      endIf
      SayString (sTemp)
      i = i + 1
    endwhile

    ; BrailleClearMessage ()
    BrailleRefresh ()
  endif

  oFocus = oNull

endScript

/* rom: moved code for HistoryOpened event to other event handling code */

script TestScript ()
endScript
