sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"code/d22/project1/test/integration/pages/ZC_TFED22List",
	"code/d22/project1/test/integration/pages/ZC_TFED22ObjectPage"
], function (JourneyRunner, ZC_TFED22List, ZC_TFED22ObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('code/d22/project1') + '/test/flp.html#app-preview',
        pages: {
			onTheZC_TFED22List: ZC_TFED22List,
			onTheZC_TFED22ObjectPage: ZC_TFED22ObjectPage
        },
        async: true
    });

    return runner;
});

