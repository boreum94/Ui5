sap.ui.define([], function () {
    "use strict";

    var pExcelJSLoadPromise = null;

    function restoreDefine(fnDefine, vOriginalAmd, bHadAmd) {
        try {
            if (typeof fnDefine === "function") {
                if (bHadAmd) {
                    fnDefine.amd = vOriginalAmd;
                } else {
                    delete fnDefine.amd;
                }

                window.define = fnDefine;
            }
        } catch (oError) {
            window.define = fnDefine;
        }
    }

    return {
        load: function () {
            if (window.ExcelJS && window.ExcelJS.Workbook) {
                return Promise.resolve(window.ExcelJS);
            }

            if (pExcelJSLoadPromise) {
                return pExcelJSLoadPromise;
            }

            pExcelJSLoadPromise = new Promise(function (resolve, reject) {
                var sScriptId = "forecastExcelJsScript";
                var sScriptUrl = sap.ui.require.toUrl(
                    "code/t2/forecast/thirdparty/exceljs.min.js"
                );

                var oExistingScript = document.getElementById(sScriptId);

                if (oExistingScript) {
                    oExistingScript.parentNode.removeChild(oExistingScript);
                }

                var oScript = document.createElement("script");
                var fnOriginalDefine = window.define;
                var vOriginalAmd;
                var bHadAmd = false;

                if (
                    typeof window.define === "function" &&
                    window.define.amd
                ) {
                    bHadAmd = true;
                    vOriginalAmd = window.define.amd;

                    /*
                     * ExcelJS UMD 번들이 FLP에서 AMD define을 감지하면
                     * window.ExcelJS에 등록되지 않으므로 로딩 순간에만 amd 플래그를 숨긴다.
                     */
                    try {
                        window.define.amd = undefined;
                    } catch (oError) {
                        window.define = undefined;
                    }
                }

                oScript.id = sScriptId;
                oScript.src = sScriptUrl;
                oScript.async = true;

                oScript.onload = function () {
                    restoreDefine(fnOriginalDefine, vOriginalAmd, bHadAmd);

                    if (window.ExcelJS && window.ExcelJS.Workbook) {
                        resolve(window.ExcelJS);
                        return;
                    }

                    pExcelJSLoadPromise = null;

                    reject(
                        new Error(
                            "ExcelJS 파일은 로드되었지만 ExcelJS 객체를 찾을 수 없습니다. URL: " +
                            sScriptUrl
                        )
                    );
                };

                oScript.onerror = function () {
                    restoreDefine(fnOriginalDefine, vOriginalAmd, bHadAmd);

                    pExcelJSLoadPromise = null;

                    reject(
                        new Error(
                            "ExcelJS 파일 로드에 실패했습니다. URL: " +
                            sScriptUrl
                        )
                    );
                };

                document.head.appendChild(oScript);
            });

            return pExcelJSLoadPromise;
        }
    };
});