sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {
    "use strict";

    return Controller.extend("code.t2.forecast.controller.BaseController", {
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
            return this.getView().getModel(sName) ||
                this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        getAppStateModel: function () {
            return this.getOwnerComponent().getModel("appState");
        },

        resetPreviewState: function () {
            this.getAppStateModel().setProperty("/preview", {
                ready: false,
                data: null
            });
        },

        getODataErrorMessage: function (oError, sDefaultMessage) {
            var sResponseText;
            var oResponse;

            try {
                sResponseText =
                    oError.responseText ||
                    (oError.response && oError.response.body) ||
                    "";

                oResponse = JSON.parse(sResponseText);

                if (
                    oResponse &&
                    oResponse.error &&
                    oResponse.error.message &&
                    oResponse.error.message.value
                ) {
                    return oResponse.error.message.value;
                }
            } catch (oParseError) {
                return sDefaultMessage;
            }

            return sDefaultMessage;
        },

        formatForcastType: function (sType) {
            if (sType === "G") {
                return "일반판매";
            }

            if (sType === "R") {
                return "렌탈";
            }

            return "";
        },

        formatForcastTypeState: function (sType) {
            if (sType === "G") {
                return "Information";
            }

            if (sType === "R") {
                return "Success";
            }

            return "None";
        },

        formatStatus: function (sStatus) {
            if (sStatus === "D") {
                return "저장";
            }

            if (sStatus === "C") {
                return "확정";
            }

            if (sStatus === "X") {
                return "취소";
            }

            return sStatus || "";
        },

        formatStatusState: function (sStatus) {
            if (sStatus === "D") {
                return "Information";
            }

            if (sStatus === "C") {
                return "Success";
            }

            if (sStatus === "X") {
                return "Error";
            }

            return "None";
        },

        formatQuantity: function (vValue) {
            var nValue = Number(vValue || 0);

            return nValue.toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        },

        formatPercent: function (vValue) {
            var nValue = Number(vValue || 0);

            return nValue.toLocaleString("ko-KR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + "%";
        },

        formatKpiValue: function (vValue) {
            var nValue = Number(vValue || 0);

            if (Math.abs(nValue) >= 1000000) {
                return (nValue / 1000000).toFixed(1);
            }

            if (Math.abs(nValue) >= 1000) {
                return (nValue / 1000).toFixed(1);
            }

            return String(Math.round(nValue));
        },

        formatKpiScale: function (vValue) {
            var nValue = Number(vValue || 0);

            if (Math.abs(nValue) >= 1000000) {
                return "M";
            }

            if (Math.abs(nValue) >= 1000) {
                return "K";
            }

            return "";
        },

        formatDate: function (vValue) {
            var oDate;
            var aMatch;

            if (!vValue) {
                return "";
            }

            if (vValue instanceof Date) {
                oDate = vValue;
            } else if (typeof vValue === "string") {
                aMatch = /\/Date\((\d+)\)\//.exec(vValue);

                if (aMatch) {
                    oDate = new Date(Number(aMatch[1]));
                } else if (/^\d{8}$/.test(vValue)) {
                    return (
                        vValue.substring(0, 4) +
                        "." +
                        vValue.substring(4, 6) +
                        "." +
                        vValue.substring(6, 8)
                    );
                } else {
                    return vValue;
                }
            }

            if (!oDate || isNaN(oDate.getTime())) {
                return "";
            }

            return oDate.toLocaleDateString("ko-KR");
        }
    });
});