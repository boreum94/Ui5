sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.exam1.controller.Main", {
        onInit() {
            //Input값을 ID로 가져오면 0과 같은 틀린 값도 가져오기 때문에
            //제이슨 모델로 가져와야함
            var oModel = new JSONModel({
                Input: {
                    number1: 0,
                    number2: 1
                },
                //초기값 줘야함
                Output: {
                    Plus: 0
                }
            });
            var oView = this.getView();
            //setModel로 이미 모델을 줬기 때문에 이 뒤에 모델에 값을
            //넣어주는건 순서에 맞지 않음
            oView.setModel(oModel);

            // let oModel = {
            //     Input: {
            //         number1: 0,
            //         number2: 1
            //     }
            // };

        },
        onButtonPlus() {
            let oView = this.getView();

            let oModel = oView.getModel();

            // let oInput = oData.getProperty("/Input");
            let num1 = oModel.getProperty("/Input/number1");
            let num2 = oModel.getProperty("/Input/number2");

            var result = num1 + num2;

            oModel.setProperty("/Output/Plus", result);

            // if (oInput.number22) {
            //     total = oInput1 + oInput2;
            // }
            
            // let 
            
            
            
        },
        onButtonMinus(){
            
        },
        onButtonMultiple() {

        },
        onButtonDivision(){
            //나눗셈은 0으로 나눌 수 없게 하는게 뽀인트
            var oView = this.getView();
            var oModel = oView.getModel();
            var num1 = oModel.getProperty("/Input/number1");
            var num2 = oModel.getProperty("/Input/number2");


            if(num2 !==0) {
                var result = num1/num2;
            } else {
                sap.m.MessageBox.error("0으로 나눌 수 없습니다.");
            }

            oModel.setProperty("/Output/Division", result);
        }
    });
});