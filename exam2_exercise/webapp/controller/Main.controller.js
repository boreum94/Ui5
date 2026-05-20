sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller,Formatter,Filter,FilterOperator) => {
    "use strict";

    return Controller.extend("code.d22.exam2exercise.controller.Main", {
        onInit() {
        },

        formatter: Formatter,

        onComboBoxSelectionChange(oEvent) {
            var oItem = oEvent.getParameter('selectedItem');
            //sKey에는 선택한 행의 Key값이 들어있음
            var sKey = oItem.getKey();

            // sap.m.MessageToast.show(oItem.getKey());

            var aFilter = [];

            //sKey값이 존재하고, 키값이 '전체'가 아닐때
            //Filter와 FilterOperator를 사용하기 위해 선언하는 것 
            //잊지 말기!
            if (sKey && sKey !== "A") {
                //StorageCode가 sKey의 키값과 같은 것만 배열에 담는다.
                var oFilter = new Filter("StorageCode", FilterOperator.EQ, sKey);
                //o배열의 값을 a배열에 넣는다.
                aFilter.push(oFilter);
            }

            //List의 id를 이용해서 상품재고목록 정보를 가져온다.
            var oList = this.byId("idList");

            //상품재고목록 정보에서 바인딩정보를 가져온다. 
            //단 한 행에 대한 정보가 아닌, List 전체에 대한 정보를 
            //가져와야 하기 때문에 getBinding을 사용했다. 
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);

            
        }
    });
});