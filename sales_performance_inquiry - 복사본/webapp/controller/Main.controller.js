sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    var DEFAULT_KPI = {
        totalYearAmt: 0,
        totalYearAmtFormatted: "0",
        amtScale: "",
        totalSalesCount: 0,
        ttlYoyGrowthPct: "0.0",
        currency: "KRW",
        bestCategory: "-",
        bestCategoryShare: "-",
        growthColor: "Neutral",
        growthIndicator: "None"
    };

    return Controller.extend("node.t2.salesperformanceinquiry.controller.Main", {

        onInit: function () {
            var oViewModel = new JSONModel({
                busy: false,
                filter: {
                    year: "2026",
                    itemCategory: ""
                },
                kpi: Object.assign({}, DEFAULT_KPI),
                quarterTable: [],
                quarterChart: [],
                categoryKpi: []
            });

            this.getView().setModel(oViewModel, "view");
            this._loadData();
        },

        onSearch: function () {
            this._loadData();
        },

        onReset: function () {
            var oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/filter", {
                year: "2026",
                itemCategory: ""
            });
            this._loadData();
        },

        formatGrowthText: function (fValue) {
            var fNum = Number(fValue || 0);
            return (fNum > 0 ? "▲ +" : fNum < 0 ? "▼ " : "") + fNum.toFixed(1) + "%";
        },

        formatGrowthState: function (fValue) {
            var fNum = Number(fValue || 0);
            if (fNum > 0) return "Success";
            if (fNum < 0) return "Error";
            return "None";
        },

        _loadData: function () {
            var oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/busy", true);

            var iPending = 2;
            var fnDone = function () {
                iPending--;
                if (iPending === 0) {
                    oViewModel.setProperty("/busy", false);
                }
            };

            this._readQuarterSales(fnDone);
            this._readKpiSummary(fnDone);
        },

        _getYearFilter: function (sPropertyName) {
            var sYear = this.getView().getModel("view").getProperty("/filter/year");
            if (!sYear) return [];
            return [new Filter(sPropertyName, FilterOperator.EQ, sYear)];
        },

        _readQuarterSales: function (fnDone) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");
            var aFilters = this._getYearFilter("Syear");

            oODataModel.read("/QuarterSalesSet", {
                filters: aFilters,
                success: function (oData) {
                    var aResult = oData.results || [];
                    var mYear = {};
                    var aChart = [];

                    aResult.forEach(function (oRow) {
                        var sYear = oRow.Syear;
                        var sQuarter = oRow.Quarter;
                        var iCount = Number(oRow.Salescount || 0);

                        if (!mYear[sYear]) {
                            mYear[sYear] = { Syear: sYear, Q1: 0, Q2: 0, Q3: 0, Q4: 0, Total: 0 };
                        }
                        mYear[sYear]["Q" + sQuarter] = iCount;
                        mYear[sYear].Total += iCount;

                        aChart.push({
                            Label: sYear + "년 " + sQuarter + "분기",
                            Salescount: iCount
                        });
                    });

                    var aTable = Object.values(mYear).sort(function (a, b) {
                        return b.Syear.localeCompare(a.Syear);
                    });

                    oViewModel.setProperty("/quarterTable", aTable);
                    oViewModel.setProperty("/quarterChart", aChart);
                    fnDone();
                },
                error: function () {
                    MessageBox.error("분기별 판매건수 조회 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
                    fnDone();
                }
            });
        },

        _readKpiSummary: function (fnDone) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");
            var aFilters = this._getYearFilter("Syear");
            var sItemCategory = oViewModel.getProperty("/filter/itemCategory");

            if (sItemCategory) {
                aFilters.push(new Filter("Itemcategory", FilterOperator.EQ, sItemCategory));
            }

            oODataModel.read("/KpiSummarySet", {
                filters: aFilters,
                success: function (oData) {
                    var aResult = oData.results || [];

                    if (aResult.length === 0) {
                        oViewModel.setProperty("/categoryKpi", []);
                        oViewModel.setProperty("/kpi", Object.assign({}, DEFAULT_KPI));
                        fnDone();
                        return;
                    }

                    aResult.sort(function (a, b) {
                        return Number(b.Yearnum) - Number(a.Yearnum);
                    });

                    var oBase = aResult[0];
                    var fTtlAmt = Number(oBase.Ttlyearamt || 0);
                    var fGrowth = Number(oBase.Ttlyoygrowthpct || 0);
                    var oFormatted = this._formatAmountForTile(fTtlAmt);

                    var oBest = aResult.reduce(function (oPrev, oCurr) {
                        return Number(oCurr.Sharepct || 0) > Number(oPrev.Sharepct || 0) ? oCurr : oPrev;
                    }, aResult[0]);

                    oViewModel.setProperty("/kpi", {
                        totalYearAmt: fTtlAmt,
                        totalYearAmtFormatted: oFormatted.value,
                        amtScale: oFormatted.scale,
                        totalSalesCount: Number(oBase.Ttlsalescount || 0),
                        ttlYoyGrowthPct: fGrowth.toFixed(1),
                        currency: oBase.Currency || "KRW",
                        bestCategory: oBest.Categoryname || oBest.Itemcategory || "-",
                        bestCategoryShare: Number(oBest.Sharepct || 0).toFixed(1) + "%",
                        growthColor: fGrowth > 0 ? "Good" : fGrowth < 0 ? "Critical" : "Neutral",
                        growthIndicator: fGrowth > 0 ? "Up" : fGrowth < 0 ? "Down" : "None"
                    });

                    oViewModel.setProperty("/categoryKpi", aResult);
                    fnDone();
                }.bind(this),
                error: function () {
                    MessageBox.error("KPI 요약 조회 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.");
                    fnDone();
                }
            });
        },

        _formatAmountForTile: function (fAmount) {
            var fAbs = Math.abs(fAmount);
            if (fAbs >= 1000000000000) {
                return { value: (fAmount / 1000000000000).toFixed(1), scale: "조" };
            }
            if (fAbs >= 100000000) {
                return { value: (fAmount / 100000000).toFixed(1), scale: "억" };
            }
            if (fAbs >= 10000) {
                return { value: (fAmount / 10000).toFixed(0), scale: "만" };
            }
            return { value: String(Math.round(fAmount)), scale: "" };
        }

    });
});
