(function(){
  'use strict';

//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

angular.module('ArkSDK.config', [])
  // In the production mode you have to specify API key here
  .value('ArkAPIKey', 'your-ark-api-key')
  // list of available networks
  .constant('ArkAvailableNetworks', {
    'AngelList': 'angellist',
    'About.me': 'aboutme',
    'Behance': 'behance',
    'Blogger': 'blogger',
    'Care2.com': 'care2',
    'Cruncbase': 'crunchbase',
    'deviantART': 'deviantart',
    'Dribbble': 'dribbble',
    'Facebook': 'facebook',
    'Flavors.me': 'flavorsme',
    'Flickr': 'flickr',
    'FourSquare': 'foursquare',
    'GitHub': 'github',
    'Google+': 'googleplus',
    'Hacker News': 'hackernews',
    'Instagram': 'instagram',
    'Keek': 'keek',
    'Klout': 'klout',
    'Last.fm': 'lastfm',
    'LinkedIn': 'linkedin',
    'Meetup': 'meetup',
    'Newsle': 'newsle',
    'Pinterest': 'pinterest',
    '500px.com': '500px',
    'Quora': 'quora',
    'SoundCloud': 'soundcloud',
    'StackOverflow': 'stackoverflow',
    'Spotify': 'spotify',
    'Sprasivai.ru': 'sprashivairu',
    'Svpply': 'svpply',
    'Tumblr': 'tumblr',
    'Twitter': 'twitter',
    'VK': 'vk',
    'Vimeo': 'vimeo',
    'Wanelo': 'wanelo',
    'WordPress': 'wordpress',
    'Xing': 'xing',
    'Ya.ru': 'yaru',
    'Yelp': 'yelp',
    'Youtube': 'youtube'
  });


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
                        .tthen(function extractMultipleSuggest(data){
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
                            return dapta;
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
                        fieldsNames.push(field + ".completion");
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

})();
