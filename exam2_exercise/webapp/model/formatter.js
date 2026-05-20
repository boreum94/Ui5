sap.ui.define([
    "sap/ui/core/library"
],
function(coreLibrary){
    "use strict";

    var ValueState = coreLibrary.ValueState;

    return{
        quantityState: function(quantity) {
            if (quantity >= 3000) {
                return "Success"
            }else if (quantity < 1000) {
                return "Error"
            }else return "Information"
        },
        quantityText: function(quantity) {
            if (quantity >= 3000) {
                return "많음"
            }else if (quantity < 1000) {
                return "부족"
            }else return "보통"
           
        }
    };

});