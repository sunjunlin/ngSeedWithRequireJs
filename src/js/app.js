define([
  'angular',
  'angular-router',
   'angular-resource',
   'controllers/controllers',
   'services/services',
   'filters/filters'
],
  function (angular) {
      'use strict';
   
      var app = angular.module('wxApp', ['ngRoute', 'controllers', 'services', 'filters']);
      app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
          $routeProvider.when('/PendingList/', {
              templateUrl: 'partials/about.html',
              controller: 'PendinglistCtr'
          }).otherwise({
              redirectTo: '/PendingList'
          });

      }]);
      return app;
  });
