sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
<<<<<<< HEAD
    "sap/m/MessageBox",
    "sap/ui/core/Item"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, Item) {
    // ↑ Filter, FilterOperator, Item 누락이 데이터 미로드의 핵심 원인이었음
    "use strict";

    return Controller.extend("node.t2.salesperformanceinquiry.controller.Main", {

        /* =========================================================== */
        /* 라이프사이클                                                  */
        /* =========================================================== */

        onInit: function () {
            this._initModels();       // 모델 먼저 초기화
            this._loadQuarterSales(); // QuarterSalesSet 조회 → 연도 콤보 → KPI → 자재
        },

        /* =========================================================== */
        /* 모델 초기화                                                   */
        /* =========================================================== */

        _initModels: function () {
            // 섹션1: 분기별 판매건수 pivot
            // rows 배열 + length → View의 {pivotModel>/rows}, {pivotModel>/length}
            this.getView().setModel(
                new JSONModel({ rows: [], length: 3 }),
                "pivotModel"
            );

            // 섹션2,3: KPI
            this.getView().setModel(
                new JSONModel({
                    selectedYear:        "",
                    categories:          [],
                    categoriesWithTotal: [],
                    totals: {
                        Ttlsalescount:   0,
                        Ttlyearamt:      0,
                        Ttlprevyearamt:  0,
                        Ttlyoygrowthpct: 0
                    }
                }),
                "kpiModel"
            );

            // 섹션4: 자재별 판매수량
            this.getView().setModel(
                new JSONModel({ rows: [] }),
                "materialModel"
            );
        },

        /* =========================================================== */
        /* 섹션1: 분기별 판매건수 + 연도 콤보 초기화                   */
        /* =========================================================== */

        _loadQuarterSales: function () {
            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/QuarterSalesSet", {
                success: function (oData) {
                    var aPivot = this._pivotQuarterData(oData.results);

                    // pivotModel 세팅 → rows 배열 구조로 저장
                    var oPivotModel = this.getView().getModel("pivotModel");
                    oPivotModel.setProperty("/rows",   aPivot);
                    oPivotModel.setProperty("/length", aPivot.length || 3);

                    // 연도 목록 추출 (최신순)
                    var aYears = aPivot
                        .map(function (o) { return o.Syear; })
                        .sort(function (a, b) { return b.localeCompare(a); });

                    // 연도 Select 채우기
                    this._populateYearSelect(aYears);

                    // 최신 연도로 KPI + 자재 로드
                    if (aYears.length > 0) {
                        this._loadKpiData(aYears[0]);
                    }
                }.bind(this),
                error: function () {
                    MessageBox.error("분기별 판매건수 조회에 실패했습니다.");
                }
            });
        },

        /**
         * QuarterSalesSet Flat → Pivot
         * [{Syear:"2025", Quarter:"1", Salescount:30}, ...]
         * → [{Syear:"2025", Q1:30, Q2:30, Q3:30, Q4:30}, ...]
         */
        _pivotQuarterData: function (aResults) {
            var oMap = {};
            aResults.forEach(function (oItem) {
                var sYear = oItem.Syear;
                var sKey  = "Q" + oItem.Quarter;
                if (!oMap[sYear]) {
                    oMap[sYear] = { Syear: sYear, Q1: null, Q2: null, Q3: null, Q4: null };
                }
                oMap[sYear][sKey] = oItem.Salescount;
            });
            return Object.values(oMap).sort(function (a, b) {
                return a.Syear.localeCompare(b.Syear);
            });
        },

        /* =========================================================== */
        /* 연도 Select                                                  */
        /* =========================================================== */

        _populateYearSelect: function (aYears) {
            var oSelect = this.byId("yearSelect");
            oSelect.removeAllItems();
            aYears.forEach(function (sYear) {
                oSelect.addItem(new Item({ key: sYear, text: sYear + "년" }));
            });
            if (aYears.length > 0) {
                oSelect.setSelectedKey(aYears[0]);
            }
        },

        onYearChange: function (oEvent) {
            var sYear = oEvent.getParameter("selectedItem").getKey();
            this._loadKpiData(sYear);
        },

        /* =========================================================== */
        /* 섹션2,3: KPI (KpiSummarySet)                               */
        /* =========================================================== */

        _loadKpiData: function (sYear) {
            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/KpiSummarySet", {
                filters: [new Filter("Syear", FilterOperator.EQ, sYear)],
                success: function (oData) {
                    var aResults  = oData.results;
                    var oKpiModel = this.getView().getModel("kpiModel");

                    oKpiModel.setProperty("/selectedYear", sYear);
                    oKpiModel.setProperty("/categories",   aResults);

                    if (aResults.length > 0) {
                        var o = aResults[0];

                        oKpiModel.setProperty("/totals", {
                            Ttlsalescount:   o.Ttlsalescount,
                            Ttlyearamt:      o.Ttlyearamt,
                            Ttlprevyearamt:  o.Ttlprevyearamt,
                            Ttlyoygrowthpct: o.Ttlyoygrowthpct
                        });

                        // 카테고리 행 + 전체 합계 행
                        oKpiModel.setProperty("/categoriesWithTotal",
                            aResults.concat([{
                                Categoryname:       "전체",
                                Currentyearamt:     o.Ttlyearamt,
                                Yoygrowthpct:       o.Ttlyoygrowthpct,
                                Categorysalescount: o.Ttlsalescount,
                                Sharepct:           "100"
                            }])
                        );

                        console.log(o.Ttlsalescount);
                    }

                    this._loadMaterialData(sYear);
                }.bind(this),
                error: function () {
                    MessageBox.error("KPI 데이터 조회에 실패했습니다.");
=======
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
>>>>>>> 6c562b1709e869439ac4a4e63510973036fd5bc9
                }
            });
        },

