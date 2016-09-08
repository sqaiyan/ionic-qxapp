angular.module('qx.controllers').controller('MainCtrl', function($scope, $http, $ionicLoading, $location, $state, $wilddogArray, updateCart) { //首页
	//$ionicLoading.show();
	$scope.cart_propronum = 0; //默认购物车没商品
	$scope.cart_count = 0; //默认金额0
	$scope.is_cart_showdetail = false; //默认不显示购物车里商品，点击图标显示
	$scope.openmsg = false; //信息开关
	$scope.navcur_id = 0; //当前被选择的类别
	$scope.proIncartPropronum = 0; //购物车中商品类别数量

	$scope.ad = $wilddogArray(ref.child("adv")); //广告
	var prolist = $wilddogArray(ref.child("prolist")); //商品列表
	$scope.navlist = $wilddogArray(ref.child("protype")); //类别
	$scope.baglist = $wilddogArray(ref.child("bag/" + access_token));
	$scope.baglist.$loaded();
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