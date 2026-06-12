sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend("node.t2.quotationmanagement.controller.Main", {
        onInit: function () {
        },

        onSearch: function () {
            var aFilters = [];

            var sDocDateFrom = this.byId("dpDocDateFrom").getValue();
            var sDocDateTo = this.byId("dpDocDateTo").getValue();
            var sQuotDocTy = this.byId("selQuotDocTy").getSelectedKey();
            var sSoldTo = this.byId("sfSoldTo").getValue();
            var sQuotStatus = this.byId("selQuotStatus").getSelectedKey();

            if (sDocDateFrom && sDocDateTo) {
                aFilters.push(new Filter("DocDate", FilterOperator.BT, new Date(sDocDateFrom), new Date(sDocDateTo)));
            } else if (sDocDateFrom) {
                aFilters.push(new Filter("DocDate", FilterOperator.GE, new Date(sDocDateFrom)));
            } else if (sDocDateTo) {
                aFilters.push(new Filter("DocDate", FilterOperator.LE, new Date(sDocDateTo)));
            }

            if (sQuotDocTy) {
                aFilters.push(new Filter("QuotDocTy", FilterOperator.EQ, sQuotDocTy));
            }

            if (sSoldTo) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("SoldTo", FilterOperator.Contains, sSoldTo),
                        new Filter("CustomerNm", FilterOperator.Contains, sSoldTo)
                    ],
                    and: false
                }));
            }

            if (sQuotStatus) {
                aFilters.push(new Filter("QuotStatus", FilterOperator.EQ, sQuotStatus));
            }

            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onClearFilter: function () {
            this.byId("dpDocDateFrom").setValue("");
            this.byId("dpDocDateTo").setValue("");
            this.byId("selQuotDocTy").setSelectedKey("");
            this.byId("sfSoldTo").setValue("");
            this.byId("selQuotStatus").setSelectedKey("");

            var oBinding = this.byId("quotationTable").getBinding("items");

            if (oBinding) {
                oBinding.filter([]);
            }
        },

        onNavDetail: function (oEvent) {
            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext();

            if (!oContext) {
                oContext = oSource.getParent().getBindingContext();
            }

            if (!oContext) {
                return;
            }

            var sQuotCd = oContext.getProperty("QuotCd");

            this.getOwnerComponent().getRouter().navTo("RouteDetail", {
                QuotCd: sQuotCd
            });
        },

        onNavCreate: function () {
            this.getOwnerComponent().getRouter().navTo("RouteCreate");
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