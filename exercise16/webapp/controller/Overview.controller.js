sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.exercise16.controller.Overview", {
        onInit() {
            //제이슨 모델 객체를 생성해서 oModel에 보관
            var oModel = new JSONModel({
                Date: "2025-10-30",
                Currency: {
                    Key: "KRW",
                    Value: 0
                }
            });

            //현재 화면 객체를 가져와서 oView에 보관
            var oView = this.getView();

            //"view" 라는 이르믕로 제이슨 모델을 설정
            oView.setModel(oModel, "view");
        }
        

    });
});