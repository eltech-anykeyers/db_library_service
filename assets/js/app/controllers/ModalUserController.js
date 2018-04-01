(function () {
    'use strict'

    angular.module('Library').controller('ModalUserController', ModalUserController);

    ModalUserController.$inject = ['$scope', '$uibModalInstance', 'user', 'User'];
    function ModalUserController($scope, $uibModalInstance, user, User) {
        // пересоздаю пользователя, для того что бы не затереть старые данные
        $scope.user = new User(user);

        // обновление данных
        $scope.update = function () {
            if ($scope.user.isAvailable()) {
                $scope.user.update(function (OkPacket, err) {
                    if (err) {
                        $scope.user.error = err;
                        return
                    }
                    
                    if (!OkPacket) {
                        $scope.user.error = 'Изменения не полученны!!';
                        return
                    }

                    user.setData($scope.user);
                    $uibModalInstance.close(user);
                });
            }
        }

        // отмена
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();