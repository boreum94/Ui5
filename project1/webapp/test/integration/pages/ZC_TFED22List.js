sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'code.d22.project1',
            componentId: 'ZC_TFED22List',
            contextPath: '/ZC_TFED22'
        },
        CustomPageDefinitions
    );
});