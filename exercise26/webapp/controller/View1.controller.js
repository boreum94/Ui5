sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.exercise26.controller.View1", {
        onInit() {
        },
        onNavView2() {
            //라우팅 기능을 사용하기 위해 = 페이지 이동을 하기 위해
            //라우터를 가져와야 한다. 
            let oRouter = this.getOwnerComponent().getRouter();

            //manifest에서 router의 name을 확인한다. 
            oRouter.navTo("RouteView2");
        }
    });
});