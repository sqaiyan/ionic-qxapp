angular.module('qx.controllers').controller('ServiceCtrl', function($scope, $http, $ionicLoading) {
		//获取服务列表
		$ionicLoading.show();
		$http({
			method: 'get',
			url: basepath + 'service/list3/?access_token=' + access_token
		}).success(function(data) {
			$ionicLoading.hide();
			$scope.service = data.data;
		}).error(function(a, b, c, d) {
			artDialog.alert(b)
			$ionicLoading.hide();
		});
	})
	.controller('shangmenctrl', function($scope, $state, $http, $ionicLoading) {
		//区享上门
		if (!access_token) {
			$state.go("login", {
				'from': $state.current.name
			});
			return;
		}
		$ionicLoading.show();
		$http({
			method: 'get',
			url: basepath + 'order/getDeliveryList/?access_token=' + access_token
		}).success(function(data) {
			$ionicLoading.hide();
			if (data.result_code == '0') {
				$scope.dlist = data.data;
			} else {
				artDialog.alert(data.result_dec);
			}
		}).error(function(a, b, c, d) {
			$ionicLoading.hide();
			artDialog.alert(b)
		})
	})