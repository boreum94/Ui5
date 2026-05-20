;
; Message file for SAPGUI.
;
;  Copyright
;    SAP AG, www.sap.com
;    Last Update : 2022/04/06
;

Const
  ; verbosity dialog extra items to adapt verbosity of SAPGUI-specific items
  ; the string segment after ':' and before "|" is displayed to present alternatives to the user
  ; e.g. "SAPGUI Verbosity Level", "SAPGUI Steploop Mode", ...
  ; the other part is the name of a function (and must not be translated)
  SapGuiVerbosityItems="|ToggleSapGuiAccVerbosity:SAPGUI Verbosity Level|ToggleSapGuiSteploopMode:SAPGUI Steploop Mode"
  ;For column review - KK (discontinued)
  ; jvToggleColumnReview="|ToggleColumnReviewVerbosity:Select this column for review"

messages

; Give version information
@msgSapGuiAppName
Sapfront screen reader extension
@@

; Status message saving application settings
@msgAppSettingsSaved
Application settings saved
@@
@msgAppSettingsNotSaved
Could not save the application settings
@@

;
; Messages concerning the verbosity levels and modes:
;
; switch the annoucement of an item "off" in the verbosity dialog
@msgSapGuiModeOff
off
@@
; switch the annoucement of an item "on" in the verbosity dialog
@msgSapGuiModeOn
on
@@
; set verbosity level for an item to "low"
@msgSapGuiAccVerbosityLow
low
@@
; set verbosity level for an item to "high"
@msgSapGuiAccVerbosityHigh
high
@@
@msgSapGuiScriptsNotRunning
warning. current session does not support the sapfront screen reader extensions.
@@
@msgSapGuiSessionBusy
warning. session busy. please wait.
@@

;
; TextFields/Edits
; Generally, the standard JAWS presentation is used
;
; CTextFields - text boxes with F4 help button are announced as "F4 edit"
@msgGuiCTextField
f4 edit
@@

;
; with F4 help;
@msgGuiHasF4Help
with F4 Help
@@

;
; Labels
;
; Label / static text - no announcement is made for regular labels
@msgGuiLabel

@@
@msgBrlLabel
txt
@@
@msgBrlSeparator
-
@@
@msgLabelHasType
label is
@@

;
; Icons
;
@msgGuiIcon
icon
@@
@msgBrlIcon
ico
@@

;
; Hotspot and link modifier messages, used in combination with annoncement of  control type
;
@msgIsHotspot
hotspot
@@
@msgHasHotspot
with hotspot
@@
@msgHotspotTutor
To activate press F2
@@
@msgIsLink
link
@@
@msgHasLink
with link
@@
@msgBrlIsHotspot
*
@@
@msgBrlHasHotspot
*
@@

;
; Button
;
; Additional speech annoucement for the special "table settings" button
@msgGuiButtonTableSettings
table settings
@@

; OKCodeField (the one and only transaction code field)
@msgGuiOkCodeField
command field
@@
@msgBrlGuiOkCodeField
cmd
@@

;
; announcements for system and application toolbar
;
@msgSystemToolbar
system toolbar
@@
@msgApplicationToolbar
application toolbar
@@
@msgEndOfToolbar
leaving toolbar
@@
@msgBrlApplicationToolbar
atb
@@
@msgBrlSystemToolbar
stb
@@

; footer toolbar area in Belize themed systems
@msgFooter
footer
@@
@msgEndOfFooter
leaving footer
@@
@msgBrlFooter
ft
@@

;
; define the text of the system toolbar buttons
;
@msgBtnTextSave
Save (Ctrl+S)
@@
@msgBtnTextBack
Back (F3)
@@
@msgBtnTextExit
Exit (Shift+F3)
@@
@msgBtnTextCancel
Cancel (F12)
@@
@msgBtnTextPrint
Print (Ctrl+P)
@@
@msgBtnTextFind
Find (Ctrl+F)
@@
@msgBtnTextFindNext
Find next (Ctrl+G)
@@
@msgBtnTextFirstPage
First Page (Ctrl+Screen -)
@@
@msgBtnTextPreviousPage
Previous Page (Screen -)
@@
@msgBtnTextNextPage
Next page (Screen +)
@@
@msgBtnTextLastPage
Last Page (Ctrl+Screen +)
@@
@msgBtnTextCreateSession
Create a New Session
@@
@msgBtnTextGenerateShortcut
Generates a Shortcut
@@
@msgBtnTextStartAccCheck
Start the AccCheck tool
@@
@msgBtnTextHelp
Help (F1)
@@
@msgBtnTextOkCode
Enter
@@
@msgBtnCommandField
open or close command field
@@
@msgBtnLocalLayout
customize local layout
@@

