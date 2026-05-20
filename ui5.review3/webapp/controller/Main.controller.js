sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], (Controller, MessageBox) => {
    "use strict";

    return Controller.extend("code.t2.ui5.review3.controller.Main", {
        onInit() {
        },
        onTopTableItemPress(oEvent) {
            const oSelectedItem = oEvent.getSource();
            MessageBox.information("Item Pressed!!!");
        },
        onTopTableSelectionChange(oEvent) {
            const oSelectedItem = oEvent.getParameter("listItem");
            const oContext = oSelectedItem.getBindingContext();
            const id =  oContext.getProperty("Id");
            const name = oContext.getProperty("Name");
            MessageBox.information("Selection changed: " + id + " - " + name);
        }
    });
});