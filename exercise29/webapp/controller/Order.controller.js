sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.exercise29.controller.Order", {
        onInit() {
        },
        onItemPress(oEvent) {
            //alert(1);
            //console.log(oEvent);
            //console.log(oEvent.getSource());

            //Source는 이벤트가 어디서 일어나는 지에 따라서 달라진다. 
            let oItem = oEvent.getSource(); // ListItem 
            let oBindingContext = oItem.getBindingContext();
            let sOrderID = oBindingContext.getProperty("OrderID");

            //alert("주문ID" + sOrderID);

            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail",  {OrderID: sOrderID});
        }
    });
});