; GuiCombobox
;
; GuiComboboxes are announced as "dropdown listbox"
@msgGuiCombobox
dropdown listbox
@@
; Message denotes the current position within the list box - %n are placeholders for numeric values
; %1 = current item no - %2 = total number of items
; e.g. "4 of 10" means that currently the 4th item is shown and the list box
; contains 10 items altogether
@msgGuiComboboxPosition
%1 of %2
@@
; The number of items within the list box
@msgGuiComboboxCount
%1 entries
@@
@msgGuiComboboxSingleEntry
%1 entry
@@

;
; Radio buttons
;
; Indicates that the current radio button item is activated
@msgGuiRadioButtonSelected
selected
@@
; Indicates that the current radio button item is not activated
@msgGuiRadioButtonNotSelected
not selected
@@

; Message denotes the current position within the radio button group
; %1 = current item no - %2 = total number of items in group
@msgGuiRadioButtonPosition
%1 of %2
@@

;
; Picture control
;
@msgGuiPicture
picture
@@
;
; Editor control
;
@msgGuiTextEdit
editor
@@

;
; Tabstrip
;
; Indicates that the currently focused tab is activated
@msgGuiTabSelected
selected
@@
; Indicates that the currently focused tab is not activated
@msgGuiTabNotSelected
not selected
@@

;
; TableControl
;
; Announced when entering a table
@msgTableControl
in table
@@
; Denotes the current row position within the table
; %1 = current row no - %2 = total number of rows
@msgTablePositionRows
record %1 of %2
@@
; Denotes the current row position within the table
; %1 = current item no - %2 = total number of visible items
@msgTablePositionVisibleRows
visible row %1 of %2
@@
; Number of total rows and total visible rows in the table
@msgTableVisibleTotalRows
with %1 records and %2 visible rows
@@
; Denotes the current column position within the table
; %1 = current column no - %2 = total number of columns
@msgTablePositionCols
column %1 of %2
@@
; Indicates that row is selectable
@msgTableRowSelectable 
selectable
@@
; %1=table name - %2=row - %3=column
@msgBrlTableInfo
%1 r%2c%3
@@
; Message given if a table command is invoked outside a table
@msgNotInTable
not in a table
@@
; Annouced when navigating to the last visible row of the table
@msgTableLastVisibleRow
last visible row in table
@@
; Annouced when navigating to the last visible cell of the table
@msgTableLastVisibleCell
last visible cell in table
@@
; Annouced when inserting a row to a table
@msgTableRowInserted
row inserted
@@
; Annouced when deleting a row of a table
@msgTableRowDeleted
row deleted
@@
@msgEndOfTable
out of table
@@
@msgEmptyTable
table is empty
@@

;
; Steploop
;
; Announced when entering a steploop
@msgStepLoop
steploop
@@
; Number of total rows and total columns in the steploop
@msgStepLoopRowsTotal
with %1 rows
@@
; Annouced when navigating to the last row of the steploop
@msgStepLoopLastRow
last row in steploop
@@
; Annouced when navigating to the last cell of the steploop
@msgStepLoopLastCell
last cell in steploop
@@

;
; Splitter shell
;
@msgGuiSplitter
splitter
@@
@msgGuiSplitterVertical
vertical
@@
@msgGuiSplitterHorizontal
horizontal
@@
@msgGuiSplitterCombined
combined
@@
; Position (coordinates) of objects within splitter
@msgGuiSplitterVerticalPos
left %1 %2% right %3 %4%
@@
@msgGuiSplitterHorizontalPos
top %1 %2% bottom %3 %4%
@@
; Braille message for the splitter
@msgBrlGuiSplitterVerticalPos
(l %1 %2% / r %3 %4%)
@@
@msgBrlGuiSplitterHorizontalPos
(t %1 %2% / b %3 %4%)
@@
;
; Docking shell
;
@msgGuiDockShellVertical
vertical docking view
@@
@msgGuiDockShellHorizontal
horizontal docking view
@@
@msgGuiDockShellVerticalPos
width %1 %2%
@@
@msgGuiDockShellHorizontalPos
height %1 %2%
@@
@msgBrlGuiDockShellVerticalPos
w %1 %2%
@@
@msgBrlGuiDockShellHorizontalPos
h %1 %2%
@@

;
; OTF preview
;
@msgOTFPreviewType
print preview
@@
@msgBrlOTFPreviewType
prnt
@@

