//
// Copyright (c) 2014 by Ark.com. All Rights Reserved.
// Created by Vitaly Aminev <v@aminev.me>
//

'use strict';

var main = require('./main/main_service.js');

module.exports = angular.module('ArkSDK', [
    main.name
]);
