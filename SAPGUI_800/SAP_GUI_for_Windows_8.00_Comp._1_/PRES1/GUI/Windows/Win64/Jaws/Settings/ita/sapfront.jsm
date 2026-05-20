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
Estensione lettura schermo Sapfront
@@

; Status message saving application settings
@msgAppSettingsSaved
Impostazioni applicazione salvate
@@
@msgAppSettingsNotSaved
Impostazioni applicazione non possono salvate
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
basso
@@
; set verbosity level for an item to "high"
@msgSapGuiAccVerbosityHigh
alto
@@
@msgSapGuiScriptsNotRunning
attenzione. la sessione corrente non supporta le estensioni per la lettura dello schermo.
@@
@msgSapGuiSessionBusy
attenzione. sessione occupata. attendere prego.
@@

;
; TextFields/Edits
; Generally, the standard JAWS presentation is used
;
; CTextFields - text boxes with F4 help button are announced as "F4 edit"
@msgGuiCTextField
f4 modifica
@@

;
; with F4 help;
@msgGuiHasF4Help
con f4 modifica
@@

;
; Labels
;
; Label / static text - no announcement is made for regular labels
@msgGuiLabel

@@
@msgBrlLabel
testo
@@
@msgBrlSeparator
trattino
@@
@msgLabelHasType
etichetta è
@@

;
; Icons
;
@msgGuiIcon
icona
@@
@msgBrlIcon
icona
@@

;
; Hotspot and link modifier messages, used in combination with annoncement of  control type
;
@msgIsHotspot
hot spot
@@
@msgHasHotspot
con hot spot
@@
@msgHotspotTutor
Per attivare premere F2
@@
@msgIsLink
link
@@
@msgHasLink
con link
@@
@msgBrlIsHotspot
asterisco
@@
@msgBrlHasHotspot
asterisco
@@

;
; Button
;
; Additional speech annoucement for the special "table settings" button
@msgGuiButtonTableSettings
impostazioni tabella
@@

; OKCodeField (the one and only transaction code field)
@msgGuiOkCodeField
campo comando
@@
@msgBrlGuiOkCodeField
comando
@@

;
; announcements for system and application toolbar
;
@msgSystemToolbar
toolbar sistema
@@
@msgApplicationToolbar
toolbar applicazione
@@
@msgEndOfToolbar
uscito da toolbar
@@
@msgBrlApplicationToolbar
bdoa
@@
@msgBrlSystemToolbar
bdos
@@

; footer toolbar area in Belize themed systems
@msgFooter
piè di pagina
@@
@msgEndOfFooter
sto uscendo dal piè di pagina
@@
@msgBrlFooter
ft
@@


;
; define the text of the system toolbar buttons
;
@msgBtnTextSave
Salvare (Ctrl più esse)
@@
@msgBtnTextBack
Indietro (effe 3)
@@
@msgBtnTextExit
Uscire (Shift più effe 3)
@@
@msgBtnTextCancel
Annulla (effe 12)
@@
@msgBtnTextPrint
Stampare (Control più P)
@@
@msgBtnTextFind
Cercare (Control più effe)
@@
@msgBtnTextFindNext
Continuare ricerca (Control più G)
@@
@msgBtnTextFirstPage
Prima Pagina (Ctrl + Screen -)
@@
@msgBtnTextPreviousPage
Pagina precedente (Screen -)
@@
@msgBtnTextNextPage
Pagina successiva (Screen +)
@@
@msgBtnTextLastPage
Ultima pagina (Ctrl + Screen +)
@@
@msgBtnTextCreateSession
Crea nuova sessione
@@
@msgBtnTextGenerateShortcut
Crea un collegamento
@@
@msgBtnTextStartAccCheck
Avviare effe a ci ti esse
@@
@msgBtnTextHelp
Aiuto (effe 1)
@@
@msgBtnTextOkCode
Invio
@@
@msgBtnCommandField
aprire o chiudere campo comando
@@
@msgBtnLocalLayout
personalizzare il lai aut locale
@@

