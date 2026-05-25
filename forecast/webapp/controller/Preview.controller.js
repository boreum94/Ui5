sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    BaseController,
    JSONModel,
    MessageToast,
    MessageBox
) {
    "use strict";

    return BaseController.extend("code.t2.forecast.controller.Preview", {
        onInit: function () {
            this.setModel(
                new JSONModel({
                    saving: false
                }),
                "previewPage"
            );

            this.getRouter()
                .getRoute("preview")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oPreviewState =
                this.getAppStateModel().getProperty("/preview");

            if (
                !oPreviewState ||
                !oPreviewState.ready ||
                !oPreviewState.data
            ) {
                MessageToast.show("먼저 Excel 파일을 검증하세요.");
                this.getRouter().navTo("upload", {}, true);
                return;
            }

            this.getModel("previewPage").setProperty("/saving", false);
        },

        onBack: function () {
            this.resetPreviewState();
            this.getRouter().navTo("upload");
        },

        onCancel: function () {
            MessageBox.confirm(
                "현재 미리보기를 취소하고 업로드 화면으로 돌아가시겠습니까?",
                {
                    title: "업로드 취소",
                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this.resetPreviewState();
                            this.getRouter().navTo("upload");
                        }
                    }.bind(this)
                }
            );
        },

        onSave: function () {
            var oParsedData =
                this.getAppStateModel().getProperty("/preview/data");

            if (!oParsedData || !oParsedData.isValid) {
                MessageBox.warning(
                    "검증 오류가 없는 경우에만 저장할 수 있습니다."
                );
                return;
            }

            MessageBox.confirm(
                oParsedData.header.ForcastYear +
                    "년 " +
                    oParsedData.header.ForcastTypeText +
                    " 판매예측 " +
                    oParsedData.items.length +
                    "건을 저장하시겠습니까?",
                {
                    title: "판매예측 저장 확인",
                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._saveDeepEntity(oParsedData.payload);
                        }
                    }.bind(this)
                }
            );
        },

        _saveDeepEntity: function (oPayload) {
            var oODataModel = this.getOwnerComponent().getModel();
            var oPageModel = this.getModel("previewPage");
            var oSavePayload = JSON.parse(JSON.stringify(oPayload));

            oPageModel.setProperty("/saving", true);

            oODataModel.create("/PlanHeaderSet", oSavePayload, {
                success: function (oCreatedData) {
                    var sForcastCd = String(
                        oCreatedData.ForcastCd || ""
                    ).trim();

                    oPageModel.setProperty("/saving", false);

                    if (!sForcastCd) {
                        MessageBox.success(
                            "판매예측 저장은 완료되었지만 생성된 판매예측 코드가 응답에 포함되지 않았습니다. 목록에서 저장 결과를 확인하세요.",
                            {
                                onClose: function () {
                                    this.resetPreviewState();
                                    this.getRouter().navTo("main");
                                }.bind(this)
                            }
                        );
                        return;
                    }

                    MessageToast.show("판매예측 저장이 완료되었습니다.");

                    this.resetPreviewState();

                    this.getRouter().navTo("detail", {
                        forcastCd: encodeURIComponent(sForcastCd),
                        forcastYear: encodeURIComponent(
                            String(oCreatedData.ForcastYear || oPayload.ForcastYear || "").trim()
                        )
                    }, true);
                }.bind(this),

                error: function (oError) {
                    oPageModel.setProperty("/saving", false);

                    MessageBox.error(
                        this.getODataErrorMessage(
                            oError,
                            "판매예측 저장 중 오류가 발생했습니다."
                        )
                    );
                }.bind(this)
            });
        }
    });
});