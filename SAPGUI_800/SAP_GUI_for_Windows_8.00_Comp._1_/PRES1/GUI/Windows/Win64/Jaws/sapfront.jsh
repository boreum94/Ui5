
/*
 * Main header file for SAPGUI.
 *
 * Copyright
 *   SAP AG, www.sap.com
 *   Last Update : 2022/12/01
 */

/*
 * Constants
 */
Const
  ; Type codes of GuiComponents
  GUI_TC_UNKNOWN = 4294967295,
  GUI_TC_COMPONENT = 0,
  GUI_TC_VCOMPONENT = 1,
  GUI_TC_VCONTAINER = 2,
  GUI_TC_APLLICATION = 10,
  GUI_TC_CONNECTION = 11,
  GUI_TC_SESSION = 12,
  GUI_TC_FRAMEWINDOW = 20,
  GUI_TC_MAINWINDOW = 21,
  GUI_TC_MODALWINDOW = 22,
  GUI_TC_LABEL = 30,
  GUI_TC_TEXTFIELD = 31,
  GUI_TC_CTEXTFIELD = 32,
  GUI_TC_PASSWORDFIELD = 33,
  GUI_TC_COMBOBOX = 34,
  GUI_TC_OKCODEFIELD = 35,
  GUI_TC_BUTTON = 40,
  GUI_TC_RADIOBUTTON = 41,
  GUI_TC_CHECKBOX = 42,
  GUI_TC_STATUSPANE = 43,
  GUI_TC_CUSTOMCONTROL = 50,
  GUI_TC_CONTAINERSHELL = 51,
  GUI_TC_BOX = 62,
  GUI_TC_CONTAINER = 70,
  GUI_TC_SIMPLECONTAINER = 71,
  GUI_TC_SCROLLCONTAINER = 72,
  GUI_TC_USERAREA = 74,
  GUI_TC_SPLITTERCONTAINER = 75,
  GUI_TC_TABLECONTROL = 80,
  GUI_TC_TABLECOLUMN = 81,
  GUI_TC_TABLEROW = 82,
  GUI_TC_TABSTRIP = 90,
  GUI_TC_TAB = 91,
  GUI_TC_SCROLLBAR = 100,
  GUI_TC_TOOLBAR = 101,
  GUI_TC_TITLEBAR = 102,
  GUI_TC_STATUSBAR = 103,
  GUI_TC_MENU = 110,
  GUI_TC_MENUBAR = 111,
  GUI_TC_COLLECTION = 120,
  GUI_TC_SESSIONINFO = 121,
  GUI_TC_GUISHELL = 122,
  GUI_TC_GOSHELL = 123,
  GUI_TC_SPLITTERSHELL = 124, 
  GUI_TC_DIALOGSHELL = 125, 
  GUI_TC_DOCKSHELL = 126, 
  GUI_TC_CONTEXTMENU = 127,
  GUI_TC_VHVIEWSWITCH = 129,
  ;
  ; Braille custom control types
  ;
  GUI_WT_CHECKBOX=1,
  GUI_WT_RADIOBUTTON=2,
  GUI_WT_BUTTON=3,
  GUI_WT_TEXTFIELD=4,
  GUI_WT_CTEXTFIELD=5,
  GUI_WT_COMBOBOX=6,
  GUI_WT_TABLECONTROL=7,
  GUI_WT_TAB=8,
  GUI_WT_SHELL_TV=9,
  GUI_WT_LABEL=10,
  GUI_WT_GRIDVIEW=11,
  GUI_WT_CALENDAR=12,
  GUI_WT_PASSWORDFIELD=13,
  GUI_WT_TOOLBAR=14,
  GUI_WT_PICTURE=15,
  GUI_WT_SPLITTERSHELL=16,
  GUI_WT_CONTAINER=17,
  ;
  ; GuiTree control: tree types
  ;
  GUI_TREETYPE_SIMPLE=0,
  GUI_TREETYPE_LIST=1,
  GUI_TREETYPE_COLUMN=2,
  ;
  ; GuiTree control: item types
  ;
  GUI_TREEITEMPTYPE_HIERARCHY = 0,
  GUI_TREEITEMPTYPE_IMAGE = 1,
  GUI_TREEITEMPTYPE_TEXT = 2,
  GUI_TREEITEMPTYPE_BOOL = 3,
  GUI_TREEITEMPTYPE_BUTTON = 4,
  GUI_TREEITEMPTYPE_LINK = 5,
  ;
  ; GuiTree control: selection modes
  ;
  GUI_SM_SINGLE_NODE=0,
  GUI_SM_MULTIPLE_NODE=1,
  GUI_SM_SINGLE_ITEM=2,
  GUI_SM_MULTIPLE_ITEM=3,
  ;
  ; InputFieldControl or GuiTextField
  ;
  GUI_IF_NONE=0,
  GUI_IF_TEXTFIELD=1,           ; GuiTextField
  GUI_IF_INPUTFIELDCONTROL=2,  ; InputFieldControl
  ;
  ; GuiShell integration - embedded application object ("OfficeIntegration" / "HTMLViewer")
  ;
  GUI_SI_UNKNOWN=0,
  GUI_SI_WORD=1,
  GUI_SI_EXCEL=2,
  GUI_SI_POWERPOINT=3,
  GUI_SI_PROJECT=4,
  GUI_SI_VISIO=5,
  GUI_SI_WORDPRO=6,
  GUI_SI_LOTUS123=7,
  GUI_SI_WORDPERFECT=8,
  GUI_SI_SAPOROS=9,
  GUI_SI_PSPLANNINGMODELLER=10,
  GUI_SI_ADOBE=11,
  ; HTMLViewer - Browser control types
  GUI_SI_BROWSERCONTROL_IE = 1000,
  GUI_SI_BROWSERCONTROL_EDGE = 1001,
  ;
  ; Belize and newer themes
  ;
  GUI_UI_GUIDELINE_BELIZE = 2

