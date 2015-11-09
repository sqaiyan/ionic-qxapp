angular.module('qx.controllers').controller('MainCtrl', function($scope, $http, $ionicLoading, $location, $state, updateCart) { //首页
		$ionicLoading.show();
		$scope.cart_propronum = 0; //默认购物车没商品
		$scope.cart_count = 0; //默认金额0
		$scope.is_cart_showdetail = false; //默认不显示购物车里商品，点击图标显示
		$scope.openmsg = false; //信息开关
		$scope.navcur_id = 0; //当前被选择的类别
		$scope.proIncartPropronum = 0; //购物车中商品类别数量
		//商品类别
		$http({
			method: 'get',
			url: basepath + 'product/tlist3/?access_token=' + access_token
		}).success(function(data) {
			if (data.result_code == '0') {
				$scope.navlist = data.data;
				$scope.navcur_id = $scope.navcur_id ? $scope.navcur_id : $scope.navlist[0].service_id;
			} else {
				//artDialog.alert(data.result_dec);
			}
		});
		$scope.tad = function() {
			$scope.openmsg = !$scope.openmsg
		};
		//切换导航
		$scope.togglenav = function(navid) {
			$scope.navcur_id = navid;
		};
		//小区信息
		$http({
			method: 'get',
			url: basepath + 'community/contact/?access_token=' + access_token
		}).success(function(data) {
			if (data.result_code == '0') {
				$scope.area_name = data.data.community_nanme;
			}
		});
		//广告
		$http({
			method: 'get',
			url: basepath + 'service/ad3/?access_token=' + access_token + '&type=1'
		}).success(function(data) {
			if (data.result_code == '0') {
				$scope.ad = data.data;
			}
		});
		//所有商品列表
		$http({
			method: 'get',
			url: basepath + 'product/list3/?access_token=' + access_token
		}).success(function(data) {
			$ionicLoading.hide();
			$scope.prolist = data.data;
		}).error(function(a,b,c,d){
			$ionicLoading.hide();
			artDialog.tips(a)
		});
		//监视购物车内商品类别数量
		$scope.$watch('prolist', function(n, o, scope) {
			$scope.proIncartPropronum = 0;
			$scope.cart_propronum = 0;
			$scope.cart_count = 0;
			for (i in scope.prolist) {
				if ($scope.prolist[i].product_amount * 1 > 0) {
					$scope.proIncartPropronum++;
					$scope.cart_propronum = $scope.cart_propronum + $scope.prolist[i].product_amount * 1;
					$scope.cart_count = $scope.cart_count + $scope.prolist[i].product_amount * 1 * $scope.prolist[i].product_price;
				}
			}
		}, true);
		$scope.gosubpro = function() {
			//获取购物车列表
			$http({
				method: 'get',
				url: basepath + 'cart/list3/?access_token=' + access_token

			}).success(function(data) {
				if (data.result_dec == 'OK') {
					var clist = data.data;
					//称重商品跳转到购物车
					for (var i = 0; i < clist.length; i++) {
						if ('2' == clist[i].type) {
							$location.path('tab/bag');
							return;
						}
					};
					//普通商品提交
					var proidlist = [];
					angular.forEach($scope.prolist, function(data) {
						if (data.product_amount != '0') {
							proidlist.push(data.product_id);
						}
					});
					$location.path('suborder');
					$location.orderlist = proidlist.join(',');
				} else {
					artDialog.alert(data.result_dec)
				}
			}).error(function(a, b, c, d) {
				console.log(b);
			})
		}
	})