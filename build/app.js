(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./app/app.js":[function(require,module,exports){
//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

'use strict';

var main = require('./main/main_service.js');

module.exports = angular.module('ArkSDK', [
    main.name
]);

},{"./main/main_service.js":"/Users/vitaly/projects/angular-ark-sdk/app/main/main_service.js"}],"/Users/vitaly/projects/angular-ark-sdk/app/config.js":[function(require,module,exports){
'use strict';

var _ArkAPIKeyPlaceholder = 'your-ark-api-key';

module.exports = angular.module('ArkSDK.config', [])
    // In the production mode you have to specify API key here
    .value('ArkAPIKey', window._globalArkAPIKey || _ArkAPIKeyPlaceholder)
    // list of available networks
    .constant('ArkAvailableNetworks', {
        'AngelList': 'angellist',
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
        'Yelp': 'yelp',
        'Youtube': 'youtube'
    });

// for checks
module.exports._ArkAPIKeyPlaceholder = _ArkAPIKeyPlaceholder;

},{}],"/Users/vitaly/projects/angular-ark-sdk/app/main/ArkRestangular.js":[function(require,module,exports){
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

},{"../config.js":"/Users/vitaly/projects/angular-ark-sdk/app/config.js"}],"/Users/vitaly/projects/angular-ark-sdk/app/main/main_service.js":[function(require,module,exports){
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

},{"../config.js":"/Users/vitaly/projects/angular-ark-sdk/app/config.js","./ArkRestangular.js":"/Users/vitaly/projects/angular-ark-sdk/app/main/ArkRestangular.js","./query_builder_service.js":"/Users/vitaly/projects/angular-ark-sdk/app/main/query_builder_service.js"}],"/Users/vitaly/projects/angular-ark-sdk/app/main/query_builder_service.js":[function(require,module,exports){
//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

var config = require('../config.js');

module.exports = angular.module('ArkSDK.queryBuilder', [
        config.name
    ])
    .factory('ArkQueryBuilder', [
        'ArkAvailableNetworks',
        function (ArkAvailableNetworks) {

            var _sexValues = [ 'male', 'female', 'other' ];
            var _interestsTypes = [ 'books', 'film', 'games', 'movies', 'music', 'other' ];
            var _suggestAllowedFields = [
                'fullName',
                'header',
                'languages',
                'education.degree',
                'education.school',
                'experience.company',
                'experience.title',
                'interests.books.value.tag',
                'interests.film.value.tag',
                'interests.games.value.tag',
                'interests.movies.value.tag',
                'interests.music.value.tag',
                'interests.other.value.tag',
                'interests.spotify.artist',
                'interests.spotify.song'
            ];
            var _networks = _.values(ArkAvailableNetworks);
            var _allowedBatchRequests = [ 'email' ];

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

                networkIdQuery: function (id) {
                    if (!id) {
                      throw new Error('id must be defined');
                    }

                    var query = {
                        type: 'network_id_only',
                        data: {
                            id: id
                        }
                    };

                    return query;
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

                },

                /**
                 * [batchQuery description]
                 * @param {Array} requests - data to query for
                 * @param {String} type    - type of request {email}
                 */
                batchQuery: function (requests, type) {
                    if (_.indexOf(_allowedBatchRequests, type) === -1) {
                        throw new Error("Batch query supports only these types of requests: ", _allowedBatchRequests.join(','));
                    }

                    switch (type) {
                        case 'email':
                            // just send an array of emails
                            return requests;
                    }
                }

            };

            return queryBuilder;
        }
    ]);

},{"../config.js":"/Users/vitaly/projects/angular-ark-sdk/app/config.js"}]},{},["./app/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvYXBwLmpzIiwiYXBwL2NvbmZpZy5qcyIsImFwcC9tYWluL0Fya1Jlc3Rhbmd1bGFyLmpzIiwiYXBwL21haW4vbWFpbl9zZXJ2aWNlLmpzIiwiYXBwL21haW4vcXVlcnlfYnVpbGRlcl9zZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL1xuLy8gQ29weXJpZ2h0IChjKSAyMDE0IGJ5IEFyay5jb20uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4vLyBDcmVhdGVkIGJ5IFZpdGFseSBBbWluZXYgPHZAYW1pbmV2Lm1lPlxuLy9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWFpbiA9IHJlcXVpcmUoJy4vbWFpbi9tYWluX3NlcnZpY2UuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnQXJrU0RLJywgW1xuICAgIG1haW4ubmFtZVxuXSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfQXJrQVBJS2V5UGxhY2Vob2xkZXIgPSAneW91ci1hcmstYXBpLWtleSc7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ0Fya1NESy5jb25maWcnLCBbXSlcbiAgICAvLyBJbiB0aGUgcHJvZHVjdGlvbiBtb2RlIHlvdSBoYXZlIHRvIHNwZWNpZnkgQVBJIGtleSBoZXJlXG4gICAgLnZhbHVlKCdBcmtBUElLZXknLCB3aW5kb3cuX2dsb2JhbEFya0FQSUtleSB8fCBfQXJrQVBJS2V5UGxhY2Vob2xkZXIpXG4gICAgLy8gbGlzdCBvZiBhdmFpbGFibGUgbmV0d29ya3NcbiAgICAuY29uc3RhbnQoJ0Fya0F2YWlsYWJsZU5ldHdvcmtzJywge1xuICAgICAgICAnQW5nZWxMaXN0JzogJ2FuZ2VsbGlzdCcsXG4gICAgICAgICdCZWhhbmNlJzogJ2JlaGFuY2UnLFxuICAgICAgICAnQmxvZ2dlcic6ICdibG9nZ2VyJyxcbiAgICAgICAgJ0NhcmUyLmNvbSc6ICdjYXJlMicsXG4gICAgICAgICdDcnVuY2Jhc2UnOiAnY3J1bmNoYmFzZScsXG4gICAgICAgICdkZXZpYW50QVJUJzogJ2RldmlhbnRhcnQnLFxuICAgICAgICAnRHJpYmJibGUnOiAnZHJpYmJibGUnLFxuICAgICAgICAnRmFjZWJvb2snOiAnZmFjZWJvb2snLFxuICAgICAgICAnRmxhdm9ycy5tZSc6ICdmbGF2b3JzbWUnLFxuICAgICAgICAnRmxpY2tyJzogJ2ZsaWNrcicsXG4gICAgICAgICdGb3VyU3F1YXJlJzogJ2ZvdXJzcXVhcmUnLFxuICAgICAgICAnR2l0SHViJzogJ2dpdGh1YicsXG4gICAgICAgICdHb29nbGUrJzogJ2dvb2dsZXBsdXMnLFxuICAgICAgICAnSGFja2VyIE5ld3MnOiAnaGFja2VybmV3cycsXG4gICAgICAgICdJbnN0YWdyYW0nOiAnaW5zdGFncmFtJyxcbiAgICAgICAgJ0tlZWsnOiAna2VlaycsXG4gICAgICAgICdMYXN0LmZtJzogJ2xhc3RmbScsXG4gICAgICAgICdMaW5rZWRJbic6ICdsaW5rZWRpbicsXG4gICAgICAgICdNZWV0dXAnOiAnbWVldHVwJyxcbiAgICAgICAgJ05ld3NsZSc6ICduZXdzbGUnLFxuICAgICAgICAnUGludGVyZXN0JzogJ3BpbnRlcmVzdCcsXG4gICAgICAgICc1MDBweC5jb20nOiAnNTAwcHgnLFxuICAgICAgICAnUXVvcmEnOiAncXVvcmEnLFxuICAgICAgICAnU291bmRDbG91ZCc6ICdzb3VuZGNsb3VkJyxcbiAgICAgICAgJ1N0YWNrT3ZlcmZsb3cnOiAnc3RhY2tvdmVyZmxvdycsXG4gICAgICAgICdTcG90aWZ5JzogJ3Nwb3RpZnknLFxuICAgICAgICAnU3ByYXNpdmFpLnJ1JzogJ3NwcmFzaGl2YWlydScsXG4gICAgICAgICdTdnBwbHknOiAnc3ZwcGx5JyxcbiAgICAgICAgJ1R1bWJscic6ICd0dW1ibHInLFxuICAgICAgICAnVHdpdHRlcic6ICd0d2l0dGVyJyxcbiAgICAgICAgJ1ZLJzogJ3ZrJyxcbiAgICAgICAgJ1ZpbWVvJzogJ3ZpbWVvJyxcbiAgICAgICAgJ1dhbmVsbyc6ICd3YW5lbG8nLFxuICAgICAgICAnV29yZFByZXNzJzogJ3dvcmRwcmVzcycsXG4gICAgICAgICdYaW5nJzogJ3hpbmcnLFxuICAgICAgICAnWWVscCc6ICd5ZWxwJyxcbiAgICAgICAgJ1lvdXR1YmUnOiAneW91dHViZSdcbiAgICB9KTtcblxuLy8gZm9yIGNoZWNrc1xubW9kdWxlLmV4cG9ydHMuX0Fya0FQSUtleVBsYWNlaG9sZGVyID0gX0Fya0FQSUtleVBsYWNlaG9sZGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnLmpzJyk7XG5cbi8vIE1ha2Ugc3VyZSB0byBpbmNsdWRlIHJlc3Rhbmd1bGFyIGluIHlvdXIgb3duIHByb2plY3Rcbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ0Fya1NESy5yZXN0YW5ndWxhcicsIFtcbiAgICAgICAgJ3Jlc3Rhbmd1bGFyJ1xuICAgIF0pXG4gICAgLmZhY3RvcnkoJ0Fya1Jlc3Rhbmd1bGFyJywgW1xuICAgICAgICAnUmVzdGFuZ3VsYXInLFxuICAgICAgICAnQXJrQVBJS2V5JyxcbiAgICAgICAgZnVuY3Rpb24gKFJlc3Rhbmd1bGFyLCBBcmtBUElLZXkpIHtcblxuICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLndpdGhDb25maWcoZnVuY3Rpb24gKFJlc3Rhbmd1bGFyQ29uZmlndXJlcikge1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZy5fQXJrQVBJS2V5UGxhY2Vob2xkZXIgIT09IEFya0FQSUtleSkge1xuICAgICAgICAgICAgICAgICAgICBSZXN0YW5ndWxhckNvbmZpZ3VyZXIuc2V0RGVmYXVsdEhlYWRlcnMoe1wieC1hcmstdG9rZW5cIjogQXJrQVBJS2V5fSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gb3RoZXJ3aXNlXG4gICAgICAgICAgICAgICAgLy8gdmFyIHdhcm4gPSAgJ1BsZWFzZSwgc3BlY2lmeSB5b3VyIG93biBBUEkgS0VZXFxuJyArXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgJ0l0IGNhbiBiZSBkb25lIGJ5IGFkZGluZyB0aGlzIGNvZGUgdG8geW91ciBtb2R1bGVcXG4nICtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAnYW5ndWxhci5tb2R1bGUoXFwnQXJrU0RLLmNvbmZpZ1xcJykuY29uZmlnKFtcIiRwcm92aWRlXCIsIGZ1bmN0aW9uICgkcHJvdmlkZSkge1xcbicgK1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICcgJHByb3ZpZGUuZGVjb3JhdG9yKFxcJ0Fya0FQSUtleVxcJywgZnVuY3Rpb24gKCkge1xcbicgK1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICcgICByZXR1cm4gXFwncmVhbC1hcmstdG9rZW5cXCc7XFxuJyArXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgJyB9KTtcXG4nICtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAnfV0pO1xcbicgK1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAnT3IgYnkgc2V0dGluZyBgd2luZG93Ll9nbG9iYWxBcmtBUElLZXkgPSBgeW91ci1hcnBpLWtleWA7JztcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKHdhcm4pO1xuXG4gICAgICAgICAgICAgICAgUmVzdGFuZ3VsYXJDb25maWd1cmVyLnNldEJhc2VVcmwoJ2h0dHBzOi8vbmcuYXJrLmNvbS9hcGkvMScpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgeW91IG5lZWQgdG8gZGlzYWJsZSBjYWNoaW5nIC0gZG8gaXQgaGVyZVxuICAgICAgICAgICAgICAgIFJlc3Rhbmd1bGFyQ29uZmlndXJlci5zZXREZWZhdWx0SHR0cEZpZWxkcyh7Y2FjaGU6IHRydWV9KTtcblxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgIH1cblxuICAgIF0pO1xuIiwiLy9cbi8vIENvcHlyaWdodCAoYykgMjAxNCBieSBBcmsuY29tLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy8gQ3JlYXRlZCBieSBWaXRhbHkgQW1pbmV2IDx2QGFtaW5ldi5tZT5cbi8vXG5cbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcuanMnKTtcbnZhciBBcmtSZXN0YW5ndWxhciA9IHJlcXVpcmUoJy4vQXJrUmVzdGFuZ3VsYXIuanMnKTtcbnZhciBBcmtRdWVyeUJ1aWxkZXIgPSByZXF1aXJlKCcuL3F1ZXJ5X2J1aWxkZXJfc2VydmljZS5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdBcmtTREsubWFpbicsIFtcbiAgICAgICAgY29uZmlnLm5hbWUsXG4gICAgICAgIEFya1Jlc3Rhbmd1bGFyLm5hbWUsXG4gICAgICAgIEFya1F1ZXJ5QnVpbGRlci5uYW1lXG4gICAgXSlcbiAgICAuZmFjdG9yeSgnQXJrQXBpJywgW1xuICAgICAgICAnQXJrUmVzdGFuZ3VsYXInLFxuICAgICAgICAnJHEnLFxuICAgICAgICAnQXJrQXZhaWxhYmxlTmV0d29ya3MnLFxuICAgICAgICAnQXJrUXVlcnlCdWlsZGVyJyxcbiAgICAgICAgZnVuY3Rpb24gKFJlc3Rhbmd1bGFyLCAkcSwgQXJrQXZhaWxhYmxlTmV0d29ya3MsIEFya1F1ZXJ5QnVpbGRlcikge1xuXG4gICAgICAgICAgICB2YXIgc2VydmljZSA9IHtcblxuICAgICAgICAgICAgICAgIGZpbmRCeUVtYWlsOiBmdW5jdGlvbiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLm9uZShcImVtYWlsXCIsIGVtYWlsKS5nZXQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fZXh0cmFjdFJlc3BvbnNlKHRydWUpLCB0aGlzLl9oYW5kbGVFcnJvcik7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGZpbmRCeU5ldHdvcmtBbmRJZDogZnVuY3Rpb24gKG5ldHdvcmssIGlkLCBwYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IEFya1F1ZXJ5QnVpbGRlci5uZXR3b3JrQW5kSWRRdWVyeShuZXR3b3JrLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlYXJjaChxdWVyeSwgcGFnZSk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGdldEJhdGNoOiBmdW5jdGlvbiAocmVxdWVzdHMsIHR5cGUsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gQXJrUXVlcnlCdWlsZGVyLmJhdGNoUXVlcnkocmVxdWVzdHMsIHR5cGUpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmF0Y2gocXVlcnksIHR5cGUsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGZpbmRCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIub25lKFwic2VhcmNoXCIsIGlkKS5nZXQoKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ2V0UmFuZG9tOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLmFsbChcInJhbmRvbVwiKS5jdXN0b21HRVQoKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgYmF0Y2g6IGZ1bmN0aW9uIChjb21tYW5kcywgdHlwZSwgY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSZXN0YW5ndWxhci5hbGwoXCJzZWFyY2gvYmF0Y2gvXCIgKyB0eXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhIdHRwQ29uZmlnKGNvbmZpZylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3N0KGNvbW1hbmRzKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBmdW5jdGlvbiAoY29tbWFuZHMsIHBhZ2UsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBhZGQgbW9kZSBzdXBwb3J0XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHsgcXVlcnk6IGNvbW1hbmRzIH07XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UgPSBwYWdlIHx8IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKFwic2VhcmNoXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAud2l0aEh0dHBDb25maWcoY29uZmlnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc3QocXVlcnksIHsgcGFnZTogcGFnZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4odGhpcy5fZXh0cmFjdFJlc3BvbnNlKGZhbHNlKSwgdGhpcy5faGFuZGxlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBzdWdnZXN0TXVsdGlwbGU6IGZ1bmN0aW9uIChmaWVsZHMsIHRleHQsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSBBcmtRdWVyeUJ1aWxkZXIuc3VnZ2VzdE11bHRpcGxlUXVlcnkoZmllbGRzLCB0ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSZXN0YW5ndWxhci5hbGwoXCJzdWdnZXN0XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAud2l0aEh0dHBDb25maWcoY29uZmlnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnBvc3QocXVlcnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiBleHRyYWN0TXVsdGlwbGVTdWdnZXN0KGRhdGEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGFkZCBhcHByb3ByaWF0ZSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMuX2hhbmRsZUVycm9yKTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgc3VnZ2VzdDogZnVuY3Rpb24gKGZpZWxkLCB0ZXh0LCBjb25maWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0gQXJrUXVlcnlCdWlsZGVyLnN1Z2dlc3RRdWVyeShmaWVsZCwgdGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIuYWxsKFwic3VnZ2VzdFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgLndpdGhIdHRwQ29uZmlnKGNvbmZpZylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wb3N0KHF1ZXJ5KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gZXh0cmFjdFN1Z2dlc3QoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvIGFueSB0cmFuc2Zvcm1hdGlvbnMgaWYgbmVlZCBiZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcy5faGFuZGxlRXJyb3IpO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAvLyBleHRyYWN0cyByZXNwb25zZSBvdXQgb2YgdGhlIG1ldGEgaW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICBfZXh0cmFjdFJlc3BvbnNlOiBmdW5jdGlvbiAoc2luZ2xlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNpbmdsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhLnJlc3VsdHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBfaGFuZGxlRXJyb3I6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGVyciwgbXNnO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXJyRGF0YSA9IGRhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyckRhdGEgJiYgdHlwZW9mIGVyckRhdGEgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSBlcnJEYXRhLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IobXNnIHx8ICdVbmtub3duIEVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIGVyci5zdGF0dXMgPSBkYXRhLnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIF8uYmluZEFsbChzZXJ2aWNlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2U7XG4gICAgICAgIH1cbiAgICBdKTtcbiIsIi8vXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTQgYnkgQXJrLmNvbS4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbi8vIENyZWF0ZWQgYnkgVml0YWx5IEFtaW5ldiA8dkBhbWluZXYubWU+XG4vL1xuXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ0Fya1NESy5xdWVyeUJ1aWxkZXInLCBbXG4gICAgICAgIGNvbmZpZy5uYW1lXG4gICAgXSlcbiAgICAuZmFjdG9yeSgnQXJrUXVlcnlCdWlsZGVyJywgW1xuICAgICAgICAnQXJrQXZhaWxhYmxlTmV0d29ya3MnLFxuICAgICAgICBmdW5jdGlvbiAoQXJrQXZhaWxhYmxlTmV0d29ya3MpIHtcblxuICAgICAgICAgICAgdmFyIF9zZXhWYWx1ZXMgPSBbICdtYWxlJywgJ2ZlbWFsZScsICdvdGhlcicgXTtcbiAgICAgICAgICAgIHZhciBfaW50ZXJlc3RzVHlwZXMgPSBbICdib29rcycsICdmaWxtJywgJ2dhbWVzJywgJ21vdmllcycsICdtdXNpYycsICdvdGhlcicgXTtcbiAgICAgICAgICAgIHZhciBfc3VnZ2VzdEFsbG93ZWRGaWVsZHMgPSBbXG4gICAgICAgICAgICAgICAgJ2Z1bGxOYW1lJyxcbiAgICAgICAgICAgICAgICAnaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAnbGFuZ3VhZ2VzJyxcbiAgICAgICAgICAgICAgICAnZWR1Y2F0aW9uLmRlZ3JlZScsXG4gICAgICAgICAgICAgICAgJ2VkdWNhdGlvbi5zY2hvb2wnLFxuICAgICAgICAgICAgICAgICdleHBlcmllbmNlLmNvbXBhbnknLFxuICAgICAgICAgICAgICAgICdleHBlcmllbmNlLnRpdGxlJyxcbiAgICAgICAgICAgICAgICAnaW50ZXJlc3RzLmJvb2tzLnZhbHVlLnRhZycsXG4gICAgICAgICAgICAgICAgJ2ludGVyZXN0cy5maWxtLnZhbHVlLnRhZycsXG4gICAgICAgICAgICAgICAgJ2ludGVyZXN0cy5nYW1lcy52YWx1ZS50YWcnLFxuICAgICAgICAgICAgICAgICdpbnRlcmVzdHMubW92aWVzLnZhbHVlLnRhZycsXG4gICAgICAgICAgICAgICAgJ2ludGVyZXN0cy5tdXNpYy52YWx1ZS50YWcnLFxuICAgICAgICAgICAgICAgICdpbnRlcmVzdHMub3RoZXIudmFsdWUudGFnJyxcbiAgICAgICAgICAgICAgICAnaW50ZXJlc3RzLnNwb3RpZnkuYXJ0aXN0JyxcbiAgICAgICAgICAgICAgICAnaW50ZXJlc3RzLnNwb3RpZnkuc29uZydcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB2YXIgX25ldHdvcmtzID0gXy52YWx1ZXMoQXJrQXZhaWxhYmxlTmV0d29ya3MpO1xuICAgICAgICAgICAgdmFyIF9hbGxvd2VkQmF0Y2hSZXF1ZXN0cyA9IFsgJ2VtYWlsJyBdO1xuXG4gICAgICAgICAgICB2YXIgcXVlcnlCdWlsZGVyID0ge1xuXG4gICAgICAgICAgICAgICAgaWRRdWVyeTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IGlkOiBpZCB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGFsbFF1ZXJ5OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJfYWxsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7IHRleHQ6IHRleHQgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBlbWFpbFF1ZXJ5OiBmdW5jdGlvbiAoZW1haWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZW1haWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHsgZW1haWw6IGVtYWlsIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgbmV0d29ya0lkUXVlcnk6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpZCBtdXN0IGJlIGRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICduZXR3b3JrX2lkX29ubHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgbmV0d29ya0FuZElkUXVlcnk6IGZ1bmN0aW9uIChuZXR3b3JrLCBpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pbmRleE9mKF9uZXR3b3JrcywgbmV0d29yaykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobmV0d29yayArIFwiIGlzIG5vdCBpbiB0aGUgbGlzdCBvZiBhdmFpbGFibGUgbmV0d29ya3NcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm5ldHdvcmtfaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXR3b3JrOiBuZXR3b3JrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldHdvcmtfaWQ6IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBwbGFjZXNRdWVyeTogZnVuY3Rpb24gKHBsYWNlLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghcGxhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXQgbGVhc3QgcGxhY2UgaGFzIHRvIGJlIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJwbGFjZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZTogcGxhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnkuZGF0YS50eXBlID0gdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBxdWVyeTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgc2V4UXVlcnk6IGZ1bmN0aW9uIChzZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaW5kZXhPZihfc2V4VmFsdWVzLCBzZXgpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiT25seSBcIiArIF9zZXhWYWx1ZXMuam9pbihcIixcIikgKyBcIiBhcmUgc3VwcG9ydGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwic2V4XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V4OiBzZXhcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgbGFuZ3VhZ2VRdWVyeTogZnVuY3Rpb24gKGxhbmd1YWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxhbmd1YWdlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBmdWxsTmFtZVF1ZXJ5OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJmdWxsX25hbWVfZXhhY3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsTmFtZTogbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBmdWxsTmFtZVBhcnRpYWxRdWVyeTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZnVsbF9uYW1lX3BhcnRpYWxfdHJhbnNsaXRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsTmFtZTogbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBlZHVjYXRpb25RdWVyeTogZnVuY3Rpb24gKHNjaG9vbCwgZGVncmVlLCBzdGFydCwgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc2Nob29sICYmICFkZWdyZWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF0IGxlYXN0IHNjaG9vbCBvciBkZWdyZWUgc2hvdWxkIGJlIHNwZWNpZmllZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXNzZWRBcmdzID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiZWR1Y2F0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHF1ZXJ5LmRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgW1wic2Nob29sXCIsIFwiZGVncmVlXCIsIFwic3RhcnRcIiwgXCJlbmRcIl0uZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgaWR4KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZHggPj0gcGFzc2VkQXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGFyZ3NbaWR4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkXSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBleHBlcmllbmNlUXVlcnk6IGZ1bmN0aW9uIChjb21wYW55LCB0aXRsZSwgc3RhcnQsIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBhbnkgJiYgIXRpdGxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBdCBsZWFzdCBjb21wYW55IG9yIHRpdGxlIHNob3VsZCBiZSBzcGVjaWZpZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBhc3NlZEFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHF1ZXJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJleHBlcmllbmNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7fVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHF1ZXJ5LmRhdGE7XG5cbiAgICAgICAgICAgICAgICAgICAgW1wiY29tcGFueVwiLCBcInRpdGxlXCIsIFwic3RhcnRcIiwgXCJlbmRcIl0uZm9yRWFjaChmdW5jdGlvbihmaWVsZCwgaWR4KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZHggPj0gcGFzc2VkQXJncykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGFyZ3NbaWR4XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkXSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBpbnRlcmVzdHNRdWVyeTogZnVuY3Rpb24gKHR5cGUsIHRleHQpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoX2ludGVyZXN0c1R5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZSArIFwiIGlzIG5vdCBzdXBwb3J0ZWQgaW50ZXJlc3QgdHlwZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImludGVyZXN0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICBzdWdnZXN0UXVlcnk6IGZ1bmN0aW9uIChmaWVsZCwgdGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pbmRleE9mKF9zdWdnZXN0QWxsb3dlZEZpZWxkcywgZmllbGQpID09PSAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN1Z2dlc3QgZmllbGQgbXVzdCBiZSBvbmUgb2YgdGhlOiBcIiArIF9zdWdnZXN0QWxsb3dlZEZpZWxkcy5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkTmFtZSA9IGZpZWxkICsgXCIuY29tcGxldGlvblwiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGZpZWxkTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgc3VnZ2VzdE11bHRpcGxlUXVlcnk6IGZ1bmN0aW9uIChmaWVsZHMsIHRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzQXJyYXkoZmllbGRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZmllbGRzIG11c3QgYmUgYW4gQXJyYXlcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZE5hbWVzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZmllbGRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQgPSBmaWVsZHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pbmRleE9mKF9zdWdnZXN0QWxsb3dlZEZpZWxkcywgZmllbGQpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlN1Z2dlc3QgZmllbGQgbXVzdCBiZSBvbmUgb2YgdGhlOiBcIiArIF9zdWdnZXN0QWxsb3dlZEZpZWxkcy5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGROYW1lcy5wdXNoKGZpZWxkICsgXCIuY29tcGxldGlvblwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IGZpZWxkTmFtZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogW2JhdGNoUXVlcnkgZGVzY3JpcHRpb25dXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHtBcnJheX0gcmVxdWVzdHMgLSBkYXRhIHRvIHF1ZXJ5IGZvclxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlICAgIC0gdHlwZSBvZiByZXF1ZXN0IHtlbWFpbH1cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBiYXRjaFF1ZXJ5OiBmdW5jdGlvbiAocmVxdWVzdHMsIHR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaW5kZXhPZihfYWxsb3dlZEJhdGNoUmVxdWVzdHMsIHR5cGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmF0Y2ggcXVlcnkgc3VwcG9ydHMgb25seSB0aGVzZSB0eXBlcyBvZiByZXF1ZXN0czogXCIsIF9hbGxvd2VkQmF0Y2hSZXF1ZXN0cy5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdlbWFpbCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBzZW5kIGFuIGFycmF5IG9mIGVtYWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHF1ZXJ5QnVpbGRlcjtcbiAgICAgICAgfVxuICAgIF0pO1xuIl19