; GuiCombobox
;
; GuiComboboxes are announced as "dropdown listbox"
@msgGuiCombobox
lista a cascata
@@
; Message denotes the current position within the list box - %n are placeholders for numeric values
; %1 = current item no - %2 = total number of items
; e.g. "4 of 10" means that currently the 4th item is shown and the list box
; contains 10 items altogether
@msgGuiComboboxPosition
%1 di %2
@@
; The number of items within the list box
@msgGuiComboboxCount
%1 inserimenti
@@

@msgGuiComboboxSingleEntry
%1 inserimento
@@

;
; history listbox of input fields has opened
;
@msgHistoryOpened
Aperta Cronologia
@@
@msgHistoryCount
%1 registrazioni
@@
@msgHistorySingleEntry
%1 registrazione
@@

;
; Radio buttons
;
; Indicates that the current radio button item is activated
@msgGuiRadioButtonSelected
selezionato
@@
; Indicates that the current radio button item is not activated
@msgGuiRadioButtonNotSelected
non selezionato
@@

; Message denotes the current position within the radio button group
; %1 = current item no - %2 = total number of items in group
@msgGuiRadioButtonPosition
%1 di %2
@@

;
; Picture control
;
@msgGuiPicture
immagine
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
selezionato
@@
; Indicates that the currently focused tab is not activated
@msgGuiTabNotSelected
non selezionato
@@

;
; TableControl
;
; Announced when entering a table
@msgTableControl
in tabella
@@
; Denotes the current row position within the table
; %1 = current row no - %2 = total number of rows
@msgTablePositionRows
record %1 di %2
@@
; Denotes the current row position within the table
; %1 = current item no - %2 = total number of visible items
@msgTablePositionVisibleRows
riga visibile %1 di %2
@@
; Number of total rows and total visible rows in the table
@msgTableVisibleTotalRows
con %1 records e %2 righe visibili
@@
; Denotes the current column position within the table
; %1 = current column no - %2 = total number of columns
@msgTablePositionCols
colonna %1 di %2
@@
; Indicates that row is selectable
@msgTableRowSelectable 
selezionabile
@@
; %1=table name - %2=row - %3=column
@msgBrlTableInfo
%1 r%2c%3
@@
; Message given if a table command is invoked outside a table
@msgNotInTable
non in tabella
@@
; Annouced when navigating to the last visible row of the table
@msgTableLastVisibleRow
ultima riga visibile in tabella
@@
; Annouced when navigating to the last visible cell of the table
@msgTableLastVisibleCell
ultima cella visibile in tabella
@@
; Annouced when inserting a row to a table
@msgTableRowInserted
riga inserita
@@
; Annouced when deleting a row of a table
@msgTableRowDeleted
riga cancellata
@@
@msgEndOfTable
fuori da tabella
@@
@msgEmptyTable
la tabella è vuota
@@

;
; Steploop
;
; Announced when entering a steploop
@msgStepLoop
step lup
@@
; Number of total rows and total columns in the steploop
@msgStepLoopRowsTotal
con %1 righe
@@
; Annouced when navigating to the last row of the steploop
@msgStepLoopLastRow
ultima riga nello step lup
@@
; Annouced when navigating to the last cell of the steploop
@msgStepLoopLastCell
ultima cella nello step lup
@@

;
; Splitter shell
;
@msgGuiSplitter
divisore
@@
@msgGuiSplitterVertical
verticale
@@
@msgGuiSplitterHorizontal
orizzontale
@@
@msgGuiSplitterCombined
combinato
@@
; Position (coordinates) of objects within splitter
@msgGuiSplitterVerticalPos
sinistra %1 %2% destra %3 %4%
@@
@msgGuiSplitterHorizontalPos
sopra %1 %2% percento sotto %3 %4%
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
docking view verticale
@@
@msgGuiDockShellHorizontal
docking view orizzontale
@@
@msgGuiDockShellVerticalPos
larghezza %1 %2%
@@
@msgGuiDockShellHorizontalPos
altezza %1 %2%
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
anteprima di stampa
@@
@msgBrlOTFPreviewType
stampa
@@

;
; APO Grid
;
@msgGuiCtrlApoGrid
Vista griglia apo
@@
@msgGuiCtrlApoGridLastRow
ultima riga nella griglia apo
@@
@msgGuiCtrlApoGridLastCell
ultima riga nella griglia apo
@@

