sap.ui.define([], () =>{
    "use strict";

    return{
        getFlightCount: function (oFlights) {
            if (!oFlights) {
                return 0;
            }

            // OData expand 된 경우
            if (oFlights.results) {
                return oFlights.results.length;
            }

            return 0;
    }
    };
});
