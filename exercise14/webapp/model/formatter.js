sap.ui.define([], function() {

    //문법 검사를 엄격하게 진행하도록 해서, 오류가 있을 경우 웹페이지를 작동 중지 시키도록 한다. 
    "use strict"; 

    return {

        // 전달받은 클래스가 F, C, Y 인 경우 적절한 명칭을 결과값으로 내보내고
        // 그 외는 전부 미확인 좌석으로 반환한다. 

        classText: function(sClass) {

            switch(sClass) {
                case "F": return "일등석";
                case "C": return "비즈니스석";
                case "Y": return "이코노미석";
                default: return "미확인 좌석";
            }
        }
    };
});