sap.ui.define([], function () {
    "use strict";

    var ITEM_FIRST_ROW = 2;
    var ITEM_LAST_ROW = 501;
    var QUANTITY_FORMAT = "#,##0";
    var RATE_FORMAT = "0.00";

    var EXCEL_MIME_TYPE =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    function toText(vValue) {
        if (vValue === null || vValue === undefined) {
            return "";
        }

        return String(vValue).trim();
    }

    function getTodayText() {
        var oDate = new Date();

        return (
            String(oDate.getFullYear()) +
            String(oDate.getMonth() + 1).padStart(2, "0") +
            String(oDate.getDate()).padStart(2, "0")
        );
    }

    function getFileName() {
        return "판매수요예측_전체입력양식_" + getTodayText() + ".xlsx";
    }

    function applyBorder(oCell) {
        oCell.border = {
            top: {
                style: "thin",
                color: {
                    argb: "FFD9D9D9"
                }
            },
            left: {
                style: "thin",
                color: {
                    argb: "FFD9D9D9"
                }
            },
            bottom: {
                style: "thin",
                color: {
                    argb: "FFD9D9D9"
                }
            },
            right: {
                style: "thin",
                color: {
                    argb: "FFD9D9D9"
                }
            }
        };
    }

    function applyTitleStyle(oCell) {
        oCell.font = {
            name: "맑은 고딕",
            size: 16,
            bold: true,
            color: {
                argb: "FFFFFFFF"
            }
        };

        oCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FF0A6ED1"
            }
        };

        oCell.alignment = {
            horizontal: "center",
            vertical: "middle"
        };

        applyBorder(oCell);
    }

    function applyHeaderStyle(oRow) {
        oRow.height = 28;

        oRow.eachCell(function (oCell) {
            oCell.font = {
                name: "맑은 고딕",
                size: 10,
                bold: true,
                color: {
                    argb: "FFFFFFFF"
                }
            };

            oCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {
                    argb: "FF354A5F"
                }
            };

            oCell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true
            };

            applyBorder(oCell);
        });
    }

    function applyLabelStyle(oCell) {
        oCell.font = {
            name: "맑은 고딕",
            size: 10,
            bold: true
        };

        oCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFEAF3FC"
            }
        };

        oCell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };

        applyBorder(oCell);
    }

    function applyInputStyle(oCell) {
        oCell.font = {
            name: "맑은 고딕",
            size: 10
        };

        oCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFFFF2CC"
            }
        };

        oCell.alignment = {
            vertical: "middle",
            wrapText: true
        };

        applyBorder(oCell);
    }

    function applyAutoStyle(oCell) {
        oCell.font = {
            name: "맑은 고딕",
            size: 10
        };

        oCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "FFF2F2F2"
            }
        };

        oCell.alignment = {
            vertical: "middle",
            wrapText: true
        };

        applyBorder(oCell);
    }

    function applyNormalStyle(oCell) {
        oCell.font = {
            name: "맑은 고딕",
            size: 10
        };

        oCell.alignment = {
            vertical: "middle",
            wrapText: true
        };

        applyBorder(oCell);
    }

    function applyInputQuantityStyle(oCell) {
        applyInputStyle(oCell);
        oCell.numFmt = QUANTITY_FORMAT;
    }

    function applyAutoQuantityStyle(oCell) {
        applyAutoStyle(oCell);
        oCell.numFmt = QUANTITY_FORMAT;
    }

    function getRentalMaterials(aMaterials) {
        return aMaterials.filter(function (oMaterial) {
            return oMaterial.RentYn === "X";
        });
    }

    function getGeneralMaterials(aMaterials) {
        return aMaterials.filter(function (oMaterial) {
            return oMaterial.SaleYn === "X";
        });
    }

    function createGuideSheet(oWorkbook, oCounts) {
        var oSheet = oWorkbook.addWorksheet("작성안내", {
            views: [
                {
                    showGridLines: false
                }
            ]
        });

        var aGuideRows = [
            "HEADER 시트에서 예측 연도, 판매예측 유형, 목표 판매성장률과 비고를 입력하세요.",
            "판매예측 코드는 저장 시 SAP에서 예측 연도 기준으로 자동 생성됩니다. 예: FC26000001",
            "버전은 저장 시 SAP에서 예측 연도 기준으로 자동 생성됩니다. 예: V001, V002",
            "판매예측 유형은 일반판매 또는 렌탈 중 하나를 선택합니다.",
            "ITEMS 시트의 자재코드 목록은 HEADER의 판매예측 유형에 따라 자동으로 변경됩니다.",
            "자재코드를 선택하면 자재명과 기본단위가 자동 표시됩니다.",
            "연간 계획수량과 월별 계획수량은 EA 기준 0 이상의 정수로 입력하세요.",
            "월별 합계가 연간 계획수량과 일치해야 정상으로 검증됩니다.",
            "자재 목록은 다운로드 시점의 최신 자재마스터 기준입니다."
        ];

        oSheet.columns = [
            { width: 10 },
            { width: 105 }
        ];

        oSheet.mergeCells("A1:B1");
        oSheet.getCell("A1").value = "판매 수요 예측 Excel 업로드 양식";
        oSheet.getRow(1).height = 34;
        applyTitleStyle(oSheet.getCell("A1"));

        oSheet.getCell("A3").value = "순서";
        oSheet.getCell("B3").value = "작성 방법";
        applyHeaderStyle(oSheet.getRow(3));

        aGuideRows.forEach(function (sText, iIndex) {
            var iRow = iIndex + 4;

            oSheet.getCell("A" + iRow).value = String(iIndex + 1);
            oSheet.getCell("B" + iRow).value = sText;

            applyLabelStyle(oSheet.getCell("A" + iRow));
            applyNormalStyle(oSheet.getCell("B" + iRow));

            oSheet.getRow(iRow).height = 34;
        });

        oSheet.getCell("A15").value = "자재목록 현황";
        oSheet.getCell("B15").value =
            "전체 " +
            oCounts.totalCount +
            "건 / 일반판매 대상 " +
            oCounts.generalCount +
            "건 / 렌탈 대상 " +
            oCounts.rentalCount +
            "건";

        applyLabelStyle(oSheet.getCell("A15"));
        applyNormalStyle(oSheet.getCell("B15"));

        return oSheet;
    }

    function createHeaderSheet(oWorkbook) {
        var oSheet = oWorkbook.addWorksheet("HEADER", {
            views: [
                {
                    showGridLines: false
                }
            ]
        });

        var aRows = [
            [
                "예측 연도",
                "",
                "판매예측 대상 연도를 4자리 숫자로 입력하세요. 예: 2026"
            ],
            [
                "버전",
                "SAP 저장 시 자동 생성",
                "입력하지 않습니다. 저장 시 예측 연도 기준으로 V001, V002 순서로 자동 생성됩니다."
            ],
            [
                "판매예측 유형",
                "",
                "일반판매 또는 렌탈 중 하나를 선택하세요."
            ],
            [
                "목표 판매성장률 (%)",
                "",
                "목표 성장률을 숫자로 입력하세요. 예: 5.00"
            ],
            [
                "비고",
                "",
                "판매예측 관련 메모를 입력하세요."
            ]
        ];

        oSheet.columns = [
            { width: 28 },
            { width: 42 },
            { width: 82 }
        ];

        oSheet.mergeCells("A1:C1");
        oSheet.getCell("A1").value = "판매계획 기본정보";
        oSheet.getRow(1).height = 34;
        applyTitleStyle(oSheet.getCell("A1"));

        oSheet.getCell("A3").value = "항목";
        oSheet.getCell("B3").value = "입력값";
        oSheet.getCell("C3").value = "작성 안내";
        applyHeaderStyle(oSheet.getRow(3));

        aRows.forEach(function (aRow, iIndex) {
            var iRow = iIndex + 4;

            oSheet.getCell("A" + iRow).value = aRow[0];
            oSheet.getCell("B" + iRow).value = aRow[1];
            oSheet.getCell("C" + iRow).value = aRow[2];

            applyLabelStyle(oSheet.getCell("A" + iRow));

            if (iRow === 5) {
                applyAutoStyle(oSheet.getCell("B" + iRow));
            } else {
                applyInputStyle(oSheet.getCell("B" + iRow));
            }

            applyNormalStyle(oSheet.getCell("C" + iRow));

            oSheet.getRow(iRow).height = iRow === 8 ? 44 : 34;
        });

        oSheet.getCell("B4").dataValidation = {
            type: "whole",
            operator: "between",
            allowBlank: false,
            showInputMessage: true,
            showErrorMessage: true,
            errorStyle: "error",
            promptTitle: "예측 연도 입력",
            prompt: "4자리 연도를 입력하세요.",
            errorTitle: "연도 입력 오류",
            error: "예측 연도는 2000부터 2099 사이의 숫자로 입력하세요.",
            formulae: [2000, 2099]
        };

        oSheet.getCell("B6").dataValidation = {
            type: "list",
            allowBlank: false,
            showInputMessage: true,
            showErrorMessage: true,
            errorStyle: "error",
            promptTitle: "판매예측 유형 선택",
            prompt: "일반판매 또는 렌탈을 선택하세요.",
            errorTitle: "판매예측 유형 오류",
            error: "일반판매 또는 렌탈 중 하나만 선택할 수 있습니다.",
            formulae: ['"일반판매,렌탈"']
        };

        oSheet.getCell("B7").dataValidation = {
            type: "decimal",
            operator: "greaterThanOrEqual",
            allowBlank: true,
            showInputMessage: true,
            showErrorMessage: true,
            errorStyle: "error",
            promptTitle: "목표 성장률 입력",
            prompt: "0 이상의 숫자를 입력하세요.",
            errorTitle: "성장률 입력 오류",
            error: "목표 판매성장률은 0 이상의 숫자로 입력하세요.",
            formulae: [0]
        };

        oSheet.getCell("B7").numFmt = RATE_FORMAT;

        oSheet.getCell("A10").value = "자동생성 항목";
        oSheet.getCell("B10").value = "판매예측 코드 / 버전";
        oSheet.getCell("C10").value =
            "예측 연도 2026 기준 저장 순서에 따라 FC26000001, FC26000002 및 V001, V002 형식으로 Backend에서 생성합니다.";

        applyLabelStyle(oSheet.getCell("A10"));
        applyAutoStyle(oSheet.getCell("B10"));
        applyNormalStyle(oSheet.getCell("C10"));

        oSheet.getRow(10).height = 44;

        oSheet.getCell("A11").value = "판매유형 코드";
        oSheet.getCell("B11").value = "일반판매 = G / 렌탈 = R";
        oSheet.getCell("C11").value =
            "업로드 시 UI5에서 한글 선택값을 Backend 코드값으로 변환합니다.";

        applyLabelStyle(oSheet.getCell("A11"));
        applyAutoStyle(oSheet.getCell("B11"));
        applyNormalStyle(oSheet.getCell("C11"));

        return oSheet;
    }

    function createItemsSheet(oWorkbook) {
        var oSheet = oWorkbook.addWorksheet("ITEMS", {
            views: [
                {
                    state: "frozen",
                    ySplit: 1,
                    xSplit: 3
                }
            ]
        });

        oSheet.columns = [
            { header: "자재코드", key: "MaterialCd", width: 22 },
            { header: "자재명", key: "MaterialNm", width: 34 },
            { header: "단위", key: "Unit", width: 10 },
            { header: "연간 계획수량", key: "AnnualQty", width: 17 },
            { header: "1월", key: "January", width: 13 },
            { header: "2월", key: "Feburary", width: 13 },
            { header: "3월", key: "March", width: 13 },
            { header: "4월", key: "April", width: 13 },
            { header: "5월", key: "May", width: 13 },
            { header: "6월", key: "June", width: 13 },
            { header: "7월", key: "July", width: 13 },
            { header: "8월", key: "August", width: 13 },
            { header: "9월", key: "September", width: 13 },
            { header: "10월", key: "October", width: 13 },
            { header: "11월", key: "November", width: 13 },
            { header: "12월", key: "December", width: 13 },
            { header: "비고", key: "Remark", width: 30 },
            { header: "월별 합계", key: "MonthlyTotal", width: 17 },
            { header: "검증 결과", key: "ValidationResult", width: 22 }
        ];

        applyHeaderStyle(oSheet.getRow(1));

        oSheet.autoFilter = "A1:S1";

        return oSheet;
    }

    function createLookupSheet(oWorkbook, aMaterials) {
        var oSheet = oWorkbook.addWorksheet("선택목록");
        var aRentalMaterials = getRentalMaterials(aMaterials);
        var aGeneralMaterials = getGeneralMaterials(aMaterials);
        var iRentalLastRow;
        var iGeneralLastRow;

        oSheet.columns = [
            { width: 24 },
            { width: 36 },
            { width: 12 },
            { width: 12 },
            { width: 16 },
            { width: 4 },
            { width: 24 },
            { width: 36 },
            { width: 12 },
            { width: 4 },
            { width: 24 },
            { width: 36 },
            { width: 12 },
            { width: 4 },
            { width: 12 }
        ];

        [
            ["A1", "전체 자재코드"],
            ["B1", "자재명"],
            ["C1", "기본단위"],
            ["D1", "렌탈여부"],
            ["E1", "일반판매여부"],
            ["G1", "렌탈 자재코드"],
            ["H1", "렌탈 자재명"],
            ["I1", "기본단위"],
            ["K1", "일반판매 자재코드"],
            ["L1", "일반판매 자재명"],
            ["M1", "기본단위"],
            ["O1", "빈 목록"]
        ].forEach(function (aCell) {
            oSheet.getCell(aCell[0]).value = aCell[1];
        });

        applyHeaderStyle(oSheet.getRow(1));

        aMaterials.forEach(function (oMaterial, iIndex) {
            var iRow = iIndex + 2;

            oSheet.getCell("A" + iRow).value = toText(oMaterial.MaterialCd);
            oSheet.getCell("B" + iRow).value = toText(oMaterial.MaterialNm);
            oSheet.getCell("C" + iRow).value = toText(oMaterial.Unit);
            oSheet.getCell("D" + iRow).value = toText(oMaterial.RentYn);
            oSheet.getCell("E" + iRow).value = toText(oMaterial.SaleYn);

            ["A", "B", "C", "D", "E"].forEach(function (sColumn) {
                applyNormalStyle(oSheet.getCell(sColumn + iRow));
            });
        });

        aRentalMaterials.forEach(function (oMaterial, iIndex) {
            var iRow = iIndex + 2;

            oSheet.getCell("G" + iRow).value = toText(oMaterial.MaterialCd);
            oSheet.getCell("H" + iRow).value = toText(oMaterial.MaterialNm);
            oSheet.getCell("I" + iRow).value = toText(oMaterial.Unit);
        });

        aGeneralMaterials.forEach(function (oMaterial, iIndex) {
            var iRow = iIndex + 2;

            oSheet.getCell("K" + iRow).value = toText(oMaterial.MaterialCd);
            oSheet.getCell("L" + iRow).value = toText(oMaterial.MaterialNm);
            oSheet.getCell("M" + iRow).value = toText(oMaterial.Unit);
        });

        oSheet.getCell("O2").value = "";

        iRentalLastRow = Math.max(2, aRentalMaterials.length + 1);
        iGeneralLastRow = Math.max(2, aGeneralMaterials.length + 1);

        oWorkbook.definedNames.add(
            "'선택목록'!$G$2:$G$" + iRentalLastRow,
            "RentalMaterialCodes"
        );

        oWorkbook.definedNames.add(
            "'선택목록'!$K$2:$K$" + iGeneralLastRow,
            "GeneralMaterialCodes"
        );

        oWorkbook.definedNames.add(
            "'선택목록'!$O$2:$O$2",
            "BlankMaterialCodes"
        );

        oSheet.state = "veryHidden";
    }

    function getValidationFormula(iRow) {
        return (
            'IF(A' + iRow + '="","",' +
                'IF(HEADER!$B$6="","판매유형 선택 필요",' +
                    'IF(D' + iRow + '="","연간 수량 입력 필요",' +
                        'IF(HEADER!$B$6="렌탈",' +
                            'IF(IFERROR(VLOOKUP(A' + iRow + ',\'선택목록\'!$A:$E,4,FALSE),"")<>"X",' +
                                '"렌탈 대상 아님",' +
                                'IF(D' + iRow + '=R' + iRow + ',"정상","월 합계 불일치")' +
                            '),' +
                            'IF(HEADER!$B$6="일반판매",' +
                                'IF(IFERROR(VLOOKUP(A' + iRow + ',\'선택목록\'!$A:$E,5,FALSE),"")<>"X",' +
                                    '"일반판매 대상 아님",' +
                                    'IF(D' + iRow + '=R' + iRow + ',"정상","월 합계 불일치")' +
                                '),' +
                                '"판매유형 선택 필요"' +
                            ')' +
                        ')' +
                    ')' +
                ')' +
            ')'
        );
    }

    function applyItemsInputArea(oSheet) {
        var sMaterialFormula =
            'INDIRECT(IF(HEADER!$B$6="렌탈",' +
                '"RentalMaterialCodes",' +
                'IF(HEADER!$B$6="일반판매",' +
                    '"GeneralMaterialCodes",' +
                    '"BlankMaterialCodes"' +
                ')' +
            '))';

        var iRow;
        var iColumn;

        for (iRow = ITEM_FIRST_ROW; iRow <= ITEM_LAST_ROW; iRow += 1) {
            oSheet.getRow(iRow).height = 24;

            oSheet.getCell("A" + iRow).dataValidation = {
                type: "list",
                allowBlank: true,
                showInputMessage: true,
                showErrorMessage: true,
                errorStyle: "error",
                promptTitle: "자재 선택",
                prompt: "HEADER 판매예측 유형에 맞는 자재를 선택하세요.",
                errorTitle: "선택 불가 자재",
                error: "현재 판매예측 유형의 대상 자재만 선택할 수 있습니다.",
                formulae: [sMaterialFormula]
            };

            oSheet.getCell("B" + iRow).value = {
                formula:
                    'IFERROR(VLOOKUP(A' +
                    iRow +
                    ',\'선택목록\'!$A:$C,2,FALSE),"")'
            };

            oSheet.getCell("C" + iRow).value = {
                formula:
                    'IFERROR(VLOOKUP(A' +
                    iRow +
                    ',\'선택목록\'!$A:$C,3,FALSE),"")'
            };

            oSheet.getCell("D" + iRow).dataValidation = {
                type: "whole",
                operator: "greaterThanOrEqual",
                allowBlank: true,
                showErrorMessage: true,
                errorStyle: "error",
                errorTitle: "수량 입력 오류",
                error: "연간 계획수량은 EA 기준 0 이상의 정수로 입력하세요.",
                formulae: [0]
            };

            for (iColumn = 5; iColumn <= 16; iColumn += 1) {
                oSheet.getCell(iRow, iColumn).dataValidation = {
                    type: "whole",
                    operator: "greaterThanOrEqual",
                    allowBlank: true,
                    showErrorMessage: true,
                    errorStyle: "error",
                    errorTitle: "수량 입력 오류",
                    error: "월별 계획수량은 EA 기준 0 이상의 정수로 입력하세요.",
                    formulae: [0]
                };
            }

            oSheet.getCell("R" + iRow).value = {
                formula: "SUM(E" + iRow + ":P" + iRow + ")"
            };

            oSheet.getCell("S" + iRow).value = {
                formula: getValidationFormula(iRow)
            };

            applyInputStyle(oSheet.getCell("A" + iRow));
            applyAutoStyle(oSheet.getCell("B" + iRow));
            applyAutoStyle(oSheet.getCell("C" + iRow));
            applyInputQuantityStyle(oSheet.getCell("D" + iRow));

            for (iColumn = 5; iColumn <= 16; iColumn += 1) {
                applyInputQuantityStyle(oSheet.getCell(iRow, iColumn));
            }

            applyInputStyle(oSheet.getCell("Q" + iRow));
            applyAutoQuantityStyle(oSheet.getCell("R" + iRow));
            applyAutoStyle(oSheet.getCell("S" + iRow));
        }
    }

    function createWorkbook(ExcelJS, aMaterials) {
        var oWorkbook = new ExcelJS.Workbook();
        var aRentalMaterials = getRentalMaterials(aMaterials);
        var aGeneralMaterials = getGeneralMaterials(aMaterials);
        var oCounts = {
            totalCount: aMaterials.length,
            rentalCount: aRentalMaterials.length,
            generalCount: aGeneralMaterials.length
        };
        var oItemsSheet;

        oWorkbook.creator = "Oleum";
        oWorkbook.lastModifiedBy = "Oleum";
        oWorkbook.created = new Date();
        oWorkbook.modified = new Date();
        oWorkbook.calcProperties.fullCalcOnLoad = true;

        createGuideSheet(oWorkbook, oCounts);
        createHeaderSheet(oWorkbook);

        oItemsSheet = createItemsSheet(oWorkbook);

        createLookupSheet(oWorkbook, aMaterials);
        applyItemsInputArea(oItemsSheet);

        return {
            workbook: oWorkbook,
            counts: oCounts
        };
    }

    function downloadBuffer(aBuffer, sFileName) {
        var oBlob = new Blob([aBuffer], {
            type: EXCEL_MIME_TYPE
        });

        var sUrl = URL.createObjectURL(oBlob);
        var oLink = document.createElement("a");

        oLink.href = sUrl;
        oLink.download = sFileName;
        oLink.style.display = "none";

        document.body.appendChild(oLink);
        oLink.click();
        document.body.removeChild(oLink);

        setTimeout(function () {
            URL.revokeObjectURL(sUrl);
        }, 0);
    }

    return {
        download: function (oOptions) {
            var oResult = createWorkbook(
                oOptions.ExcelJS,
                oOptions.materials || []
            );

            var sFileName = getFileName();

            return oResult.workbook.xlsx.writeBuffer().then(function (aBuffer) {
                downloadBuffer(aBuffer, sFileName);

                return {
                    fileName: sFileName,
                    totalCount: oResult.counts.totalCount,
                    rentalCount: oResult.counts.rentalCount,
                    generalCount: oResult.counts.generalCount
                };
            });
        }
    };
});