;
; APO Grid
;
@msgGuiCtrlApoGrid
apo grid view
@@
@msgGuiCtrlApoGridLastRow
last row in apo grid view
@@
@msgGuiCtrlApoGridLastCell
last cell in apo grid view
@@

;
; GuiBox: Groups of controls are announced as "group" along with it's title when the focus comes to the group
;         A group contained within another group is being announced as "subgroup <subgroup-title> of group <group-title>"
;
@msgBeginOfGroup
group
@@
@msgSubgroup
subgroup %1 of group %2
@@
@msgEndOfGroup
out of group
@@

;
; ALV
;
; ALV name - announced when entering the ALV
@msgALV
grid view
@@
; Denotes the current column position within the ALV
; %1 = current column no - %2 = total number of columns
@msgALVPositionColumns
column %1 of %2
@@
; Denotes the current row position within the ALV
; %1 = current row no - %2 = total number of rows
@msgALVPositionRows
record %1 of %2
@@
; Annouced when navigating to the last visible row
@msgALVLastVisibleRow
last row in grid view
@@
; Annouced when navigating to the last visible cell
@msgALVLastVisibleCell
last cell in grid view
@@

; messages given for certain ALV column properties
@msgALVIsColumnKey
key
@@
@msgALVIsColumnFiltered
filtered
@@
@msgALVIsColumnSorted
sorted
@@
@msgALVIsColumnSortedAsc
ascending
@@
@msgALVIsColumnSortedDesc
descending
@@
@msgALVColumnTypeTotal
has total sums
@@
@msgALVColumnTypeSubtotal
has subtotals
@@
@msgALVColumnOperationTypeMean
contains mean value
@@
@msgALVColumnOperationTypeMinimum
contains minimum value
@@
@msgALVColumnOperationTypeMaximum
contains maximum value
@@

; Denotes the ALV cell type "symbol"
@msgALVSymbol
symbol
@@

; annoncement of header
@msgALVHeader
header row
@@

; Braille messages for ALV
@msgBrlALVTextField
ed
@@
@msgBrlALVIsColumnKey
k
@@
@msgBrlALVIsColumnFiltered
f
@@
@msgBrlALVIsColumnSortedAsc
asc
@@
@msgBrlALVIsColumnSortedDesc
desc
@@
@msgBrlALVSymbol
sym
@@
@msgBrlALVExpander
exp
@@
@msgBrlALVHeader
hdr
@@
@msgBrlALVHeaderInfo
c%1
@@
@msgBrlALVColumnTypeTotal
sum
@@
@msgBrlALVColumnTypeSubtotal
sub
@@
@msgBrlALVColumnOperationTypeMean
mean
@@
@msgBrlALVColumnOperationTypeMinimum
min
@@
@msgBrlALVColumnOperationTypeMaximum
max
@@

;
; Trees
;

; Type of trees:
@msgTreeABAPListTree
tree view
@@
@msgTreeSimple
simple tree view
@@
@msgTreeList
list tree view
@@
@msgTreeColumn
column tree view
@@

; message for single tree entry
@msgTreeEntry
item
@@
; message for multiple tree entries
@msgTreeEntries
items
@@

; current level within the tree
@msgTreeLevel
level
@@
; number of items contained within this level (used for trees or tabs)
@msgItemPosition
%1 of %2
@@
; to announce the name of the column
@msgTreeItemColumn
column
@@

; types of tree items
@msgTreeTypeHierarchy
level
@@
@msgTreeTypeImage
image
@@
@msgTreeTypeText
text
@@

; number of nodes which are selected (marked)
@msgTreeSelectedNodeCount
%1 nodes selected
@@
; name of single tree node
@msgTreeNode
node
@@
; name of multiple tree nodes
@msgTreeNodes
nodes
@@
; Indicates that the node is marked
@msgTreeNodeMarked
marked
@@

;Used for the command to read entire node
@msgTreeNotValid
Not in a column tree
@@
@msgTreeNodeSelection
with single node selection
@@
@msgTreeSingleNodeTutor
Read the complete node in this tree view using Shift+Insert+UpArrow
@@
; Braille messages for trees
@msgBrlTreeSimple
tv
@@
@msgBrlTreeList	
tvl
@@
@msgBrlTreeColumn
tvc
@@
@msgBrlTreeLevel
lvl
@@
@msgBrlTVImage
img
@@
@msgBrlTVHierarchy
hrc
@@
@msgBrlTVNodeClosed
closed
@@
@msgBrlTreeTypeText
txt
@@

