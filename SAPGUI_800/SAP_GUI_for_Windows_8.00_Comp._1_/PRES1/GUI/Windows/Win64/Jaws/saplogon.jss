
/*
 * JAWS Script file for SAPLogon
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2021/11/29
 */

include "HJConst.jsh"
include "HJGlobal.jsh"
include "common.jsm"
include "MSAAConst.jsh"
include "WinStyles.jsh"

include "sapglobal.jsh"
include "sapfront.jsm"

const
  CID_COMMENT_TOGGLE_BUTTON = 0x0442,  ; control id of the comment toggle button
  CID_COMMENT_MULTILINE_EDIT = 0x044D, ; control id of "comments" edit
  CID_INFORMATION_MULTILINE_EDIT = 0x0CA8, ; control id of "information" edit
  CID_NEWITEM_BUTTON = 0x042E,          ; control id of "new item" menu button
  CID_MORE_BUTTON = 0x801E,             ; control id of "more" menu button,
  CID_OPTIONS_CONTAINER = 0x07D2,      ; control id of container with play buttons
  CID_ERROR_MESSAGE = 0x03FC           ; control id of control containing error/warning messages

const
  WS_THICKFRAME = 0x00040000

globals
  int g_bPlayButtonsInitialized,
  int g_nPlayButtonCount,
  string g_sPlayButtonLabel,
  IntArray g_nPlayButtonIds

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

void function SayTabControl ()
var
  int i,
  int nChildren,
  int nRole,
  int nState,
  string sName,
  object oTabPage,
  object oTabControl

  let oTabControl = GetCurrentObject (0)
  let nRole = oTabControl.accRole(0)
  let nChildren = oTabControl.accChildCount

  ; MessageBox (GetRoleText (nRole) + " - kids=" + IntToString(nChildren))

  let i = 1
  let sName = ""
  while (i <= nChildren)
    let nState = oTabControl.accState(i)
    if (nState & STATE_SYSTEM_SELECTED) then
      let sName = oTabControl.accName(i)
      let i = nChildren+1
    endif
    let i = i + 1
  endWhile

  IndicateControlType (WT_TABCONTROL, sName)

endFunction

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

  if (nType == WT_BUTTON) then
    g_sPlayButtonLabel = ""
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    if ((nControlId == CID_NEWITEM_BUTTON) || (nControlId == CID_MORE_BUTTON)) then
      IndicateControlType (WT_BUTTONMENU, GetObjectName ())
      return
    endif
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
  elif (nType == WT_CHECKBOX) then
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    if (nControlId == CID_COMMENT_TOGGLE_BUTTON) then
      nState = GetObjectStateCode ()
      IndicateControlType (WT_TOGGLE_BUTTON, GetObjectName ())
      if (nState == CTRL_CHECKED) then
        IndicateControlState (WT_TOGGLE_BUTTON, CTRL_PRESSED)
      else
        IndicateControlState(WT_TOGGLE_BUTTON, 0, cmsgNotPressed_l )
      endif
      return
    endif
  endif

  if (nType == WT_READONLYEDIT) then
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    if ((nControlId == CID_COMMENT_MULTILINE_EDIT) || (nControlId == CID_INFORMATION_MULTILINE_EDIT)) then
      IndicateControlType (WT_READONLYEDIT)
      ; SayWindow (hCurWnd, READ_EVERYTHING)
      JAWSTopOfFIle ()
      SayString (GetLine ())
      return
    endif
  endif

  if ((nType == WT_MULTILINE_EDIT) || (nType == WT_EDIT_SPINBOX)) then
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
    nWinStyles = GetWindowStyleBits (hCurWnd)
    if (nWinStyles & ES_MULTILINE) then
      SayMessage (OT_CONTROL_NAME, GetWindowName (GetPriorWindow (hCurWnd)))
      if (nWinStyles & ES_READONLY) then
        IndicateControlState (WT_EDIT, CTRL_READONLY)
      endif
      IndicateControlType (WT_MULTILINE_EDIT)
      return
    endif
  endif

  SayObjectTypeAndText (nLevel)

endFunction

Void function ActiveItemChangedEvent (handle hCurWnd, int nCurObjId, int nCurChildId,
  handle hPrevWnd, int nPrevObjId, int nPrevChildId)
var
  int nType

  let nType = GetObjectSubTypeCode ()
  if (((nType == WT_TREEVIEWITEM) || (nType == WT_TREEVIEWITEM)) && !MenusActive ()) then
    SayTreeViewLevel (false)
    ; SayObjectActiveItem (true)
    return
  elif (nType == WT_LISTBOXITEM) then
    if (StringIsBlank (GetCurrentListViewItemName())) then
      SayString (cmsgBlank1)
    endif
    SayObjectActiveItem (true)
    return
  endif

  ActiveItemChangedEvent (hCurWnd, nCurObjId, nCurChildId, hPrevWnd, nPrevObjId, nPrevChildId)

endFunction

