sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/message/MessageType"
], (Controller,myFormatter,Filter,FilterOperator,JSONModel,MessageBox,MessageType) => {
    "use strict";

    return Controller.extend("code.d22.exam2.controller.Main", {
        
        formatter: myFormatter,

        onInit() {

            //새로운 데이터를 테이블에 추가하기 위한 함수
            var oModel = new JSONModel({
                //Input은 _initData의 결과값을 가진다.
                Input: this._initData()
            });
            var oView = this.getView();
            oView.setModel(oModel, "new");

        },
        // 이 함수는 컨트롤러에서 사용하기 위해 만들었다.
        _initData(){

            //컴포넌트를 통해 i18n모델을 불러온다.(getText("cityBusan")의 cityBusan이 
            //i18n 모델에 있으니까)
            var oI18nModel = this.getOwnerComponent().getModel("i18n");

            //리소스번들을 가져와서 
            var oResourceBundle = oI18nModel.getResourceBundle();
            var sCity = oResourceBundle.getText("cityBusan");//"cityBusan"은 i18n에 있는 단어
            return {
                ProductName: "",
                Price: 0,
                Currency: "KRW",
                Quantity: 0,
                Unit: "Box",
                //라디오 버튼은
                City: {
                    Seoul: true,
                    Busan: false
                },
                Storage: sCity
            }
        },
        onComboBoxChange(oEvent) {
            //콤보박스 버튼을 누를 때마다 기준에 따라 다른 상품을 
            //보여주는 버튼 구현

            //debugger;

            var oItem = oEvent.getParameter('selectedItem');
            var sKey = oItem.getKey();

            var aFilter = [];

            //A는 전체를 보여줄거기 때문에 A에 대한 제약조건이 없게 만들어야함
            if( sKey && sKey !== "A" ){
                var oFilter = new Filter("StorageCode", FilterOperator.EQ, sKey);
                aFilter.push(oFilter);
            }

            //List에 id를 부여한 이유가 이것 때문
            var oList = this.byId("idList");

            //aggregation items는 현재 { path: '/Products', sorter: {...}}로
            //Model의 데이터를 가져오기 위한 연결 정보가 기록되어 있다.
            //그 연결 정보를 가져와서 filter 정보도 추가시키도록 한다.
            var oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        },
        onAddPress(){
            //상품 추가를 위해 만든 버튼으로 누르면 추가된
            //상품이 하단에 보임

            //입력된 값이 올바른지 검사
            var oInputProductName = this.byId("idProductNameInput");
            var sProductName = oInputProductName.getValue();

            if ( sProductName && sProductName.length > 0) {
                //정상, 제품명이 있고, 길이가 1자리 이상인 문자열
                //중단하지 않는다.
            }else {
                //제품명이 없음
                MessageBox.error("제품명이 비어있습니다.");
                //중단한다.
                return;
            }

            //Message Manager에 오류 메시지가 존재하면 중단한다.
            var oMessageManager = sap.ui.getCore().getMessageManager();
            var oMessageData = oMessageManager.getMessageModel().getData();
            var hasError = oMessageData.some( (msg) => m.type === MessageType.Error);
            
            if ( hasError ) {
                MessageBox.error("에러가 존재합니다.");
                return;
            }

        
            //검사가 통과되면 상품 목록에 추가하는 로직을 실행한다. 
            
            var oView = this.getView();
            //여기서 "new"라는 모델을 가져오는 것이 중요
            var oNewModel = oView.getModel("new");
            
            /*경로 /Input의 데이터를 가져온다.
            이 데이터는 다음과 같이 이뤄져 있다.
            {
                ProductName: "~~",
                Price: 12233~,
                Currenct: "KRW",
                Quantity: 12234~~,
                Unit: "Box",
                City: {
                    Seoul: true/false
                    Busan: false/true
                },
                Storage: "서울" / "부산"
            }*/ 

            var oNewProduct = oNewModel.getProperty("/Input");

            // 사용자가 선택한 라디오 버튼이 서울인지 부산이지에
            //따라 다르게 입력되야함
            if ( oNewProduct.City.Seoul) {
                oNewProduct.Storage = "서울";
                oNewProduct.StorageCode = "S";

            } else if ( oNewProduct.City.Busan ){
                oNewProduct.Storage = "부산";
                oNewProduct.StorageCode = "B";

            }else {
                oNewProduct.Storage = "?";
                oNewProduct.StorageCode= "";
            }

            //기본 모델을 가져와서 경로 /Products에 신규 상품 정보를 추가한다. 
            var oModel = oView.getModel();
            var aProducts = oModel.getProperty("/Products");
            aProducts.push( oNewProduct );

            //경로 /Products에 새로운 상품 정보가 추가되었으므로,
            //화면에 반영하기 위해 모델 정보를 새로고침한다. 
            oModel.refresh();

            //new 모델의 경로 /Input에는 입력한 데이터를 초기화한다.
            oNewModel.setProperty("/Input", this._initData());
        },
        onButtonDeletePress() {
            
            //리스트에서 사용되는 모델의 제품 목록
            var oView = this.getView();
            var oModel = oView.getModel();
            //aProducts는 배열이다.
            var aProducts = oModel.getProperty("/Products");

            //리스트에서 선택한 항목들을 가져온다.
            var oList = oView.byId("idList");
            var aSelectedItems = oList.getSelectedItems();

            //선택한 항목들 정보를 토대로 aProducts에서 삭제할 데이터를
            //찾아서 삭제할 예정이다.
            // JSONModel은 데이터가 배열로 이뤄져 있는데, 
            //배열에 데이터를 접근할 때는 인덱스로 접근한다.
            //그래서 우리는 삭제할 데이터의 Index를 알아야 하므로

            //선택한 항목들마다 연결된 모델 경로에서(path)
            //인덱스 정보를 가져와 배열에 따로 보관한다. 
            var aIndex = [];

            for(var oItem of aSelectedItems){
                //getBindingContextPath함수는 연결된 모델의 경로를
                //가져온다. 
                var path = oItem.getBindingContextPath();
                console.log("아이템의 경로:" + path);
                var index = path.split("/").pop();
                aIndex.push(index);
            }

            //배열의 데이터를 내림차순으로 정렬한다.
            var aDescIndex = aIndex.sort((a,b) => b-a);
            for( var index of aDescIndex ){

                //삭제할 대상 중 가장 마지막 항목부터 
                //삭제하며 올라간다.
                aProducts.splice(index, 1);
            }


            /*
            //배열의 데이터를 오름차순으로 정렬한다.
            aIndex.sort();

            var deleteCount = 0;
            for(var index of aIndex){
                //특정 인덱스부터 1개만 삭제하는 문법: splice
                aProducts.splice( index - deleteCount, 1);
                //삭제할 때마다 인덱스를 앞당기기 위해 count를 증가
                deleteCount++;
            }
            */

            //삭제가 완료되면 화면에 변경된 모델 데이터가 갱신
            //되도록 새로고침한다. 
            oModel.refresh();

            //리스트에 항목을 선택한 정보를 초기화한다.
            oList.removeSelections(true);
    
        }
    });
});