sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("code.d22.mentoringsy05.controller.Overview", {
        onInit() {
        },
        onButtonProduct() {
        // Product 버튼 누르면 실행되는 함수

        // 연결된 뷰를 가져와서 테이블의 visible을 false로 변경한다. 
        this.byId("productId").setVisible(true);
        this.byId("bpId").setVisible(false);

        },
        onButtonBP() {
        // Business Partners 버튼 누르면 실행되는 함수
        this.byId("productId").setVisible(false);
        this.byId("bpId").setVisible(true);

        }
    });
});