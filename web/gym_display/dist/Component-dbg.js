sap.ui.define([
	"sap/ui/core/UIComponent"	
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("gym_display.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			console.log("component init");
			UIComponent.prototype.init.apply(this, arguments);			
		}
	});
});