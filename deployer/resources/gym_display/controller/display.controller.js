sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("gym_display.controller.display", {
        onInit: function () {
			console.log("controller init");		
		},

		updateGym: function() {
			var oTable = this.getView().byId("gymsTable");

			var oSelectedItem = oTable.getSelectedItem();

			var name = this.getView().byId("input_name").getValue();
			var type = this.getView().byId("input_type").getValue();
			var trainer = this.getView().byId("input_trainer").getValue();

			if (!oSelectedItem){
				sap.m.MessageToast.show("Gym is not selected!");
			} else if (!name || !type || !trainer){
				sap.m.MessageToast.show("Enter the value ");	
			} else{
				console.log("Start request");
				var usid = oSelectedItem.getBindingContext("gyms").getObject().usid;
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "https://p2001123599trial-trial-dev-router.cfapps.eu10.hana.ondemand.com/api/xsodata/himta.xsodata/Gym('" + usid + "')",
					"method": "PUT",
					"headers": {
						"content-type": "application/json"
					},
					"processData": false,
					"data": "{\"name\": \"" + name  + "\",\"type\": \"" + type  + "\",\"trainer\": \"" + trainer  + "\",\"creationDate\":null,\"updateDate\":null}"
				};
				console.log(settings.url);
				$.ajax(settings).done(function (response) {
					console.log(response);
				});
				window.location.reload();
			}		
		},

		createGym: function () {
			var name = this.getView().byId("input_name").getValue();
			var type = this.getView().byId("input_type").getValue();
			var trainer = this.getView().byId("input_trainer").getValue();
			if (!name || !type || !trainer){
				sap.m.MessageToast.show("Enter the value ");	
			} else{
				var settings = {
					"async": true,
					"crossDomain": true,
					"url": "https://p2001123599trial-trial-dev-router.cfapps.eu10.hana.ondemand.com/api/xsodata/himta.xsodata/Gym",
					"method": "POST",
					"headers": {
						"content-type": "application/json"
					},
					"processData": false,
					"data": "{\"name\": \"" + name  + "\",\"type\": \"" + type  + "\",\"trainer\": \"" + trainer  + "\",\"creationDate\":null,\"updateDate\":null}"
				};
				$.ajax(settings).done(function (response) {
					console.log(response);
				});
				window.location.reload();
			}			
		}
     });
});