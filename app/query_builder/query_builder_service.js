//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('angular-ark-sdk')
    .factory('ArkApi', [
        "ArkAvailableNetworks",
        function (ArkAvailableNetworks) {

            var _sexValues = ["male", "female", "other"];

            var queryBuilder = {

                emailQuery: function (email) {
                    return {
                        type: "email",
                        data: { email: email }
                    };
                },

                networkAndIdQuery: function (network, id) {
                    if (_.indexOf(ArkAvailableNetworks, network) === -1) {
                        throw new Error(network + " is not in the list of available networks");
                    }

                    var query = {
                        type: "network_id",
                        data: {
                            network: network,
                            network_id: id
                        }
                    };

                    return query;
                },

                placesQuery: function (place) {
                    return {
                        type: "places",
                        data: {
                            place: place
                        }
                    };
                },

                sexQuery: function (sex) {
                    if (_.indexOf(_sexValues, sex) === -1) {
                        throw new Error("Only " + _sexValues.join(",") + " are supported");
                    }

                    return {
                        type: "sex",
                        data: {
                            sex: sex
                        }
                    };
                },

                languageQuery: function (language) {
                    return {
                        type: "language",
                        data: {
                            language: language
                        }
                    };
                },

                fullNameQuery: function (name) {
                    return {
                        type: "full_name_exact",
                        data: {
                            fullName: name
                        }
                    };
                },

                fullNamePartialQuery: function (name) {
                    return {
                        type: "full_name_partial_translit",
                        data: {
                            fullName: name
                        }
                    };
                },

                educationQuery: function (school, degree, start, end) {
                    if (!school && !degree) {
                        throw new Error("At least school or degree should be specified");
                    }

                    var query = {
                        type: "education",
                        data: {}
                    };
                    var data = query.data;

                    ["school", "degree", "start", "end"].forEach(function(field, idx){
                        var val = arguments[idx];
                        if (val) {
                            data[field] = arguments[idx];
                        }
                    });

                    return query;
                },

                experienceQuery: function (company, title, start, end) {
                    if (!school && !degree) {
                        throw new Error("At least school or degree should be specified");
                    }

                    var query = {
                        type: "experience",
                        data: {}
                    };
                    var data = query.data;

                    ["company", "title", "start", "end"].forEach(function(field, idx){
                        var val = arguments[idx];
                        if (val) {
                            data[field] = arguments[idx];
                        }
                    });

                    return query;
                }

            };

            return queryBuilder;
        }
    ]);
