sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.hw1c.controller.Main", {
        onInit() {
        },
        onCustomerChange(oEvent) {
            
            //oListItem에 getParameter로 가져온 사용자가 클릭한 행의 정보를 
            //담는다.
            var oListItem = oEvent.getParameter("listItem");

            //oBindingCotext에는 listItem(행)의 데이터 위치 정보를 담는다.
            var oBindingContext = oListItem.getBindingContext();

            //oPurchaseTable에는 컨트롤러와 연결된 뷰의
            //purchaseList라는 id를 가지고 있는 테이블에 가서 정보를 가져온다.
            var oPurchaseTable = this.byId("purchaseList");

            //oPurchaseTable과 oBindingContext를 이어준다. 
            oPurchaseTable.setBindingContext(oBindingContext);
            
            

        }
    });
});