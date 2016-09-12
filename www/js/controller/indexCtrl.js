angular.module('qx.controllers').controller('MainCtrl', function($scope, $http, $ionicLoading, $location, $state, $wilddogArray, updateCart) { //首页
	$scope.navcur_id = 0; //当前被选择的类别
	$scope.models = {
		cart_propronum:0,
		cart_count:0
	}
	$scope.ad = $wilddogArray(ref.child("adv")); //广告
	var prolist = $wilddogArray(ref.child("prolist")); //商品列表
	$scope.navlist = $wilddogArray(ref.child("protype")); //类别
	$scope.baglist = $wilddogArray(ref.child("bag/" + access_token));
	$scope.baglist.$loaded().then(function() {
		$scope.models.cart_propronum=0;
		$scope.models.cart_count=0;
		$scope.baglist.forEach(function(i) {
			$scope.models.cart_count = $scope.models.cart_count + i.product_price * i.amount;
			$scope.models.cart_propronum = $scope.models.cart_propronum + i.amount * 1
		})
	});
	$scope.baglist.$watch(function(){
		$scope.models.cart_propronum=0;
		$scope.models.cart_count=0;
		$scope.baglist.forEach(function(i) {
			$scope.models.cart_count = $scope.models.cart_count + i.product_price * i.amount;
			$scope.models.cart_propronum = $scope.models.cart_propronum + i.amount * 1
		})
	})
	$scope.pl = prolist;
	$scope.navlist.$loaded().then(function(data) {
		$scope.navcur_id = data[0].$id;
		$scope.pl = prolist.filter(function(i) {
			return i.service_id == data[0].$id
		})
	});

	//切换导航
	$scope.togglenav = function(navid) {
		$scope.navcur_id = navid;
		$scope.pl = prolist.filter(function(i) {
			return i.service_id == navid
		})
	};
})