Const
  SapGuiJsiFileName="sapfront.jsi",
  ; application verbosity settings
  Section_SapGuiVerbositySettings="Application Verbosity Settings",
  Key_SapGuiAccVerbosity="AccVerbosityLevel",
  Key_SapGuiSteploopMode="SteploopMode",
  Key_SapGuiProgressBarMode="ProgressBarAnnouncement",
  Key_SapGuiMultipleSelection="MultipleSelections",
  Key_SapGuiTooltipsBrailleMode = "TooltipsBrailleMode",
  ; keycodes used in KeypressedEvent
  kiEsc=1,
  kiBackspace=14,
  kiEnter=28,
  kiSpaceBar=57,
  kiF2=60,
  kiF3=61,
  kiF8=66,
  kiF9=67,
  kiCursorLeft=75,
  kiCursorRight=77,
  kiDelete=83,
  kiContext=93,
  kiContextLShftF10=2097220,
  kiContextRShftF10=1048644,
  kiLeftCtrlShift7=2097672,
  kiRightCtrlShift7=1048840,
  kiCtrlSpace=32825,
  kiCtrlTab=65551,
  kiAltMask=524288,
  kiCtrlAltMask=524800,
  cksSapControlUpArrow="control+uparrow",
  cksSapControlDownArrow="control+downarrow",
  cksSapBackspace="backspace",
  cwnSapTaskSwitch="#32771"
