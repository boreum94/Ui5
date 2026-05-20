sap.ui.define([
    "sap/ui/model/type/Currency"
],(CurrencyType) => {
    "use strict";

    return{
        discountText(iDiscount) {
            return iDiscount * 100;
        },
        calcAmount(fUnitPrice, iQuantity, fDiscount, sCurrency) {
            //가격 * 수량 * (1-할인율)
            //소수점 3자리에서 반올림해서 소수 2번째 자리까지
            //보이게 한다.
            var fAmount = fUnitPrice * iQuantity * (1-fDiscount);
            
            //소수점을 무조건 없애고 반올림하기 때문에,
            //소수 2번째 자리까지 보존하려면 100을 곱해야 한다.
            //반올림이 끝나면 소수2번째 자리로 되돌리기 위해 100으로 나눠야 한다.
            fAmount = Math.round(fAmount * 100) / 100;
            
            var oCurrencyType = new CurrencyType({
                showMeasure: false,
            });

            var sFormattedAmount = oCurrencyType.formatValue([fAmount, sCurrency], "string");

            return sFormattedAmount;
        }
    }
});