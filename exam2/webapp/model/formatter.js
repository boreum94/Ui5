sap.ui.define([
    "sap/ui/core/library"
], 
function (coreLibrary) {
    "use strict";

    var ValueState = coreLibrary.ValueState;
    

    return {

        //뷰에서 포메터를 찾으면 컨트롤러가 포메터를 실행시킨다.
       quantityText: function(quantity) {
            if(quantity >= 3000) {

                return "많음";

            }else if (quantity < 1000) {

                return "부족";

            }else return "보통";


            //  switch(quantity) {
            //     case "A" : return "많음";
            //     case "B" : return "보통";
            //     case "C" : return "부족";

            //  }
       },
       quantityState: function(quantity) {
            if(quantity >= 3000) {

                // return "Success";
                return ValueState.Success;

            }else if (quantity < 1000) {

                // return "Error";
                return ValueState.Error

            }else return ValueState.Information;
       }
    };

});