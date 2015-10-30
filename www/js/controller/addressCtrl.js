angular.module('qx.controllers').controller('AddressCtrl', function($scope, $http, $state, $location, updateCart) {
	$scope.map = new BMap.Map('map');
	var geolocationControl = new BMap.GeolocationControl();
	$scope.map.addControl(geolocationControl);
	$scope.map.centerAndZoom("上海市", 14);
	try {
		if (navigator.userAgent.indexOf('Android') > -1) {
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r) {
				if (this.getStatus() == BMAP_STATUS_SUCCESS) {
					alert('定位成功')
					$scope.map.centerAndZoom(r.point, 18);
				} else {
					alert('正常定位失败')
				}
			}, function(e) {
				alert(e + '定位失败')
			}, {
				enableHighAccuracy: true,
				timeout: 3000
			})

		} else {
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r) {
				if (this.getStatus() == BMAP_STATUS_SUCCESS) {
					$scope.map.centerAndZoom(r.point, 18);
				} else {
					alert('正常定位失败')
				}
			}, function(e) {
				alert(e)
			}, {
				enableHighAccuracy: true,
				timeout: 3000
			});
		}
	} catch (e) {
		alert(e + 'catch')
	}
})