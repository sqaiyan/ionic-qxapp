angular.module('qx.controllers').controller('AddressCtrl', function($scope, $http, $state, $location, updateCart) {
	$scope.map = new BMap.Map('map');
	var geolocationControl = new BMap.GeolocationControl();
	$scope.map.addControl(geolocationControl);
		if (ionic.Platform.isAndroid()) {
			try {
				window.LocationPlugin.getLocation(function(pos) {
				//window.locationService.getCurrentPosition(function(pos){
					console.log(pos);
					alert(pos.longitude)
				$scope.map.centerAndZoom(new BMap.Point(pos.longitude, pos.latitude), 18);
				//$scope.map.centerAndZoom(new BMap.Point(pos.coords.longitude, pos.coords.latitude), 18);
				}, function(msg) {
					console.log("错误消息：" + msg);
				});
			} catch (e) {
				console.log(e);
				//alert(e + '异常')
			}
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
			});
		}
})