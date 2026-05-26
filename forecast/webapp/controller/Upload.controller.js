sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../util/ExcelJSLoader",
    "../util/ForecastExcelTemplate",
    "../util/ForecastExcelParser"
], function (
    BaseController,
    JSONModel,
    MessageToast,
    MessageBox,
    ExcelJSLoader,
    ForecastExcelTemplate,
    ForecastExcelParser
) {
    "use strict";

    return BaseController.extend("code.t2.forecast.controller.Upload", {
        onInit: function () {
            this._oSelectedFile = null;

            this.setModel(
                new JSONModel({
                    busy: false,
                    statusText:
                        "전체 Excel 양식을 다운로드한 후 HEADER와 ITEMS 시트를 작성하세요.",
                    statusType: "Information",
                    templateCreated: false,
                    templateSummary: [],
                    fileSelected: false,
                    selectedFileName: "",
                    selectedFileSize: ""
                }),
                "upload"
            );

            this.getRouter()
                .getRoute("upload")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._resetUploadPage();
            this.resetPreviewState();
        },

        onBack: function () {
            this.getRouter().navTo("main");
        },

        onDownloadTemplate: function () {
            var oUploadModel = this.getModel("upload");

            oUploadModel.setProperty("/busy", true);
            oUploadModel.setProperty(
                "/statusText",
                "최신 자재목록을 조회하고 Excel 양식을 생성하는 중입니다."
            );
            oUploadModel.setProperty("/statusType", "Information");

            Promise.all([
                ExcelJSLoader.load(),
                this._readMaterialHelpSet()
            ])
                .then(function (aResult) {
                    var ExcelJS = aResult[0];
                    var aMaterials = aResult[1];

                    if (aMaterials.length === 0) {
                        throw new Error(
                            "Excel 양식에 포함할 판매예측 대상 완제품이 없습니다."
                        );
                    }

                    return ForecastExcelTemplate.download({
                        ExcelJS: ExcelJS,
                        materials: aMaterials
                    });
                })
                .then(function (oResult) {
                    oUploadModel.setProperty("/templateCreated", true);

                    oUploadModel.setProperty("/templateSummary", [
                        {
                            category: "전체 대상",
                            description: "일반판매 또는 렌탈 대상 MTS 완제품",
                            count: oResult.totalCount
                        },
                        {
                            category: "일반판매",
                            description: "SALE_YN = X",
                            count: oResult.generalCount
                        },
                        {
                            category: "렌탈",
                            description: "RENT_YN = X",
                            count: oResult.rentalCount
                        }
                    ]);

                    oUploadModel.setProperty(
                        "/statusText",
                        "양식을 다운로드했습니다. Excel에서 작성한 후 아래에서 파일을 선택하세요."
                    );
                    oUploadModel.setProperty("/statusType", "Success");

                    MessageToast.show(
                        oResult.fileName + " 다운로드가 완료되었습니다."
                    );
                })
                .catch(function (oError) {
                    this._showUploadError(
                        oError.message ||
                        "Excel 양식 생성 중 오류가 발생했습니다."
                    );
                }.bind(this))
                .then(function () {
                    oUploadModel.setProperty("/busy", false);
                });
        },

        onFileSelected: function (oEvent) {
            var aFiles = oEvent.getParameter("files") || [];
            var oFile = aFiles[0];
            var oUploadModel = this.getModel("upload");

            if (!oFile) {
                this._clearFileOnly();
                return;
            }

            if (!/\.xlsx$/i.test(oFile.name)) {
                this.byId("fileUploader").clear();
                this._clearFileOnly();

                MessageBox.warning(
                    "Excel 통합 문서 형식(.xlsx)의 파일만 선택할 수 있습니다."
                );
                return;
            }

            this._oSelectedFile = oFile;

            oUploadModel.setProperty("/fileSelected", true);
            oUploadModel.setProperty("/selectedFileName", oFile.name);
            oUploadModel.setProperty(
                "/selectedFileSize",
                this._formatFileSize(oFile.size)
            );
            oUploadModel.setProperty(
                "/statusText",
                "작성 완료 파일을 선택했습니다. 검증 및 미리보기 버튼을 누르세요."
            );
            oUploadModel.setProperty("/statusType", "Information");
        },

        onValidateAndPreview: function () {
            var oUploadModel = this.getModel("upload");

            if (!this._oSelectedFile) {
                MessageBox.warning("먼저 작성 완료 Excel 파일을 선택하세요.");
                return;
            }

            oUploadModel.setProperty("/busy", true);
            oUploadModel.setProperty(
                "/statusText",
                "Excel 파일을 읽고 최신 자재마스터 기준으로 검증하는 중입니다."
            );
            oUploadModel.setProperty("/statusType", "Information");

            Promise.all([
                ExcelJSLoader.load(),
                this._readMaterialHelpSet(),
                this._readFileAsArrayBuffer(this._oSelectedFile)
            ])
                .then(function (aResult) {
                    return ForecastExcelParser.parse({
                        ExcelJS: aResult[0],
                        materials: aResult[1],
                        arrayBuffer: aResult[2],
                        fileName: this._oSelectedFile.name
                    });
                }.bind(this))
                .then(function (oParsedData) {
                    this.getAppStateModel().setProperty("/preview", {
                        ready: true,
                        data: oParsedData
                    });

                    this.getRouter().navTo("preview");
                }.bind(this))
                .catch(function (oError) {
                    this._showUploadError(
                        oError.message ||
                        "Excel 파일 검증 중 오류가 발생했습니다."
                    );
                }.bind(this))
                .then(function () {
                    oUploadModel.setProperty("/busy", false);
                });
        },

        onClearFile: function () {
            var oUploader = this.byId("fileUploader");

            if (oUploader) {
                oUploader.clear();
            }

            this._clearFileOnly();

            MessageToast.show("선택한 파일을 초기화했습니다.");
        },

        _resetUploadPage: function () {
            var oUploadModel = this.getModel("upload");
            var oUploader = this.byId("fileUploader");

            this._oSelectedFile = null;

            if (oUploader) {
                oUploader.clear();
            }

            oUploadModel.setData({
                busy: false,
                statusText:
                    "전체 Excel 양식을 다운로드한 후 HEADER와 ITEMS 시트를 작성하세요.",
                statusType: "Information",
                templateCreated: false,
                templateSummary: [],
                fileSelected: false,
                selectedFileName: "",
                selectedFileSize: ""
            });
        },

        _clearFileOnly: function () {
            var oUploadModel = this.getModel("upload");

            this._oSelectedFile = null;

            oUploadModel.setProperty("/fileSelected", false);
            oUploadModel.setProperty("/selectedFileName", "");
            oUploadModel.setProperty("/selectedFileSize", "");
        },

        _readFileAsArrayBuffer: function (oFile) {
            return new Promise(function (resolve, reject) {
                var oReader = new FileReader();

                oReader.onload = function (oEvent) {
                    resolve(oEvent.target.result);
                };

                oReader.onerror = function () {
                    reject(
                        new Error(
                            "선택한 Excel 파일을 브라우저에서 읽을 수 없습니다."
                        )
                    );
                };

                oReader.readAsArrayBuffer(oFile);
            });
        },

        _readMaterialHelpSet: function () {
            var oODataModel = this.getOwnerComponent().getModel();

            return new Promise(function (resolve, reject) {
                oODataModel.read("/MaterialHelpSet", {
                    success: function (oData) {
                        resolve(
                            this._normalizeMaterials(oData.results || [])
                        );
                    }.bind(this),

                    error: function (oError) {
                        reject(
                            new Error(
                                this.getODataErrorMessage(
                                    oError,
                                    "판매예측 대상 자재 조회에 실패했습니다."
                                )
                            )
                        );
                    }.bind(this)
                });
            }.bind(this));
        },

        _normalizeMaterials: function (aResults) {
            var mMaterialKeys = {};

            return aResults
                .filter(function (oMaterial) {
                    var sMaterialCd = String(
                        oMaterial.MaterialCd || ""
                    ).trim();

                    var bValid =
                        sMaterialCd !== "" &&
                        String(oMaterial.MaterialType || "").trim() === "FERT" &&
                        String(oMaterial.StrategyType || "").trim() === "S" &&
                        String(oMaterial.UseYn || "").trim() === "X" &&
                        (
                            String(oMaterial.RentYn || "").trim() === "X" ||
                            String(oMaterial.SaleYn || "").trim() === "X"
                        );

                    if (!bValid || mMaterialKeys[sMaterialCd]) {
                        return false;
                    }

                    mMaterialKeys[sMaterialCd] = true;
                    return true;
                })
                .map(function (oMaterial) {
                    return {
                        MaterialCd: String(oMaterial.MaterialCd || "").trim(),
                        MaterialNm: String(oMaterial.MaterialNm || "").trim(),
                        MaterialType: String(oMaterial.MaterialType || "").trim(),
                        StrategyType: String(oMaterial.StrategyType || "").trim(),
                        Unit: String(oMaterial.Unit || "").trim(),
                        RentYn: String(oMaterial.RentYn || "").trim(),
                        SaleYn: String(oMaterial.SaleYn || "").trim(),
                        UseYn: String(oMaterial.UseYn || "").trim()
                    };
                })
                .sort(function (oFirst, oSecond) {
                    return oFirst.MaterialCd.localeCompare(
                        oSecond.MaterialCd
                    );
                });
        },

        _formatFileSize: function (iSize) {
            if (!iSize || iSize <= 0) {
                return "0 KB";
            }

            if (iSize < 1024 * 1024) {
                return (iSize / 1024).toFixed(1) + " KB";
            }

            return (iSize / (1024 * 1024)).toFixed(1) + " MB";
        },

        _showUploadError: function (sMessage) {
            var oUploadModel = this.getModel("upload");

            oUploadModel.setProperty("/statusText", sMessage);
            oUploadModel.setProperty("/statusType", "Error");

            MessageBox.error(sMessage);
        }
    });
});