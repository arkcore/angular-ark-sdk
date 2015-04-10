'use strict';

var config = require('../config.js');

// Make sure to include restangular in your own project
module.exports = angular.module('ArkSDK.restangular', [
        'restangular'
    ])
    .factory('ArkRestangular', [
        'Restangular',
        'ArkAPIKey',
        function (Restangular, ArkAPIKey) {

            return Restangular.withConfig(function (RestangularConfigurer) {

                if (config._ArkAPIKeyPlaceholder !== ArkAPIKey) {
                    RestangularConfigurer.setDefaultHeaders({"x-ark-token": ArkAPIKey});
                }

                // otherwise
                // var warn =  'Please, specify your own API KEY\n' +
                //             'It can be done by adding this code to your module\n' +
                //             'angular.module(\'ArkSDK.config\').config(["$provide", function ($provide) {\n' +
                //             ' $provide.decorator(\'ArkAPIKey\', function () {\n' +
                //             '   return \'real-ark-token\';\n' +
                //             ' });\n' +
                //             '}]);\n' +
                //             '\n' +
                //             'Or by setting `window._globalArkAPIKey = `your-arpi-key`;';
                // console.error(warn);

                RestangularConfigurer.setBaseUrl('https://ng.ark.com/api/1');

                // If you need to disable caching - do it here
                RestangularConfigurer.setDefaultHttpFields({cache: true});

              });

          }

    ]);