Const
  ;
  ; Some SAPGUI names used  for controls
  ;
  sGuiInteger="integer",
  sGuiString="string",
  sGuiGridView="GridView",
  sGuiCtrlApoGrid="ApoGrid",
  sGuiCheckbox="Checkbox",
  sGuiRadioButton="RadioButton",
  sGuiButton="Button",
  sGuiMenu="Menu",
  sGuiButtonAndMenu="ButtonAndMenu",
  sGuiSeparator="Separator",
  sGuiGroup="Group",
  sGuiNormal="Normal",
  sGuiValueList="ValueList",
  ; sGuiValueList="f4 edit",
  sGuiIcon= "Icon",
  sGuiSymbol="Symbol",
  sGuiCTextField="F4 Edit",
  sGuiInputField="Inputfield",
  sGuiComboBox="Combobox",
  /* sGuiLink="Link", -- unused */
  sGuiExpander="Expander",
  sGuiNone="None",
  sGuiAscending="Ascending",
  sGuiDescending="Descending",
  sGuiTotal="Total",
  sGuiSubtotal="Subtotal",
  sGuiMean="Mean",
  sGuiMinimum="Minimum",
  sGuiMaximum="Maximum",
  sGuiTree="Tree",
  sGuiCalendar="Calendar",
  sGuiHtmlViewer="HTMLViewer",
  sGuiOfficeIntegration="OfficeIntegration",
  sGuiToolbar="Toolbar",
  sGuiPicture="Picture",
  sGuiTextEdit="TextEdit",
  sGuiAbapEditor="AbapEditor",
  sTextEditClass="SAP TextEdit",
  sTextEditBodyClass="TextEditBody",
  sShellClass="Shell Window Class",
  sContainerClass="Container Class",
  sCalendarClass="SAP Calendar",
  sAbapEditorClass="AfxMDIFrame80u",
  sALVGridControlClass="SAPALVGridControl",
  sSysPagerClass="SysPager",
  sStateChecked="x",
  sStatusBarMessageSuccess="S",
  sStatusBarMessageError="E",
  sStatusBarMessageWarning="W",
  sStatusBarMessageAbort="A",
  sStatusBarMessageInformation="I",
  sIsHotspotProperty="HS",
  sIsLinkProperty="L",
  sSelModeSingleRow="ListboxSingle",
  sSelModeMultipleRows="ListboxMultiple",
  sSelModeRowsAndColumns="RowsAndColumns",
  sSelModeFree="Free",
  sGuiGridViewLink="Link"

Const
  ;
  ; for ABAP lists
  ; Label Types
  LT_NORMALHEADER="N",
  LT_SUPERCOLUMNHEADER="H",
  LT_TITLE="T",
  LT_GROUPHEADER="A",
  LT_GROUPLABEL="G",
  LT_SUBGROUPLABEL="S",
  ; Container Types
  CT_LIST="L",
  CT_TABLE = "T",
  CT_GROUP="G",
  CT_SUBGROUP="S",
  CT_ROW="R",
  CT_TEXTBOX="B",
  CT_TREE="E",
  CT_FREETEXT="F",
  ; RowTypes
  RT_U="U",
  RT_S="S",
  RT_I="I",
  ; ColorIndex
  CI_READONLY=2 ,
  CI_KEY=4,
  CI_THRESHOLD=5,
  CI_NEGATIVE=6,
  ; ListInputTypes
  LIT_NONE="N",
  LIT_CHECKBOXES="C",
  LIT_EDITFIELDS="E",
  LIT_ALL="A",

  ; Tree Types
  TT_SimpleTree=0,
  TT_ListTree=1,
  TT_ColumnTree=2,

  ; Split/docking view types
  SDT_SPLITHORIZONTAL = 0,
  SDT_SPLITVERTICAL = 1,
  SDT_SPLITCOMBINED = 2,
  SDT_DOCKSHELLHORIZONTAL = 3,
  SDT_DOCKSHELLVERTICAL = 4

Const
  sSystemToolbarName = "tbar[0]",
  sApplicationToolbarName = "tbar[1]",
  sStatusPaneMessageName = "pane[0]",
  sStatusPaneButtonMenu = "pane[1]",
  sStatusPaneLinkName = "link",
  sBtnNameSave = "btn[11]",
  sBtnNameBack = "btn[3]",
  sBtnNameExit = "btn[15]",
  sBtnNameCancel = "btn[12]",
  sBtnNamePrint = "btn[86]",
  sBtnNameFind = "btn[71]",
  sBtnNameFindNext = "btn[84]",
  sBtnNameFirstPage = "btn[80]",
  sBtnNamePreviousPage = "btn[81]",
  sBtnNameNextPage = "btn[82]",
  sBtnNameLastPage = "btn[83]",
  sBtnNameCreateSession = "btn[419]",
  sBtnNameGenerateShortcut = "btn[418]",
  sBtnNameStartAccCheck = "btn[422]",
  sBtnNameHelp = "btn[1]",
  sBtnNameOkCode = "btn[0]",
  /* ROM 2010/08/06 - more button names in signature design */
  sBtnNameCommandField = "btn[423]",
  sBtnNameLocalLayout = "btn[446]",
  /* ROM 2018/01/22 - added buttons for Belize design */
  sBtnNameMore = "btnvhmore",
  sBtnNameFooterMore = "btnvhfootermore",
  sBtnNameTableSettings = "btn",
  /* ROM 2017/01/26 - footer element in Belize design */
  sWndNameFooter = "Footer"

