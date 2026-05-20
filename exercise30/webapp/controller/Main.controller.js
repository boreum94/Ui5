sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
], (Controller,JSONModel, myFormatter) => {
    "use strict";

    return Controller.extend("code.d22.exercise30.controller.Main", {

        formatter: myFormatter,

        onInit() {
                let oModel = new JSONModel();
                oModel.setProperty("/Currency", "EUR");
                oModel.setProperty("/Unit", "EA");

                let oView = this.getView();
                oView.setModel(oModel, "view")
        },
        onRowSelectionChange(oEvent) {
            //Element Binding을 할 때
            //1. Model의 Context 정보를 사용할 수 있을 때 선택
            //할 수 있는 방법

            //debugger
            //선택한 행에 대한 모델 정보를 가져온다.
            //let oRowContext = oEvent.getParameter("rowContext");

            //View에 선택한 행으 ㅣ모델 정보를 현재 기준으로 설정한다. 
            //그래서 상대경로로도 내가 설정했던 {OrderID}나 {CustomerID}를
            //가져올 수 있다. 
            //let oView = this.getView();
            //oView.setBindingContext(oRowContext);

            //2. 모델의 경로를 알고 있을 때 선택할 수 있는 방법
            // 주문을 선택할 때 경로: /Orders(주문ID)
            let oRowContext = oEvent.getParameter("rowContext");

            //선택한 행의 주문ID 를 가져온다.
            let sOrderID = oRowContext.getProperty("OrderID");
            //let sPath = `/Orders(${sOrderID})`;
            let sPath = "/Orders(" + sOrderID + ")";

            let oView = this.getView();
            oView.bindElement({path: sPath, //현재 경로에서 직원에 대한 정보를 추가로 더 가져오도록 한다. 
                                parameters: {
                                    expand: 'Employee'
                                }
            });

        }
    });
});