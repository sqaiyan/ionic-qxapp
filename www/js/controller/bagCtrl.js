angular.module('qx.controllers').controller('bagCtrl', function($scope, $http, $state, $location, updateCart) {
		//购物袋
		if (!access_token) {
			$state.go("login", {
				'from': $state.current.name
			});
			return;
		};
		$scope.models = {};
		$scope.models.cart_count = $scope.models.price_count = 0; //商品数量和总价
		$scope.checkall = false;
		$scope.$watch('models.commonpro', function() {
			$scope.models.cart_count = $scope.models.price_count = 0;
			for (i in $scope.models.commonpro) {
				if ($scope.models.commonpro[i].selected == 'true') {
					$scope.models.cart_count++;
					var procountprice = $scope.models.commonpro[i].product_amount * 1 * $scope.models.commonpro[i].product_price;
					if ($scope.models.commonpro[i].wholesale_price) {
						procountprice = (procountprice >= $scope.models.commonpro[i].wholesale_price.split('|')[0] * 1) ? (procountprice - $scope.models.commonpro[i].wholesale_price.split('|')[1]) : procountprice;
					}
					$scope.models.price_count = $scope.models.price_count + procountprice;
				} else {
					$scope.models.checkall = false;
				}
			};
			for (i in $scope.models.weightpro) {
				if ($scope.models.weightpro[i].selected == 'true') {
					$scope.cart_count++;
					var procountprice = $scope.models.weightpro[i].product_amount * 1 * $scope.weightpro[i].product_price;
					if ($scope.models.weightpro[i].wholesale_price) {
						procountprice = (procountprice >= $scope.models.weightpro[i].wholesale_price.split('|')[0] * 1) ? (procountprice - $scope.models.weightpro[i].wholesale_price.split('|')[1]) : procountprice;
					}
					$scope.models.price_count = $scope.models.price_count + procountprice;
				} else {
					if ($scope.models.weightpro[i].status == '3') {
						if ($scope.models.weightpro[i].selected == 'false') {
							$scope.models.checkall = false;
						}
					}
				}
			}
		}, true);
		$scope.$watch('models.weightpro', function() {
			$scope.models.cart_count = $scope.models.price_count = 0;
			for (i in $scope.models.commonpro) {
				if ($scope.models.commonpro[i].selected == 'true') {
					$scope.models.cart_count++;
					var procountprice = $scope.models.commonpro[i].product_amount * 1 * $scope.models.commonpro[i].product_price;
					if ($scope.models.commonpro[i].wholesale_price) {
						procountprice = (procountprice >= $scope.models.commonpro[i].wholesale_price.split('|')[0] * 1) ? (procountprice - $scope.models.commonpro[i].wholesale_price.split('|')[1]) : procountprice;
					}
					$scope.models.price_count = $scope.models.price_count + procountprice;
				} else {
					$scope.models.checkall = false;
				}
			};
			for (i in $scope.models.weightpro) {
				if ($scope.models.weightpro[i].selected == 'true') {
					$scope.models.cart_count++;
					var procountprice = $scope.models.weightpro[i].product_amount * 1 * $scope.weightpro[i].product_price;
					if ($scope.models.weightpro[i].wholesale_price) {
						procountprice = (procountprice >= $scope.models.weightpro[i].wholesale_price.split('|')[0] * 1) ? (procountprice - $scope.models.weightpro[i].wholesale_price.split('|')[1]) : procountprice;
					}
					$scope.models.price_count = $scope.models.price_count + procountprice;
				} else {
					if (($scope.models.weightpro[i].status == '3') && ($scope.models.weightpro[i].selected == 'false')) {
						$scope.models.checkall = false;
					}
				}
			}
		}, true);
		//标签转换
		$scope.transtags = function(o, i) {
			return o & (1 << i);
		};
		//全选
		$scope.selectall = function() {
			if (!$scope.models.checkall) {
				for (i in $scope.models.weightpro) {
					if ($scope.models.weightpro[i].status == '3') {
						$scope.models.weightpro[i].selected = 'true';
					}
				};
				for (i in $scope.models.commonpro) {
					$scope.models.commonpro[i].selected = 'true';
				}
				$scope.models.checkall = true;
			} else {
				$scope.models.checkall = false;
			}
		};
		$scope.getbagdata = function() {
			//购物车数据
			$http({
				method: 'get',
				url: basepath + 'cart/view3/?access_token=' + access_token
			}).success(function(data) {
				if (data.result_code == "0") {
					$scope.models.commonpro = data.data.common_products;
					$scope.models.weightpro = data.data.weight_products;
					console.log($scope.models.commonpro)
				} else {
					artDialog.alert('获取数据失败，请稍后重试！')
				}
			}).error(function(a, b, c, d) {
				artDialog.alert('服务器错误，请稍后重试！')
			}).finally(function() {
				$scope.$broadcast('scroll.refreshComplete');
			});
		};
		//提交订单
		$scope.toSuborder = function() {
				//普通商品提交
				var proidlist = [];
				angular.forEach($scope.models.commonpro, function(data) {
					if ((data.product_amount != '0') && (data.selected == "true")) {
						proidlist.push(data.product_id);
					}
				});
				angular.forEach($scope.models.weightpro, function(data) {
					if ((data.product_amount != '0') && (data.selected == "true")) {
						proidlist.push(data.product_id);
					}
				});
				//$state.go('tab.suborder')
				console.log(proidlist.join(','));
				$location.path('tab/suborder');
				$location.orderlist = proidlist.join(',');
			}
			//添加到购物车
		$scope.addTocart = function(pro) {
			updateCart.addTcart(pro);
		};
		//去称重
		$scope.toWeight = function(pro) {
			$http({
				method: 'get',
				url: basepath + 'cart/weight/?access_token=' + access_token,
				params: { //商品id, userid,数量
					product_id: pro.product_id,
				}
			}).success(function(data) {
				if (data.result_code == '0') {
					art.dialog.alert('商品称重结束后我们后联系您，请留意信息，若10分钟内没有提交订单，称重结果将取消！')
					pro.status = '2';
				}
			})
		};
		//删减选中的商品
		$scope.removeFcart = function(pro) {
				updateCart.removeFcart(pro);
			} //删除购物袋中商品
		$scope.del_pro = function(pro, protype) {
			var num = pro.pronum;
			var dp = updateCart.removeFcart(pro, true);
			dp.success(function(d) {
				if (d.result_code != '0') {
					artDialog.alert(d.result_dec);
					return;
				}
				if (protype == 'common') {
					for (var i = 0; i < $scope.models.commonpro.length; i++) {
						if ($scope.models.commonpro[i].product_id == pro.product_id) {
							$scope.models.commonpro.splice(i, 1);
						}
					}
				} else {
					for (var i = 0; i < $scope.weightpro.length; i++) {
						if ($scope.models.weightpro[i].product_id == pro.product_id) {
							$scope.models.weightpro.splice(i, 1);
						}
					}
				}
			}).error(function(a, b, c, d) {
				artDialog.alert('删除失败' + b)
			})
		}
	})