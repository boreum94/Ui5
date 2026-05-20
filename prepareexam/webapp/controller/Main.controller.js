sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.prepareexam.controller.Main", {
        onInit() {
        },
        onSelectionChange(oEvent) {
            var oListItem = oEvent.getParameter("listItem"); 
            var oContext = oListItem.getBindingContext();
            var sPath = oContext.getPath();
            var oSelectedData = oContext.getProperty();

            var oData = {
                data: oSelectedData,
                path: sPath
            }
            this.getView().setModel(new JSONModel(oData), "update");

            // var oUpdateModel = new JSONModel();
            // oUpdateModel.setData(oData);

            // // console.log("경로:"+sPath);

            // var oView = this.getView();
            // oView.setModel(oUpdateModel, "update");
            // //우리는 앞서 뷰에 SimpleForm에 띄울 데이터 경로를 / 없이 상대경로로 주었는데
            // // 아래와 같이 경로를 bindElement 해주면, 해당 경로에서부터 경로를 시작하고, 데이터를 가져온다. 
            // // oView.bindElement(sPath);

        },
        onSave() {
            var oView = this.getView();
            var oODataModel = oView.getModel(); // SAP랑 연결된 모델
            var oUpdateModel = oView.getModel("update"); //JSON Model
            
            var oData = oUpdateModel.getData();
            oODataModel.update(
                oData.path,
                oData.data,
                {
                    success(oEvent){
                        alert("변경 성공");
                    },
                    error(oEvent){
                        aler("변경 실패");
                    }
                }
            )
        },
        onReset() {
            var oView = this.getView();
            var oModel = oView.getModel(); // SAP랑 연결된 모델
            var oUpdateModel = oView.getModel("update"); // JSON Model

            var oData = oUpdateModel.getData();
            oModel.read(
                oData.path,
                {
                    success(oEvent){
                        oUpdateModel.setProperty("/data", oEvent);
                        sap.m.MessageToast.show("데이터를 다시 읽어왔습니다.");
                    },
                    error(oEvent){
                        alert("조회 실패");
                    }
                }
            )

        }
    });
});