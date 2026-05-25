sap.ui.define([], function () {
    "use strict";

    function toNumber(vValue) {
        var nValue = Number(String(vValue || "0").replace(/,/g, ""));
        return Number.isFinite(nValue) ? nValue : 0;
    }

    return {
        number: function (vValue) {
            return toNumber(vValue).toLocaleString("ko-KR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            });
        },

        integer: function (vValue) {
            return toNumber(vValue).toLocaleString("ko-KR", {
                maximumFractionDigits: 0
            });
        },

        compactNumber: function (vValue) {
            var nValue = toNumber(vValue);

            if (Math.abs(nValue) >= 1000000) {
                return (nValue / 1000000).toLocaleString("ko-KR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }) + " M";
            }

            if (Math.abs(nValue) >= 1000) {
                return (nValue / 1000).toLocaleString("ko-KR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }) + " K";
            }

            return nValue.toLocaleString("ko-KR", {
                maximumFractionDigits: 0
            });
        },

        rate: function (vValue) {
            return toNumber(vValue).toLocaleString("ko-KR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + "%";
        },

        forcastTypeText: function (sType) {
            switch (sType) {
                case "R":
                    return "렌탈";
                case "G":
                    return "일반판매";
                default:
                    return "-";
            }
        },

        forcastTypeState: function (sType) {
            switch (sType) {
                case "R":
                    return "Information";
                case "G":
                    return "Success";
                default:
                    return "None";
            }
        },

        statusText: function (sStatus) {
            switch (sStatus) {
                case "D":
                    return "임시저장";
                case "C":
                    return "확정";
                case "X":
                    return "취소";
                default:
                    return sStatus || "-";
            }
        },

        statusState: function (sStatus) {
            switch (sStatus) {
                case "D":
                    return "Warning";
                case "C":
                    return "Success";
                case "X":
                    return "Error";
                default:
                    return "None";
            }
        },

        date: function (vDate) {
            var sDate;

            if (!vDate) {
                return "-";
            }

            if (vDate instanceof Date) {
                return vDate.toLocaleDateString("ko-KR");
            }

            sDate = String(vDate);

            if (sDate.indexOf("/Date(") === 0) {
                return new Date(Number(sDate.replace(/\D/g, ""))).toLocaleDateString("ko-KR");
            }

            if (/^\d{8}$/.test(sDate)) {
                return sDate.substring(0, 4) + "." +
                    sDate.substring(4, 6) + "." +
                    sDate.substring(6, 8);
            }

            return sDate;
        }
    };
});