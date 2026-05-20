sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller,JSONModel,Filter,FilterOperator) => {
    "use strict";

    return Controller.extend("code.d22.exercise31.controller.Main", {
        onInit() {
                //oData는 Members라는 이름으로 배열 데이터를 가지고있다. 
                var oData = {
                    Members: [
                        {
                            name: "홍길동",
                            gender: "남",
                            genderCode: "M"
                        },
                        {
                            name: "아이유",
                            gender: "여",
                            genderCode: "F"
                        },
                        {
                            name: "신사임당",
                            gender: "여",
                            genderCode: "F"
                        }
                    ]
                }
                //JSON 모델을 생성할때 오데이터가 가진 데이터를 
                //경로 /Members로 배열 3줄이 모델에 기록하도록 한다.
                var oModel = new JSONModel(oData); 

                //이 컨트롤러와 연결된 뷰에 모델을 기록한다.
                var oView = this.getView();
                oView.setModel(oModel, "view");
        },
        onComboBoxSelectionChange(oEvent) {
            //debugger;

            //var oItem = oEvent.getParameter('selectedItem');
            let oItem = oEvent.getParameter('selectedItem');

            //sap.m.MessageToast.show(oItem.getkey());

            //Filter를 보관할 배열 선언
            var aFilter = [];

            //사용자가 콤보박스에서 선택한 항목의 key를 가져온다.
            var sKey = oItem.getKey();
            if (sKey){
                //해당 키값이 존재하면, 그 키에 해당되는 데이터만 출력하도록
                //Filter를 생성해서 배열에 보관한다. 
                var oFilter = new Filter("genderCode", FilterOperator.EQ, sKey);

                aFilter.push(oFilter); //aFilter배열에 추가한다. 


            }

            var oList = this.byId("idList");
            var oBinding = oList.getBinding("items");

            oBinding.filter(aFilter);



        }
    });
});