void function ObjStateChangedEvent (handle hObj, optional int iObjType, int nChangedState, int nState, int nOldState)
var
  int nControlId

  if (iObjType == WT_CHECKBOX) then
    nControlId = GetControlID (hObj)
    if (nControlId == CID_COMMENT_TOGGLE_BUTTON) then
       if (nState == CTRL_CHECKED) then
        IndicateControlState (WT_TOGGLE_BUTTON, CTRL_PRESSED)
      elif (nState == CTRL_UNCHECKED) then
        IndicateControlState (WT_TOGGLE_BUTTON, 0, cmsgNotPressed_l)
      endif
      return
    endif
  endif

  ObjStateChangedEvent (hObj,iObjType, nChangedState, nState, nOldState)

endFunction

void function NewTextEventShouldBeSilent (handle hFocusWnd, handle hWnd, string sBuffer,
  int nAttributes, int nTextColor, int nBackgroundColor, int nEcho, string sFrameName)
var
  int nType

  if (StringCompare (GetWindowClass (hWnd), "ListBox", true) == 0) then
    if ((nAttributes&(ATTRIB_TEXT|ATTRIB_HIGHLIGHT)) == (ATTRIB_TEXT|ATTRIB_HIGHLIGHT))then
      nType = GetObjectSubTypeCode ()
      if ((nType == WT_TREEVIEWITEM) && (hFocusWnd != hWnd)) then
        return (true)
      endif
    endif
  endif

  return (NewTextEventShouldBeSilent (hFocusWnd, hWnd, sBuffer, nAttributes, nTextColor, nBackgroundColor, nEcho, sFrameName))

endFunction

; void function NewTextEvent (handle hwnd, string buffer, int nAttributes, int nTextColor, int nBackgroundColor, int nEcho, string sFrameName)
void function ProcessSpeechOnNewTextEvent (handle hFocus, handle hwnd, string buffer, int nAttributes,
  int nTextColor, int nBackgroundColor, int nEcho, string sFrameName)
var
  int nControlId,
  int nType

  nControlId = GetControlID (hwnd)
  nType = GetWindowSubTypeCode (hwnd)

  if ((nControlId == CID_ERROR_MESSAGE) && (nType == WT_STATIC)) then
    SayMessage (OT_SCREEN_MESSAGE, buffer)
    BrailleMessage (buffer)
  endif

  ProcessSpeechOnNewTextEvent (hFocus, hwnd, buffer, nAttributes, nTextColor, nBackgroundColor, nEcho, sFrameName)

endFunction


int function BrailleAddObjectName (int nType)
var
  handle hCurWnd,
  handle hPriorWnd,
  handle hNextWnd,
  string sLabel

  if (nType == WT_EDIT_SPINBOX) then
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
  elif (nType == WT_BUTTON) then
    if (!StringIsBlank (g_sPlayButtonLabel)) then
      BrailleAddString (g_sPlayButtonLabel, GetCursorCol(), GetCursorRow(), 0)
      return true
    endif
  endif

  return false

endFunction

int function BrailleAddObjectType (int nType)
var
  handle hCurWnd,
  int nControlId,
  int nWinStyles,
  string sType

  if (nType == WT_BUTTON) then
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    if ((nControlId == CID_NEWITEM_BUTTON) || (nControlId == CID_MORE_BUTTON)) then
      sType = BrailleGetSubtypeString (WT_BUTTONMENU)
      BrailleAddString (sType, GetCursorCol (), GetCursorRow (), 0)
      return true
    endif
    nWinStyles = GetWindowStyleBits (hCurWnd)
    if ((nWinStyles & WS_THICKFRAME) && (nWinStyles & BS_OWNERDRAW)) then
      BrailleAddString (msgBrlStateHighlighted, 0, 0, 0)
      sType = BrailleGetSubtypeString (WT_BUTTON)
      BrailleAddString (sType, GetCursorCol (), GetCursorRow (), 0)
      return true
    endif
  elif (nType == WT_CHECKBOX) then
    hCurWnd = GetCurrentWindow ()
    nControlId = GetControlID (hCurWnd)
    if (nControlId == CID_COMMENT_TOGGLE_BUTTON) then
      sType = BrailleGetSubtypeString (WT_TOGGLE_BUTTON)
      BrailleAddString (sType, GetCursorCol (), GetCursorRow (), 0)
      return true
    endif
  endif

  return false

endFunction

/*
int function SayTutorialHelpHotKey (handle hHotKeyWindow, int nIsScriptKey)
var
  int i,
  int nChildren,
  int nRole,
  int nState,
  string sHotKey,
  object oCurControl

  let oCurControl = GetCurrentObject (0)
  let nRole = oCurControl.accRole(0)

  if ((nRole == ROLE_SYSTEM_CHECKBUTTON) || (nRole == ROLE_SYSTEM_PUSHBUTTON)) then
    ; MessageBox (GetRoleText (nRole) + " - kids=" + IntToString(nChildren))
    let sHotKey = oCurControl.accKeyboardShortcut(0)
    ; Say (sHotKey, OT_HELP)
  endif
  let oCurControl = oNull

  return (SayTutorialHelpHotKey (hHotKeyWindow, nIsScriptKey))

endFunction
*/

script TestScript ()
  SayMessage (OT_POSITION, PositionInGroup ())
endScript

