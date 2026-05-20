sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/base/strings/formatMessage"
], (Controller,MessageToast,formatMessage) => {
    "use strict";

    return Controller.extend("code.d22.exercise32.controller.Main", {
        
        formatMessage: formatMessage,

        onInit() {
        },
        onTableSelectionChange(oEvent){
            let oItem = oEvent.getParameter("listItem");
            console.log("내가 선택한 리스트 아이템: " + oItem);

            //내가 선택한 리스트 아이템의 모델 정보
            let oBindingContext = oItem.getBindingContext();
            
            //그 모델 정보에서 컨택네임을 가져온다. 
            let sContactName = oBindingContext.getProperty("ContactName");

            //가져온 컨텍네임을 화면에 출력한다. 
            MessageToast.show( sContactName + "님을 선택했습니다.");

            //현재 화면에 내가 선택한 ListItem의 모델 정보를 현재 기준으로 설정한다.
            //이와 같이 설정하면, 해당 뷰에서 모델에 상대경로로 접근할 때
            //내가 선택한 ListItem의 모델 정보를 기준으로 접근하게 된다. 
            let oView = this.getView();
            oView.setBindingContext(oBindingContext);


            //webapp/view/CustomerInfo.fragment.xml파일을 읽도록 시킨다.
            this.pDialog ??= this.loadFragment({
                name: "code.d22.exercise32.view.CustomerInfo"
            });

            //파일을 읽으면, then() 안의 functoion을 실행한다.
            //function을 실행할 때 function()안에는
            //fragment에서 가져온 객체를 담을 parameter 변수명을 적는다.
            //fragment에는 <Dialog>만 있으므로, parameter에 전달되는 객체는
            //Dialog 객체가 전달되므로, parameter 변수명은 oDialog로 명명한다.
            this.pDialog.then(function(oDialog){
                oDialog.open();
            });
        },
        //열려있는 dialog를 찾아서 닫는 기능
        onCloseDialog() {
            let oDialog = this.byId("idCustomerInfoDialog");
            if (oDialog){
                oDialog.close();
            }
        }
    });
});