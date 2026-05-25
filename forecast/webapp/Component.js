sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (
    UIComponent,
    JSONModel
) {
    "use strict";

    return UIComponent.extend("code.t2.forecast.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(
                new JSONModel({
                    preview: {
                        ready: false,
                        data: null
                    }
                }),
                "appState"
            );

            this.getRouter().initialize();
        }
    });
});