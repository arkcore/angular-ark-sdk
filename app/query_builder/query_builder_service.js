//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('ArkSDK')
    .factory('ArkQueryBuilder', [
        'ArkAvailableNetworks',
        function (ArkAvailableNetworks) {

            var _sexValues = ["male", "female", "other"];
            var _interestsTypes = ['books', 'film', 'games', 'movies', 'music', 'other'];
            var _suggestAllowedFields = [
                'fullName',
                'header',
                'languages',
                'education.degree',
                'education.school',
                'experience.company',
                'experience.title'
            ];
            var _networks = _.values(ArkAvailableNetworks);

            var queryBuilder = {

                idQuery: function (id) {
                    return {
                        type: "id",
                        data: { id: id }
                    };
                },

                allQuery: function (text) {
                    return {
                        type: "_all",
                        data: { text: text }
                    };
                },

                emailQuery: function (email) {
                    return {
                        type: "email",
                        data: { email: email }
                    };
                },

                networkAndIdQuery: function (network, id) {
                    if (_.indexOf(_networks, network) === -1) {
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

                placesQuery: function (place, type) {
                    if (!place) {
                        throw new Error('At least place has to be specified');
                    }

                    var query = {
                        type: "places",
                        data: {
                            place: place
                        }
                    };

                    if (type) {
                        query.data.type = type;
                    }

                    return query;
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
                        type: "languages",
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

                    var passedArgs = arguments.length;
                    var args = arguments;
                    var query = {
                        type: "education",
                        data: {}
                    };
                    var data = query.data;

                    ["school", "degree", "start", "end"].forEach(function(field, idx){
                        if (idx >= passedArgs) {
                            return;
                        }

                        var val = args[idx];
                        if (val) {
                            data[field] = val;
                        }
                    });

                    return query;
                },

                experienceQuery: function (company, title, start, end) {
                    if (!company && !title) {
                        throw new Error("At least company or title should be specified");
                    }
                    var passedArgs = arguments.length;
                    var args = arguments;
                    var query = {
                        type: "experience",
                        data: {}
                    };
                    var data = query.data;

                    ["company", "title", "start", "end"].forEach(function(field, idx){
                        if (idx >= passedArgs) {
                            return;
                        }

                        var val = args[idx];
                        if (val) {
                            data[field] = val;
                        }
                    });

                    return query;
                },

                interestsQuery: function (type, text) {

                    if (_interestsTypes.indexOf(type) === -1) {
                        throw new Error(type + " is not supported interest type");
                    }

                    return {
                        type: "interests",
                        data: {
                            type: type,
                            text: text
                        }
                    };
                },

                suggestQuery: function (field, text) {
                    if (_.indexOf(_suggestAllowedFields, field) === -1 ) {
                        throw new Error("Suggest field must be one of the: " + _suggestAllowedFields.join(','));
                    }

                    var fieldName = field + ".completion";
                    return {
                        field: fieldName,
                        text: text
                    };
                },

                suggestMultipleQuery: function (fields, text) {
                    if (!_.isArray(fields)) {
                        throw new Error("fields must be an Array");
                    }

                    var field;
                    var fieldNames = [];
                    for (var i = 0, l = fields.length; i < l; i++) {
                        field = fields[i];
                        if (_.indexOf(_suggestAllowedFields, field) === -1) {
                            throw new Error("Suggest field must be one of the: " + _suggestAllowedFields.join(','));
                        }
                        fieldNames.push(field + ".completion");
                    }

                    return {
                        fields: fieldNames,
                        text: text
                    };

                }

            };

            return queryBuilder;
        }
    ]);
