define(['controllers/controllers'], function (controllers) {
    'use strict';
    controllers.controller('PendinglistCtr', ['$scope', 'pendinglistSvc',
    function ($scope, data) {
        $scope.name = data.name;

    }]);
});
