sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast
) {
    "use strict";

    return BaseController.extend("code.t2.forecast.controller.Detail", {
        onInit: function () {
            var oDetailModel = new JSONModel({
                busy: false,
                header: {},
                items: [],
                monthlyChart: [],
                productChart: [],
                summary: {
                    itemCount: 0,
                    annualTotal: 0,
                    monthlyAverage: 0,
                    peakMonth: "-",
                    peakMonthQty: 0,
                    topMaterialCd: "-",
                    topMaterialQty: 0
                }
            });

            oDetailModel.setSizeLimit(1000);

            this.setModel(oDetailModel, "detail");

            this.getRouter()
                .getRoute("detail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        onAfterRendering: function () {
            if (this._bChartsConfigured) {
                return;
            }

            this._configureCharts();
            this._bChartsConfigured = true;
        },

        _configureCharts: function () {
            var oMonthlyChart = this.byId("monthlyForecastChart");
            var oProductChart = this.byId("productAnnualChart");

            if (oMonthlyChart) {
                oMonthlyChart.setVizProperties({
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: false
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true
                        },
                        marker: {
                            visible: true
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: false
                        },
                        label: {
                            formatString: "#,##0"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false
                        }
                    },
                    tooltip: {
                        visible: true
                    },
                    interaction: {
                        selectability: {
                            mode: "EXCLUSIVE"
                        }
                    }
                });
            }

            if (oProductChart) {
                oProductChart.setVizProperties({
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: false
                    },
                    plotArea: {
                        dataLabel: {
                            visible: true
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: false
                        },
                        label: {
                            formatString: "#,##0"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false
                        }
                    },
                    tooltip: {
                        visible: true
                    },
                    interaction: {
                        selectability: {
                            mode: "EXCLUSIVE"
                        }
                    }
                });
            }
        },

        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");

            var sForcastCd = decodeURIComponent(
                oArguments.forcastCd || ""
            );

            var sForcastYear = decodeURIComponent(
                oArguments.forcastYear || ""
            );

            if (!sForcastCd || !sForcastYear) {
                MessageBox.error(
                    "상세조회에 필요한 판매예측 코드 또는 예측 연도가 없습니다.",
                    {
                        onClose: function () {
                            this.getRouter().navTo("main");
                        }.bind(this)
                    }
                );
                return;
            }

            this._loadDetail(sForcastCd, sForcastYear);
        },

        onBack: function () {
            this.getRouter().navTo("main");
        },

        onNewUpload: function () {
            this.resetPreviewState();
            this.getRouter().navTo("upload");
        },

        onConfirmForecast: function () {
            var oHeader = this.getModel("detail").getProperty("/header");

            if (!oHeader || oHeader.Status !== "D") {
                MessageBox.warning(
                    "저장 상태의 판매예측 문서만 확정할 수 있습니다."
                );
                return;
            }

            MessageBox.confirm(
                oHeader.ForcastYear +
                    "년 " +
                    this.formatForcastType(oHeader.ForcastType) +
                    " 판매예측 문서 " +
                    oHeader.ForcastCd +
                    "를 확정하시겠습니까?",
                {
                    title: "판매예측 확정",
                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._updateForecastStatus(oHeader, "C");
                        }
                    }.bind(this)
                }
            );
        },

        onCancelForecast: function () {
            var oHeader = this.getModel("detail").getProperty("/header");
            var sMessage;

            if (!oHeader || oHeader.Status === "X") {
                MessageBox.warning(
                    "취소할 수 있는 판매예측 문서가 아닙니다."
                );
                return;
            }

            if (oHeader.Status === "C") {
                sMessage =
                    "현재 확정된 판매예측 문서입니다.\n\n" +
                    "취소하면 해당 연도와 판매유형의 확정 기준이 해제됩니다. " +
                    "취소하시겠습니까?";
            } else {
                sMessage =
                    "저장된 판매예측 문서 " +
                    oHeader.ForcastCd +
                    "를 취소하시겠습니까?";
            }

            MessageBox.confirm(
                sMessage,
                {
                    title: "판매예측 취소",
                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._updateForecastStatus(oHeader, "X");
                        }
                    }.bind(this)
                }
            );
        },

        _updateForecastStatus: function (oHeader, sTargetStatus) {
            var oDetailModel = this.getModel("detail");
            var oODataModel = this.getOwnerComponent().getModel();

            var sEntityPath = "/" + oODataModel.createKey(
                "PlanHeaderSet",
                {
                    ForcastCd: oHeader.ForcastCd,
                    ForcastYear: oHeader.ForcastYear
                }
            );

            var oPayload = {
                ForcastCd: oHeader.ForcastCd,
                ForcastYear: oHeader.ForcastYear,
                Status: sTargetStatus
            };

            oDetailModel.setProperty("/busy", true);

            oODataModel.update(sEntityPath, oPayload, {
                merge: true,

                success: function () {
                    MessageToast.show(
                        sTargetStatus === "C"
                            ? "판매예측 문서가 확정되었습니다."
                            : "판매예측 문서가 취소되었습니다."
                    );

                    this._loadDetail(
                        oHeader.ForcastCd,
                        oHeader.ForcastYear
                    );
                }.bind(this),

                error: function (oError) {
                    oDetailModel.setProperty("/busy", false);

                    MessageBox.error(
                        this.getODataErrorMessage(
                            oError,
                            sTargetStatus === "C"
                                ? "판매예측 확정 처리 중 오류가 발생했습니다."
                                : "판매예측 취소 처리 중 오류가 발생했습니다."
                        )
                    );
                }.bind(this)
            });
        },

        _updateForecastStatus: function (oHeader) {
            var oDetailModel = this.getModel("detail");
            var oODataModel = this.getOwnerComponent().getModel();

            var sEntityPath = "/" + oODataModel.createKey(
                "PlanHeaderSet",
                {
                    ForcastCd: oHeader.ForcastCd,
                    ForcastYear: oHeader.ForcastYear
                }
            );

            var oPayload = {
                ForcastCd: oHeader.ForcastCd,
                ForcastYear: oHeader.ForcastYear,
                Status: "C"
            };

            oDetailModel.setProperty("/busy", true);

            oODataModel.update(sEntityPath, oPayload, {
                merge: true,

                success: function () {
                    MessageToast.show("판매예측 문서가 확정되었습니다.");

                    this._loadDetail(
                        oHeader.ForcastCd,
                        oHeader.ForcastYear
                    );
                }.bind(this),

                error: function (oError) {
                    oDetailModel.setProperty("/busy", false);

                    MessageBox.error(
                        this.getODataErrorMessage(
                            oError,
                            "판매예측 확정 처리 중 오류가 발생했습니다."
                        )
                    );
                }.bind(this)
            });
        },

        _loadDetail: function (sForcastCd, sForcastYear) {
            var oDetailModel = this.getModel("detail");
            var oODataModel = this.getOwnerComponent().getModel();

            var sEntityPath = "/" + oODataModel.createKey(
                "PlanHeaderSet",
                {
                    ForcastCd: sForcastCd,
                    ForcastYear: sForcastYear
                }
            );

            this._resetDetailData();

            oDetailModel.setProperty("/busy", true);

            oODataModel.read(sEntityPath, {
                urlParameters: {
                    "$expand": "toItems"
                },

                success: function (oData) {
                    var vItemsNavigation =
                        oData.toItems ||
                        oData.ToItems ||
                        oData.TOITEMS ||
                        null;

                    var aItems = this._extractItems(vItemsNavigation);
                    var oAnalysis = this._buildAnalysis(aItems);

                    oDetailModel.setProperty("/header", oData);
                    oDetailModel.setProperty("/items", oAnalysis.items);
                    oDetailModel.setProperty(
                        "/monthlyChart",
                        oAnalysis.monthlyChart
                    );
                    oDetailModel.setProperty(
                        "/productChart",
                        oAnalysis.productChart
                    );
                    oDetailModel.setProperty(
                        "/summary",
                        oAnalysis.summary
                    );
                    oDetailModel.setProperty("/busy", false);
                }.bind(this),

                error: function (oError) {
                    oDetailModel.setProperty("/busy", false);

                    MessageBox.error(
                        this.getODataErrorMessage(
                            oError,
                            "판매예측 상세조회 중 오류가 발생했습니다."
                        ),
                        {
                            onClose: function () {
                                this.getRouter().navTo("main");
                            }.bind(this)
                        }
                    );
                }.bind(this)
            });
        },

        _resetDetailData: function () {
            var oDetailModel = this.getModel("detail");

            oDetailModel.setProperty("/header", {});
            oDetailModel.setProperty("/items", []);
            oDetailModel.setProperty("/monthlyChart", []);
            oDetailModel.setProperty("/productChart", []);
            oDetailModel.setProperty("/summary", {
                itemCount: 0,
                annualTotal: 0,
                monthlyAverage: 0,
                peakMonth: "-",
                peakMonthQty: 0,
                topMaterialCd: "-",
                topMaterialQty: 0
            });
        },

        _extractItems: function (vItemsNavigation) {
            if (!vItemsNavigation) {
                return [];
            }

            if (Array.isArray(vItemsNavigation)) {
                return vItemsNavigation;
            }

            if (
                vItemsNavigation.results &&
                Array.isArray(vItemsNavigation.results)
            ) {
                return vItemsNavigation.results;
            }

            return [];
        },

        _buildAnalysis: function (aRawItems) {
            var aMonthDefinition = [
                { property: "January", month: "1월" },
                { property: "Feburary", month: "2월" },
                { property: "March", month: "3월" },
                { property: "April", month: "4월" },
                { property: "May", month: "5월" },
                { property: "June", month: "6월" },
                { property: "July", month: "7월" },
                { property: "August", month: "8월" },
                { property: "September", month: "9월" },
                { property: "October", month: "10월" },
                { property: "November", month: "11월" },
                { property: "December", month: "12월" }
            ];

            var nAnnualTotal = 0;
            var aItems;
            var aMonthlyChart;
            var aProductChart;
            var oPeakMonth;
            var oTopProduct;

            aRawItems.forEach(function (oItem) {
                nAnnualTotal += Number(oItem.AnnualQty || 0);
            });

            aItems = aRawItems.map(function (oItem) {
                var nAnnualQty = Number(oItem.AnnualQty || 0);
                var nShare = nAnnualTotal > 0
                    ? (nAnnualQty / nAnnualTotal) * 100
                    : 0;

                return Object.assign({}, oItem, {
                    AnnualShare: Number(nShare.toFixed(1)),
                    AnnualShareText: nShare.toFixed(1) + "%"
                });
            });

            aMonthlyChart = aMonthDefinition.map(function (oMonth) {
                var nMonthlyQty = aItems.reduce(function (nTotal, oItem) {
                    return nTotal + Number(oItem[oMonth.property] || 0);
                }, 0);

                return {
                    Month: oMonth.month,
                    PlanQty: nMonthlyQty
                };
            });

            aProductChart = aItems
                .map(function (oItem) {
                    return {
                        MaterialCd: String(oItem.MaterialCd || ""),
                        AnnualQty: Number(oItem.AnnualQty || 0)
                    };
                })
                .sort(function (oFirst, oSecond) {
                    return oSecond.AnnualQty - oFirst.AnnualQty;
                })
                .slice(0, 5);

            oPeakMonth = aMonthlyChart.reduce(function (oCurrentMax, oMonth) {
                if (!oCurrentMax || oMonth.PlanQty > oCurrentMax.PlanQty) {
                    return oMonth;
                }

                return oCurrentMax;
            }, null);

            oTopProduct = aProductChart.length > 0
                ? aProductChart[0]
                : null;

            return {
                items: aItems,
                monthlyChart: aMonthlyChart,
                productChart: aProductChart,
                summary: {
                    itemCount: aItems.length,
                    annualTotal: nAnnualTotal,
                    monthlyAverage: nAnnualTotal / 12,
                    peakMonth: oPeakMonth ? oPeakMonth.Month : "-",
                    peakMonthQty: oPeakMonth ? oPeakMonth.PlanQty : 0,
                    topMaterialCd: oTopProduct
                        ? oTopProduct.MaterialCd
                        : "-",
                    topMaterialQty: oTopProduct
                        ? oTopProduct.AnnualQty
                        : 0
                }
            };
        }
    });
});