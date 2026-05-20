sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/strings/formatMessage"

] , (Controller, formatMessage) => {

    "use strict";

        return Controller.extend("code.d22.exercise29.controller.Detail", {

            formatMessage: formatMessage,

            onInit(){

                let oRouter = this.getOwnerComponent().getRouter();
                let oRoute = oRouter.getRoute("RouteDetail");

                //이 루트의 패턴이 일치할 때마다 
                //=>웹 주소에 detail/{OrderID}에 일치하는 경로가 붙었다. 
                //_onPatternMatched가 자동으로
                //실행되도록 한다. 
                oRoute.attachPatternMatched( this._onPatternMatched, this);
            },
            _onPatternMatched (oEvent) {    
                
                let oArgs = oEvent.getParameter("arguments");
                let sOrderID = oArgs.OrderID;
                //oArgs는 이미 getParameter로 OrderID를 갖고 있는거 아니였나

                //alert("주문번호 :" + sOrderID);

                // /Orders(주문ID)
                let sPath = "/Orders(" + sOrderID + ")";

                //Detail View에 현재 경로를 /Orders(주문ID)로 설정한다.
                //bidnElement에 의해 설정된 이후부터는 Detail View에서는
                //모델의 데이터를 접근할 때, / 없이 쓸 경우 /Order(주문ID)에서부터 데이터를
                //가져오는 것으로 취급된다.
                // 예) <Text text={CustomerID} /> => /Order(주문ID)/CustomerID를 쓴 것과 같다. 
                let oView = this.getView();
                oView.bindElement(sPath);

            } 
        } );
    
    }
    
);

