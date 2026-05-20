sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.exam3.controller.Main", {
        onInit() {
        },
        onOpenDialog(oEvent) {

            //getSouce를 통해서 oEvent가 담고있는 Item을 가져온다.
            //oEvent는 press라는 이벤트가 발생한 곳이 Item이기 때문에
            //사용자가 클릭한 행에 대한 정보가 들어있다. 
            let oItem = oEvent.getSource(); 

            let oContext = oItem.getBindingContext();

            let sEmployeeID = oContext.getProperty("EmployeeID");
            // sap.m.MessageBox.alert("내가 선택한 직원 아이디" + sEmployeeID);

            this.pDialog ??= this.loadFragment({
                name: "code.d22.exam3.view.Detail"
            });

            this.pDialog.then((oDialog) => {
                oDialog.setBindingContext(oContext);
                oDialog.open()
            });
        },
        onCloseDialog() {
            var oDialog = this.byId("idDialog");
            if (oDialog) {
                oDialog.close();
            }
        }
    });
});