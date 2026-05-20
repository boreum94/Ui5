sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.flight.test.controller.Detail", {
        onInit() {
            // debugger;
            // RouteDetail로 페이지를 이동한다. 
            var oRouter = this.getOwnerComponent().getRouter();
            var oRoute = oRouter.getRoute("RouteDetail");

            // 페이지 이동시 (실행할 메서드, oRoute 즉 oRouter.getRoute("RouteDetail") )
            // 이라는 루트의 패턴이 일치할 때마다 웹주소에 
            // carrid/{CarrierId}에 일치하는 경로가 붙었다. 
            // _onPatternMatched가 자동으로 실행된다. 
            oRoute.attachPatternMatched( this._onPatternMatched, this  );
        },
        _onPatternMatched: function(oEvent) {
            // oEvent의 Parameters의 arguments의 값을 가져온다.->{CarrierId: 'AA'}
            var oArgs = oEvent.getParameter("arguments");
            // {CarrierId: 'AA'}에서 'AA'만 가져온다. 
            var sCarrierId = oArgs.CarrierId;
            // CarrierSet경로로 가서 
            // "+ sCarrierId +" 에서 +는 && 같은 것. 
            // 그래서 <" && AA && ">라는 문자열과 동일하다. 
            var sPath = "/CarrierSet('"+ sCarrierId +"')";
            // console.log(sPath);
            this.getView().bindElement(sPath);
            // debugger;
        },
        onNavPress: function(oEvent) {
            //이전화면으로 이동
            window.history.go(-1);
        }
    });
});