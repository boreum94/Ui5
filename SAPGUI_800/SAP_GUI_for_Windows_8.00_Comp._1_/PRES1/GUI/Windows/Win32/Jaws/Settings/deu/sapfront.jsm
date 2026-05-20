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
  SapGuiVerbosityItems="|ToggleSapGuiAccVerbosity:SAPGUI Ausführlichkeit|ToggleSapGuiSteploopMode:SAPGUI Steploop Modus"
  ;For column review - KK (discontinued)
  ; jvToggleColumnReview="|ToggleColumnReviewVerbosity:Aktuelle spalte zum Kontroll lesen auswählen"

messages

; Give version information
@msgSapGuiAppName
Sapfront screen reader Erweiterungen
@@

; Status message saving application settings
@msgAppSettingsSaved
Anwendungseinstellungen gespeichert
@@
@msgAppSettingsNotSaved
Anwendungseinstellungen konnten nicht gespeichert werden
@@

;
; Messages concerning the verbosity levels and modes:
;
; switch the annoucement of an item "off" in the verbosity dialog
@msgSapGuiModeOff
aus
@@
; switch the annoucement of an item "on" in the verbosity dialog
@msgSapGuiModeOn
an
@@
; set verbosity level for an item to "low"
@msgSapGuiAccVerbosityLow
niedrig
@@
; set verbosity level for an item to "high"
@msgSapGuiAccVerbosityHigh
hoch
@@
@msgSapGuiScriptsNotRunning
Warnung. Die Screen Reader Erweiterungen werden von der aktuellen Sitzung nicht unterstützt.
@@
@msgSapGuiSessionBusy
Warnung. Sitzung nicht eingabe bereit. bitte warten.
@@

;
; TextFields/Edits
; Generally, the standard JAWS presentation is used
;
; CTextFields - text boxes with F4 help button are announced as "F4 edit"
@msgGuiCTextField
f4 eingabefeld
@@

;
; with F4 help;
@msgGuiHasF4Help
mit F4 Wertehilfe
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
label ist
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
mit hotspot
@@
@msgHotspotTutor
Zum Aktivieren drücken Sie F2
@@
@msgIsLink
link
@@
@msgHasLink
mit link
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
Tabelleneinstellungen
@@

; OKCodeField (the one and only transaction code field)
@msgGuiOkCodeField
kommandofeld
@@
@msgBrlGuiOkCodeField
cmd
@@

;
; announcements for system and application toolbar
;
@msgSystemToolbar
system symbolleiste
@@
@msgApplicationToolbar
anwendungs symbolleiste
@@
@msgEndOfToolbar
symbolleiste verlassen
@@
@msgBrlApplicationToolbar
asl
@@
@msgBrlSystemToolbar
ssl
@@

; footer toolbar area in Belize themed systems
@msgFooter
Fußbereich
@@
@msgEndOfFooter
Fußbereich verlassen
@@
@msgBrlFooter
fb
@@

;
; define the text of the system toolbar buttons
;
@msgBtnTextSave
Speichern (Strg+S)
@@
@msgBtnTextBack
Zurück (F3)
@@
@msgBtnTextExit
Beenden (Umsch+F3)
@@
@msgBtnTextCancel
Abbrechen (F12)
@@
@msgBtnTextPrint
Drucken... (Strg+P)
@@
@msgBtnTextFind
Suchen(Strg+F)
@@
@msgBtnTextFindNext
Weiter Suchen (Strg+G)
@@
@msgBtnTextFirstPage
Erste Seite (Strg+Bild hoch)
@@
@msgBtnTextPreviousPage
Vorige Seite (Bild hoch)
@@
@msgBtnTextNextPage
Nächste Seite (Bild runt)
@@
@msgBtnTextLastPage
Letzte Seite (Strg+Bild runt)
@@
@msgBtnTextCreateSession
Neuen Modus erzeugen
@@
@msgBtnTextGenerateShortcut
Erstellt eine Verknüpfung
@@
@msgBtnTextStartAccCheck
Accessibility Checker starten
@@
@msgBtnTextHelp
Hilfe (F1)
@@
@msgBtnTextOkCode
Weiter
@@
@msgBtnCommandField
Kommandofeld öffnen oder schließen
@@
@msgBtnLocalLayout
Lokales Layout anpassen
@@