; Calendar format strings
; "week number" announcement
@msgCalendarWeekNumber
week number
@@
; announcing/presenting different elements of calendar
@msgCalendarButton
open/close date navigator
@@
@msgCalendarNavigator
calendar navigator
@@
@msgBrlCalendarNavigator
nav
@@
@msgCalendarToday
today
@@

;
; Control and item states
;
; indicates a read-only item/control (eg. read-only edits)
@msgStateReadOnly
read only
@@
@msgStateHighlighted
highlighted
@@
@msgStateRequired
required
@@
@msgStateInvalid
invalid
@@

; used to announce a color (%1 = number of color)
@msgStateColorNumber
color %1
@@
; Braille state messages
@msgBrlStateReadOnly
ro
@@
@msgBrlStateHighlighted
hgh
@@
@msgBrlStateRequired
req
@@

; to indicate that items are selected (marked) for further processing
@msgItemsSelected
selected
@@
@msgItemsNotSelected
not selected
@@

; selection modes (in ALV GridView)
@msgSelModeSingleRow
selection mode single row
@@
@msgSelModeMultipleRows
selection mode multiple rows
@@
@msgSelModeRowsAndColumns
selection mode rows and columns
@@
@msgSelModeFree
selection mode free
@@

;
; Status bar
;
@msgStatusBarMessage
status message
@@
@msgNoStatusBarMessage
no status message displayed
@@
@msgStatusBarMessageSuccess
status success
@@
@msgStatusBarMessageError
status error
@@
@msgStatusBarMessageWarning
status warning
@@
@msgStatusBarMessageAbort
status aborted
@@
@msgStatusBarMessageInformation
status information
@@
@msgStatusBarDetails
status details available
@@

;
; ABAP Lists
;
@msgLstGroupHeader
group header 
@@
@msgLstSubGroupHeader
subgroup header
@@
@msgLstSubGroupLABEL
subgroup label
@@
@msgLstHeader
header
@@
@msgLstGroupLabel
group label
@@
@msgLstFreeText
free text
@@
; the following is used in the form: "<current-item-number> of <total-number-of-items>"
@msgLstOf
of
@@
; single "row" in ABAP-list structures
@msgLstRow
row
@@
; multiple "rows" in ABAP-list structures
@msgLstRows
rows
@@
; single "column" in ABAP-list structures
@msgLstColumn
column
@@
; multiple "column" in ABAP-list structures
@msgLstColumns
columns
@@
; single "group" in ABAP-list structures
@msgLstGroup
group
@@
; multiple "groups" in ABAP-list structures
@msgLstGroups
groups
@@
; single "subgroup" in ABAP-list structures
@msgLstSubGroup
subgroup
@@
; multiple "subgroups" in ABAP-list structures
@msgLstSubGroups
subgroups
@@
; to announce the line number in ABAP-list structures
@msgLine
line
@@
; to announce subordinate columns in ABAP-list structures (with super column header)
@msgSubordinateColumns
subcolumns
@@
; to announce super columns in ABAP-list structures
@msgSuperColumn
super column
@@

; modifiers/properties of list fields
@msgLstFieldModifierNegative
negative
@@
@msgLstFieldModifierThreshold
beyond threshold
@@
@msgLstColumnModifierKey
key 
@@

; container title in ABAP-list structures
@msgLstContainerTitle
title
@@
; container list in ABAP-list structures
@msgLstContainerList
list
@@

; to specify the contents of the container (e.g. "list with <number-of-items> checkboxes")
@msgLstWith 
with
@@

; table(s), tree(s), textboxe(s), ... in ABAP-list structures
@msgLstTable
table
@@
@msgLstTables
tables
@@
@msgLstTree
tree
@@
@msgLstTrees
trees
@@
@msgLstTextbox
textbox
@@
@msgLstTextboxes
textboxes
@@
@msgLstCheckboxes
checkboxes
@@
@msgLstEditfields
editfields
@@
@msgLstCheckboxesAndEditfields
checkboxes and editfields
@@

; to annouce a number of items in ABAP-list structures, eg. "tree number 5"
@msgLstNumber
number
@@

; to announce number of hierarchical levels in ABAP-list structures
@msgLst2HierarchyLevels
with %1 groups
@@
@msgLst3HierarchyLevels
with %1 groups with subgroups
@@
; announce ALV like in ABAP-list structures
@msgLstALVlikeHierarchy
with groups
@@

;
; Braille symbols for ABAP lists and tables
;
@msgBrlLstTable
ltbl
@@
@msgBrlLstTree
ltv
@@
@msgBrlLstGroup
lgrp
@@
@msgBrlLstSubgroup
lsgrp
@@
@msgBrlLstContainerList
lst
@@
@msgBrlLstFieldModifierThreshold
^
@@
@msgBrlLstFieldModifierNegative
-
@@
@msgBrlLstNormalHeaderType
hdr
@@
@msgBrlLstSuperColumnHeaderType
suphdr
@@
@msgBrlLstGroupHeaderType
grphdr
@@

