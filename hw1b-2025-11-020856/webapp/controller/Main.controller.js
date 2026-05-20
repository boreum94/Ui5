sap.ui.define([
    "sap/ui/core/mvc/Controller",
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.hw1b.controller.Main", {
        onInit() {
        },
        // Fragment를 불러오기 위한 함수
        onOpenDialog() {
            
            //??= 연산자를 사용해서 pDialog가 null이거나 undefined면
            //Fragment를 load하고 그 경로를 name: 으로 지정
            this.pDialog ??= this.loadFragment({
                name: "code.d22.hw1b.view.myDialog"
            });

            //Dialog가 존재하면 oDialog callback함수를 실행시킨다
            //oDialog 함수는 open 함수를 실행한다. 
            this.pDialog.then((oDialog) => {
                oDialog.open();
            });
        },
        //Dialog의 아이디를 통해서 컨트롤러에 Dialog를 닫는 기능을 구현
        //let oDialog = this.byId("idDialog");
        //if (oDialog) {
            //oDialog.close();
        //}

        onCloseDialog() {
            this.byId("idDialog").close();
        }
        
    });
});