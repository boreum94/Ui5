sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.exam4.controller.Main", {
        onInit() {
        },
        onRowSelectionChange(oEvent) {
            // alert("a")

            //내가 선택한 행의 모델정보
            var oRowContext = oEvent.getParameter("rowContext");

            var sOrderID = oRowContext.getProperty("OrderID");

            // sap.m.MessageBox.alert("내가 선택한 행의 주문ID: " + sOrderID);

            //Router를 가져오기 위해 먼저 component를 가져온다.
            let oComponent = this.getOwnerComponent();
            var oRouter = oComponent.getRouter();

            //첫 번째 인자값(Parameter): Route의 이름
            //두 번째 인자값(Parameter): pattern에 전달될 값 
            //Detail.view.xml을 불러오기 위해서 만든 Route의 이름은 
            //RouteDetail, pattern은 "detail/{OrderID}"로 정의를 했기 
            //때문에 OrderID를 위한 필수 Parameter를 전달.
            oRouter.navTo("RouteDetail",{OrderID: sOrderID});
        }
    });
});