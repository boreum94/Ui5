sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast,
    BusyDialog
) {
    "use strict";

    return Controller.extend("node.t2.quotationmanagement.controller.Detail", {
        onInit: function () {
            var oViewModel = new JSONModel({
                header: {},
                items: []
            });

            this.getView().setModel(oViewModel, "view");

            this._oBusyDialog = new BusyDialog({
                title: "처리 중",
                text: "잠시만 기다려주세요."
            });

            this.getOwnerComponent()
                .getRouter()
                .getRoute("RouteDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sQuotCd = oEvent.getParameter("arguments").QuotCd;

            this._loadQuotation(sQuotCd);
        },

        _loadQuotation: function (sQuotCd) {
            var oModel = this.getView().getModel();
            var oViewModel = this.getView().getModel("view");

            var sPath = oModel.createKey("/QuotationHeaderSet", {
                QuotCd: sQuotCd
            });

            this._oBusyDialog.open();

            oModel.read(sPath, {
                success: function (oHeader) {
                    oViewModel.setProperty("/header", oHeader);

                    oModel.read(sPath + "/ToItems", {
                        success: function (oData) {
                            oViewModel.setProperty("/items", oData.results || []);
                            this._oBusyDialog.close();
                        }.bind(this),
                        error: function () {
                            this._oBusyDialog.close();
                            MessageBox.error("견적 Item 정보를 조회하는 중 오류가 발생했습니다.");
                        }.bind(this)
                    });
                }.bind(this),
                error: function () {
                    this._oBusyDialog.close();
                    MessageBox.error("견적 Header 정보를 조회하는 중 오류가 발생했습니다.");
                }.bind(this)
            });
        },

        onSendQuotation: function () {
            var oHeader = this.getView().getModel("view").getProperty("/header");

            if (!oHeader || !oHeader.QuotCd) {
                MessageBox.warning("송출할 견적 정보가 없습니다.");
                return;
            }

            MessageBox.confirm("선택한 견적서를 송출하시겠습니까?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }

                    this._sendQuotation(oHeader.QuotCd);
                }.bind(this)
            });
        },

        _sendQuotation: function (sQuotCd) {
            var oModel = this.getView().getModel();

            this._oBusyDialog.open();

            oModel.callFunction("/SendQuotation", {
                method: "POST",
                urlParameters: {
                    QuotCd: sQuotCd
                },
                success: function (oData) {
                    this._oBusyDialog.close();

                    var oResult = oData.SendQuotation || oData;
                    var sMessage = oResult.Message || "견적서가 정상적으로 송출되었습니다.";

                    MessageToast.show(sMessage);
                }.bind(this),
                error: function (oError) {
                    this._oBusyDialog.close();

                    var sMessage = "견적서 송출 중 오류가 발생했습니다.";

                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMessage = oResponse.error.message.value || sMessage;
                    } catch (e) {
                        // 기본 메시지 사용
                    }

                    MessageBox.error(sMessage);
                }.bind(this)
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        formatStatusText: function (sStatus) {
            switch (sStatus) {
                case "C":
                    return "작성완료";
                case "S":
                    return "송출완료";
                case "O":
                    return "오더전환";
                case "X":
                    return "취소";
                default:
                    return sStatus || "";
            }
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "C":
                    return "Success";
                case "S":
                    return "Information";
                case "O":
                    return "Warning";
                case "X":
                    return "Error";
                default:
                    return "None";
            }
        }
    });
});