; GuiCombobox
;
; GuiComboboxes are announced as "dropdown listbox"
@msgGuiCombobox
Ausklappliste
@@
; Message denotes the current position within the list box - %n are placeholders for numeric values
; %1 = current item no - %2 = total number of items
; e.g. "4 of 10" means that currently the 4th item is shown and the list box
; contains 10 items altogether
@msgGuiComboboxPosition
%1 von %2
@@
; The number of items within the list box
@msgGuiComboboxCount
%1 Einträge
@@
@msgGuiComboboxSingleEntry
%1 Eintrag
@@

;
; Radio buttons
;
; Indicates that the current radio button item is activated
@msgGuiRadioButtonSelected
aktiviert
@@
; Indicates that the current radio button item is not activated
@msgGuiRadioButtonNotSelected
nicht aktiviert
@@

; Message denotes the current position within the radio button group
; %1 = current item no - %2 = total number of items in group
@msgGuiRadioButtonPosition
%1 von %2
@@

;
; Picture control
;
@msgGuiPicture
Grafik
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
aktiviert
@@
; Indicates that the currently focused tab is not activated
@msgGuiTabNotSelected
nicht aktiviert
@@

;
; TableControl
;
; Announced when entering a table
@msgTableControl
in Tabelle
@@
; Denotes the current row position within the table
; %1 = current row no - %2 = total number of rows
@msgTablePositionRows
Datensatzzeile %1 von %2
@@
; Denotes the current row position within the table
; %1 = current item no - %2 = total number of visible items
@msgTablePositionVisibleRows
Sichtbare Zeile %1 von %2
@@
; Number of total rows and total visible rows in the table
@msgTableVisibleTotalRows
mit %1 Datensätzen und %2 sichtbare Zeilen
@@
; Denotes the current column position within the table
; %1 = current column no - %2 = total number of columns
@msgTablePositionCols
Spalte %1 von %2
@@
; Indicates that row is selectable
@msgTableRowSelectable 
markierbar
@@
; %1=table name - %2=row - %3=column
@msgBrlTableInfo
%1 z%2s%3
@@
; Message given if a table command is invoked outside a table
@msgNotInTable
nicht in einer Tabelle
@@
; Annouced when navigating to the last visible row of the table
@msgTableLastVisibleRow
letzte sichtbare Zeile der Tabelle
@@
; Annouced when navigating to the last visible cell of the table
@msgTableLastVisibleCell
letzte sichtbare Zeile der Tabelle
@@
; Annouced when inserting a row to a table
@msgTableRowInserted
Zeile eingefügt
@@
; Annouced when deleting a row of a table
@msgTableRowDeleted
Zeile gelöscht
@@
@msgEndOfTable
Tabelle verlassen
@@
@msgEmptyTable
Tabelle ist leer
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
mit %1 Zeilen
@@
; Annouced when navigating to the last row of the steploop
@msgStepLoopLastRow
letzte Zeile des steploops
@@
; Annouced when navigating to the last cell of the steploop
@msgStepLoopLastCell
letzte Zelle des steploops
@@

;
; Splitter shell
;
@msgGuiSplitter
trennleiste
@@
@msgGuiSplitterVertical
vertikale
@@
@msgGuiSplitterHorizontal
horizontale
@@
@msgGuiSplitterCombined
kombinierte
@@
; Position (coordinates) of objects within splitter
@msgGuiSplitterVerticalPos
links %1 %2% rechts %3 %4%
@@
@msgGuiSplitterHorizontalPos
oben %1 %2% unten %3 %4%
@@

; Braille message for the splitter
@msgBrlGuiSplitterVerticalPos
(l %1 %2% / r %3 %4%)
@@
@msgBrlGuiSplitterHorizontalPos
(o %1 %2% / u %3 %4%)
@@
;
; Docking shell
;
@msgGuiDockShellVertical
vertikaler trenner
@@
@msgGuiDockShellHorizontal
horizontaler trenner
@@
@msgGuiDockShellVerticalPos
breite %1 %2%
@@
@msgGuiDockShellHorizontalPos
höhe %1 %2%
@@
@msgBrlGuiDockShellVerticalPos
b %1 %2%
@@
@msgBrlGuiDockShellHorizontalPos
h %1 %2%
@@

;
; OTF preview
;
@msgOTFPreviewType
druckvorschau
@@
@msgBrlOTFPreviewType
dv
@@

;
; APO Grid
;
@msgGuiCtrlApoGrid
apo grid
@@
@msgGuiCtrlApoGridLastRow
letzte Zeile des apo grid
@@
@msgGuiCtrlApoGridLastCell
letzte Zelle des apo grid
@@

