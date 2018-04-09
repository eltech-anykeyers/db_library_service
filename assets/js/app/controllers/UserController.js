(function () {
    'use strict'

    angular.module('Library').controller('UserController', UserController);

    UserController.$inject = ['$scope', '$uibModal', 'User'];
    function UserController($scope, $uibModal, User) {
        $scope.users = [];
        $scope.usersParams = new User();
        /* $scope.maxPrintCount = 50;
        $scope.currentListUsers = 1;

        $scope.listNext = function () {
            if ($scope.currentListUsers < $scope.maxNumberList) {
                $scope.currentListUsers++;
            }
        } */

        $scope.search = function () {
            $scope.usersParams.search(function callbackUsers(users) {
                $scope.users = users;
            });
        }

        $scope.updateUser = function (user) {
            var uibModalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/update-user.html',
                controller: 'ModalUserController',
                size: 'lg',
                resolve: {
                    user: user
                }
            });
        }

        $scope.removeUser = function (user) {
            var uibModalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/modals/delete-user.html',
                controller: 'ModalRemoveController',
                size: 'sm',
                resolve: {
                    obj: user,
                    callbackRemove: {
                        run: function callbackRemove() {
                            let index = $scope.users.indexOf(user);
                            if (index !== -1) {
                                $scope.users.splice(index, 1);
                            }
                        }
                    }
                }
            });
        }
    }
})();