<<<<<<< HEAD
        /* =========================================================== */
        /* 섹션4: 자재별 판매수량 (MaterialSalesSet)                   */
        /* =========================================================== */

        _loadMaterialData: function (sYear) {
            var oModel = this.getOwnerComponent().getModel();

            oModel.read("/MaterialSalesSet", {
                filters: [new Filter("Year", FilterOperator.EQ, sYear)],
                success: function (oData) {
                    var aPivot = this._pivotMaterialData(oData.results);
                    this.getView().getModel("materialModel").setProperty("/rows", aPivot);
                }.bind(this),
                error: function () {
                    MessageBox.error("자재별 판매수량 조회에 실패했습니다.");
                }
            });
        },

        /**
         * MaterialSalesSet Flat → Pivot (월 → 분기 합산)
         * [{MaterialCd:"FERT_CHAIR_M", MaterialNm:"...", Month:"01", Sum_qty:30}, ...]
         * → [{MaterialNm:"...", Q1:90, Q2:0, Q3:0, Q4:0}, ...]
         */
        _pivotMaterialData: function (aResults) {
            var oMap = {};

            aResults.forEach(function (oItem) {
                var sKey   = oItem.MaterialCd;
                var iMonth = parseInt(oItem.Month, 10);

                var sQuarter;
                if      (iMonth <= 3)  { sQuarter = "Q1"; }
                else if (iMonth <= 6)  { sQuarter = "Q2"; }
                else if (iMonth <= 9)  { sQuarter = "Q3"; }
                else                   { sQuarter = "Q4"; }

                if (!oMap[sKey]) {
                    oMap[sKey] = {
                        MaterialCd: oItem.MaterialCd,
                        MaterialNm: oItem.MaterialNm,
                        Q1: 0, Q2: 0, Q3: 0, Q4: 0
                    };
                }
                oMap[sKey][sQuarter] += Number(oItem.Sum_qty) || 0;
            });

            return Object.values(oMap).sort(function (a, b) {
                return a.MaterialCd.localeCompare(b.MaterialCd);
            });
=======
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
>>>>>>> 6c562b1709e869439ac4a4e63510973036fd5bc9
        }

    });
});