;
; GuiBox: Groups of controls are announced as "group" along with it's title when the focus comes to the group
;         A group contained within another group is being announced as "subgroup <subgroup-title> of group <group-title>"
;
@msgBeginOfGroup
gruppe
@@
@msgSubgroup
untergruppe %1 von gruppe %2
@@
@msgEndOfGroup
gruppe verlassen
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
Spalte %1 von %2
@@
; Denotes the current row position within the ALV
; %1 = current row no - %2 = total number of rows
@msgALVPositionRows
Datensatzzeile %1 von %2
@@
; Annouced when navigating to the last visible row
@msgALVLastVisibleRow
letzte Zeile des Grid
@@
; Annouced when navigating to the last visible cell
@msgALVLastVisibleCell
letzte Zelle des Grid
@@

; messages given for certain ALV column properties
@msgALVIsColumnKey
Schlüssel
@@
@msgALVIsColumnFiltered
gefiltert
@@
@msgALVIsColumnSorted
sortiert
@@
@msgALVIsColumnSortedAsc
aufsteigend
@@
@msgALVIsColumnSortedDesc
absteigend
@@
@msgALVColumnTypeTotal
hat Summen
@@
@msgALVColumnTypeSubtotal
hat Zwischensummen
@@
@msgALVColumnOperationTypeMean
enthält Mittelwert
@@
@msgALVColumnOperationTypeMinimum
enthält Minimum
@@
@msgALVColumnOperationTypeMaximum
enthält Maximum
@@

; Denotes the ALV cell type "symbol"
@msgALVSymbol
symbol
@@

; annoncement of header
@msgALVHeader
Kopfzeile
@@

; Braille messages for ALV
@msgBrlALVTextField
ef
@@
@msgBrlALVIsColumnKey
s
@@
@msgBrlALVIsColumnFiltered
f
@@
@msgBrlALVIsColumnSortedAsc
auf
@@
@msgBrlALVIsColumnSortedDesc
ab
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
s%1
@@
@msgBrlALVColumnTypeTotal
sum
@@
@msgBrlALVColumnTypeSubtotal
zwsum
@@
@msgBrlALVColumnOperationTypeMean
mw
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
Strukturansicht
@@
@msgTreeSimple
einfache Strukturansicht
@@
@msgTreeList
Listenstrukturansicht
@@
@msgTreeColumn
Spaltenstrukturansicht
@@

; message for single tree entry
@msgTreeEntry
Eintrag
@@
; message for multiple tree entries
@msgTreeEntries
Einträge
@@

; current level within the tree
@msgTreeLevel
Ebene
@@
; number of items contained within this level (used for trees or tabs)
@msgItemPosition
%1 von %2
@@
; to announce the name of the column
@msgTreeItemColumn
Spalte
@@

; types of tree items
@msgTreeTypeHierarchy
Ebene
@@
@msgTreeTypeImage
Grafik
@@
@msgTreeTypeText
text
@@

; number of nodes which are selected (marked)
@msgTreeSelectedNodeCount
%1 Knoten markiert
@@
; name of single tree node
@msgTreeNode
Knoten
@@
; name of multiple tree nodes
@msgTreeNodes
Knoten
@@
; Indicates that the node is marked
@msgTreeNodeMarked
markiert
@@

;Used for the command to read entire node
@msgTreeNotValid
Nicht in einer Spaltenstrukturansicht
@@
@msgTreeNodeSelection
Mit Einzelknotenauswahl
@@
@msgTreeSingleNodeTutor
Mit Einfügen + Umschalt + Pfeiltaste-nach-oben erhalten Sie in der Struktursicht die vollständige Information zum Knoten.
@@ 
; Braille messages for trees
@msgBrlTreeSimple
sa
@@
@msgBrlTreeList	
esa
@@
@msgBrlTreeColumn
ssa
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
+
@@
@msgBrlTreeTypeText
txt
@@

; Calendar format strings
; "week number" announcement
@msgCalendarWeekNumber
Woche
@@
; announcing/presenting different elements of calendar
@msgCalendarButton
Datumsnavigator öffnen/schließen
@@
@msgCalendarNavigator
Kalender Navigator
@@
@msgBrlCalendarNavigator
nav
@@
@msgCalendarToday
heute
@@

;
; Control and item states
;
; indicates a read-only item/control (eg. read-only edits)
@msgStateReadOnly
nur lesen
@@
@msgStateHighlighted
hervorgehoben
@@
@msgStateRequired
erforderlich
@@
@msgStateInvalid
ungültig
@@

; used to announce a color (%1 = number of color)
@msgStateColorNumber
Farbe %1
@@
; Braille state messages
@msgBrlStateReadOnly
s
@@
@msgBrlStateHighlighted
hvg
@@
@msgBrlStateRequired
erf
@@

