sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"

], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.exercise13.controller.Overview", {
        onInit() {
            //json model 생성, ()안이 비었기 때문에 비어있는 모델로 만들어진다. 
            var oModel = new JSONModel(
                {
                    Name: "신사임당"
                }
            );

            //컨트롤러와 연결된 뷰 객체를 가져온다.
            var oView = this.getView();

            //가져온 뷰 객체에 방금 만든 비어있는 Model을 "customer"라는 이름으로 설정한다.=연결한다. 
            oView.setModel(oModel, "customer");

        },
        onOpenDialog() {
            this.pDialog ??= this.loadFragment({
                name: "code.d22.exercise13.view.Dialog"
            });

            this.pDialog.then(function(oDialog) {
                oDialog.open();
            });
        }
        
    });
});

