sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller,JSONModel) => {
    "use strict";

    return Controller.extend("code.d22.exercise33.controller.Main", {
        onInit() {
            let oData = {
                Input: {
                    name: "",
                    gender: "",
                    age: 0,
                    address: "",
                    cash: 0,
                    currency: "KRW"
                },
                Members: [
                    {
                        name: "홍길동",
                        gender: "남",
                        age: 999,
                        address: "조선",
                        cash: 1000000,
                        currency: "KRW"
                    }
                ]
            }

            let oModel = new JSONModel( oData );
            let oView = this.getView();
            oView.setModel(oModel); //모델을 이름없이 설정
        },
        onButtonAddPress() {
            let oView = this.getView();

            // 모델 이름이 있는 경우 ()안에 모델 이름을 적어야함
            let oModel = oView.getModel(); 

            //경로[/Input]의 데이터를 가져온다. 
            let oInput = oModel.getProperty("/Input");

            if (!oInput.name) {
                sap.m.MessageBox.error("이름은 필수 입력 입니다.");
                return;
            }
            
            //경로 [/Members]의 데이터를 가져온다.
            let aMembers = oModel.getProperty("/Members");

            //gender는 combobox로 선택한 값이지 입력한
            //값이 아니기 때문에 다른 값들과 다르게 가져와야 함
            //원래 this.byId = this.getView().byId = oView.byId()
            //byId는 View객체의 기능이었으나 너무 자주 쓰이는 함수이므로
            //this에서 화면을 가져오지 않아도 바로 사용할 수 있도록 기능이 추가됨
            let oComboBox = oView.byId("idGenderComboBox");

            let sKey = oComboBox.getSelectedKey();

            //comboBox에 선택된 키값에 따라 Input의 gender
            //정보를 결정한다. 
            switch( sKey ){
                case "M":
                    oInput.gender= "남";
                    break;
                case "F":
                    oInput.gender="여";
                    break;
                default:
                    oInput.gender="?";

            }
            aMembers.push(oInput);

            //경로[/Input]의 데이터가 aMembers와 공유하고 있기
            //때문에 새로운 oInput데이터로 덮어쓰지 않으면 경로
            //[/Members]의 값이 영향받는다. 
            oInput = {
                name: "",
                gender: "",
                age: 0,
                address: "",
                cash: 0,
                currency: "KRW"
            }

            //경로 [/Input]에 새로운 데이터로 기록한다.
            oModel.setProperty("/Input", oInput);

            //모델의 변경된 내용이 화면에 갱신되도록 최신화
            oModel.refresh();
        
        },
        onButtonDeletePress() {
            //Table에 선택된 행을 삭제하기 위해서는
            //먼저 Table 객체부터 가져와야 하낟.
            let oTable = this.byId("idMemberTable");

            //Table객체에게 현재 테이블에 선택된 Item을 가져온다.
            let oSelectedItem = oTable.getSelectedItem();

            //선택된 Item의 모델 정보를 가져온다.
            let oBindingContext = oSelectedItem.getBindingContext();

            let sPath = oBindingContext.getPath();

            //alert(" 선택한 행으 ㅣ모델 경로: " + sPath);

            //예를들어 sPath가 /Members/0 이다.
            //"/"기준으로 자르면(split) ["", "Members", "0"]
            //[...].pop()을 하게되면 마지막 "0"이 배열에서 나오면서
            //좌측에 전달하게 된다.
            let index = sPath.split("/").pop();

            //모델에서 경로 /Members 의 데이터를 가져와서 
            //index에 해당하는 행을 삭제한다.
            
            let oView = this.getView();
            let oModel = oView.getModel();
            let aMembers = oModel.getProperty("/Members");

            //선택한 행을 배열에서 Index기준으로 찾아서 삭제한다.
            aMembers.splice( index, 1);

            //변경된 모델의 내용이 뷰에 반영되도록 새로고침한다. 
            oModel.refresh();

            //테이블에 어떤 아이템도 선택되어있지 않도록 초기화
            oTable.removeSelections(true);
        }
        
    });
});