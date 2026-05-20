sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
    "use strict";

    return Controller.extend("code.d22.create.carrier.controller.Main", {
        onInit() {
            var oData = {
                data: {
                    Carrid: "",
                Carrname: "",
                Currcode: "",
                Url: ""
                }
            }
            var oNewModel = new JSONModel(oData);
            this.getView().setModel(oNewModel, "new");
        },
        onSave() {
            var oView = this.getView();
            var oNewModel = oView.getModel("new");
            var oData = oNewModel.getData();
            console.log(oData);

            var oModel = oView.getModel();
            oModel.create(
                "/CarrierSet",
                oData.data,
                {
                    success(oEvent){
                        MessageToast.show("생성 성공");

                    },
                    error(oEvent){
                        MessageToast.show("생성 실패");
                    }
                }
            )
        },
        onClear(){
            var oView = this.getView();
            var oNewModel = oView.getModel("new");
            oNewModel.setProperty("/data", {});
        }
    });
});