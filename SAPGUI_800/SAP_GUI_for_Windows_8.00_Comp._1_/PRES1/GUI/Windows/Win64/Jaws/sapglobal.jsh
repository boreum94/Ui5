
/*
 * Header file for SAPGUI containing global definitions.
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2020/04/23
 */

Const
  sSapGuiConfiguration="sapfront",
  sSapGuiStatusBarName="sbar",
  sSapGuiStatusBarType="GuiStatusbar",
  sSapGuiOkCodeFieldName="okcd",
  sSapGuiOkCodeFieldType="GuiOkCodeField",
  sConfWinword="Microsoft Word",
  sConfExcel="Microsoft Excel",
  sConfPowerpoint="Microsoft PowerPoint",
  sConfProject="Microsoft Project",
  sConfWordperfect="WordPerfect 11",
  sConfAdobeAcrobat="Adobe Acrobat",
  sConfInternetExplorer="Internet Explorer",
  sConfNWBC="NWBC",
  sConfEdge="msedge",
  sClassInternetExplorer="Internet Explorer_Server",
  sClassIEFrame="IEFrame",
  sClassEdge="Chrome_WidgetWin", /* TODO: edge class name - Chrome_RenderWidgetHostHWND */
  sClassAcrobatReader="AVL_AVView",
  sClassToolbarWindow32="ToolbarWindow32",
  sClassDialogContainer="DialogBox Container Class",
  sClassSapFrontend="SAP_FRONTEND_SESSION",
  sClassSapEmbeddedFrontend="SAP_FRONTEND_EMBEDDED"

/*
 * Global variables
 */

globals
  string g_sPreviousConfiguration,
  object g_oSAPGUI,
  object g_oSAPGUISession,
  object g_oSAPGUIFrame,
  object oNull,
  handle hNull
