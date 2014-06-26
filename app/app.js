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
