//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('ArkSDK')
    .factory('ArkApi', [
        'ArkRestangular',
        '$q',
        'ArkAvailableNetworks',
        'ArkQueryBuilder',
        function (Restangular, $q, ArkAvailableNetworks, ArkQueryBuilder) {

            var service = {

                findByEmail: function (email) {
                    return Restangular.one("email", email).get()
                        .then(this._extractResponse(true), this._handleError);
                },

                findByNetworkAndId: function (network, id, page) {
                    var query = ArkQueryBuilder.networkAndIdQuery(network, id);
                    return this.search(query, page);
                },

                findById: function(id) {
                    return Restangular.one("search", id).get();
                },

                search: function (commands, page, config) {
                    // TODO: add mode support
                    var query = { query: commands };
                    page = page || 0;
                    config = config || {};

                    return Restangular.all("search")
                        .withHttpConfig(config)
                        .post(query, { page: page })
                        .then(this._extractResponse(false), this._handleError);
                },

                suggestMultiple: function (fields, text, config) {
                    var query = ArkQueryBuilder.suggestMultipleQuery(fields, text);
                    config = config || {};

                    return Restangular.all("suggest")
                        .withHttpConfig(config)
                        .post(query)
                        .then(function extractMultipleSuggest(data){
                            // TODO: add appropriate transformations
                            return data;
                        }, this._handleError);
                },

                suggest: function (field, text, config) {
                    var query = ArkQueryBuilder.suggestQuery(field, text);
                    config = config || {};

                    return Restangular.all("suggest")
                        .withHttpConfig(config)
                        .post(query)
                        .then(function extractSuggest(data) {
                            // do any transformations if need be
                            return data;
                        }, this._handleError);
                },

                // extracts response out of the meta information
                _extractResponse: function (single) {
                    return function (data) {
                        if (single === true) {
                            return data.results[0];
                        } else {
                            return data;
                        }
                    };
                },

                _handleError: function () {
                    // TODO: handle errors
                    console.error(arguments);
                }

            };

            _.bindAll(service);

            return service;
        }
    ]);
