sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
    
], (Controller,MessageToast,JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.hw1a.controller.Main", {
        onInit() {
            
                        
            //비어있는 제이슨 모델 객체를 만들었다. 
            var oModel = new JSONModel();
            
            //뷰에서 객체를 가져와 oView에 담는다.
            var oView = this.getView(); 
            
            //만든 제이슨 모델을 뷰에 item이라는 이름으로 연결시킨다.
            oView.setModel(oModel,'Item');
            
        },
        onShowContext() {
            
            //뷰에서 id가 myInput인 컨트롤을 가져온다. 
            var oData = this.byId("myInput"); 

            //myInput에 입력된 값을 가져와서 sValue에 넣는다. 
            //사용자가 '감자'를 입력했다면 sValue에는 '감자'가 저장됨
            var sValue = oData.getValue(); 

            //가져온 입력값을 messageToast로 띄운다.
            sap.m.MessageToast.show(sValue)
             

        },
        onShowMessage() {

            //oModel에 뷰의 Item모델을 가져와서 담는다.
            //get View()는 뷰의 객체를 가져오는 것이고, getModel("Item")은
            //뷰를 통해서 내가 만든 Item이라는 모델을 뷰에서 가져오는 것이다. 
            
            //let oView=this.getView();
            //oModel= oView.getModel();
            var oModel = this.getView().getModel("Item");

            
            //sValue를 선언하고 oModel의 경로를 통해 값을 가져와서 
            // (getProperty함수) 저장한다.
            var sValue = oModel.getProperty("/items");
            
            //MessageToast를 통해 sValue를 화면에 띄운다. 
            MessageToast.show(sValue);
            
       
        }

    });
});