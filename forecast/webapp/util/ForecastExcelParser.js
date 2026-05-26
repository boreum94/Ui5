sap.ui.define([], function () {
    "use strict";

    var ITEM_FIRST_ROW = 2;
    var ITEM_LAST_ROW = 501;

    var MONTH_FIELDS = [
        { column: "E", property: "January", label: "1월" },
        { column: "F", property: "Feburary", label: "2월" },
        { column: "G", property: "March", label: "3월" },
        { column: "H", property: "April", label: "4월" },
        { column: "I", property: "May", label: "5월" },
        { column: "J", property: "June", label: "6월" },
        { column: "K", property: "July", label: "7월" },
        { column: "L", property: "August", label: "8월" },
        { column: "M", property: "September", label: "9월" },
        { column: "N", property: "October", label: "10월" },
        { column: "O", property: "November", label: "11월" },
        { column: "P", property: "December", label: "12월" }
    ];

    function getCellValue(oCell) {
        var vValue;

        if (!oCell) {
            return "";
        }

        vValue = oCell.value;

        if (vValue === null || vValue === undefined) {
            return "";
        }

        if (typeof vValue === "object") {
            if (Object.prototype.hasOwnProperty.call(vValue, "result")) {
                return vValue.result || "";
            }

            if (vValue.richText) {
                return vValue.richText.map(function (oPart) {
                    return oPart.text || "";
                }).join("");
            }

            if (vValue.text !== undefined) {
                return vValue.text;
            }
        }

        return vValue;
    }

    function getText(oSheet, sAddress) {
        return String(getCellValue(oSheet.getCell(sAddress)) || "").trim();
    }

    function isBlank(vValue) {
        return (
            vValue === null ||
            vValue === undefined ||
            String(vValue).trim() === ""
        );
    }

    function readNumber(oSheet, sAddress, bAllowBlank) {
        var vValue = getCellValue(oSheet.getCell(sAddress));
        var nValue;

        if (isBlank(vValue)) {
            return {
                blank: true,
                valid: bAllowBlank,
                value: 0
            };
        }

        nValue = Number(String(vValue).replace(/,/g, "").trim());

        return {
            blank: false,
            valid: !isNaN(nValue),
            value: isNaN(nValue) ? 0 : nValue
        };
    }

    function isWholeNonNegative(oValue, bAllowBlank) {
        if (oValue.blank) {
            return bAllowBlank;
        }

        return (
            oValue.valid &&
            oValue.value >= 0 &&
            Number.isInteger(oValue.value)
        );
    }

    function convertForcastType(sTypeText) {
        if (sTypeText === "일반판매" || sTypeText === "G") {
            return "G";
        }

        if (sTypeText === "렌탈" || sTypeText === "R") {
            return "R";
        }

        return "";
    }

    function getForcastTypeText(sType) {
        if (sType === "G") {
            return "일반판매";
        }

        if (sType === "R") {
            return "렌탈";
        }

        return "";
    }

    function addMessage(aMessages, sScope, iRowNo, sMessage) {
        aMessages.push({
            scopeText: iRowNo ? sScope + " " + iRowNo + "행" : sScope,
            message: sMessage
        });
    }

    function createMaterialMap(aMaterials) {
        var mMaterials = {};

        aMaterials.forEach(function (oMaterial) {
            mMaterials[oMaterial.MaterialCd] = oMaterial;
        });

        return mMaterials;
    }

    function hasInput(oSheet, iRow) {
        return [
            "A", "D", "E", "F", "G", "H", "I",
            "J", "K", "L", "M", "N", "O", "P", "Q"
        ].some(function (sColumn) {
            return !isBlank(getCellValue(oSheet.getCell(sColumn + iRow)));
        });
    }

    function readHeader(oSheet, sFileName, aMessages) {
        var sType = convertForcastType(getText(oSheet, "B6"));
        var oRate = readNumber(oSheet, "B7", true);

        var oHeader = {
            ForcastYear: getText(oSheet, "B4"),
            ForcastVersion: "",
            ForcastVersionText: "저장 시 자동 생성",
            ForcastType: sType,
            ForcastTypeText: getForcastTypeText(sType),
            UploadFileNm: sFileName,
            Status: "D",
            AchvRate: oRate.value,
            Remark: getText(oSheet, "B8")
        };

        if (!/^\d{4}$/.test(oHeader.ForcastYear)) {
            addMessage(
                aMessages,
                "HEADER",
                null,
                "예측 연도는 4자리 숫자로 입력해야 합니다."
            );
        }

        if (!oHeader.ForcastType) {
            addMessage(
                aMessages,
                "HEADER",
                null,
                "판매예측 유형은 일반판매 또는 렌탈을 선택해야 합니다."
            );
        }

        if (!oRate.valid || oRate.value < 0) {
            addMessage(
                aMessages,
                "HEADER",
                null,
                "목표 판매성장률은 0 이상의 숫자로 입력해야 합니다."
            );
        }

        return oHeader;
    }

    function readItems(oSheet, oHeader, aMaterials, aMessages) {
        var mMaterials = createMaterialMap(aMaterials);
        var mDuplicateCheck = {};
        var aItems = [];
        var iRow;

        for (iRow = ITEM_FIRST_ROW; iRow <= ITEM_LAST_ROW; iRow += 1) {
            if (!hasInput(oSheet, iRow)) {
                continue;
            }

            var aItemErrors = [];
            var sMaterialCd = getText(oSheet, "A" + iRow);
            var sExcelUnit = getText(oSheet, "C" + iRow);
            var oMaterial = mMaterials[sMaterialCd];
            var oAnnualQty = readNumber(oSheet, "D" + iRow, false);

            var oItem = {
                ExcelRowNo: iRow,
                MaterialCd: sMaterialCd,
                MaterialNm: oMaterial ? oMaterial.MaterialNm : "",
                Unit: oMaterial ? oMaterial.Unit : sExcelUnit,
                AnnualQty: oAnnualQty.value,
                Remark: getText(oSheet, "Q" + iRow),
                MonthlyTotal: 0,
                ValidationState: "Success",
                ValidationText: "정상"
            };

            if (!sMaterialCd) {
                aItemErrors.push("자재코드를 선택해야 합니다.");
            } else if (!oMaterial) {
                aItemErrors.push(
                    "현재 판매예측 대상 자재목록에 존재하지 않는 자재입니다."
                );
            }

            if (sMaterialCd) {
                if (mDuplicateCheck[sMaterialCd]) {
                    aItemErrors.push("동일한 자재코드가 중복 입력되었습니다.");
                }

                mDuplicateCheck[sMaterialCd] = true;
            }

            if (
                oMaterial &&
                oHeader.ForcastType === "G" &&
                oMaterial.SaleYn !== "X"
            ) {
                aItemErrors.push("일반판매 대상 제품이 아닙니다.");
            }

            if (
                oMaterial &&
                oHeader.ForcastType === "R" &&
                oMaterial.RentYn !== "X"
            ) {
                aItemErrors.push("렌탈 대상 제품이 아닙니다.");
            }

            if (
                oMaterial &&
                sExcelUnit &&
                sExcelUnit !== oMaterial.Unit
            ) {
                aItemErrors.push(
                    "Excel 단위와 자재마스터 기본단위가 일치하지 않습니다."
                );
            }

            if (
                oMaterial &&
                oMaterial.Unit &&
                oMaterial.Unit !== "EA"
            ) {
                aItemErrors.push(
                    "현재 Excel 업로드는 EA 단위 완제품만 저장할 수 있습니다."
                );
            }

            if (!isWholeNonNegative(oAnnualQty, false)) {
                aItemErrors.push(
                    "연간 계획수량은 EA 기준 0 이상의 정수로 입력해야 합니다."
                );
            }

            MONTH_FIELDS.forEach(function (oMonth) {
                var oMonthQty = readNumber(
                    oSheet,
                    oMonth.column + iRow,
                    true
                );

                oItem[oMonth.property] = oMonthQty.value;
                oItem.MonthlyTotal += oMonthQty.value;

                if (!isWholeNonNegative(oMonthQty, true)) {
                    aItemErrors.push(
                        oMonth.label +
                        " 수량은 EA 기준 0 이상의 정수로 입력해야 합니다."
                    );
                }
            });

            if (
                isWholeNonNegative(oAnnualQty, false) &&
                oAnnualQty.value !== oItem.MonthlyTotal
            ) {
                aItemErrors.push(
                    "연간 계획수량과 월별 수량 합계가 일치하지 않습니다."
                );
            }

            if (aItemErrors.length > 0) {
                oItem.ValidationState = "Error";
                oItem.ValidationText = aItemErrors.join(" / ");

                aItemErrors.forEach(function (sError) {
                    addMessage(aMessages, "ITEMS", iRow, sError);
                });
            }

            aItems.push(oItem);
        }

        if (aItems.length === 0) {
            addMessage(
                aMessages,
                "ITEMS",
                null,
                "저장할 판매예측 아이템이 없습니다."
            );
        }

        return aItems;
    }

    function buildSummary(aItems, aMessages) {
        var nAnnualTotal = 0;
        var nMonthlyTotal = 0;
        var iNormalCount = 0;

        aItems.forEach(function (oItem) {
            nAnnualTotal += Number(oItem.AnnualQty || 0);
            nMonthlyTotal += Number(oItem.MonthlyTotal || 0);

            if (oItem.ValidationState === "Success") {
                iNormalCount += 1;
            }
        });

        return {
            itemCount: aItems.length,
            annualTotal: nAnnualTotal,
            monthlyTotal: nMonthlyTotal,
            monthlyAverage: nMonthlyTotal / 12,
            normalCount: iNormalCount,
            errorCount: aMessages.length
        };
    }

    function toFixedText(vValue, iDecimals) {
        return Number(vValue || 0).toFixed(iDecimals);
    }

    function buildPayload(oHeader, aItems) {
        return {
            ForcastYear: oHeader.ForcastYear,
            ForcastType: oHeader.ForcastType,
            UploadFileNm: oHeader.UploadFileNm,
            Status: "D",
            AchvRate: toFixedText(oHeader.AchvRate, 2),
            Remark: oHeader.Remark,
            toItems: aItems.map(function (oItem) {
                return {
                    MaterialCd: oItem.MaterialCd,
                    AnnualQty: toFixedText(oItem.AnnualQty, 0),
                    Unit: oItem.Unit,
                    January: toFixedText(oItem.January, 3),
                    Feburary: toFixedText(oItem.Feburary, 3),
                    March: toFixedText(oItem.March, 3),
                    April: toFixedText(oItem.April, 3),
                    May: toFixedText(oItem.May, 3),
                    June: toFixedText(oItem.June, 3),
                    July: toFixedText(oItem.July, 3),
                    August: toFixedText(oItem.August, 3),
                    September: toFixedText(oItem.September, 3),
                    October: toFixedText(oItem.October, 3),
                    November: toFixedText(oItem.November, 3),
                    December: toFixedText(oItem.December, 3),
                    Remark: oItem.Remark
                };
            })
        };
    }

    return {
        parse: function (oOptions) {
            var oWorkbook = new oOptions.ExcelJS.Workbook();

            return oWorkbook.xlsx.load(oOptions.arrayBuffer).then(function () {
                var oHeaderSheet = oWorkbook.getWorksheet("HEADER");
                var oItemsSheet = oWorkbook.getWorksheet("ITEMS");
                var aMessages = [];
                var oHeader;
                var aItems;
                var oSummary;
                var bIsValid;

                if (!oHeaderSheet) {
                    throw new Error(
                        "HEADER 시트를 찾을 수 없습니다. 다운로드한 판매예측 양식을 사용하세요."
                    );
                }

                if (!oItemsSheet) {
                    throw new Error(
                        "ITEMS 시트를 찾을 수 없습니다. 다운로드한 판매예측 양식을 사용하세요."
                    );
                }

                oHeader = readHeader(
                    oHeaderSheet,
                    oOptions.fileName,
                    aMessages
                );

                aItems = readItems(
                    oItemsSheet,
                    oHeader,
                    oOptions.materials || [],
                    aMessages
                );

                oSummary = buildSummary(aItems, aMessages);
                bIsValid = aMessages.length === 0 && aItems.length > 0;

                return {
                    header: oHeader,
                    items: aItems,
                    messages: aMessages,
                    summary: oSummary,
                    hasErrors: !bIsValid,
                    isValid: bIsValid,
                    payload: buildPayload(oHeader, aItems)
                };
            });
        }
    };
});