;
; GuiBox: Groups of controls are announced as "group" along with it's title when the focus comes to the group
;         A group contained within another group is being announced as "subgroup <subgroup-title> of group <group-title>"
;
@msgBeginOfGroup
gruppo
@@
@msgSubgroup
sottogruppo %1 del gruppo %2
@@
@msgEndOfGroup
fuori dal gruppo
@@

;
; ALV
;
; ALV name - announced when entering the ALV
@msgALV
vista griglia A elle Vi
@@
; Denotes the current column position within the ALV
; %1 = current column no - %2 = total number of columns
@msgALVPositionColumns
colonna %1 di %2
@@
; Denotes the current row position within the ALV
; %1 = current row no - %2 = total number of rows
@msgALVPositionRows
record %1 di %2
@@
; Annouced when navigating to the last visible row
@msgALVLastVisibleRow
ultima riga nella griglia
@@
; Annouced when navigating to the last visible cell
@msgALVLastVisibleCell
ultima cella nella griglia
@@

; messages given for certain ALV column properties
@msgALVIsColumnKey
chiave
@@
@msgALVIsColumnFiltered
filtrato
@@
@msgALVIsColumnSorted
ordinato
@@
@msgALVIsColumnSortedAsc
ascendente
@@
@msgALVIsColumnSortedDesc
discendente
@@
@msgALVColumnTypeTotal
ha somme totali
@@
@msgALVColumnTypeSubtotal
ha subtotali
@@
@msgALVColumnOperationTypeMean
contiene valore medio
@@
@msgALVColumnOperationTypeMinimum
contiene valore minimo
@@
@msgALVColumnOperationTypeMaximum
contiene valore massimo
@@


; Denotes the ALV cell type "symbol"
@msgALVSymbol
simbolo
@@

; annoncement of header
@msgALVHeader
riga di testata
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
acca di erre
@@
@msgBrlALVHeaderInfo
c%1
@@
@msgBrlALVColumnTypeTotal
somma
@@
@msgBrlALVColumnTypeSubtotal
subtotale
@@
@msgBrlALVColumnOperationTypeMean
medio
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
vista ad albero
@@
@msgTreeSimple
vista ad albero semplice
@@
@msgTreeList
elenco ad albero
@@
@msgTreeColumn
colonna albero
@@

; message for single tree entry
@msgTreeEntry
elemento
@@
; message for multiple tree entries
@msgTreeEntries
elementi
@@

; current level within the tree
@msgTreeLevel
livello
@@
; number of items contained within this level (used for trees or tabs)
@msgItemPosition
%1 di %2
@@
; to announce the name of the column
@msgTreeItemColumn
colonna
@@

; types of tree items
@msgTreeTypeHierarchy
livello
@@
@msgTreeTypeImage
immagine
@@
@msgTreeTypeText
testo
@@

; number of nodes which are selected (marked)
@msgTreeSelectedNodeCount
%1 nodi selezionati
@@
; name of single tree node
@msgTreeNode
nodo
@@
; name of multiple tree nodes
@msgTreeNodes
nodi
@@
; Indicates that the node is marked
@msgTreeNodeMarked
marcato
@@

;Used for the command to read entire node
@msgTreeNotValid
Non sono su una colonna dell’albero
@@
@msgTreeNodeSelection
con selezione a nodo singolo
@@
@msgTreeSingleNodeTutor
Leggere il nodo completo in questo albero premendo Shift più Insert più freccia giù
@@
; Braille messages for trees
@msgBrlTreeSimple
ti vi
@@
@msgBrlTreeList	
ti vi elle
@@
@msgBrlTreeColumn
ti vi ci
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
chiuso
@@
@msgBrlTreeTypeText
txt
@@

; Calendar format strings

; "week number" announcement
@msgCalendarWeekNumber
numero della settimana
@@
; announcing/presenting different elements of calendar
@msgCalendarButton
aprire/chiudere navigatore del calendario
@@
@msgCalendarNavigator
navigatore del calendario
@@
@msgBrlCalendarNavigator
nav
@@
@msgCalendarToday
oggi
@@


