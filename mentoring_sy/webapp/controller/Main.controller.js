sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    // .. 은 상위 폴더를 의미한다. 즉 이건 webapp폴더의 포메터 파일이라는 뜻.
    "../model/formatter",
    // Filter를 위한 추가
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, MessageToast, JSONModel, formatter,
    Filter, FilterOperator
) => {
    "use strict";

    return Controller.extend("code.d22.mentoringsy.controller.Main", {
        // formatter를 등록하기 위해 컨트롤러에 아래 로직 작성
        // formatter가 view에 접근할 수 있다. 
        formatter: formatter,
        onInit() {
            //여기에 쓰는 이유는, 모델은 뷰가 열리자마자 세팅되어야 하니크크룽삥뽕
            // oData라는 JSON Model 생성
            const oData = { recipient : {
                                            name : "Sung Yun"
            } };
            // oModel이라는 제이슨모델 객체 생성,,, 을 하는데 oData변수를 곁들인
            const oModel = new JSONModel(oData);
            //this=이 컨트롤러
            //getView=뷰를 가져와서
            //setModel=모델을 세팅하겠다. 근데 oModel 객체를 곁들인.. ? 몰라삐
            this.getView().setModel(oModel);

            const oViewModel = new JSONModel({
                currency: "EUR"
            });
            this.getView().setModel(oViewModel, "view");

        },
        onShowHello() {

            const oBundle = this.getView().getModel("i18n").getResourceBundle();
            const sRecipient = this.getView().getModel().getProperty("/recipient/name");
            const sMsg = oBundle.getText("helloMsg", [sRecipient]);

            MessageToast.show(sMsg);
        },
        onOpenDialog() {
            // 이 컨트롤러와 연결된 뷰의 Dialog
            // ??= : this.pDialog가 null 또는 undefined일 때만 this.loadFragment
            // 를 할당하라는 뜻이다. 먼 말이지 
            this.pDialog ??= this.loadFragment({
                name: "code.d22.mentoringsy.view.HelloDialog"
            });

            this.pDialog.then((oDialog) => oDialog.open());
        },
        onCloseDialog() {
            // Dialog 닫는 기능 구현
            // 이 컨트롤러에 Dialog를 helloDialog라는 id로 가져와서 .close() 닫는다. 
            this.byId("helloDialog").close();
        },
        // oEvent에는 무엇이 담길까? 
        // 우리가 검색창에 입력한 글자가 query의 value로 들어간다 이말씀 
        onFilterInvoices(oEvent) {
            // aFilter라는 배열을 선언.
            const aFilter = [];
            // sQuery 변수 = getParameter()로 query의 value인 사용자가 입력창에 입력한 값
            const sQuery = oEvent.getParameter("query");
            
            debugger;

            // aFilter.push() : ()안의 결과를 aFilter 배열에 추가해라
            //FilterOperator.Contains : 필터의 조건이 '포함'
            // 뭘 포함? ProductName 중 sQuery를 포함하면.
            if(sQuery) {
                aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
            }
            //invoiceList라는 ID의 List를 가져와서 oList에 담아.
            const oList = this.byId("invoiceList");
            //invoiceList의 items에는 우리가 json모델에서 가져온 데이터들이 있는데
            //그걸 가져와.
            const oBinding = oList.getBinding("items");
            // 가져온 데이터에 aFilter[] 배열의 필터 옵션을 적용시켜
            oBinding.filter(aFilter);
        },
        onPress(oEvent) {

            const oItem = oEvent.getSource();
            // 라우터를 가져오려면 항상 먼저 컴포넌트를 가져와야 한다 이거야
            const oRouter = this.getOwnerComponent().getRouter();
            // navigate to detail 이라는 라우터를 찾아가라.
            // manifest에는 detail이라는 이름의 라우터가 있고, 
            // detail 이라는 이름의 targets에 대한 정보를 가지고 있다. 
            // detail target은 Detail이라는 view로 이동시킨다. 
            oRouter.navTo("detail", {ProductName}); // 와우. 여기서부터 1도 모르겠다. 
        }
    });
});