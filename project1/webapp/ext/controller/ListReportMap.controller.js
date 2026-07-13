sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('code.d22.project1.ext.controller.ListReportMap', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf code.d22.project1.ext.controller.ListReportMap
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
			}
		},
		onFilterChange: function (oEvent) { 
			// let oExtensionAPI = this.base.getExtensionAPI();
            // let sFromValue = oEvent.getParameters().value;
            // let iFromValue = Number(sFromValue);
            // oExtensionAPI.setFilterValues("SeatsOccupied", "BT", [iFromValue, iFromValue+10]);
			
			let oExtensionAPI = this.base.getExtensionAPI();
			let oHBox = oEvent.getSource().getParent();
			let oFromInput = oHBox.getItems().find(item => item.getName() === 'F');
			let oToInput = oHBox.getItems().find(item => item.getName() === 'T');

			if(oFromInput.getValue() && oToInput.getValue()) {
				oExtensionAPI.setFilterValues("SeatsOccupied", "BT", [oFromInput.getValue(), oToInput.getValue()]);
			}
			
			
		}
	});
});
