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
