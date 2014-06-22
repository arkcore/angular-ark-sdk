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
