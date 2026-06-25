sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("node.t2.salesperformanceinquiry.controller.Main", {
        onInit: function () {
            var oViewModel = new JSONModel({
                filter: {
                    year: "2026",
                    itemCategory: ""
                },
                kpi: {
                    totalYearAmt: 0,
                    totalSalesCount: 0,
                    ttlYoyGrowthPct: 0,
                    currency: "KRW",
                    bestCategory: "-",
                    bestCategoryShare: "-"
                },

                quarterTable: [],
                quarterChart: [],
                quarterMonthChart: [],
                quarterMonthTable: [],

                categoryKpi: [],
                categoryRevenueChart: [],
                categoryShareChart: [],
                categoryGrowthCards: [],

                materialSales: [],
                materialMonthChart: [],
                materialTopChart: [],

                customerBizMonthOrder: [],
                customerBizPattern: [],
                customerBizChart: []
            });

            this.getView().setModel(oViewModel, "view");

            this._loadData();
        },

        onAfterRendering: function () {
            this._setChartProperties();
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

            var oIconTabBar = this.byId("mainIconTabBar");

            if (oIconTabBar) {
                oIconTabBar.setSelectedKey("quarter");
            }

            this._loadData();
        },

        onCategoryChange: function () {
            var sItemCategory = this.getView().getModel("view").getProperty("/filter/itemCategory");

            if (sItemCategory !== "" && sItemCategory !== "S" && sItemCategory !== "R") {
                var oIconTabBar = this.byId("mainIconTabBar");

                if (oIconTabBar && oIconTabBar.getSelectedKey() === "material") {
                    oIconTabBar.setSelectedKey("quarter");
                }
            }
        },

        _loadData: function () {
            this._readQuarterSales();
            this._readQuarterMonthSales();
            this._readKpiSummary();
            this._readMaterialSales();
            this._readCustomerBizMonthOrder();
        },

        _setChartProperties: function () {
            var aChartIds = [
                "quarterChart",
                "categoryRevenueChart",
                "categoryShareChart",
                "materialMonthChart",
                "materialTopChart",
                "customerBizChart"
            ];

            aChartIds.forEach(function (sChartId) {
                var oChart = this.byId(sChartId);

                if (!oChart) {
                    return;
                }

                oChart.setVizProperties({
                    title: {
                        visible: false
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true
                        }
                    },
                    legend: {
                        visible: true
                    }
                });
            }, this);
        },

        _getYearFilter: function (sPropertyName) {
            var sYear = this.getView().getModel("view").getProperty("/filter/year");

            if (!sYear) {
                return [];
            }

            return [
                new Filter(sPropertyName, FilterOperator.EQ, sYear)
            ];
        },

        formatAmount: function (vValue) {
            var nValue = Number(vValue || 0);

            return nValue.toLocaleString("ko-KR");
        },

        formatBizTypeName: function (sBiztype) {
            var mBizType = {
                "10": "숙박업",
                "20": "정부기관",
                "30": "기숙사",
                "40": "공유오피스",
                "50": "복지시설",
                "60": "프랜차이즈"
            };

            return mBizType[sBiztype] || sBiztype || "-";
        },

        formatMonth: function (sMonth) {
            var iMonth = Number(sMonth);

            if (!iMonth) {
                return sMonth;
            }

            return iMonth + "월";
        },

        _getQuarterState: function (sQuarter) {
            if (sQuarter === "1") {
                return "Information";
            }

            if (sQuarter === "2") {
                return "Success";
            }

            if (sQuarter === "3") {
                return "Warning";
            }

            if (sQuarter === "4") {
                return "Error";
            }

            return "None";
        },

        _readQuarterSales: function () {
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
                        var iSalesCount = Number(oRow.Salescount || 0);

                        if (!mYear[sYear]) {
                            mYear[sYear] = {
                                Syear: sYear,
                                Q1: 0,
                                Q2: 0,
                                Q3: 0,
                                Q4: 0
                            };
                        }

                        mYear[sYear]["Q" + sQuarter] = iSalesCount;

                        aChart.push({
                            Quarter: sQuarter + "분기",
                            Year: sYear + "년",
                            Salescount: iSalesCount
                        });
                    });

                    aChart.sort(function (a, b) {
                        if (a.Quarter !== b.Quarter) {
                            return a.Quarter.localeCompare(b.Quarter);
                        }

                        return a.Year.localeCompare(b.Year);
                    });

                    oViewModel.setProperty("/quarterTable", Object.values(mYear));
                    oViewModel.setProperty("/quarterChart", aChart);
                },
                error: function () {
                    MessageToast.show("분기별 판매건수 조회 중 오류가 발생했습니다.");
                }
            });
        },

        _readQuarterMonthSales: function () {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");
            var aFilters = this._getYearFilter("Syear");

            oODataModel.read("/QuarterMonthSalesSet", {
                filters: aFilters,
                success: function (oData) {
                    var aResult = oData.results || [];

                    aResult.sort(function (a, b) {
                        if (a.Syear !== b.Syear) {
                            return Number(a.Syear) - Number(b.Syear);
                        }

                        return Number(a.Smonth) - Number(b.Smonth);
                    });

                    var aChart = aResult.map(function (oRow) {
                        var sQuarter = String(oRow.Quarter || "");
                        var sQuarterText = sQuarter + "분기";
                        var sMonthText = Number(oRow.Smonth) + "월";

                        return {
                            Label: sQuarterText + " " + sMonthText,
                            Syear: oRow.Syear,
                            Quarter: sQuarter,
                            QuarterText: sQuarterText,
                            QuarterState: this._getQuarterState(sQuarter),
                            Smonth: oRow.Smonth,
                            MonthText: sMonthText,
                            Salescount: Number(oRow.Salescount || 0)
                        };
                    }, this);

                    oViewModel.setProperty("/quarterMonthChart", aChart);
                    oViewModel.setProperty("/quarterMonthTable", aChart);
                }.bind(this),
                error: function () {
                    MessageToast.show("분기/월별 판매건수 조회 중 오류가 발생했습니다.");
                }
            });
        },

        _readKpiSummary: function () {
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
                        oViewModel.setProperty("/kpi", {
                            totalYearAmt: 0,
                            totalSalesCount: 0,
                            ttlYoyGrowthPct: 0,
                            currency: "KRW",
                            bestCategory: "-",
                            bestCategoryShare: "-"
                        });

                        oViewModel.setProperty("/categoryKpi", []);
                        oViewModel.setProperty("/categoryRevenueChart", []);
                        oViewModel.setProperty("/categoryShareChart", []);
                        oViewModel.setProperty("/categoryGrowthCards", []);
                        return;
                    }

                    aResult.sort(function (a, b) {
                        return Number(b.Yearnum) - Number(a.Yearnum);
                    });

                    var oBase = aResult[0];

                    var oBestCategory = aResult.reduce(function (oPrev, oCurr) {
                        return Number(oCurr.Sharepct || 0) > Number(oPrev.Sharepct || 0) ? oCurr : oPrev;
                    }, aResult[0]);

                    oViewModel.setProperty("/kpi", {
                        totalYearAmt: Number(oBase.Ttlyearamt || 0),
                        totalSalesCount: Number(oBase.Ttlsalescount || 0),
                        ttlYoyGrowthPct: Number(oBase.Ttlyoygrowthpct || 0),
                        currency: oBase.Currency || "KRW",
                        bestCategory: oBestCategory.Categoryname || oBestCategory.Itemcategory || "-",
                        bestCategoryShare: Number(oBestCategory.Sharepct || 0) + "%"
                    });

                    oViewModel.setProperty("/categoryKpi", aResult);
                    oViewModel.setProperty("/categoryRevenueChart", this._makeCategoryRevenueChart(aResult));
                    oViewModel.setProperty("/categoryShareChart", this._makeCategoryShareChart(aResult));
                    oViewModel.setProperty("/categoryGrowthCards", this._makeCategoryGrowthCards(aResult));
                }.bind(this),
                error: function () {
                    MessageToast.show("KPI 요약 조회 중 오류가 발생했습니다.");
                }
            });
        },

        _readMaterialSales: function () {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");
            var aFilters = this._getYearFilter("Year");

            var sItemCategory = oViewModel.getProperty("/filter/itemCategory");

            if (sItemCategory) {
                if (sItemCategory !== "S" && sItemCategory !== "R") {
                    oViewModel.setProperty("/materialSales", []);
                    oViewModel.setProperty("/materialMonthChart", []);
                    oViewModel.setProperty("/materialTopChart", []);
                    return;
                }

                aFilters.push(new Filter("Itemcategory", FilterOperator.EQ, sItemCategory));
            } else {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Itemcategory", FilterOperator.EQ, "S"),
                        new Filter("Itemcategory", FilterOperator.EQ, "R")
                    ],
                    and: false
                }));
            }

            oODataModel.read("/MaterialSalesSet", {
                filters: aFilters,
                success: function (oData) {
                    var aResult = oData.results || [];

                    oViewModel.setProperty("/materialSales", aResult);
                    oViewModel.setProperty("/materialMonthChart", this._makeMaterialMonthChart(aResult));
                    oViewModel.setProperty("/materialTopChart", this._makeMaterialTopChart(aResult, 5));
                }.bind(this),
                error: function () {
                    MessageToast.show("제품별 월별 판매수량 조회 중 오류가 발생했습니다.");
                }
            });
        },

        _makeCategoryRevenueChart: function (aRows) {
            return aRows.map(function (oRow) {
                return {
                    Category: oRow.Categoryname || oRow.Itemcategory || "-",
                    Itemcategory: oRow.Itemcategory,
                    Currentyearamt: Number(oRow.Currentyearamt || 0),
                    Currency: oRow.Currency || "KRW"
                };
            });
        },

        _makeCategoryShareChart: function (aRows) {
            return aRows.map(function (oRow) {
                return {
                    Category: oRow.Categoryname || oRow.Itemcategory || "-",
                    Sharepct: Number(oRow.Sharepct || 0)
                };
            });
        },

        _makeCategoryGrowthCards: function (aRows) {
            return aRows.map(function (oRow) {
                var nGrowth = Number(oRow.Yoygrowthpct || 0);
                var sState = "None";
                var sValueColor = "Neutral";

                if (nGrowth > 0) {
                    sState = "Success";
                    sValueColor = "Good";
                } else if (nGrowth < 0) {
                    sState = "Error";
                    sValueColor = "Error";
                } else {
                    sState = "Warning";
                    sValueColor = "Neutral";
                }

                return {
                    Category: oRow.Categoryname || oRow.Itemcategory || "-",
                    Itemcategory: oRow.Itemcategory,
                    Yoygrowthpct: nGrowth,
                    Sharepct: Number(oRow.Sharepct || 0),
                    Categorysalescount: Number(oRow.Categorysalescount || 0),
                    State: sState,
                    ValueColor: sValueColor
                };
            });
        },

        _makeMaterialMonthChart: function (aRows) {
            var mMonth = {};
            var aChart = [];

            aRows.forEach(function (oRow) {
                var sYear = oRow.Year || "";
                var sMonth = oRow.Month || "";
                var sKey = sYear + "_" + sMonth;
                var nQty = Number(oRow.SumQty || 0);

                if (!mMonth[sKey]) {
                    mMonth[sKey] = {
                        Year: sYear,
                        Month: sMonth,
                        MonthNo: Number(sMonth || 0),
                        Label: sYear + "년 " + Number(sMonth || 0) + "월",
                        SumQty: 0,
                        Unit: oRow.Unit || ""
                    };
                }

                mMonth[sKey].SumQty += nQty;
            });

            aChart = Object.keys(mMonth).map(function (sKey) {
                return mMonth[sKey];
            });

            aChart.sort(function (a, b) {
                if (a.Year !== b.Year) {
                    return Number(a.Year) - Number(b.Year);
                }

                return Number(a.MonthNo) - Number(b.MonthNo);
            });

            return aChart;
        },

        _makeMaterialTopChart: function (aRows, iLimit) {
            var mMaterial = {};
            var aChart = [];

            aRows.forEach(function (oRow) {
                var sMaterialCd = oRow.Materialcd || "";
                var sMaterialNm = oRow.Materialnm || sMaterialCd || "-";
                var sKey = sMaterialCd + "_" + sMaterialNm;
                var nQty = Number(oRow.SumQty || 0);

                if (!mMaterial[sKey]) {
                    mMaterial[sKey] = {
                        Materialcd: sMaterialCd,
                        Materialnm: sMaterialNm,
                        TotalQty: 0,
                        Unit: oRow.Unit || ""
                    };
                }

                mMaterial[sKey].TotalQty += nQty;
            });

            aChart = Object.keys(mMaterial).map(function (sKey) {
                return mMaterial[sKey];
            });

            aChart.sort(function (a, b) {
                return Number(b.TotalQty || 0) - Number(a.TotalQty || 0);
            });

            return aChart.slice(0, iLimit || 5);
        },

        _readCustomerBizMonthOrder: function () {
            var oODataModel = this.getOwnerComponent().getModel();
            var oViewModel = this.getView().getModel("view");
            var aFilters = this._getYearFilter("Syear");

            oODataModel.read("/CustomerBizMonthOrderSet", {
                filters: aFilters,
                success: function (oData) {
                    var aResult = oData.results || [];

                    aResult = this._calculateBizMonthPattern(aResult);

                    oViewModel.setProperty("/customerBizMonthOrder", aResult);
                    oViewModel.setProperty("/customerBizPattern", this._makeBizPatternSummary(aResult));
                    oViewModel.setProperty("/customerBizChart", this._makeBizMonthChart(aResult));
                }.bind(this),
                error: function () {
                    MessageToast.show("고객 사업부문별 월별 주문 분석 조회 중 오류가 발생했습니다.");
                }
            });
        },

        _calculateBizMonthPattern: function (aRows) {
            var mBiz = {};

            aRows.forEach(function (oRow) {
                var sBiztype = oRow.Biztype;
                var iOrdercount = Number(oRow.Ordercount || 0);

                if (!mBiz[sBiztype]) {
                    mBiz[sBiztype] = {
                        totalOrdercount: 0,
                        rows: []
                    };
                }

                mBiz[sBiztype].totalOrdercount += iOrdercount;
                mBiz[sBiztype].rows.push(oRow);
            });

            Object.keys(mBiz).forEach(function (sBiztype) {
                var oBiz = mBiz[sBiztype];

                var nMonthlyAvg = oBiz.totalOrdercount / 12;

                var nMaxOrdercount = Math.max.apply(null, oBiz.rows.map(function (oRow) {
                    return Number(oRow.Ordercount || 0);
                }));

                var nMinOrdercount = Math.min.apply(null, oBiz.rows.map(function (oRow) {
                    return Number(oRow.Ordercount || 0);
                }));

                oBiz.rows.forEach(function (oRow) {
                    var iOrdercount = Number(oRow.Ordercount || 0);
                    var nOrderIntensity = nMonthlyAvg === 0 ? 0 : iOrdercount / nMonthlyAvg;

                    oRow.BiztypeText = this.formatBizTypeName(oRow.Biztype);
                    oRow.MonthText = this.formatMonth(oRow.Smonth);
                    oRow.MonthlyAvgOrdercount = Number(nMonthlyAvg.toFixed(1));
                    oRow.OrderIntensity = Number(nOrderIntensity.toFixed(2));
                    oRow.OrderIntensityText = "평균 대비 " + nOrderIntensity.toFixed(1) + "배";
                    oRow.IsPeakMonth = iOrdercount === nMaxOrdercount;
                    oRow.IsLowMonth = iOrdercount === nMinOrdercount;

                    if (nOrderIntensity >= 1.3) {
                        oRow.PatternType = "주문 집중월";
                    } else if (nOrderIntensity <= 0.7) {
                        oRow.PatternType = "주문 저조월";
                    } else {
                        oRow.PatternType = "일반월";
                    }

                    oRow.AnalysisText =
                        oRow.BiztypeText + " 고객군은 " +
                        oRow.MonthText + "에 주문 " +
                        iOrdercount + "건이 발생했으며, " +
                        oRow.OrderIntensityText + " 수준입니다.";
                }, this);
            }, this);

            return aRows;
        },

        _makeBizPatternSummary: function (aRows) {
            var mBiz = {};
            var aSummary = [];

            aRows.forEach(function (oRow) {
                var sBiztype = oRow.Biztype;

                if (!mBiz[sBiztype]) {
                    mBiz[sBiztype] = {
                        Biztype: sBiztype,
                        BiztypeText: oRow.BiztypeText,
                        PeakMonthText: "",
                        PeakOrdercount: 0,
                        LowMonthText: "",
                        LowOrdercount: null,
                        TotalOrdercount: 0,
                        TotalNetamount: 0,
                        Currency: oRow.Currency
                    };
                }

                mBiz[sBiztype].TotalOrdercount += Number(oRow.Ordercount || 0);
                mBiz[sBiztype].TotalNetamount += Number(oRow.Netamount || 0);

                if (Number(oRow.Ordercount || 0) > mBiz[sBiztype].PeakOrdercount) {
                    mBiz[sBiztype].PeakMonthText = oRow.MonthText;
                    mBiz[sBiztype].PeakOrdercount = Number(oRow.Ordercount || 0);
                }

                if (mBiz[sBiztype].LowOrdercount === null ||
                    Number(oRow.Ordercount || 0) < mBiz[sBiztype].LowOrdercount) {
                    mBiz[sBiztype].LowMonthText = oRow.MonthText;
                    mBiz[sBiztype].LowOrdercount = Number(oRow.Ordercount || 0);
                }
            });

            Object.keys(mBiz).forEach(function (sBiztype) {
                var oSummary = mBiz[sBiztype];

                oSummary.AnalysisText =
                    oSummary.BiztypeText + " 고객군은 " +
                    oSummary.PeakMonthText + "에 주문이 가장 많았고, " +
                    oSummary.LowMonthText + "에 주문이 가장 적었습니다.";

                aSummary.push(oSummary);
            });

            return aSummary;
        },

        _makeBizMonthChart: function (aRows) {
            return aRows.map(function (oRow) {
                return {
                    Biztype: oRow.Biztype,
                    BiztypeText: oRow.BiztypeText,
                    MonthText: oRow.MonthText,
                    Ordercount: Number(oRow.Ordercount || 0),
                    Netamount: Number(oRow.Netamount || 0)
                };
            });
        },

        onQuarterMonthRowsUpdated: function (oEvent) {
            var oTable = oEvent.getSource();
            var aRows = oTable.getRows();

            aRows.forEach(function (oRow) {
                var oContext = oRow.getBindingContext("view");

                oRow.$().removeClass(
                    "quarterRowQ1 quarterRowQ2 quarterRowQ3 quarterRowQ4"
                );

                if (!oContext) {
                    return;
                }

                var oData = oContext.getObject();
                var sQuarter = String(oData.Quarter || "");

                if (sQuarter === "1") {
                    oRow.$().addClass("quarterRowQ1");
                } else if (sQuarter === "2") {
                    oRow.$().addClass("quarterRowQ2");
                } else if (sQuarter === "3") {
                    oRow.$().addClass("quarterRowQ3");
                } else if (sQuarter === "4") {
                    oRow.$().addClass("quarterRowQ4");
                }
            });
        }
    });
});