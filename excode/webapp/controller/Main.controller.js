sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], (Controller,JSONModel,MessageToast) => {
    "use strict";

    return Controller.extend("code.d22.excode.controller.Main", {
        onInit() {
            //JSONModel 객체를 만들고 경로를 설정해줌
            var oModel = new JSONModel({
                Carriers: [
                   
                ]
            });
            
            var oView = this.getView();

            //여기서 만들어준 JSONModel을 뷰에 줬음
            oView.setModel(oModel, "view");



            //Detailview가 열릴 때마다 실행할 함수 정의
            // var oRouter = this.getOwnerComponent().getRouter();
            // oRouter.getRoute("Detail").attachPatternMatched(this._onObjectMatched,this);
        },

        // Main 화면 Add Button
        onPressAddButton() {
            this.pDialog ??= this.loadFragment({
                name: "code.d22.excode.view.Dialog"
            });

            this.pDialog.then((oDialog) => oDialog.open());
        },

        // 데이터를 삭제하는 버튼
        onPressDeleteButton() {
            // alert("a")
            //view를 가져온다.
            var oView = this.getView();

            //가져와야 하는 모델은 JSONModel이다.
            var oModel = oView.getModel("view");
            //Table을 가져온다.
            var oTable = this.byId("idMainViewTable");
            //선택한 행들을 가져온다.
            //getSelectedIndices()는 GridTable에서 선택한
            //행들의 값을 가져오는데, getSelectedItems와 다른건
            //경로 없이 Index만 가져온다. 
            var oSelectedItems = oTable.getSelectedIndices();
            console.log(oSelectedItems);

            //aArray 가져오기
            //모델에 저장된 값들 중 선택한 아이템을 삭제하기 위해
            //JSONModel에 저장된 아이템을 경로를 통해서 배열에
            //저장한다.
            var aArray = oModel.getProperty("/Carriers");

            //배열의 데이터를 내림차순으로 정렬
            var aDescIndex = oSelectedItems.sort((a,b) => b-a);
            for( var index of aDescIndex ) {
                //삭제
                aArray.splice(index, 1);
            }

            //삭제할 데이터가 사라진 aArray를 모델에게 다시 준다.
            oModel.setProperty("/Carriers",aArray);

            
        },
        
        // Fragment Close
        onButtonCloseFragment() {
            //fragment의 tableId를 사용해서
            //테이블을 닫을 때마다 초기화하는 함수 실행
            var oTable = this.byId("idDialogTable");
            oTable.removeSelections();

            var oDialog = this.byId("idDialog");
            if (oDialog) {
                oDialog.close();
            }
        },
        onButtonOK() {
            // fragment에서 byId로 테이블을 가져와서 
            // 선택한 행의 정보를 가져온다.
            // 가져온 정보를 
            // view라는 이름의 JSONModel에 배열을 가진 
            // 경로를 만들고, 그 경로를 메인 뷰에 바인딩 시켜준다.
            //  저장하고, 뷰에 띄운다. 
            
            // alert("a")
            // view 객체 가져옴
            var oView = this.getView();
            //Table 정보 가져옴
            var oTable = this.byId("idDialogTable");
            //테이블의 선택한 행의 정보를 가져옴
            var oItem = oTable.getSelectedItem();
     
            if(!oItem) {
                MessageToast.show("선택을 안 했습니다.");
            }else{
                //선택한 행의 정보에서 (OData에 있음)경로를 가져온다.
                //getBindingContext()는 단순히 경로만 가져오는 것이기 때문에
                //getProperty()를 통해서 그 경로에 있는 데이터를 가져온다.
                var oBindingContext = oItem.getBindingContext().getProperty();
                 console.log(oBindingContext);

                //뷰에서 view모델을 가져온다.
                var oModel = oView.getModel("view");

                //배열을 선언하되, 이전에 모델에 저장됐던 값도 가져올 수 
                //있도록 oModel의 Property를 "/Carriers"라는 경로로
                //가져온다.
                var aArray = oModel.getProperty("/Carriers");

                //배열에 getBindingContext()를 통해 가져온 값을 저장한다.
                aArray.push(oBindingContext);

                //배열에 있는 값을 모델에 저장한다. 
                oModel.setProperty("/Carriers",aArray);

                //OK버튼을 누를때 실행되는 이 함수도 함수 실행이 끝나면 
                //닫힐 수 있도록 onButtonCloseFragment함수를 호출한다. 
                this.onButtonCloseFragment();
            }
   
        },
        //Routing할 버튼
        onButtonDetailsPage(oEvent) {
            //View에서 선택한 행의 정보를 가져온다.
            //getSource()
            var oItem = oEvent.getSource();

            //가져온 행의 정보를 가지고 컨텍스트를 가져온다.
            var oContext = oItem.getBindingContext("view");

            //컨텍스트를 가지고 Carrid값을 가져온다.
            var oCarrid = oContext.getProperty("Carrid");
            // sap.m.MessageBox.alert(oCarrid);


            //페이지 이동을 위해 컴포넌트/라우트 가져오기
            var oRouter = this.getOwnerComponent().getRouter();

            //라우터를 이용해서 페이지 이동
            oRouter.navTo("RouteDetail", {Carrid:oCarrid});
        }

    });
});