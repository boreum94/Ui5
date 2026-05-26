sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageToast,
    MessageBox
) {
    "use strict";

    return BaseController.extend("code.t2.forecast.controller.Main", {
        onInit: function () {
            var oMainModel = new JSONModel({
                busy: false,
                resultCount: 0,
                filters: this._getDefaultFilters(),
                headers: []
            });

            oMainModel.setSizeLimit(1000);

            this.setModel(oMainModel, "main");

            this.getRouter()
                .getRoute("main")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _getDefaultFilters: function () {
            return {
                ForcastYear: String(new Date().getFullYear()),
                ForcastType: "",
                Status: ""
            };
        },

        _onRouteMatched: function () {
            this.onSearch();
        },

        onNewUpload: function () {
            this.resetPreviewState();
            this.getRouter().navTo("upload");
        },

        onSearch: function () {
            var oMainModel = this.getModel("main");
            var oODataModel = this.getOwnerComponent().getModel();
            var oFilterData = oMainModel.getProperty("/filters");
            var aFilters = [];

            if (
                oFilterData.ForcastYear &&
                !/^\d{4}$/.test(oFilterData.ForcastYear)
            ) {
                MessageBox.warning("예측 연도는 4자리 숫자로 입력하세요.");
                return;
            }

            if (oFilterData.ForcastYear) {
                aFilters.push(
                    new Filter(
                        "ForcastYear",
                        FilterOperator.EQ,
                        oFilterData.ForcastYear
                    )
                );
            }

            if (oFilterData.ForcastType) {
                aFilters.push(
                    new Filter(
                        "ForcastType",
                        FilterOperator.EQ,
                        oFilterData.ForcastType
                    )
                );
            }

            if (oFilterData.Status) {
                aFilters.push(
                    new Filter(
                        "Status",
                        FilterOperator.EQ,
                        oFilterData.Status
                    )
                );
            }

            oMainModel.setProperty("/busy", true);

            oODataModel.read("/PlanHeaderSet", {
                filters: aFilters,

                success: function (oData) {
                    var aHeaders = (oData.results || []).sort(
                        this._sortHeaders.bind(this)
                    );

                    oMainModel.setProperty("/headers", aHeaders);
                    oMainModel.setProperty("/resultCount", aHeaders.length);
                    oMainModel.setProperty("/busy", false);

                    MessageToast.show(
                        "판매예측 " + aHeaders.length + "건을 조회했습니다."
                    );
                }.bind(this),

                error: function (oError) {
                    oMainModel.setProperty("/busy", false);

                    MessageBox.error(
                        this.getODataErrorMessage(
                            oError,
                            "판매예측 목록 조회 중 오류가 발생했습니다."
                        )
                    );
                }.bind(this)
            });
        },

        onReset: function () {
            this.getModel("main").setProperty(
                "/filters",
                this._getDefaultFilters()
            );

            this.onSearch();
        },

        _sortHeaders: function (oFirst, oSecond) {
            var iFirstPriority = this._getStatusPriority(oFirst.Status);
            var iSecondPriority = this._getStatusPriority(oSecond.Status);

            if (iFirstPriority !== iSecondPriority) {
                return iFirstPriority - iSecondPriority;
            }

            return String(oSecond.ForcastCd || "").localeCompare(
                String(oFirst.ForcastCd || "")
            );
        },

        _getStatusPriority: function (sStatus) {
            if (sStatus === "C") {
                return 0;
            }

            if (sStatus === "D") {
                return 1;
            }

            if (sStatus === "X") {
                return 2;
            }

            return 3;
        },

        onPlanPress: function (oEvent) {
            var oContext = oEvent
                .getSource()
                .getBindingContext("main");

            var sForcastCd = String(
                oContext.getProperty("ForcastCd") || ""
            ).trim();

            var sForcastYear = String(
                oContext.getProperty("ForcastYear") || ""
            ).trim();

            if (!sForcastCd || !sForcastYear) {
                MessageBox.error(
                    "상세조회에 필요한 판매예측 코드 또는 예측 연도가 없습니다."
                );
                return;
            }

            this.getRouter().navTo("detail", {
                forcastCd: encodeURIComponent(sForcastCd),
                forcastYear: encodeURIComponent(sForcastYear)
            });
        }
    });
});