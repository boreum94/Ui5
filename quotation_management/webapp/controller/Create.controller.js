sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast
) {
    "use strict";

    return Controller.extend("node.t2.quotationmanagement.controller.Create", {
        onInit: function () {
            var oCreateModel = new JSONModel(this._getInitialData());
            this.getView().setModel(oCreateModel, "create");
        },

        _getInitialData: function () {
            var sToday = this._getToday();

            return {
                header: {
                    QuotDocTyIndex: 0,
                    SoldTo: "",
                    DocDate: sToday,
                    ReqDueDate: sToday,
                    PaymentCd: "CA30",
                    OrderReason: ""
                },
                items: [
                    {
                        ItemCd: "010",
                        MaterialCd: "",
                        RefConfigCd: "",
                        CurrentGrade: "N",
                        ReqQty: "1",
                        Unit: "EA",
                        TargetMargin: "0.00"
                    }
                ]
            };
        },

        _getToday: function () {
            var oDate = new Date();
            var sYear = oDate.getFullYear();
            var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
            var sDay = String(oDate.getDate()).padStart(2, "0");

            return sYear + "-" + sMonth + "-" + sDay;
        },

        onAddItem: function () {
            var oModel = this.getView().getModel("create");
            var aItems = oModel.getProperty("/items") || [];
            var iNextNo = (aItems.length + 1) * 10;

            aItems.push({
                ItemCd: String(iNextNo).padStart(3, "0"),
                MaterialCd: "",
                RefConfigCd: "",
                CurrentGrade: "N",
                ReqQty: "1",
                Unit: "EA",
                TargetMargin: "0.00"
            });

            oModel.setProperty("/items", aItems);
        },

        onDeleteItem: function (oEvent) {
            var oModel = this.getView().getModel("create");
            var aItems = oModel.getProperty("/items") || [];
            var oContext = oEvent.getSource().getBindingContext("create");
            var sPath = oContext.getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);

            aItems.splice(iIndex, 1);

            oModel.setProperty("/items", aItems);
        },

        onReset: function () {
            MessageBox.confirm("입력 중인 견적 정보를 초기화하시겠습니까?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this.getView().getModel("create").setData(this._getInitialData());
                    }
                }.bind(this)
            });
        },

        onCreateQuotation: function () {
            MessageToast.show("Deep Insert 저장 기능은 다음 단계에서 구현합니다.");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        }
    });
});