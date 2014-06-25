//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
// 


angular.module('angular-ark-sdk', [ 'Restangular' ])
  .config([
    "RestangularProvider",
    "ArkAPIKey",
    function (RestangularProvider, ArkAPIKey) {

      RestangularProvider.setDefaultHeaders({"x-ark-token": ArkAPIKey});
      RestangularProvider.setBaseUrl('https://ng.ark.com/api/1');

      // If you need to disable caching - do it here
      RestangularProvider.setDefaultHttpFields({cache: true});

  }]);

// In the production mode you have to specify API key here
angular.module('angular-ark-sdk')
  .value("ArkAPIKey", "your-ark-api-key");

// list of available networks
angular.module('angular-ark-sdk')
  .constant("ArkAvailableNetworks", [
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