;
; Control and item states
;
; indicates a read-only item/control (eg. read-only edits)
@msgStateReadOnly
sola lettura
@@
@msgStateHighlighted
evidenziato
@@
@msgStateRequired
richiesto
@@
@msgStateInvalid
non valido
@@

; used to announce a color (%1 = number of color)
@msgStateColorNumber
colore %1
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
selezionato
@@
@msgItemsNotSelected
non selezionato
@@

; selection modes (in ALV GridView)
@msgSelModeSingleRow
modalità di selezione riga singola
@@
@msgSelModeMultipleRows
modalità di selezione riga multipla
@@
@msgSelModeRowsAndColumns
modalità di selezione righe e colonne
@@
@msgSelModeFree
modalità di selezione libera
@@

;
; Status bar
;
@msgStatusBarMessage
messaggio di stato
@@
@msgNoStatusBarMessage
nessun messaggio di stato mostrato
@@
@msgStatusBarMessageSuccess
stato successo
@@
@msgStatusBarMessageError
stato errore
@@
@msgStatusBarMessageWarning
stato attenzione
@@
@msgStatusBarMessageAbort
stato abortito
@@
@msgStatusBarMessageInformation
stato informazione
@@
@msgStatusBarDetails
Disponibili dettagli sullo stato 
@@

;
; ABAP Lists
;
@msgLstGroupHeader
intestazione gruppo 
@@
@msgLstSubGroupHeader
intestazione sotto gruppo
@@
@msgLstSubGroupLABEL
etichetta sotto gruppo
@@
@msgLstHeader
intestazione
@@
@msgLstGroupLabel
etichetta gruppo
@@
@msgLstFreeText
testo libero
@@
; the following is used in the form: "<current-item-number> of <total-number-of-items>"
@msgLstOf
di
@@
; single "row" in ABAP-list structures
@msgLstRow
riga
@@
; multiple "rows" in ABAP-list structures
@msgLstRows
righe
@@
; single "column" in ABAP-list structures
@msgLstColumn
colonna
@@
; multiple "column" in ABAP-list structures
@msgLstColumns
colonne
@@
; single "group" in ABAP-list structures
@msgLstGroup
gruppo
@@
; multiple "groups" in ABAP-list structures
@msgLstGroups
gruppi
@@
; single "subgroup" in ABAP-list structures
@msgLstSubGroup
sottogruppo
@@
; multiple "subgroups" in ABAP-list structures
@msgLstSubGroups
sottogruppi
@@
; to announce the line number in ABAP-list structures
@msgLine
linea
@@
; to announce subordinate columns in ABAP-list structures (with super column header)
@msgSubordinateColumns
sotto colonne
@@
; to announce super columns in ABAP-list structures
@msgSuperColumn
super colonna
@@

; modifiers/properties of list fields
@msgLstFieldModifierNegative
negativo
@@
@msgLstFieldModifierThreshold
sotto la soglia
@@
@msgLstColumnModifierKey
chiave
@@

; container title in ABAP-list structures
@msgLstContainerTitle
titolo
@@
; container list in ABAP-list structures
@msgLstContainerList
elenco
@@

; to specify the contents of the container (e.g. "list with <number-of-items> checkboxes")
@msgLstWith 
con
@@

; table(s), tree(s), textboxe(s), ... in ABAP-list structures
@msgLstTable
tabella
@@
@msgLstTables
tabelle
@@
@msgLstTree
albero
@@
@msgLstTrees
alberi
@@
@msgLstTextbox
campo testo
@@
@msgLstTextboxes
campi testo
@@
@msgLstCheckboxes
ceck boxesis
@@
@msgLstEditfields
edit filds
@@
@msgLstCheckboxesAndEditfields
ceck boxesis e edit filds
@@

; to annouce a number of items in ABAP-list structures, eg. "tree number 5"
@msgLstNumber
numero
@@

; to announce number of hierarchical levels in ABAP-list structures
@msgLst2HierarchyLevels
con %1 gruppi
@@
@msgLst3HierarchyLevels
con %1 gruppi con sottogruppi
@@
; announce ALV like in ABAP-list structures
@msgLstALVlikeHierarchy
con gruppi
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
inserito
@@
; this is the inserted line type: text, total or sub total (summation sub summation)
@msgInsertedLineTypeText
testo
@@
@msgInsertedLineTypeSummation
somma
@@
@msgInsertedLineTypeSubSummation
somma parziale
@@

