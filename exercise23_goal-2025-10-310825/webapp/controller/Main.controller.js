sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d00.exercise23.controller.Main", {
        onInit() {
        },

        onItemPress(oEvent){
            // 내가 선택한 고객 정보를 가져온다.
            var oItem = oEvent.getParameter("listItem");
            var oBindingContext = oItem.getBindingContext();
            
            // Fragment 파일을 불러온다.
            this.pDialog ??= this.loadFragment({
                name:"code.d00.exercise23.view.Detail"
            });

            var that = this;
            this.pDialog.then(function(oDialog){
                // this가 다른 의미로 변질되므로, 
                // 변질되기 전에 this를 that이라는 변수에 보관한다.
                // this.byId 대신에 that.byId를 사용하여, 테이블에 내가 선택한 고객정보를 적용한다.
                var oOrderTable = that.byId("idOrderTable");
                if ( oOrderTable ) {
                    oOrderTable.setBindingContext(oBindingContext);
                }

                // this가 변질되지 않도록 function(){}.bind(this)로 묶어준다.
                // 이 경우에는 that 변수를 쓰지 않아도 this로 구현할 수 있다.
                var oOrderTable = this.byId("idOrderTable");
                if ( oOrderTable ) {
                    oOrderTable.setBindingContext(oBindingContext);
                }

                // Table이 아니라 Table을 감싸는 Dialog에
                // 내가 선택한 고객정보를 현재 위치로 기록한다.
                oDialog.setBindingContext(oBindingContext);
                oDialog.open();
                
            }.bind(this));
            
        },
        onCloseDialog(){
            var oDialog = this.byId("idDialog");

            if (oDialog) {
                oDialog.close();
            }
        }
    });
});