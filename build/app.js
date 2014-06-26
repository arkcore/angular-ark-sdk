(function(){
  'use strict';

//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('ArkSDK.config', [])
  // In the production mode you have to specify API key here
  .constant('ArkAPIKey', 'your-ark-api-key')
  // list of available networks
  .constant('ArkAvailableNetworks', [
    'angellist',
    'aboutme',
    'ark',
    'behance',
    'blogger',
    'care2',
    'crunchbase',
    'deviantart',
    'dribbble',
    'emailcrawler',
    'facebook',
    'flavorsme',
    'flickr',
    'foursquare',
    'github',
    'googleplus',
    'hackernews',
    'instagram',
    'keek',
    'klout',
    'lastfm',
    'linkedin',
    'meetup',
    'newsle',
    'pinterest',
    '500px',
    'quora',
    'soundcloud',
    'stackoverflow',
    'spotify',
    'sprashivairu',
    'svpply',
    'tumblr',
    'twitter',
    'vk',
    'vimeo',
    'wanelo',
    'wordpress',
    'xing',
    'yaru',
    'yelp',
    'youtube'
  ]);


angular.module('ArkSDK', [
    'restangular',
    'ArkSDK.config'
  ]);

// Restangular service that uses Bing
angular.module('ArkSDK')
  .factory('ArkRestangular', [
    'Restangular',
    'ArkAPIKey',
    function (Restangular, ArkAPIKey) {
      return Restangular.withConfig(function(RestangularConfigurer) {

        RestangularConfigurer.setDefaultHeaders({"x-ark-token": ArkAPIKey});
        RestangularConfigurer.setBaseUrl('https://ng.ark.com/api/1');

        // If you need to disable caching - do it here
        RestangularConfigurer.setDefaultHttpFields({cache: true});
      });
    }
  ]);

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

                search: function (commands, page) {
                    // TODO: add mode support
                    var query = { query: commands };
                    page = page || 0;

                    return Restangular.all("search").post(query, { page: page })
                        .then(this._extractResponse(false), this._handleError);
                },

                suggest: function (field, text) {
                    var query = ArkQueryBuilder.suggestQuery(field, text);

                    return Restangular.all("search/suggest").post(query)
                        .then(function extractSuggest(data) {
                            // do any transformations if need be
                            return data;
                        }, this._handleError);
                },

                // extracts response out of the meta information
                _extractResponse: function (single) {
                    signle = single || false;
                    return function (data) {
                        if (single) {
                            return data.results[0];
                        } else {
                            return { total: data.total, results: data.results };
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

//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('ArkSDK')
    .factory('ArkQueryBuilder', [
        'ArkAvailableNetworks',
        function (ArkAvailableNetworks) {

            var _sexValues = ["male", "female", "other"];
            var _suggestAllowedFields = [
                'fullName',
                'header',
                'languages',
                'education.degree',
                'education.school',
                'experience.company',
                'experience.title'
            ];

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
                }

            };

            return queryBuilder;
        }
    ]);

})();