; Braille for line insertion type
@msgBrInsertedLineTypeSummation
--somma--
@@

;
; Annoucements for session info
;
@msgSessionInfoSystem
sistema
@@
@msgSessionInfoClient
mandante
@@
@msgSessionInfoUser
cliente
@@
@msgSessionInfoProgram
programma
@@
@msgSessionInfoTransaction
transazione
@@
@msgSessionInfoInterpretationTime
interpretescion taim
@@
@msgSessionInfoRoundTrips
raund trips
@@
@msgSessionInfoFlushes
fluscisis
@@

;
; Annoucements for inplace controls
;
@msgInternetExplorer
browser attivato

@@
@msgTutorInternetExplorer
la confugrazione di internet explorer è ora attiva
@@
@msgEdge
browser attivato
@@
@msgTutorEdge
la confugrazione di edge è ora attiva
@@
@msgWinword
contenitore documento uord
@@
@msgTutorWinword
la configurazione di maicrosoft uord è ora attiva
@@
@msgExcel
contenitore documento exsel 
@@
@msgTutorExcel
la configurazione di maicrosoft exsel è ora attiva
@@
@msgPowerPoint
contenitore documento pauer point 
@@
@msgTutorPowerPoint
la configurazione di maicrosoft pauer point è ora attiva
@@
@msgWordPerfect
contenitore documento uord perfect
@@
@msgTutorWordPerfect
la configurazione di uord perfect è ora attiva
@@
@msgAdobeAcrobat
contenitore documento pi di effe
@@
@msgTutorAdobeAcrobat
la configurazione di adobi acrobat è ora attiva
@@
@msgProject
contenitore documento progect
@@
@msgTutorProject
la configurazione di maicrosoft progect è ora attiva
@@
@msgOfficeContainerIsEmpty
Contenitore office vuoto
@@

;
; Announcement in text editor (meaning of colored lines of text)
;
@msgTextEditorBreakpoint
riga con brek point
@@
@msgTextEditorSelected
riga selezionata
@@
@msgTextEditorProtected
riga protetta
@@
@msgTextEditorComment
riga di commento
@@

;
; (new) ABAP editor
@msgGuiAbapEditor
editor abap
@@
@msgTextEditorCollapsedLine
riga collassata
@@
@msgTextEditorBlockStartLine
inizio blocco
@@
@msgTextEditorBlockEndLine
fine blocco
@@
@msgTextEditorNoBlock
non dentro ad un bloco
@@
@msgTextEditorBookmark
insieme buk mark 
@@
@msgTextEditorNumberedBookmark
insieme di buk mark numero %1
@@
@msgTextEditorNoBookmark
non un insieme di buk mark
@@
@msgTextEditorLineNumber
riga %1 di %2
@@
@msgTextEditorModified
modificato
@@
@msgTextEditorAutoComplete
auto completamento
@@
@msgTextEditorAutoCompleteToolbar
alt più %1 per azionare %2
@@
@msgTextEditorQuickInfoUnavailable
quick info non disponibile
@@
@msgTextEditorToolbarUnavailable
toolbar non disponibile
@@

;For Column review feature - KK
;
;Announcements for Column Review
;
@msgNoSelection
Nessuna colonna selezionata per la revisione
@@
@msgBlankCell
Nessun valore in cella
@@
@msgClearSelection
Colonna selezionata per la revisione esaminata
@@
@msgColumnSelect
Selezionare
@@
@msgColumnClear
esaminata
@@
@msgColumnSet
Colonna selezionata per la revisione
@@
@msgColumnSetError
Non è possibile selezionare colonne per la revisione
@@

;
; message for buttons with property emphasized (only in Belize)
;
@msgChangeModeButton
passa da mostra a modifica e viceversa
@@
;
; messages for view switch control (only in Belize)
;
@msgGuiVHViewSwitchName
passa a una vista differente
@@

;
; some other general messages
;
@msgBlank
vuoto
@@
@msgNotSelected
non selezionato
@@

endMessages