; to indicate that items are selected (marked) for further processing
@msgItemsSelected
markiert
@@
@msgItemsNotSelected
nicht markiert
@@

; selection modes (in ALV GridView)
@msgSelModeSingleRow
auswahlmodus zeile
@@
@msgSelModeMultipleRows
auswahlmodus mehrfache zeilen
@@
@msgSelModeRowsAndColumns
auswahlmodus zeilen und spalten
@@
@msgSelModeFree
auswahlmodus beliebig
@@

;
; Status bar
;
@msgStatusBarMessage
Statusmeldung
@@
@msgNoStatusBarMessage
keine Statusmeldung
@@
@msgStatusBarMessageSuccess
Statusmeldung erfolgreich
@@
@msgStatusBarMessageError
Statusmeldung Fehler
@@
@msgStatusBarMessageWarning
Statusmeldung Warnung
@@
@msgStatusBarMessageAbort
Statusmeldung abgebrochen
@@
@msgStatusBarMessageInformation
Statusmeldung Information
@@
@msgStatusBarDetails
es sind Details zur Statusmeldung verfügbar
@@

;
; ABAP Lists
;
@msgLstGroupHeader
Gruppen Kopfzeile
@@
@msgLstSubGroupHeader
Teilgruppen Kopfzeile
@@
@msgLstSubGroupLABEL
Teilgruppen Name
@@
@msgLstHeader
Kopfzeile
@@
@msgLstGroupLabel
Gruppen Name
@@
@msgLstFreeText
freier Text
@@
; the following is used in the form: "<current-item-number> of <total-number-of-items>"
@msgLstOf
von
@@
; single "row" in ABAP-list structures
@msgLstRow
Zeile
@@
; multiple "rows" in ABAP-list structures
@msgLstRows
Zeilen
@@
; single "column" in ABAP-list structures
@msgLstColumn
Spalte
@@
; multiple "column" in ABAP-list structures
@msgLstColumns
Spalten
@@
; single "group" in ABAP-list structures
@msgLstGroup
Gruppe
@@
; multiple "groups" in ABAP-list structures
@msgLstGroups
Gruppen
@@
; single "subgroup" in ABAP-list structures
@msgLstSubGroup
Teilgruppe
@@
; multiple "subgroups" in ABAP-list structures
@msgLstSubGroups
Teilgruppen
@@
; to announce the line number in ABAP-list structures
@msgLine
Zeile
@@
; to announce subordinate columns in ABAP-list structures (with super column header)
@msgSubordinateColumns
untergeordnete Spalten
@@
; to announce super columns in ABAP-list structures
@msgSuperColumn
übergeordnete Spalte
@@

; modifiers/properties of list fields
@msgLstFieldModifierNegative
negativ
@@
@msgLstFieldModifierThreshold
Bereichsüberschreitung
@@
@msgLstColumnModifierKey
Schlüssel
@@

; container title in ABAP-list structures
@msgLstContainerTitle
Titel
@@
; container list in ABAP-list structures
@msgLstContainerList
Liste
@@

; to specify the contents of the container (e.g. "list with <number-of-items> checkboxes")
@msgLstWith 
mit
@@

; table(s), tree(s), textboxe(s), ... in ABAP-list structures
@msgLstTable
Tabelle
@@
@msgLstTables
Tabellen
@@
@msgLstTree
Strukturansicht
@@
@msgLstTrees
Strukturansichten
@@
@msgLstTextbox
Textbox
@@
@msgLstTextboxes
Textboxen
@@
@msgLstCheckboxes
Kontrollfelder
@@
@msgLstEditfields
Eingabefelder
@@
@msgLstCheckboxesAndEditfields
Kontrollfelder und Eingabefelder
@@

; to annouce a number of items in ABAP-list structures, eg. "tree number 5"
@msgLstNumber
Nummer
@@

; to announce number of hierarchical levels in ABAP-list structures
@msgLst2HierarchyLevels
mit %1 Gruppen
@@
@msgLst3HierarchyLevels
mit %1 Gruppen mit Teilgruppen
@@
; announce ALV like in ABAP-list structures
@msgLstALVlikeHierarchy
mit Gruppen
@@

;
; Braille symbols for ABAP lists and tables
;
@msgBrlLstTable
ltbl
@@
@msgBrlLstTree
lsa
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
z%1s%2
@@
@msgBrlLstNormalHeaderInfo
s%1
@@
@msgBrlLstGroupInfo
grp%1
@@
@msgBrlLstSubGroupInfo
subgrp%1
@@