@msgBrlLstTablePosInfo
r%1c%2
@@
@msgBrlLstNormalHeaderInfo
c%1
@@
@msgBrlLstGroupInfo
grp%1
@@
@msgBrlLstSubGroupInfo
subgrp%1
@@

@msgLstRowSelection
row selection
@@

;
; to annouce inserted line (in ABAP-lists and ALV)
;
@msgInsertedLine
inserted
@@
; this is the inserted line type: text, total or sub total (summation sub summation)
@msgInsertedLineTypeText
text
@@
@msgInsertedLineTypeSummation
total
@@
@msgInsertedLineTypeSubSummation
sub total
@@

; Braille for line insertion type
@msgBrInsertedLineTypeSummation
--total--
@@

;
; Annoucements for session info
;
@msgSessionInfoSystem
system
@@
@msgSessionInfoClient
client
@@
@msgSessionInfoUser
user
@@
@msgSessionInfoProgram
program
@@
@msgSessionInfoTransaction
transaction
@@
@msgSessionInfoInterpretationTime
interpretation time
@@
@msgSessionInfoRoundTrips
round trips
@@
@msgSessionInfoFlushes
flushes
@@

;
; Annoucements for inplace controls
;
@msgInternetExplorer
browser activated
@@
@msgTutorInternetExplorer
the internet explorer configuration is now active
@@
@msgEdge
browser activated
@@
@msgTutorEdge
the edge configuration is now active
@@
@msgWinword
word document container
@@
@msgTutorWinword
the microsoft word configuration is now active
@@
@msgExcel
excel document container
@@
@msgTutorExcel
the microsoft excel configuration is now active
@@
@msgPowerPoint
power point document container
@@
@msgTutorPowerPoint
the microsoft power point configuration is now active
@@
@msgWordPerfect
word perfect document container
@@
@msgTutorWordPerfect
the word perfect configuration is now active
@@
@msgAdobeAcrobat
p d f document container
@@
@msgTutorAdobeAcrobat
the adobe acrobat configuration is now active
@@
@msgProject
project document container
@@
@msgTutorProject
the microsoft project configuration is now active
@@
@msgOfficeContainerIsEmpty
empty office container
@@

;
; Announcement in text editor (meaning of colored lines of text)
;
@msgTextEditorBreakpoint
line with breakpoint
@@
@msgTextEditorSelected
selected line
@@
@msgTextEditorProtected
protected line
@@
@msgTextEditorComment
comment line
@@

;
; (new) ABAP editor
@msgGuiAbapEditor
ABAP editor
@@
@msgTextEditorCollapsedLine
collapsed line
@@
@msgTextEditorBlockStartLine
block start
@@
@msgTextEditorBlockEndLine
block end
@@
@msgTextEditorNoBlock
not within a block
@@
@msgTextEditorBookmark
bookmark set
@@
@msgTextEditorNumberedBookmark
bookmark number %1 set
@@
@msgTextEditorNoBookmark
no bookmark set
@@
@msgTextEditorLineNumber
line %1 of %2
@@
@msgTextEditorModified
modified
@@
@msgTextEditorAutoComplete
auto complete
@@
@msgTextEditorAutoCompleteToolbar
alt+%1 to toggle %2
@@
@msgTextEditorQuickInfoUnavailable
quick info not available
@@
@msgTextEditorToolbarUnavailable
toolbar not available
@@

;For Column review feature - KK
;
;Announcements for Column Review
;
@msgNoSelection
No column selected for review
@@
@msgBlankCell
No value in cell
@@
@msgClearSelection
Selected review column cleared
@@
@msgColumnSelect
Select
@@
@msgColumnClear
Clear
@@
@msgColumnSet
Column selected for review
@@
@msgColumnSetError
Could not select column for review
@@

;
; history listbox of input fields has opened
;
@msgHistoryOpened
History open
@@
@msgHistoryCount
%1 entries
@@
@msgHistorySingleEntry
%1 entry
@@

;
; message for buttons with property emphasized (only in Belize)
;
@msgChangeModeButton
switch between edit and display mode
@@
;
; messages for view switch control (only in Belize)
;
@msgGuiVHViewSwitchName
switch to different view
@@

;
; some other general messages
;
@msgBlank
blank
@@
@msgNotSelected
not selected
@@

endMessages
