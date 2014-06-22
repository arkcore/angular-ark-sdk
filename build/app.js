(function(){
	'use strict';

	angular.module('angular-ark-sdk', [ 'Restangular' ])
	  .config([
			"RestangularProvider",
			"ArkAPIKey",
			function (RestangularProvider, ArkAPIKey) {

				RestangularProvider.setDefaultHeaders({"x-ark-token": ArkAPIKey});
				RestangularProvider.setBaseUrl('https://ng.ark.com/api/1');

	  }]);

	// In the production mode you have to specify API key here
	angular.module('angular-ark-sdk')
		.value("ArkAPIKey", "your-ark-api-key");

})();

//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('angular-ark-sdk')
    .factory('ArkApi', [
        "Restangular",
        function (Restangular) {

            var service = {



            };

            _.bindAll(service);

            return service;
        }
    ]);
