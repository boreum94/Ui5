sap.ui.define([], function () {
    "use strict";

    var oLoadPromise = null;

    return {
        load: function () {
            if (window.ExcelJS && window.ExcelJS.Workbook) {
                return Promise.resolve(window.ExcelJS);
            }

            if (oLoadPromise) {
                return oLoadPromise;
            }

            oLoadPromise = new Promise(function (resolve, reject) {
                var oScript = document.createElement("script");

                oScript.src = sap.ui.require.toUrl(
                    "code/t2/forecast/thirdparty/exceljs.min.js"
                );
                oScript.async = true;

                oScript.onload = function () {
                    if (window.ExcelJS && window.ExcelJS.Workbook) {
                        resolve(window.ExcelJS);
                        return;
                    }

                    oLoadPromise = null;

                    reject(
                        new Error(
                            "ExcelJS 파일은 로드되었지만 ExcelJS 객체를 찾을 수 없습니다."
                        )
                    );
                };

                oScript.onerror = function () {
                    oLoadPromise = null;

                    reject(
                        new Error(
                            "webapp/thirdparty/exceljs.min.js 파일을 불러오지 못했습니다."
                        )
                    );
                };

                document.head.appendChild(oScript);
            });

            return oLoadPromise;
        }
    };
});