const
  GUI_OPT_SCREEN_ECHO = 8 /* old output type for JAWS 11 */

/*
 * Global definitions
 */

Globals
  int g_bOnFocusChanged,
  int g_nObjectTypeCode,
  int g_nSapGuiAccVerbosity,
  int g_nSapGuiSteploopMode,
  int g_nMultipleSelectionVerbosity,
  int g_nTooltipsBrailleMode

/*
 **********************************************************************
 * Custom control variables
 **********************************************************************
 */

Globals
  ;
  ; GuiComponent
  ;
  int g_bGuiComponentIsValid,
  int g_bGuiComponentSameAsPrevious,
  int g_nGuiComponentLastUpdate,
  object g_oGuiComponent,
  object g_oGuiComponentParent,
  int g_nGuiComponentType,
  int g_nGuiComponentPreviousType,
  int g_nGuiComponentParentType,
  int g_nGuiComponentPreviousParentType,
  string g_sGuiComponentParentId,
  string g_sGuiComponentPreviousParentId,
  string g_sGuiComponentFrameId,
  string g_sGuiComponentPreviousFrameId,
  string g_sGuiComponentPreviousSubType,
  int g_nGuiComponentLeft,
  int g_nGuiComponentTop,
  int g_nGuiComponentWidth,
  int g_nGuiComponentHeight,
  int g_bGuiComponentChangeable,
  string g_sGuiComponentSubType,
  string g_sGuiComponentId,
  string g_sGuiComponentParentColumnName,
  string g_sGuiComponentParentColumnTooltip,
  string g_sGuiComponentParentTabText,
  string g_sGuiComponentPreviousTabText,
  handle g_hGuiFrameWnd,
  string g_sGuiComponentTooltip,
  string g_sGuiComponentAccLabels,
  string g_sGuiComponentAccTooltip,
  string g_sGuiComponentAccText,
  string g_sGuiComponentAccDescription,
  ;
  ; GuiCheckbox
  ;
  int g_bGuiCheckBoxIsValid,
  int g_bGuiCheckBoxState,
  string g_sGuiCheckBoxText,
  string g_sGuiCheckBoxToolTip,
  ;
  ; GuiBox
  ;
  int g_bGuiBoxIsValid,
  int g_bGuiBoxShouldSpeak,
  string g_sGuiBoxText,
  string g_sGuiBoxSpeakText,
  string g_sGuiBoxTooltip,
  ;
  ; GuiTab
  ;
  int g_bGuiTabIsValid,
  int g_bGuiTabIsSelected,
  int g_iGuiTabTotalCount,
  int g_iGuiTabCurrentIndex,
  string g_sGuiTabText,
  string g_sGuiTabTooltip,
  ;
  ;GuiTextFields
  ;
  int g_bGuiTextFieldIsValid,
  int g_bGuiTextFieldNumerical,
  int g_bGuiTextFieldReadOnly,
  int g_bGuiTextFieldHighlighted,
  int g_bGuiTextFieldRequired,
  int g_bGuiTextFieldIsHotspot,
  int g_nGuiTextAttachedToButton,
  string g_sGuiTextFieldText,
  string g_sGuiTextFieldTooltip,
  string g_sGuiTextFieldParentColumnName,
  string g_sGuiTextFieldIcon,
  ;
  ; InputFieldControl (also shares some properties with GuiTextFields)
  ;
  int g_bInputFieldButtonActivated,
  string g_sInputFieldButtonTooltip,
  string g_sInputFieldPromptText,
  ;
  ; GuiRadioButton
  ;
  int g_bGuiRadioButtonIsValid,
  int g_bGuiRadioButtonState,
  int g_nGuiRadioButtonGroupPos,
  int g_nGuiRadioButtonGroupCount,
  string g_sGuiRadioButtonText,
  string g_sGuiRadioButtonToolTip,
  ;
  ; GuiLabel
  ;
  int g_bGuiLabelIsValid,
  int g_bGuiLabelNumerical,
  int g_bGuiLabelHighlighted,
  int g_nGuiLabelCaretPosition,
  string g_sGuiLabelText,
  string g_sGuiLabelTooltip,
  string g_sGuiLabelAccText,
  string g_sGuiLabelAccTextOnRequest,
  int g_bGuiLabelIsHotspot, 
  int g_bGuiLabelIsSymbolFont,
  string g_sGuiLabelIcon,
  ;
  ; used for various dynpros
  ;
  string g_sLeftLabelText,
  string g_sRightLabelText,
  string g_sLeftLabelTooltip,
  string g_sRightLabelTooltip,
  ;
  ; GuiOkCodeField
  ;
  int g_bGuiOkCodeFieldIsValid,
  ;
  ; GuiVHViewSwitch
  ;
  int g_bGuiVHViewSwitchIsValid,
  ;
  ; GuiButton
  ;
  int g_bGuiButtonIsValid,
  string g_sGuiButtonTooltip,
  string g_sGuiButtonText,
  string g_sGuiButtonType,
  int g_bGuiButtonIsTableSettings,
  int g_bGuiButtonEmphasized,
  ;
  ; GuiComboBox
  ;
  int g_bGuiComboboxIsValid,
  string g_sGuiComboboxTooltip,
  string g_sGuiComboboxText,
  string g_sGuiComboboxCurListboxEntry,
  int g_bGuiComboboxParentIsToolbar,
  int g_bGuiComboboxIsListboxActive,
  int g_bGuiComboboxReadOnly, 
  int g_bGuiComboboxRequired,
  int g_bGuiComboboxHighlighted,
  int g_nGuiComboboxEntries,
  int g_nGuiComboboxPos,
  ;
  ; GuiTableControl
  ;
  int g_iDummy,
  int g_bGuiTableControlIsValid,
  string g_sGuiTableControlName,
  string g_sGuiTableControlTitle,
  int g_iGuiTableControlColCount,
  int g_iGuiTableControlRowCount,
  int g_iGuiTableControlVisibleRowCount, 
  int g_iGuiTableControlCurCol,
  int g_iGuiTableControlCurRow,
  int g_iGuiTableControlRowOffset,
  int g_bNewColumn,
  int g_bNewTable,
  int g_bNewRow,
  int g_bForceReadCell,
  int g_bCurRowIsSelected,
  int g_bCurColIsSelected,
  int g_bCurCellIsSelected,
  int g_bTableRowSelectable,
  ;
  ; GuiShell
  ;
  int g_bGuiShellIsValid,
  ; GuiShell - SubType HTMLViewer
  int g_nGuiShellBrowserControlType,
  ; GuiCtrlGridView - ALV
  string g_sGuiGridTitle,
  string g_sGuiGridValue,
  string g_sGuiGridColumnTitle,
  string g_sGuiGridColumnLongTitle,
  string g_sGuiGridColumnTooltip,
  string g_sGuiGridCurColumn,
  int g_iGuiGridRowCount,
  int g_iGuiGridColumnCount, 
  int g_iGuiGridCurRow,
  int g_iGuiGridCurColumn,
  int g_iGuiGridVisibleRowCount, 
  int g_iGuiGridToolbarFocusButton,
  int g_bGuiGridCellChangeable,
  int g_bGuiGridCellHasF4Help,
  int g_iGuiGridToolbarPreviousButton,
  string g_sGuiGridSelectionMode,
  string g_sGuiGridCellType,
  string g_sGuiGridPreviousCellType,
  string g_sGuiGridCellProperty,
  string g_sGuiGridPreviousCellProperty,
  int g_iGuiGridBoolState, 
  int g_bGuiGridColIsKey,
  int g_bGuiGridColIsFiltered,
  string g_sGuiGridColIsSorted,
  string g_sGuiGridColTotalType,
  string g_sGuiGridColOperationType,
  int g_nGuiGridListBoxCount,
  int g_nGuiGridListBoxCurIndex,
  int g_bTotalRowExpanded,
  int g_iTotalRowLevel,
  int g_bIsCellHotspot,
  int g_bIsCellLink,
  string g_sCellTooltip,
  string g_sCellColorInfo,
  ;
  ; GuiCtrlTree
  ;
  int g_iGuiCtrlTreePreviousLevel,
  int g_iGuiCtrlTreeType,
  int g_iGuiCtrlTreeSelectionMode,
  int g_iNodesCount,
  string g_sNodeText,
  string g_sItemText, 
  int g_iItemType,
  int g_iNodeLevel,
  int g_iCurLevelCount,
  int g_iSubLevelCount,
  int g_iCurPosition, 
  string g_sColumnKey,
  string g_sColumnTitle,
  int g_iColumnIndex, 
  int g_iColumnCount, 
  int g_bNewTreeColumn,
  int g_bNodeIsSelected,
  string g_sKey,
  int g_bAllItemsTextToggle,
  string g_sAllItemsText,
  string g_sFocusedNodeKey,
  string g_sFocusedNodeText,
  string g_sNodeTooltip,
  string g_sItemTooltip,
  string g_sNodeStyle,
  string g_sitemStyle,
  string g_sItemIcon,
  int g_iIsFolder,
  int g_iIsFolderExpanded,
  int g_iIsFolderExpandable,
  int g_iIsDisabled,
  int g_iIsEditable,
  int g_bForceReadNodeInfo,
  int g_iCheckBoxState, /* note: indicates checkbox state in trees and ALVs */
  ; string g_sGuiCtrlTreeNodeFullText,
  ; string g_sGuiCtrlTreeColumnTitles,
  ;
  ; GuiCtrlCalendar
  ;
  int g_iCalDay,
  int g_iCalMonth,
  int g_iCalYear,
  int g_iCalWeekNumber,
  int g_iCalFocusedElement,
  int g_iCalPreviousElement,
  string g_sCalWeekday,
  string g_sCalTooltip,
  string g_sCalFocusDate,
  string g_sCalToday,
  string g_sCalSelectionInterval,
  string g_sCalPreviouslyAnnounced, ; contains ID of element
  ;
  ; GuiStatusbar
  ;
  int g_nGuiStatusBarLastUpdate,
  handle g_hGuiStatusBar,
  string g_sGuiStatusBarLastMessage,
  ;
  ; GuiStatusPane
  ;
  int g_bGuiStatusPaneIsValid,
  string g_sGuiStatusPaneName,
  string g_sGuiStatusPaneText,
  string g_sGuiStatusPaneTooltip,
  int g_bGuiStatusPaneIsLink,
  int g_bGuiStatusPaneHasDetails,
  int g_bGuiStatusPaneIsInfoArea,
  ;
  ; ABAP-Lists / Trees (Labels)
  ;
  int g_bGuiContainerIsValid,
  int g_bLstIsListElement,
  int    g_nLstListTablesTotal,
  int    g_nLstListTreesTotal,
  int    g_nLstListTextBoxesTotal,
  string g_sLstListInputType,

  string g_sLstTextBoxNo,
  string g_sAccTextOnRequest,
  string g_sLstFieldHeader,
  string g_sLstFieldSuperHeader,   
  int    g_nLstRowsTotal,
  int    g_nLstRowInputFields,
  int    g_nLstRowNo,
  string g_sLstRowType,

  string g_sLstRowsSubSummation,
  string g_sLstRowsSummation,
  string g_sLstContainerInputFields,
  int    g_nLstTableGroupsTotal,

  int    g_nLstColsTotal,
  int    g_nLstColNo,
  string g_sLstLabelType,
  string g_sLstTitle,
  string g_sLstContainerType,
  string g_sLstPreviousContainerType,
  string g_sLstRowType,
  int    g_nLstTableGroupsTotal,
  int    g_nLstGroupNo,
  int    g_nLstSubGroupNo,
  string g_sLstLabelText,
  string g_sLstListErrorMessage,

  int    g_nLstSubordinateColumns,
  int    g_nLstListTablesTotal,
  int    g_nLstTableNo,
  int    g_nLstTreeNo,
  int    g_nLstTextBoxNo,

  string g_sLstTableHierarchical,
  string g_sLstContainerTitle,

  int    g_nLstColumns2LevelALV,
  int    g_nLstContainerInputFields,
  int    g_nLstSubgroupsTotal,
  int    g_nLstSuperColumnsTotal,
  int    g_nLstGroupHeaderRows, 
  int    g_nLstGroupHeaderValues,
  int    g_nLstLineCount,
  int    g_nlstLineNo,

  int    g_nLstLastTableNo,
  int    g_nLstLastTreeNo,
  int    g_nLstLastTextBoxNo,
  int    g_nLstLastGroupNo,
  int    g_nLstLastColumnNo,
  int    g_nLstLastRowNo,
  int    g_nLstLastGroupNo,
  int    g_nLstLastSubGroupNo,
  
  string g_sLstRowText,
  string g_sLstLastRowText,
  int g_bLstColorIndex,
  int g_bLstColorIntensified,
  int g_bLstColorInverse,
  int      g_bLstLabelIsIcon,
  ; ListTree
  int    g_nTreeNo,
  int    g_nNodeLevelNo,
  int    g_nNodeNo,
  int    g_nNodeChildrenTotal,
  int    g_nNodeRealChildrenTotal,
  int    g_nNodeMultipleRows,
  int    g_bNodeExpandable,
  int    g_bNodeMarked,
  string g_sNodeName,
  ; TextBox
  string g_sLstContainerTitle,
  ;
  ; Toolbar
  ;
  int g_bToolbarIsValid,
  int g_nToolbarFocusedButton,
  int g_nToolbarButtonCount,
  int g_bToolbarButtonChecked,
  int g_bToolbarButtonEnabled,
  string g_sToolbarButtonText,
  string g_sToolbarButtonType,
  string g_sToolbarButtonTooltip,
  string g_sToolbarButtonIcon,
  ;
  ;GuiCtrlPicture
  ;
  int g_bGuiPictureIsValid,
  string g_sGuiPictureIcon,
  string g_sGuiPictureUrl,
  string g_sGuiPictureAltText,
  ;
  ; GuiCtrlTextEdit
  ;
  int g_bGuiTextEditIsValid,
  string g_sGuiTextEditLineText,
  int g_iGuiTextEditFirstVisibleLine,
  int g_iGuiTextEditLastVisibleLine,
  int g_iGuiTextEditLineCount,
  int g_iGuiTextEditCurrentLine,
  int g_iGuiTextEditCurrentColumn,
  int g_iGuiTextEditSelectionStartLine,
  int g_iGuiTextEditSelectionStartColumn,
  int g_iGuiTextEditSelectionEndLine,
  int g_iGuiTextEditSelectionEndColumn,
  string g_sGuiTextEditSelectedText,
  int g_bGuiTextEditIsCommentLine,
  int g_bGuiTextEditIsProtectedLine,
  int g_bGuiTextEditIsBreakPointLine,
  int g_bGuiTextEditIsSelectedLine,
  int g_bGuiTextEditIsHighlightedLine,
  ;
  ; GuiSplitterShell
  ;
  int g_bGuiSplitterShellIsValid,
  int g_nGuiSplitterShellType,
  int g_nGuiSplitterShellWidth1,
  int g_nGuiSplitterShellWidth2,
  int g_nGuiSplitterShellHeight1,
  int g_nGuiSplitterShellHeight2,
  string g_sGuiSplitterShellDescription1,
  string g_sGuiSplitterShellDescription2,
  ;
  ; OTFPreview
  ;
  int g_bIsOTFPreview,
  ;
  ; SimpleShell
  ;
  ; int g_bGuiSimpleShellIsValid,
  ;
  ; GuiSimpleContainer - StepLoop
  ;
  ; 
  string g_sStepLoopId,
  string g_sStepLoopColTitle,
  int g_bIsStepLoop,
  int g_iLoopColCount,
  int g_iLoopRowCount,
  int g_iLoopCurrentCol,
  int g_iLoopCurrentRow,
  int g_bNewStepLoop,
  ;
  ; APO
  ;
  int g_bGuiCtrlApoGridIsValid,
  int g_nGuiCtrlApoGridColumnCount,
  int g_nGuiCtrlApoGridRowCount,
  int g_nGuiCtrlApoGridVisibleRowCount,
  int g_nGuiCtrlApoGridVisibleColumnCount,
  int g_nGuiCtrlApoGridCurrentColumn,
  int g_nGuiCtrlApoGridCurrentRow,
  int g_nGuiCtrlApoGridFixedRowsBottom,
  int g_nGuiCtrlApoGridFixedRowsTop,
  int g_nGuiCtrlApoGridFixedColumnsLeft,
  int g_nGuiCtrlApoGridFixedColumnsRight,
  int g_bGuiCtrlApoGridCellChangeable,
  string g_sGuiCtrlApoGridCellValue,
  string g_sGuiCtrlApoGridCellFormat,
  string g_sGuiCtrlApoGridCellTooltip,
  string g_sGuiCtrlApoGridColumnHeader,
  string g_sGuiCtrlApoGridRowHeader,
  string g_sGuiCtrlApoGridTitle,
  ;
  ; Verbosity Globals
  ;
  int g_bTableColumnHeaders,
  int g_bTableRowPosition,
  ;
  ; Popup dialog boxes
  ;
  int g_bIsPopupDialog,
  string g_sPopupDialogText,
  ;
  ; Real window
  ;
  handle g_hRealWindow,
  handle g_hPreviousRealWindow,
  ;
  ; Application window
  ;
  string g_sAppMainWindowTitle,
  int g_bWindowTitleChanged,
  ;
  ; to identify system and application toolbar
  ;
  int g_bIsApplicationToolbar,
  int g_bIsSystemToolbar,
  int g_bIsCombinedToolbar,
  ; for Belize theme (and possibly other new themes)
  int g_nUserInterfaceGuideline,
  int g_bIsFooter,
  ;
  ; GuiCtrlAbapEditor
  ;
  int g_bGuiAbapEditorIsValid,
  int g_bGuiAbapEditorIsCommentLine,
  int g_nGuiAbapEditorCursorLine,
  int g_nGuiAbapEditorCursorColumn,
  int g_nGuiAbapEditorLineCount,
  int g_bGuiAbapEditorIsBookmark,
  int g_bGuiAbapEditorIsBreakpointSet,
  int g_bGuiAbapEditorIsLineModified,
  int g_bGuiAbapEditorIsLineCollapsed,
  int g_nGuiAbapEditorBlockStartLine,
  int g_nGuiAbapEditorBlockEndLine,
  int g_bGuiAbapEditorIsAutoCompleteOpen,
  int g_nGuiAbapEditorAutoCompleteIndex,
  int g_nGuiAbapEditorAutoCompleteCount,
  int g_nGuiAbapEditorAutoCompleteDelay,
  string g_sGuiAbapEditorAutoCompleteText,
  string g_sGuiAbapEditorLine,
  string g_sGuiAbapEditorBookmarkList,
  string g_sGuiAbapEditorAutoCompleteTooltip,
  string g_sGuiAbapEditorAutoCompleteIcon,
  string g_sGuiAbapEditorAutoCompleteToolbarHelp,

;For column review - KK
  int g_bColReviewState,
int g_iColReviewValue,
int g_iColReviewTemp,
string g_sColReviewText,
  string g_sColReviewValue,
int g_bIsGridView