@msgLstRowSelection
markier spalte
@@

;
; to annouce inserted line (in ABAP-lists and ALV)
;
@msgInsertedLine
eingefügt
@@
; this is the inserted line type: text, total or sub total (summation sub summation)
@msgInsertedLineTypeText
text
@@
@msgInsertedLineTypeSummation
summe
@@
@msgInsertedLineTypeSubSummation
subsumme
@@

; Braille for line insertion type
@msgBrInsertedLineTypeSummation
--sum--
@@

;
; Annoucements for session info
;
@msgSessionInfoSystem
system
@@
@msgSessionInfoClient
mandant
@@
@msgSessionInfoUser
benutzer
@@
@msgSessionInfoProgram
programm
@@
@msgSessionInfoTransaction
transaktion
@@
@msgSessionInfoInterpretationTime
interpretationszeit
@@
@msgSessionInfoRoundTrips
rückverbindungen
@@
@msgSessionInfoFlushes
flushes
@@

;
; Annoucements for inplace controls
;
@msgInternetExplorer
Browser aktiviert
@@
@msgTutorInternetExplorer
Internet Explorer Konfiguration ist aktiviert
@@
@msgEdge
Browser aktiviert
@@
@msgTutorEdge
Edge Konfiguration ist aktiviert
@@
@msgWinword
word document container
@@
@msgTutorWinword
microsoft word configuration ist aktiviert
@@
@msgExcel
excel document container
@@
@msgTutorExcel
microsoft excel configuration ist aktiviert
@@
@msgPowerPoint
power point document container
@@
@msgTutorPowerPoint
microsoft power point configuration ist aktiviert
@@
@msgWordPerfect
word perfect document container
@@
@msgTutorWordPerfect
word perfect configuration ist aktiviert
@@
@msgAdobeAcrobat
p d f document container
@@
@msgTutorAdobeAcrobat
adobe acrobat configuration ist aktiviert
@@
@msgProject
project document container
@@
@msgTutorProject
microsoft project configuration ist aktiviert
@@
@msgOfficeContainerIsEmpty
Office Container ohne Inhalt
@@

;
; Announcement in text editor (meaning of colored lines of text)
;
@msgTextEditorBreakpoint
zeile mit anhaltepunkt
@@
@msgTextEditorSelected
zeile markiert
@@
@msgTextEditorProtected
zeile geschützt
@@
@msgTextEditorComment
kommentar zeile
@@


;
; (new) ABAP editor
@msgGuiAbapEditor
ABAP editor
@@
@msgTextEditorCollapsedLine
block zugeklappt
@@
@msgTextEditorBlockStartLine
block start
@@
@msgTextEditorBlockEndLine
block ende
@@
@msgTextEditorNoBlock
kein block gefunden
@@
@msgTextEditorBookmark
markierung gesetzt
@@
@msgTextEditorNumberedBookmark
nummerierte markierung %1 gesetzt
@@
@msgTextEditorNoBookmark
keine markierung gesetzt
@@
@msgTextEditorLineNumber
zeile %1 von %2
@@
@msgTextEditorModified
geändert
@@
@msgTextEditorAutoComplete
auto vervollständigung
@@
@msgTextEditorAutoCompleteToolbar
alt+%1 zum umschalten von %2
@@
@msgTextEditorQuickInfoUnavailable
sprechblase nicht verfügbar
@@
@msgTextEditorToolbarUnavailable
symbolleiste nicht verfügbar
@@

;For Column review feature - KK
;
;Announcements for Column Review
;
@msgNoSelection
keine spalte zum kontroll lesen gesetzt
@@
@msgBlankCell
zelle ist leer
@@
@msgClearSelection
kontroll spalte zurückgesetzt
@@
@msgColumnSelect
auswählen
@@
@msgColumnClear
zurücksetzen
@@
@msgColumnSet
kontroll spalte gesetzt
@@
@msgColumnSetError
auswahl der kontroll spalte nicht möglich
@@

;
; history listbox of input fields has opened
;
@msgHistoryOpened
Historie offen
@@
@msgHistoryCount
%1 Einträge
@@
@msgHistorySingleEntry
%1 Eintrag
@@

;
; message for buttons with property emphasized (only in Belize)
;
@msgChangeModeButton
Wechsel zwischen Anzeige und Änderungsmodus
@@
;
; messages for view switch control (only in Belize)
;
@msgGuiVHViewSwitchName
Wechseln der Ansicht
@@

;
; some other general messages
;
@msgBlank
leer
@@
@msgNotSelected
nicht gewählt
@@

endMessages
