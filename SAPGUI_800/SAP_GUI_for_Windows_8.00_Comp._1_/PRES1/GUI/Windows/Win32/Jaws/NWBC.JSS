
/*
 * JAWS Script file for SAPGUI.
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2020/07/14
 */


include "hjConst.jsh"
include "hjGlobal.jsh"
include "common.jsm"

include "sapglobal.jsh"

use "saputils.jsb"

void function FocusChangedEvent (handle hPrevWnd, handle hFocusWnd)
var
  int bFoundSAPGUI,
  int bFoundIE,
  int bFoundEdge,
  int nLevel,
  handle hAppWindow,
  handle hTopLevelWindow,
  handle hFocus,
  handle hRun,
  handle hFound,
  string sWindowClass

  FocusChangedEvent (hPrevWnd, hFocusWnd)

  hFocus = GetFocus ()
  hTopLevelWindow = GetTopLevelWindow (hFocus)
  hAppWindow = GetAppMainWindow (hFocus)

  if ((hTopLevelWindow != hAppWindow) && (GetWindowClass (hTopLevelWindow) == cWc_dlg32770)) then
    nLevel = 0
    while ((GetWindowClass (hAppWindow) == cWc_dlg32770) && (nLevel < 10))
      hAppWindow = GetAppMainWindow (hAppWindow)
      nLevel = nLevel + 1
    endwhile
    hFound = FindWindow (hAppWindow, sClassSapEmbeddedFrontend)
    if (hFound) then
      SwitchToConfiguration (sSapGuiConfiguration)
      return
    endif
    hFound = FindWindow (hAppWindow, sClassInternetExplorer)
    if (hFound) then
      SwitchToConfiguration (sConfInternetExplorer)
      return
    endif
  endif

  sWindowClass = GetWindowClass (hFocus)
  bFoundSAPGUI = false
  bFoundIE = false
  bFoundEdge = false
  hRun = hFocus
  while (hRun && !bFoundSAPGUI && !bFoundIE && !bFoundEdge)
    sWindowClass = GetWindowClass (hRun)
    bFoundSAPGUI = (CompareStrings (sWindowClass, sClassSapEmbeddedFrontend))
    bFoundIE = (CompareStrings (sWindowClass, sClassInternetExplorer))
    bFoundEdge = (StringContains (sWindowClass, sClassEdge) != 0)
    hRun = GetParent (hRun)
  endwhile

  if (bFoundSAPGUI) then
    SwitchToConfiguration (sSapGuiConfiguration)
    return
  endif

  if (bFoundIE) then
    ; ScheduleFunction ("MyTimeoutFunc", 5)
    SwitchToConfiguration (sConfInternetExplorer)
  endif

  if (bFoundEdge) then
    SwitchToConfiguration (sConfEdge)
  endif

endFunction
