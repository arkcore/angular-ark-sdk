//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

var _ArkAPIKeyPlaceholder = 'your-ark-api-key';

angular.module('ArkSDK.config', [])
  // In the production mode you have to specify API key here
  .constant('ArkAPIKey', _ArkAPIKeyPlaceholder)
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

        if (_ArkAPIKeyPlaceholder !== ArkAPIKey) {
          RestangularConfigurer.setDefaultHeaders({"x-ark-token": ArkAPIKey});
        } else {
          console.error('Please, specify your own API KEY');
          // It can be done by adding this code to your module
          // angular.module('ArkSDK.config').config(["$provide", function ($provide) {
          //     $provide.decorator("ArkAPIKey", function () {
          //          return "real-ark-token";
          //     });
          // }]);
        }

        RestangularConfigurer.setBaseUrl('https://ng.ark.com/api/1');

        // If you need to disable caching - do it here
        RestangularConfigurer.setDefaultHttpFields({cache: true});
      });
    }
  ]);
