sap.ui.define([], function () {
    "use strict";

    return {
        calculateAll: function (aCreateItems, aConditions, sQuotDocTy, sSoldTo) {
            var aItems = aCreateItems || [];
            var aCond = aConditions || [];
            var fTotalAmount = 0;
            var sCurrency = "KRW";

            for (var i = 0; i < aItems.length; i++) {
                var oItem = aItems[i];

                if (!this._isValidItem(oItem, sQuotDocTy)) {
                    this._resetItemPrice(oItem);
                    continue;
                }

                var oCalculated = this.calculateItem(oItem, aCond, sQuotDocTy, sSoldTo);

                oItem.GrossAmt = oCalculated.GrossAmt;
                oItem.DiscountAmt = oCalculated.DiscountAmt;
                oItem.IndividualAmt = oCalculated.IndividualAmt;
                oItem.NetAmt = oCalculated.NetAmt;
                oItem.Currency = oCalculated.Currency;
                oItem.PriceConditions = oCalculated.PriceConditions;

                fTotalAmount += oCalculated.NetAmt;

                if (oCalculated.Currency) {
                    sCurrency = oCalculated.Currency;
                }
            }

            return {
                items: aItems,
                totalAmount: this._roundAmount(fTotalAmount),
                currency: sCurrency
            };
        },

        calculateItem: function (oItem, aConditions, sQuotDocTy, sSoldTo) {
            var fQty = this._toNumber(oItem.ReqQty);
            var fTargetMargin = this._toNumber(oItem.TargetMargin);
            var sMaterialCd = oItem.MaterialCd || "";
            var sCurrentGrade = sQuotDocTy === "O" ? "N" : (oItem.CurrentGrade || "");

            var aPriceConditions = [];
            var iSeq = 1;

            var fGrossAmt = 0;
            var fDiscountAmt = 0;
            var fNetAmt = 0;
            var fIndividualAmt = 0;
            var sCurrency = "KRW";

            var oBasePriceCondition = this._findBestCondition(aConditions, {
                conditionType: "P",
                materialCd: sMaterialCd
            });

            if (!oBasePriceCondition) {
                return {
                    GrossAmt: 0,
                    DiscountAmt: 0,
                    IndividualAmt: 0,
                    NetAmt: 0,
                    Currency: "KRW",
                    PriceConditions: []
                };
            }

            sCurrency = oBasePriceCondition.Currency || oBasePriceCondition.ConditionUnit || "KRW";

            var fUnitPrice = this._getSalesUnitPrice(oBasePriceCondition);

            fGrossAmt = fUnitPrice * fQty;
            fNetAmt = fGrossAmt;
            fIndividualAmt = fQty > 0 ? fNetAmt / fQty : 0;

            aPriceConditions.push(this._createPriceConditionResult({
                seq: iSeq++,
                itemNo: oItem.ItemNo,
                source: oBasePriceCondition,
                conditionType: "P",
                conditionNm: oBasePriceCondition.ConditionNm || "판매가격",

                /*
                 * KRW의 경우 SAP 통화 필드 특성상 조회값에 내부 보정이 필요하다.
                 * 단, 사용자 화면에는 내부 보정식인 "* 100"을 노출하지 않는다.
                 * 조건값도 사용자가 이해하는 실제 판매단가 기준으로 표시한다.
                 */
                conditionAmt: fUnitPrice,
                conditionUnit: sCurrency,

                baseAmt: fUnitPrice,
                appliedAmt: fGrossAmt,
                afterAmt: fNetAmt,
                currency: sCurrency,
                applyDesc: "판매단가 "
                    + this._formatAmountText(fUnitPrice, sCurrency)
                    + " 기준, 수량 "
                    + this._formatQty(fQty)
                    + " 적용"
            }));

            if (sQuotDocTy === "O" && fTargetMargin > 0) {
                var fMarginAmt = fGrossAmt * fTargetMargin / 100;

                fNetAmt += fMarginAmt;

                aPriceConditions.push(this._createPriceConditionResult({
                    seq: iSeq++,
                    itemNo: oItem.ItemNo,
                    source: {},
                    conditionType: "M",
                    conditionNm: "목표마진",
                    conditionAmt: fTargetMargin,
                    conditionUnit: "%",
                    baseAmt: fGrossAmt,
                    appliedAmt: fMarginAmt,
                    afterAmt: fNetAmt,
                    currency: sCurrency,
                    applyDesc: "주문제작 목표마진 " + this._formatRate(fTargetMargin) + "% 적용"
                }));
            }

            if (sSoldTo) {
                var oCustomerDiscount = this._findBestCondition(aConditions, {
                    conditionType: "C",
                    customerCd: sSoldTo
                });

                if (oCustomerDiscount) {
                    var fCustomerRate = this._toNumber(oCustomerDiscount.ConditionAmt);
                    var fCustomerDiscountAmt = fGrossAmt * fCustomerRate / 100;

                    fDiscountAmt += fCustomerDiscountAmt;
                    fNetAmt -= fCustomerDiscountAmt;

                    aPriceConditions.push(this._createPriceConditionResult({
                        seq: iSeq++,
                        itemNo: oItem.ItemNo,
                        source: oCustomerDiscount,
                        conditionType: "C",
                        conditionNm: oCustomerDiscount.ConditionNm || "고객할인",
                        conditionAmt: fCustomerRate,
                        conditionUnit: "%",
                        baseAmt: fGrossAmt,
                        appliedAmt: -fCustomerDiscountAmt,
                        afterAmt: fNetAmt,
                        currency: sCurrency,
                        applyDesc: "고객 "
                            + sSoldTo
                            + " 할인 "
                            + this._formatRate(fCustomerRate)
                            + "% 적용"
                    }));
                }
            }

            var oQtyDiscount = this._findBestQuantityCondition(aConditions, sMaterialCd, fQty);

            if (oQtyDiscount) {
                var fQtyRate = this._toNumber(oQtyDiscount.ConditionAmt);
                var fQtyDiscountAmt = fGrossAmt * fQtyRate / 100;

                fDiscountAmt += fQtyDiscountAmt;
                fNetAmt -= fQtyDiscountAmt;

                aPriceConditions.push(this._createPriceConditionResult({
                    seq: iSeq++,
                    itemNo: oItem.ItemNo,
                    source: oQtyDiscount,
                    conditionType: "Q",
                    conditionNm: oQtyDiscount.ConditionNm || "수량할인",
                    conditionAmt: fQtyRate,
                    conditionUnit: "%",
                    baseAmt: fGrossAmt,
                    appliedAmt: -fQtyDiscountAmt,
                    afterAmt: fNetAmt,
                    currency: sCurrency,
                    applyDesc: "수량구간 "
                        + this._formatQty(this._toNumber(oQtyDiscount.BeginQty))
                        + " ~ "
                        + this._formatQty(this._toNumber(oQtyDiscount.EndQty))
                        + " 적용"
                }));
            }

            if (sQuotDocTy !== "O" && sCurrentGrade && sCurrentGrade !== "N") {
                var oGradeDiscount = this._findBestCondition(aConditions, {
                    conditionType: "A",
                    assetGrade: sCurrentGrade
                });

                if (oGradeDiscount) {
                    var fGradeRate = this._toNumber(oGradeDiscount.ConditionAmt);
                    var fGradeDiscountAmt = fGrossAmt * fGradeRate / 100;

                    fDiscountAmt += fGradeDiscountAmt;
                    fNetAmt -= fGradeDiscountAmt;

                    aPriceConditions.push(this._createPriceConditionResult({
                        seq: iSeq++,
                        itemNo: oItem.ItemNo,
                        source: oGradeDiscount,
                        conditionType: "A",
                        conditionNm: oGradeDiscount.ConditionNm || "등급할인",
                        conditionAmt: fGradeRate,
                        conditionUnit: "%",
                        baseAmt: fGrossAmt,
                        appliedAmt: -fGradeDiscountAmt,
                        afterAmt: fNetAmt,
                        currency: sCurrency,
                        applyDesc: "상품등급 "
                            + sCurrentGrade
                            + " 할인 "
                            + this._formatRate(fGradeRate)
                            + "% 적용"
                    }));
                }
            }

            if (fNetAmt < 0) {
                fNetAmt = 0;
            }

            fIndividualAmt = fQty > 0 ? fNetAmt / fQty : 0;

            return {
                GrossAmt: this._roundAmount(fGrossAmt),
                DiscountAmt: this._roundAmount(fDiscountAmt),
                IndividualAmt: this._roundAmount(fIndividualAmt),
                NetAmt: this._roundAmount(fNetAmt),
                Currency: sCurrency,
                PriceConditions: aPriceConditions
            };
        },

        _isValidItem: function (oItem, sQuotDocTy) {
            if (!oItem) {
                return false;
            }

            if (!oItem.MaterialCd) {
                return false;
            }

            if (!oItem.ReqQty || this._toNumber(oItem.ReqQty) <= 0) {
                return false;
            }

            if (sQuotDocTy === "O" && !oItem.RefConfigCd) {
                return false;
            }

            return true;
        },

        _resetItemPrice: function (oItem) {
            oItem.GrossAmt = 0;
            oItem.DiscountAmt = 0;
            oItem.IndividualAmt = 0;
            oItem.NetAmt = 0;
            oItem.Currency = "KRW";
            oItem.PriceConditions = [];
        },

        _getSalesUnitPrice: function (oCondition) {
            var fUnitPrice = this._toNumber(oCondition.ConditionAmt);
            var sConditionUnit = oCondition.ConditionUnit || "";
            var sCurrency = oCondition.Currency || "";

            if (
                oCondition.ConditionType === "P" &&
                (sConditionUnit === "KRW" || sCurrency === "KRW")
            ) {
                fUnitPrice = fUnitPrice * 100;
            }

            return fUnitPrice;
        },

        _findBestCondition: function (aConditions, mOption) {
            var aMatched = [];

            for (var i = 0; i < aConditions.length; i++) {
                var oCondition = aConditions[i];

                if (!this._isUsableCondition(oCondition)) {
                    continue;
                }

                if (mOption.conditionType && oCondition.ConditionType !== mOption.conditionType) {
                    continue;
                }

                if (mOption.materialCd !== undefined) {
                    if ((oCondition.MaterialCd || "") !== mOption.materialCd) {
                        continue;
                    }
                }

                if (mOption.customerCd !== undefined) {
                    if ((oCondition.CustomerCd || "") !== mOption.customerCd) {
                        continue;
                    }
                }

                if (mOption.assetGrade !== undefined) {
                    if ((oCondition.AssetGrade || "") !== mOption.assetGrade) {
                        continue;
                    }
                }

                aMatched.push(oCondition);
            }

            if (aMatched.length === 0) {
                return null;
            }

            aMatched.sort(function (a, b) {
                var dA = this._parseODataDate(a.ValidFrom);
                var dB = this._parseODataDate(b.ValidFrom);

                if (dA && dB) {
                    return dB.getTime() - dA.getTime();
                }

                return 0;
            }.bind(this));

            return aMatched[0];
        },

        _findBestQuantityCondition: function (aConditions, sMaterialCd, fQty) {
            var aMatched = [];

            for (var i = 0; i < aConditions.length; i++) {
                var oCondition = aConditions[i];

                if (!this._isUsableCondition(oCondition)) {
                    continue;
                }

                if (oCondition.ConditionType !== "Q") {
                    continue;
                }

                if ((oCondition.MaterialCd || "") !== sMaterialCd) {
                    continue;
                }

                var fBeginQty = this._toNumber(oCondition.BeginQty);
                var fEndQty = this._toNumber(oCondition.EndQty);

                if (fQty < fBeginQty) {
                    continue;
                }

                if (fEndQty > 0 && fQty > fEndQty) {
                    continue;
                }

                aMatched.push(oCondition);
            }

            if (aMatched.length === 0) {
                return null;
            }

            aMatched.sort(function (a, b) {
                return this._toNumber(b.BeginQty) - this._toNumber(a.BeginQty);
            }.bind(this));

            return aMatched[0];
        },

        _isUsableCondition: function (oCondition) {
            if (!oCondition) {
                return false;
            }

            if (oCondition.UseYn && oCondition.UseYn !== "X") {
                return false;
            }

            return this._isConditionDateValid(oCondition);
        },

        _isConditionDateValid: function (oCondition) {
            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0);

            var oValidFrom = this._parseODataDate(oCondition.ValidFrom);
            var oValidTo = this._parseODataDate(oCondition.ValidTo);

            if (oValidFrom) {
                oValidFrom.setHours(0, 0, 0, 0);

                if (oToday < oValidFrom) {
                    return false;
                }
            }

            if (oValidTo) {
                oValidTo.setHours(0, 0, 0, 0);

                if (oToday > oValidTo) {
                    return false;
                }
            }

            return true;
        },

        _parseODataDate: function (vDate) {
            if (!vDate) {
                return null;
            }

            if (vDate instanceof Date) {
                return vDate;
            }

            if (typeof vDate === "string") {
                var aMatch = /\/Date\((\d+)\)\//.exec(vDate);

                if (aMatch && aMatch[1]) {
                    return new Date(Number(aMatch[1]));
                }

                var oDate = new Date(vDate);

                if (!isNaN(oDate.getTime())) {
                    return oDate;
                }
            }

            return null;
        },

        _createPriceConditionResult: function (mData) {
            var oSource = mData.source || {};

            return {
                CondSeq: String(mData.seq).padStart(3, "0"),
                ItemNo: mData.itemNo || "",
                PriceCondNo: oSource.PriceCondNo || "",
                ConditionType: mData.conditionType || oSource.ConditionType || "",
                ConditionNm: mData.conditionNm || oSource.ConditionNm || "",
                ConditionAmt: mData.conditionAmt || 0,
                ConditionUnit: mData.conditionUnit || oSource.ConditionUnit || "",
                BeginQty: oSource.BeginQty || 0,
                EndQty: oSource.EndQty || 0,
                RentPeriod: oSource.RentPeriod || "",
                CustomerCd: oSource.CustomerCd || "",
                RentalYn: oSource.RentalYn || "",
                AssetGrade: oSource.AssetGrade || "",
                Prepay: oSource.Prepay || "",
                ValidFrom: oSource.ValidFrom || null,
                ValidTo: oSource.ValidTo || null,
                MaterialCd: oSource.MaterialCd || "",
                BaseAmt: this._roundAmount(mData.baseAmt || 0),
                AppliedAmt: this._roundAmount(mData.appliedAmt || 0),
                AfterAmt: this._roundAmount(mData.afterAmt || 0),
                Currency: mData.currency || oSource.Currency || "KRW",
                ApplyDesc: mData.applyDesc || ""
            };
        },

        _toNumber: function (vValue) {
            if (vValue === null || vValue === undefined || vValue === "") {
                return 0;
            }

            if (typeof vValue === "number") {
                return vValue;
            }

            var sValue = String(vValue).replace(/,/g, "");
            var fValue = Number(sValue);

            if (isNaN(fValue)) {
                return 0;
            }

            return fValue;
        },

        _roundAmount: function (vAmount) {
            var fAmount = this._toNumber(vAmount);

            return Math.round(fAmount * 1000) / 1000;
        },

        _formatAmount: function (vAmount) {
            var fAmount = this._toNumber(vAmount);

            return fAmount.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        },

        _formatAmountText: function (vAmount, sCurrency) {
            var sAmount = this._formatAmount(vAmount);

            if (!sCurrency) {
                return sAmount;
            }

            return sAmount + " " + sCurrency;
        },

        _formatQty: function (vQty) {
            var fQty = this._toNumber(vQty);

            return fQty.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            });
        },

        _formatRate: function (vRate) {
            var fRate = this._toNumber(vRate);

            return fRate.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }
    };
});