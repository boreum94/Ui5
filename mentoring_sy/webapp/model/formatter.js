sap.ui.define([], () => {
    "use strict";

    return {
        // statusText()함수는 데이터 모델의 technical status를 input parameter로 가져온 후
        // 사람이 읽기 쉬운 문자로 돌려준다. 어디서? resourceBundle 파일에서 
        statusText(sStatus) {
            // 아래 getText()로 받아올 데이터들이 i18n에 있기 때문에 getResourceBundle 사용
            const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            // sStatus의 값이 S,A,B,C냐에 따라 다른 텍스트 가져옴.
            switch(sStatus) {
                case "S":
                    return oResourceBundle.getText("invoiceStatusS");
                case "A":
                    return oResourceBundle.getText("invoiceStatusA");
                case "B":
                    return oResourceBundle.getText("invoiceStatusB");
                case "C":
                    return oResourceBundle.getText("invoiceStatusC");
                // 아닐 경우는 변경하지 않음.
                default:
                    return sStatus;
            }
        }
    };
});