sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "code/d22/flight/test/model/formatter"
], (Controller, formatter) => {
    "use strict";

    return Controller.extend("code.d22.flight.test.controller.Main", {
        formatter: formatter,
        onInit() {
        },
        onSelectionChange: function(oEvent) {
            debugger;
            //Table에서 선택한 행의 정보를 가져오기 위해 listItem을 가져온다.
            var oListItem = oEvent.getParameter("listItem");
            // 이 listItem에 연결된 모델의 내용을 가져온다. 
            // getBindingContext(모델명)는 내가 선택한 행과 연결된 데이터를 가져온다. 
            //getBindingContext(); 를 사용할 때 ()안이 비어있는건 
            // 우리가 모델 명을 정하지 않았기 때문이고, 만약 모델명을 정해줬다면 ()안에 모델명이 꼭 들어가야 한다. 
            var oContext  = oListItem.getBindingContext();
            // 모델의 CarrierId라는 Property를 가져와서 
            var sCarrierId = oContext.getProperty("CarrierId");

            //Detail View로 화면 이동하기 위한 로직
            //현재는 전달하는 값이 단 하나도 없다.
            //나중에 클릭한 라인의 항공사ID를 전달할 예정 
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                CarrierId: sCarrierId //"AA"
            });
        
        }
    });
});