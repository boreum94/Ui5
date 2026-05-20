sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], (Controller,JSONModel,Filter,FilterOperator) => {
  "use strict";

  return Controller.extend("code.d22.excode.controller.Detail", {
      onInit() {
        /*Detail view에서 뷰객체를 가져오고
        제이슨모델을 만든다.
        view라는 이름의 JSONModel을 view에게 준다.*/
        var oView = this.getView();

        var oJSONModel = new JSONModel({
            Spfli: [],
            SpfliAll: []
        });

        oView.setModel(oJSONModel, "view");

        //경로를 비교하기 위해 (브라우저 주소창에 Detail/{Carrid}가 
        //있는지 확인하기 위해서) 주소창을 가져올 수 있는 라우터를 가져온다.
        var oRouter = this.getOwnerComponent().getRouter();
        var oRoute = oRouter.getRoute("RouteDetail");
        //브라우저 주소창에 Detail/{Carrid}에 일치하는 경로가 붙을 때마다
        //아래 함수 실행
        oRoute.attachPatternMatched( this._onPatternMatched, this);

      },
      //Detailview가 열릴때마다 실행되는 함수
      _onPatternMatched(oEvent) {

        //버튼을 눌러서 Detail/{Caarid}의 페이지가 열릴때
        //이 함수가 실행된다.
        //Event가 발생할 때 ?
        
        var oArg = oEvent.getParameter("arguments");
        //oArg에 {Carrid:AA}라는 값이 들어있는걸 확인할 수 있다. 
        // console.log(oArg);
        
        var sCarrId = oArg.Carrid;
        //sCarrId에는 "AA"라는 값이 들어있는걸 확인했다.
        // console.log(sCarrId);
        
        //Detailview에서 OData Model을 가져온다.
        var oView = this.getView();
        var oODataModel = oView.getModel();
        //위에서 만든 JSONModel인 view Model을 가져온다.
        var oViewModel = oView.getModel("view");

        //oDataModel에서 expand해서 자료를 가져오는 방법
        /*.read("/Spfli",{~} 이렇게 하면 기존경로인 
        Carriers에 /Spfli경로를 expand한게 된다.
        filter를 통해 Carrid가 ${sCarrId}와 같은 것만 필터링 한다.
        ${sCarrId}는 AA를 의미한다.
        /sap/opu/odata/sap/ZEXAMCARRIER/Spfli?$format=json&$expand=to_flights&$filter=Carrid eq 'AA'
        와 같음 */ 
        oODataModel.read("/Spfli", {
            urlParameters: {
                "$expand": "to_flights",
                "$filter": `Carrid eq '${sCarrId}'`
            },
            // read를 성공한 후 oData를 console.log로 찍어보면
            /*oData는 results를 갖고있고, 그 results는 배열로 이루어져
            있다는걸 확인할 수 있음 */
            success: (oData) => {
                console.log(oData.results);
                //oData.results에 들어있는 배열을 /Spfli 경로로
                //모델에 저장함.

                oViewModel.setProperty("/SpfliAll",oData.results);
                oViewModel.setProperty("/Spfli",oData.results);
            },
            error: (oError) => {
                console.error(oError);
                sap.m.MessageToast.show("데이터 조회 실패");
            }
        })

      },
      onButtonGo() {
        //배열 만들기
        var aFilter = [];
        //뷰 불러오기
        var oView = this.getView();
        //Input
        var oConnectionId = oView.byId("idInputConnectionId");
        var oCountryFrom = oView.byId("idInputCountryFrom");
        var oCityTo = oView.byId("idInputCityTo");

        //Input에 실제로 입력된 값 불러오기
        //왜 getValue썼징?
        var oConnectionIdValue = oConnectionId.getValue();
        var oCountryFromValue = oCountryFrom.getValue();
        var oCityToValue = oCityTo.getValue();
        
        //Input에 입력된 값이 존재하고, 길이가 0보다 클 때
        //
        if( oConnectionIdValue && 
            oConnectionIdValue.length >0 ){
            //if문 밖에서 선언한 배열 불러왔넹..?
            aFilter.push(new Filter("Connid",FilterOperator.Contains,
              oConnectionIdValue));
          }

        if( oCountryFromValue && 
            oCountryFromValue.length >0 ){

            aFilter.push(new Filter("Countryfr",FilterOperator.EQ,
              oCountryFromValue));
          }
        
        if( oCityToValue && 
            oCityToValue.length >0 ){

            aFilter.push(("Cityto",FilterOperator.EQ,
              oCityToValue));
          }

          //View에서 테이블 정보 가져오기 
          var oTable = this.byId("idDetailViewTable");
          /*Table의 items는 현재 {view>/Spfli} 경로로 모델에서
          데이터를 가져오고 있다. 
          getBinding()함수는 테이블이 어떤 데이터랑 연결되어 
          있는지 정보를 가져오는 함수로
          getBinding을 이용해서 가져온 정보에 필터를 적용*/
          var oBinding = oTable.getBinding("items");
          //아까 만든 aFilter의 조건에 맞는 값만 바인딩
          oBinding.filter(aFilter);
      },
      onSelectionChange(oEvent) {
            let oItem = oEvent.getParameter("listItem");
            let oContext = oItem.getBindingContext("view");
            let oData = oContext.getProperty();

            // to_flights 데이터 존재 여부 확인
            if (!oData.to_flights || !oData.to_flights.results) {
                MessageToast.show("해당 노선의 항공편 정보가 없습니다.");
                return;
            }

            // JSONModel에 차트용 데이터 저장
            let oChartModel = new JSONModel({
                Flights: oData.to_flights.results
            });
            this.getView().setModel(oChartModel, "chart");

            // 차트 보이기
            this.byId("idVizFrame").setVisible(true);

      },
      
  });
});