//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

var config = require('../config.js');
var ArkRestangular = require('./ArkRestangular.js');
var ArkQueryBuilder = require('./query_builder_service.js');

module.exports = angular.module('ArkSDK.main', [
        config.name,
        ArkRestangular.name,
        ArkQueryBuilder.name
    ])
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

                getBatch: function (requests, type, config) {
                  var query = ArkQueryBuilder.batchQuery(requests, type);
                  return this.batch(query, type, config);
                },

                findById: function(id) {
                    return Restangular.one("search", id).get();
                },

                getRandom: function() {
                    return Restangular.all("random").customGET();
                },

                batch: function (commands, type, config) {
                    return Restangular.all("search/batch/" + type)
                        .withHttpConfig(config)
                        .post(commands);
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

                _handleError: function (data) {
                    if (!data) {
                        return;
                    }

                    var err, msg;
                    var errData = data.data;
                    if (errData && typeof errData === 'object') {
                        msg = errData.message;
                    }

                    err = new Error(msg || 'Unknown Error');
                    err.status = data.status;
                    return $q.reject(err);
                }
            };

            _.bindAll(service);

            return service;
        }
    ]);
