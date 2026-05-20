sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("code.t2.ui5.review2.controller.Main", {
        onInit() {
            // const는 상수를 선언할 때 사용한다. 한 번 할당된 값은 변경할 수 없다.
            const oModel = new JSONModel();

            // JSONModel을 만든 뒤 초기 데이터를 세팅했다. 
            oModel.setData({
        	name: "홍길동",
            age: 999,
            city: "조선"
            });
            
            // setModel 메서드는 모델을 뷰에 설정하는 역할을 한다. 
            // 이렇게 하면 뷰에서 모델의 데이터를 사용할 수 있게 된다.
            this.getView().setModel(oModel);
        },
        onReset() {
            const oModel = this.getView().getModel();
            
            // setData 메서드는 모델의 데이터를 설정하는 역할을 한다.
            // 여기서는 name, age, city 속성을 초기값으로 설정하여 모델의 데이터를 초기화한다.
            oModel.setData({
                name: "", //이름을 빈 문자열로 초기화
                age: 0,   //나이를 0으로 초기화
                city: ""  //도시를 빈 문자열로 초기화
            })
        },
        onSave() {
            // alert("Test");
            // console.log("Save Button Clicked");

            let oView = this.getView();

            // View에서 입력한 고객정보를 취급하는 모델을 가져온다.
            let oModel = oView.getModel();  

            // getData는 JSON Model에만 있는 메서드로
            // {} 형태의 객체로 데이터를 가져온다. 
            let oData = oModel.getData();
            console.log(["고객데이터: ",oData]);

            // manifest.json에 설정한 모델을 가져온다. (sap라는 이름으로 설정한)
            let oSapModel = oView.getModel("sap");

            // this의 값은 계속 변하므로, 
            // 콜백함수에서 this를 사용할 수 있도록 that 변수에 this를 할당한다. 
            let that = this;

            // oSapModel.create()은 SAP Gateway OData서비스에 Creat 요청을 보내는 로직이다. 
            oSapModel.create("/CustomerSet",  // CustomerSet이라는 경로로
                // 아래와 같은 데이터를 sap라는 모델에 저장한다(?)
                {
                    Name: oData.name,
                    Age: oData.age.toString(),
                    City: oData.city
                }, {
                success: (oResponse) => {
                    console.log("고객 등록 성공: ", oResponse);
                    console.log("생성된 고객 ID: ", oResponse.Id);

                    const oResultModel = new JSONModel({
                        Id: oResponse.Id
                    })

                    // result라는 이름으로 oResultModel을 뷰에 설정한다.
                    // 이렇게하면 뷰에서 "result" 모델의 데이터를 사용할 수 있게 된다.
                    oView.setModel(oResultModel, "result");
                    
                    // ??= 연산자는 논리적 할당 연산자 중 하나로,
                    // 왼쪽 피연산자가 null 또는 undefined인 경우에만 (즉, 값이 없을 때만)
                    // 오른쪽 피연산자의 값을 할당한다.
                    // this.oDialog가 빈 값일 때만 오른쪽의 this.loadFragment(..)의 결고를 가져온다.
                    that.pDialog ??= that.loadFragment({
                        name: "code.t2.ui5.review2.view.Result"
                    });

                    // this.loadFragment()가 완료된 후 oDialog.open()을 실행한다.
                    // this.pDialog는 Promise 객체이므로,
                    // then() 메서드를 사용하여 Promise가 완료된 후의 로직을 작성할 수 있다.(* 콜백함수)
                    that.pDialog.then(oDialog => {
                        oDialog.open();
                    });

                },
                error: (oError) => {
                    console.log("고객 등록 실패: ", oError)
                }
            });

            
            
        },
        onCloseDialog() {
            let oView = this.getView();
            // Fragment에 Id를 "idResultDialog" 라고 줬다. 
            // byId 메서드는 뷰에서 특정 ID를 가진 요소를 찾는 역할을 한다. 
            let oDialog = oView.byId("idResultDialog");

            if (oDialog){
                oDialog.close();
            }
        }
    });
});