 
/* Filters */
define(['filters/filters'], function (filters) {
    'use strict';
    filters.filter('checkmark', function () {
        return function (input) {
            return input ? '\u2713' : '\u2718';
        };
    });
});

 