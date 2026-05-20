sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/base/strings/formatMessage",
  "sap/ui/model/json/JSONModel",
  "../model/formatter"
], (Controller,formatMessage,JSONModel,myFormatter) => {
  "use strict";

  return Controller.extend("code.d22.exam4.controller.Detail", {
      
      formatMessage: formatMessage,

      formatter: myFormatter,
    
      onInit() {

          var oComponent = this.getOwnerComponent();
          var oRouter = oComponent.getRouter();
          var oRoute = oRouter.getRoute("RouteDetail");

          oRoute.attachPatternMatched(this._onPatternMatched, this);

          var oModel = new JSONModel({
            Currency: "EUR",
            Unit: "EA"
          });

          var oView = this.getView();
          oView.setModel(oModel, "view");
      },

      _onPatternMatched(oEvent) {
        //browser에 적힌 URL이 Detail View를 호출하는 pattern일 경우
        //매번 이 함수가 자동으로 호출되도록 onInit에 설정해 주었다.

        var oArgs = oEvent.getParameter("arguments");
        var sOrderID = oArgs.OrderID;

        //모델 경로 /Orders(key)로 접근시 특정 주문데이터로 접근할 수 있다.
        var sPath = `/Orders(${sOrderID})`;

        //Detail View의 모델에 접근할 때 전달된 경로를 기준으로
        //데이터에 접근하도록 한다.
        var oView = this.getView();
        oView.bindElement({
            path: sPath,
            events: {
                dataRequested(){
                  oView.setBusy(true);
                },
                dataReceived(){
                  oView.setBusy(false);
                }
            },
            parameters: {expand: 'Customer,Employee'}
        });
      }
  });
});