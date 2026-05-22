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
                    itemCategory: "",
                    materialKeyword: ""
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
                categoryKpi: [],
                materialSales: []
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
                itemCategory: "",
                materialKeyword: ""
            });

            this._loadData();
        },

        _loadData: function () {
            this._readQuarterSales();
            this._readKpiSummary();
            this._readMaterialSales();
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
                            Label: sYear + "년 " + sQuarter + "분기",
                            Salescount: iSalesCount
                        });
                    });

                    oViewModel.setProperty("/quarterTable", Object.values(mYear));
                    oViewModel.setProperty("/quarterChart", aChart);
                },
                error: function () {
                    MessageToast.show("분기별 판매건수 조회 중 오류가 발생했습니다.");
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
                        oViewModel.setProperty("/categoryKpi", []);
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
                },
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
            var sMaterialKeyword = oViewModel.getProperty("/filter/materialKeyword");

            if (sItemCategory) {
                aFilters.push(new Filter("Itemcategory", FilterOperator.EQ, sItemCategory));
            }

            if (sMaterialKeyword) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Materialcd", FilterOperator.Contains, sMaterialKeyword),
                        new Filter("Materialnm", FilterOperator.Contains, sMaterialKeyword)
                    ],
                    and: false
                }));
            }

            oODataModel.read("/MaterialSalesSet", {
                filters: aFilters,
                success: function (oData) {
                    oViewModel.setProperty("/materialSales", oData.results || []);
                },
                error: function () {
                    MessageToast.show("제품별 월별 판매수량 조회 중 오류가 발생했습니다.");
                }
            });
        }
    });
});