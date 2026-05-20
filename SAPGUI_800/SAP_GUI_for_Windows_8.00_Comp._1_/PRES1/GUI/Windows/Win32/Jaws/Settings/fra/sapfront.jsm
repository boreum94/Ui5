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
  SapGuiVerbosityItems="|ToggleSapGuiAccVerbosity:SAPGUI verbosité|ToggleSapGuiSteploopMode:SAPGUI mode de step loop "
  ;For column review - KK (discontinued)
  ; jvToggleColumnReview="|ToggleColumnReviewVerbosity:sélectionnez colonne de contrôle courante"
messages

; Give version information
@msgSapGuiAppName
Sapfront screen reader extensions (extensions de lecture d'écran)
@@

; Status message saving application settings
@msgAppSettingsSaved
paramètres d'application sauvegardés
@@
@msgAppSettingsNotSaved
n'a pas pu sauvegarder des paramètres d'application
@@

;
; Messages concerning the verbosity levels and modes:
;
; switch the annoucement of an item "off" in the verbosity dialog
@msgSapGuiModeOff
desactivé
@@
; switch the annoucement of an item "on" in the verbosity dialog
@msgSapGuiModeOn
activé
@@
; set verbosity level for an item to "low"
@msgSapGuiAccVerbosityLow
réduite
@@
; set verbosity level for an item to "high"
@msgSapGuiAccVerbosityHigh
détaillée
@@
@msgSapGuiScriptsNotRunning
Attention. Les extensions de lecture d'écran n'est pas soutenir par cette session utilisateur.
@@
@msgSapGuiSessionBusy
Attention. Session n'est pas prêt pour la saisie. Veuillez patienter svp.
@@

;
; TextFields/Edits
; Generally, the standard JAWS presentation is used
;
; CTextFields - text boxes with F4 help button are announced as "F4 edit"
@msgGuiCTextField
Édition du F4 avec aide à la saisie
@@

;
; with F4 help;
@msgGuiHasF4Help
F4 aide à la saisie
@@

;
; Labels
;
; Label / static text - no announcement is made for regular labels
@msgGuiLabel

@@
@msgBrlLabel
Txt
@@
@msgBrlSeparator
-
@@
@msgLabelHasType
label est
@@

;
; Icons
;
@msgGuiIcon
Icône
@@
@msgBrlIcon
Ico
@@

;
; Hotspot and link modifier messages, used in combination with annoncement of  control type
;
@msgIsHotspot
Hotspot
@@
@msgHasHotspot
avec hotspot
@@
@msgHotspotTutor
Pour l’activer, f2
@@
@msgIsLink
Lien
@@
@msgHasLink
avec lien
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
Bouton des paramètres du table
@@

; OKCodeField (the one and only transaction code field)
@msgGuiOkCodeField
Zone de commande
@@
@msgBrlGuiOkCodeField
Cmd
@@

;
; announcements for system and application toolbar
;
@msgSystemToolbar
Barre de fonctions système
@@
@msgApplicationToolbar
Barre d'outils d'application
@@
@msgEndOfToolbar
quitter barre d'outils
@@
@msgBrlApplicationToolbar
bdoa
@@
@msgBrlSystemToolbar
bdos
@@

; footer toolbar area in Belize themed systems
@msgFooter
bas de page
@@
@msgEndOfFooter
quitter bas de page
@@
@msgBrlFooter
bdp
@@

;
; define the text of the system toolbar buttons
;
@msgBtnTextSave
sauvegarder (Ctrl+S)
@@
@msgBtnTextBack
retour (F3)
@@
@msgBtnTextExit
terminer (Maj+F3)
@@
@msgBtnTextCancel
interrompre (F12)
@@
@msgBtnTextPrint
imprimer... (Ctrl+P)
@@
@msgBtnTextFind
rechercher(Ctrl+F)
@@
@msgBtnTextFindNext
continuer recherche(Ctrl+G)
@@
@msgBtnTextFirstPage
première page (Ctrl+Ecr. prèc.)
@@
@msgBtnTextPreviousPage
page précédente (Ecr. prèc.)
@@
@msgBtnTextNextPage
page suivante (Ecr. suiv.)
@@
@msgBtnTextLastPage
dernière page (Ctrl+Ecr. suiv.)
@@
@msgBtnTextCreateSession
créer un nouveau mode
@@
@msgBtnTextGenerateShortcut
crée un raccourci
@@
@msgBtnTextStartAccCheck
lancer FACTS
@@
@msgBtnTextHelp
aide (F1)
@@
@msgBtnTextOkCode
afficher (Entrée)
@@
@msgBtnCommandField
fermer ou ouvrir zone de commande
@@
@msgBtnLocalLayout
ajuster mise en form locale
@@

; GuiCombobox
;
; GuiComboboxes are announced as "dropdown listbox"
@msgGuiCombobox
Liste déroulante
@@
; Message denotes the current position within the list box - %n are placeholders for numeric values
; %1 = current item no - %2 = total number of items
; e.g. "4 of 10" means that currently the 4th item is shown and the list box
; contains 10 items altogether
@msgGuiComboboxPosition
%1 sur %2
@@
; The number of items within the list box
@msgGuiComboboxCount
%1 éléments
@@
@msgGuiComboboxSingleEntry
%1 élément
@@

;
; Radio buttons
;
; Indicates that the current radio button item is activated
@msgGuiRadioButtonSelected
coché
@@
; Indicates that the current radio button item is not activated
@msgGuiRadioButtonNotSelected
non coché
@@

; Message denotes the current position within the radio button group
; %1 = current item no - %2 = total number of items in group
@msgGuiRadioButtonPosition
%1 sur %2
@@

;
; Picture control
;
@msgGuiPicture
Graphique
@@
;
; Editor control
;
@msgGuiTextEdit
Édition multiligne
@@

;
; Tabstrip
;
; Indicates that the currently focused tab is activated
@msgGuiTabSelected
sélectionné
@@
; Indicates that the currently focused tab is not activated
@msgGuiTabNotSelected
non sélectionné
@@

;
; TableControl
;
; Announced when entering a table
@msgTableControl
dans un tableau
@@
; Denotes the current row position within the table
; %1 = current row no - %2 = total number of rows
@msgTablePositionRows
Enregistrement ligne %1 sur %2
@@
; Denotes the current row position within the table
; %1 = current item no - %2 = total number of visible items
@msgTablePositionVisibleRows
Ligne visible %1 sur %2
@@
; Number of total rows and total visible rows in the table
@msgTableVisibleTotalRows
%1 enregistrements et %2 lignes visibles
@@
; Denotes the current column position within the table
; %1 = current column no - %2 = total number of columns
@msgTablePositionCols
Colonne %1 sur %2
@@
; Indicates that row is selectable
@msgTableRowSelectable 
sélectionnable
@@
; %1=table name - %2=row - %3=column
@msgBrlTableInfo
%1 l%2c%3
@@
; Message given if a table command is invoked outside a table
@msgNotInTable
Vous n’êtes pas dans un tableau
@@
; Annouced when navigating to the last visible row of the table
@msgTableLastVisibleRow
fin de ligne visible
@@
; Annouced when navigating to the last visible cell of the table
@msgTableLastVisibleCell
fin de ligne visible
@@
; Annouced when inserting a row to a table
@msgTableRowInserted
ligne inséré
@@
; Annouced when deleting a row of a table
@msgTableRowDeleted
ligne supprimé
@@
@msgEndOfTable
fin du tableau
@@
@msgEmptyTable
tableau est vide
@@

;
; Steploop
;
; Announced when entering a steploop
@msgStepLoop
step loop
@@
; Number of total rows and total columns in the steploop
@msgStepLoopRowsTotal
%1 lignes
@@
; Annouced when navigating to the last row of the steploop
@msgStepLoopLastRow
fin de ligne du step loop
@@
; Annouced when navigating to the last cell of the steploop
@msgStepLoopLastCell
fin de cellules du step loop
@@

;
; Splitter shell
;
@msgGuiSplitter
Séparateur
@@
@msgGuiSplitterVertical
verticale
@@
@msgGuiSplitterHorizontal
horizontale
@@
@msgGuiSplitterCombined
combiné
@@
; Position (coordinates) of objects within splitter
@msgGuiSplitterVerticalPos
à gauche %1 %2% à droite %3 %4%
@@
@msgGuiSplitterHorizontalPos
au-dessus %1 %2% au-dessous %3 %4%
@@

; Braille message for the splitter
@msgBrlGuiSplitterVerticalPos
(gch %1 %2% / dte %3 %4%)
@@
@msgBrlGuiSplitterHorizontalPos
(au-dessus %1 %2% / au-dessous %3 %4%)
@@
;
; Docking shell
;
@msgGuiDockShellVertical
Séparateur verticale
@@
@msgGuiDockShellHorizontal
horizontaler trenner
Séparateur horizontale
@@
@msgGuiDockShellVerticalPos
largeur %1 %2%
@@
@msgGuiDockShellHorizontalPos
hauteur %1 %2%
@@
@msgBrlGuiDockShellVerticalPos
l %1 %2%
@@
@msgBrlGuiDockShellHorizontalPos
h %1 %2%
@@

;
; OTF preview
;
@msgOTFPreviewType
prévisualisation
@@
@msgBrlOTFPreviewType
pv
@@

;
; APO Grid
;
@msgGuiCtrlApoGrid
apo grid
@@
@msgGuiCtrlApoGridLastRow
fin de lign du apo grid
letzte Zeile des apo grid
@@
@msgGuiCtrlApoGridLastCell
fin de cellules du apo grid
@@

;
; GuiBox: Groups of controls are announced as "group" along with it's title when the focus comes to the group
;         A group contained within another group is being announced as "subgroup <subgroup-title> of group <group-title>"
;
@msgBeginOfGroup
boîte de groupe
@@
@msgSubgroup
sous-groupe %1 de groupe %2
@@
@msgEndOfGroup
fin de groupe
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
colonne %1 sur %2
@@
; Denotes the current row position within the ALV
; %1 = current row no - %2 = total number of rows
@msgALVPositionRows
enregistrement ligne %1 sur %2
@@
; Annouced when navigating to the last visible row
@msgALVLastVisibleRow
fin de ligne
@@
; Annouced when navigating to the last visible cell
@msgALVLastVisibleCell
fin de cellules
@@

; messages given for certain ALV column properties
@msgALVIsColumnKey
clé
@@
@msgALVIsColumnFiltered
filtré
@@
@msgALVIsColumnSorted
assorti
@@
@msgALVIsColumnSortedAsc
ascendant 
@@
@msgALVIsColumnSortedDesc
descendant
@@
@msgALVColumnTypeTotal
contenir des totals
@@
@msgALVColumnTypeSubtotal
contenir des sous-totals
@@
@msgALVColumnOperationTypeMean
inclure la moyenne
@@
@msgALVColumnOperationTypeMinimum
inclure le minimum
@@
@msgALVColumnOperationTypeMaximum
inclure le maximum
@@

; Denotes the ALV cell type "symbol"
@msgALVSymbol
symbole
@@

; annoncement of header
@msgALVHeader
barre d'en-tête
@@

; Braille messages for ALV
@msgBrlALVTextField
Éd
@@
@msgBrlALVIsColumnKey
c
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
TLgn
@@
@msgBrlALVHeaderInfo
s%1
@@
@msgBrlALVColumnTypeTotal
total
@@
@msgBrlALVColumnTypeSubtotal
sous-total
@@
@msgBrlALVColumnOperationTypeMean
moy
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
Arborescence
@@
@msgTreeSimple
Arborescence simple
@@
@msgTreeList
Arborescence list
@@
@msgTreeColumn
Arborescence colonne
@@

; message for single tree entry
@msgTreeEntry
élément
@@
; message for multiple tree entries
@msgTreeEntries
éléments
@@

; current level within the tree
@msgTreeLevel
niveau
@@
; number of items contained within this level (used for trees or tabs)
@msgItemPosition
%1 sur %2
@@
; to announce the name of the column
@msgTreeItemColumn
colonne
@@

; types of tree items
@msgTreeTypeHierarchy
niveau
@@
@msgTreeTypeImage
graphique
@@
@msgTreeTypeText
texte
@@

; number of nodes which are selected (marked)
@msgTreeSelectedNodeCount
%1 noeuds sélectionné
@@
; name of single tree node
@msgTreeNode
noeud
@@
; name of multiple tree nodes
@msgTreeNodes
noeuds
@@
; Indicates that the node is marked
@msgTreeNodeMarked
sélectionné
@@

;Used for the command to read entire node
@msgTreeNotValid
fonction non disponsible
@@
@msgTreeNodeSelection
avec sélection simple
@@
@msgTreeSingleNodeTutor
Pour obtenir plus d'information sur ce noeud, appuyez sur INSERT + MAJ + FLÈCHE HAUT.
@@ 
; Braille messages for trees
@msgBrlTreeSimple
Arb
@@
@msgBrlTreeList	
ArbLst
@@
@msgBrlTreeColumn
ArbCol
@@
@msgBrlTreeLevel
Niv
@@
@msgBrlTVImage
Img
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
semaine
@@
; announcing/presenting different elements of calendar
@msgCalendarButton
ouvrir/fermer navigateur de dates
@@
@msgCalendarNavigator
navigateur de calendrier
@@
@msgBrlCalendarNavigator
nav
@@
@msgCalendarToday
aujourd'hui
@@

;
; Control and item states
;
; indicates a read-only item/control (eg. read-only edits)
@msgStateReadOnly
en lecture seule
@@
@msgStateHighlighted
surligné
@@
@msgStateRequired
requis
@@
@msgStateInvalid
non valide
@@

; used to announce a color (%1 = number of color)
@msgStateColorNumber
Couleur %1
@@
; Braille state messages
@msgBrlStateReadOnly
lec
@@
@msgBrlStateHighlighted
surl
@@
@msgBrlStateRequired
rq
@@

; to indicate that items are selected (marked) for further processing
@msgItemsSelected
sélectionné
@@
@msgItemsNotSelected
pas sélectionné
@@

; selection modes (in ALV GridView)
@msgSelModeSingleRow
mode de sélection ligne
@@
@msgSelModeMultipleRows
mode de sélection multiligne
@@
@msgSelModeRowsAndColumns
mode de sélection lignes et colonnes
@@
@msgSelModeFree
mode de sélection libre
@@

;
; Status bar
;
@msgStatusBarMessage
message statut
@@
@msgNoStatusBarMessage
non message statut
@@
@msgStatusBarMessageSuccess
message status de succès
@@
@msgStatusBarMessageError
message status d'erreur
@@
@msgStatusBarMessageWarning
message status d'alerte
@@
@msgStatusBarMessageAbort
message status annulée
@@
@msgStatusBarMessageInformation
message status d'information
@@
@msgStatusBarDetails
message status detaillé disponsible
@@

;
; ABAP Lists
;
@msgLstGroupHeader
ligne d'en-tête du groupe
@@
@msgLstSubGroupHeader
ligne d'en-tête du sous-groupe
@@
@msgLstSubGroupLABEL
titre du sous-groupe
@@
@msgLstHeader
ligne d'en-tête
@@
@msgLstGroupLabel
titre du groupe
@@
@msgLstFreeText
texte libre
@@
; the following is used in the form: "<current-item-number> of <total-number-of-items>"
@msgLstOf
sur
@@
; single "row" in ABAP-list structures
@msgLstRow
ligne
@@
; multiple "rows" in ABAP-list structures
@msgLstRows
lignes
@@
; single "column" in ABAP-list structures
@msgLstColumn
colonne
@@
; multiple "column" in ABAP-list structures
@msgLstColumns
colonnes
@@
; single "group" in ABAP-list structures
@msgLstGroup
groupe
@@
; multiple "groups" in ABAP-list structures
@msgLstGroups
groupes
@@
; single "subgroup" in ABAP-list structures
@msgLstSubGroup
sous-groupe
@@
; multiple "subgroups" in ABAP-list structures
@msgLstSubGroups
sous-groupes
@@
; to announce the line number in ABAP-list structures
@msgLine
ligne
@@
; to announce subordinate columns in ABAP-list structures (with super column header)
@msgSubordinateColumns
colonne subordonné
@@
; to announce super columns in ABAP-list structures
@msgSuperColumn
colonne supérieur
@@

; modifiers/properties of list fields
@msgLstFieldModifierNegative
négative
@@
@msgLstFieldModifierThreshold
dépassement du seuil
@@
@msgLstColumnModifierKey
clé
@@

; container title in ABAP-list structures
@msgLstContainerTitle
titre
@@
; container list in ABAP-list structures
@msgLstContainerList
tiste
@@

; to specify the contents of the container (e.g. "list with <number-of-items> checkboxes")
@msgLstWith 
avec
@@

; table(s), tree(s), textboxe(s), ... in ABAP-list structures
@msgLstTable
Tableau
@@
@msgLstTables
Tableaus
@@
@msgLstTree
Arborescence
@@
@msgLstTrees
Arborescences
@@
@msgLstTextbox
Zone de texte
@@
@msgLstTextboxes
Zones
@@
@msgLstCheckboxes
Cases à cocher
@@
@msgLstEditfields
Éditions
@@
@msgLstCheckboxesAndEditfields
Cases à cocher et Éditions
@@

; to annouce a number of items in ABAP-list structures, eg. "tree number 5"
@msgLstNumber
numéro
@@

; to announce number of hierarchical levels in ABAP-list structures
@msgLst2HierarchyLevels
avec %1 groupes
@@
@msgLst3HierarchyLevels
avec %1 groupes et sous-groupes
@@
; announce ALV like in ABAP-list structures
@msgLstALVlikeHierarchy
avec groupes
@@

;
; Braille symbols for ABAP lists and tables
;
@msgBrlLstTable
LstTbl
@@
@msgBrlLstTree
LstArb
@@
@msgBrlLstGroup
LstGrp
@@
@msgBrlLstSubgroup
LstSous
@@
@msgBrlLstContainerList
Lst
@@
@msgBrlLstFieldModifierThreshold
^
@@
@msgBrlLstFieldModifierNegative
-
@@
@msgBrlLstNormalHeaderType
TCol
@@
@msgBrlLstSuperColumnHeaderType
TSousCol
@@
@msgBrlLstGroupHeaderType
TGrpCol
@@

@msgBrlLstTablePosInfo
l%1c%2
@@
@msgBrlLstNormalHeaderInfo
c%1
@@
@msgBrlLstGroupInfo
grp%1
@@
@msgBrlLstSubGroupInfo
sousgrp%1
@@

@msgLstRowSelection
sélectionner ligne
@@

;
; to annouce inserted line (in ABAP-lists and ALV)
;
@msgInsertedLine
inséré
@@
; this is the inserted line type: text, total or sub total (summation sub summation)
@msgInsertedLineTypeText
texte
@@
@msgInsertedLineTypeSummation
totalisation
@@
@msgInsertedLineTypeSubSummation
sous-totalisation
@@

; Braille for line insertion type
@msgBrInsertedLineTypeSummation
--total--
@@

;
; Annoucements for session info
;
@msgSessionInfoSystem
Système
@@
@msgSessionInfoClient
Mandant
@@
@msgSessionInfoUser
Utilisateur
@@
@msgSessionInfoProgram
Programme
@@
@msgSessionInfoTransaction
Transaction
@@
@msgSessionInfoInterpretationTime
Délai d'interpretation
@@
@msgSessionInfoRoundTrips
Temps de réponse
@@
@msgSessionInfoFlushes
Flushs
@@

;
; Annoucements for inplace controls
;
@msgInternetExplorer
Browser utilisé
@@
@msgTutorInternetExplorer
Les paramètres Internet Explorer sont utilisés
@@
@msgEdge
Browser utilisé
@@
@msgTutorEdge
Les paramètres Edge sont utilisés
@@
@msgWinword
Conteneur Word
@@
@msgTutorWinword
Les paramètres Microsoft Word sont utilisés
@@
@msgExcel
Conteneur Excel
@@
@msgTutorExcel
Les paramètres Microsoft Excel configuration sont utilisés
@@
@msgPowerPoint
Conteneur PowerPoint
@@
@msgTutorPowerPoint
Les paramètres Microsoft Power Point sont utilisés
@@
@msgWordPerfect
Conteneur Word Perfect
@@
@msgTutorWordPerfect
Les paramètres Word Perfect sont utilisés
@@
@msgAdobeAcrobat
Conteneur PDF
@@
@msgTutorAdobeAcrobat
Les paramètres Adobe Acrobat sont utilisés
@@
@msgProject
Conteneur Project
@@
@msgTutorProject
Les paramètres Microsoft Project sont utilisés
@@
@msgOfficeContainerIsEmpty
Conteneur est vide
@@

;
; Announcement in text editor (meaning of colored lines of text)
;
@msgTextEditorBreakpoint
ligne avec point d'arrêt
@@
@msgTextEditorSelected
ligne selectionné
@@
@msgTextEditorProtected
ligne protégé
@@
@msgTextEditorComment
ligne de commentaire
@@


;
; (new) ABAP editor
@msgGuiAbapEditor
Édition ABAP
@@
@msgTextEditorCollapsedLine
bloc fermé
@@
@msgTextEditorBlockStartLine
début de bloc
@@
@msgTextEditorBlockEndLine
fin de bloc
@@
@msgTextEditorNoBlock
bloc pas trouvé
@@
@msgTextEditorBookmark
signet crée
@@
@msgTextEditorNumberedBookmark
signet numéro %1 crée
@@
@msgTextEditorNoBookmark
signet pas trouvé
@@
@msgTextEditorLineNumber
ligne %1 sur %2
@@
@msgTextEditorModified
modifiée
@@
@msgTextEditorAutoComplete
saisie semi-automatique
@@
@msgTextEditorAutoCompleteToolbar
ALT+%1 pour basculer %2
@@
@msgTextEditorQuickInfoUnavailable
info-bulle non disponsible
@@
@msgTextEditorToolbarUnavailable
Barre de fonctions système non disponsible
@@

;For Column review feature - KK
;
;Announcements for Column Review
;
@msgNoSelection
Pas de colonne de contrôle sélectionnée pour le relire
@@
@msgBlankCell
Cellule courante est vide
@@
@msgClearSelection
colonne de contrôle re-initialisé
@@
@msgColumnSelect
sélectionner
@@
@msgColumnClear
re-initialiser
@@
@msgColumnSet
colonne de contrôle sélectionnée
@@
@msgColumnSetError
pas possible de sélectionner une colonne de contrôle
@@

;
; history listbox of input fields has opened
;
@msgHistoryOpened
Liste d'historique ouverte
@@
@msgHistoryCount
%1 éléments
@@
@msgHistorySingleEntry
%1 élément
@@

;
; message for buttons with property emphasized (only in Belize)
;
@msgChangeModeButton
Change modes d'édition ou d'affichage
@@
;
; messages for view switch control (only in Belize)
;
@msgGuiVHViewSwitchName
Mode d'affichage
@@

;
; some other general messages
;
@msgBlank
vide
@@
@msgNotSelected
non sélectionné
@@

endMessages
