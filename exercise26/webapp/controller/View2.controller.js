sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], (Controller, History) => {
    "use strict";

    return Controller.extend("code.d22.exercise26.controller.View2", {
        onInit() {
        },
        onNavView1() {
            //라우팅 기능을 사용하기 위해 = 페이지 이동을 하기 위해
            //라우터를 가져와야 한다. 
            //debugger;
            let oRouter = this.getOwnerComponent().getRouter();

            //manifest에서 router의 name을 확인한다. 
            oRouter.navTo("RouteView1");
        },
        onNavBack() {
            //debugger;

            //HIstory는 new를 쓰지 않는다. 대신 getInstence()를 사용해서 객체를 가져온다.
            //왜냐면 기록이 없는 새로운 History는 필요없다.
            //우리는 과거에 이동했던 기록이 필요하다. 그러면 사용하던 History를 가져와야 한다. 
            let oHistory = History.getInstance();

            //뒤로 이동할 ㅅ ㅜ있는지 점검하기 위해 이전 웹페이지에 대한 정보를 다루는 hash를 가져온다. 
            let sPreviousHash = oHistory.getPreviousHash(); 

            
            if( sPreviousHash !== undefined ) {
                //undefined가 아니다. = 뒤로 이동할 웹페이지 기록이 있다. 
                window.history.go(-1); //뒤로 이동
            }else {
                //undefined 즉 기록이 전혀 없는 상태.
                //이런 경우 시작할 때 사용되는 뷰로 이동하도록 한다. 
                //let oRouter = this.getOwnerComponent().getRouter();
                //oRouter.navTo("RouteView1");

                //컨트롤러에 만들어둔 onNavView1을 호출하면 View1.view.xml로 이동하므로
                //기존에 만든 기능을 재활용 할 수도 있다. 
                this.onNavView1();
            }
        }
    });
});