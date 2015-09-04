angular.module('starter.controllers', ['ionic', 'app.service'])
	.controller('MainCtrl', function($scope, $http, $ionicLoading, $location, $state, updateCart) { //首页
		if (!access_token) {
			$state.go("login", {
				'from': $state.current.name
			});
		};
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
				artDialog.tips(data.result_dec);
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
					$location.path('tab/suborder');
					$location.orderlist = proidlist.join(',');
				} else {
					artDialog.alert(data.result_dec)
				}
			}).error(function(a, b, c, d) {
				console.log(b);
			})
		}
	})
	.controller('ServiceCtrl', function($scope, $http, $ionicLoading) {
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
			url: basepath + 'order/getDeliveryList/?accsess_token=' + access_token
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
	}).controller('OrderlistCtrl', function($scope, $http, $state, $ionicLoading, orderact) {
		//订单列表
		if (!access_token) {
			$state.go("login", {
				from: $state.current.name
			});
			return;
		};
		//$scope.tabs = localStorage.getItem('ordertype') || 1;
		$scope.tabs = 1;
		$scope.curtab = function(t) {
			return $scope.tabs == t;
		};
		$scope.getorderlist = function() {
			$scope.tabclick($scope.tabs)
		};
		$scope.tabclick = function(tab) {
			$scope.tabs = tab;
			localStorage.setItem('ordertype', tab);
			orderact.orderlist($scope.tabs, 100).success(function(data) {
				$scope.$broadcast('scroll.refreshComplete');
				if (data.result_code != '0') {
					artDialog.alert(data.result_dec);
				} else {
					$scope.ordercount = data.data.count;
					$scope.orderlist = data.data.orders;
				}
			}).error(function() {
				$scope.$broadcast('scroll.refreshComplete');
				artDialog.alert('订单获取异常');
			});
		};
	}).controller('bagCtrl', function($scope, $http, $state, $location, updateCart) {
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
	}).controller('LoginCtrl', function($scope, $http, $ionicLoading, $stateParams, $state, user) {
		//localStorage.setItem('access_token', null);
		//access_token = null;
		$ionicLoading.hide();
		$scope.models = {};
		$scope.models.formtype = $stateParams.formtype || 1;
		$scope.models.formsg = $scope.models.formsg = ($scope.models.formtype == 1) ? '登录' : '注册';;
		$scope.$watch('models.formtype', function() {
			$scope.models.formsg = ($scope.models.formtype == 1) ? '登录' : '注册';
		});
		$scope.login = function() {
			$ionicLoading.show('登录中...');
			$http({
				method: 'post',
				url: basepath + 'oauth2/access_token/',
				data: {
					username: $scope.models.name,
					password: $scope.models.pwd
				}
			}).success(function(data) {
				$ionicLoading.hide();
				if (data.result_code == '0') {
					user.loginmsg(data.data);
					var from = $stateParams.from || 'tab.main';
					console.log(from);
					$state.go(from);
				} else {
					artDialog.alert(data.result_dec + ',请重试！');
					$scope.models.name = '';
					$scope.models.pwd = '';
				}
			}).error(function(a, b, c, d) {
				$ionicLoading.hide();
				artDialog.alert('登录失败！');
			});
		}
	})
	.controller('resetpwdCtrl', function($scope, $http, $interval) {
		//重置密码
		$scope.models = {};
		$scope.models.seconds = 0;
		$scope.models.cnt = 2; //
		$scope.models.haslogin = false;
		if (access_token) {
			$scope.models.haslogin = true;
			$scope.models.cnt = 1;
		}
		//获取验证码
		$scope.getcode = function() {
			$http({
				method: 'get',
				url: basepath + 'common/getVCode/?mobile=' + $scope.models.username
			}).success(function(data) {
				if (data.result_code == '0') {
					artDialog.tips('短信发送成功');
					$scope.models.code = data.data.validate_Code;
					$scope.models.seconds = 60;
					$interval(function() {
						if ($scope.models.seconds == 0) {
							return;
						}
						$scope.models.seconds--;
					}, 1000)
				} else {
					artDialog.tips(data.result_dec);
					$scope.models.seconds = 0;
				}
			}).error(function() {
				artDialog.alert('获取验证码异常，请稍后重试！');
			});
		};
		//校验验证码
		$scope.checkcodef = function() {
			console.log("checkcode");
			$http.get(basepath + 'common/checkVCode/?mobile=' + $scope.models.username + '&code=' + $scope.models.code).success(function(data) {
				if (data.result_code == '0') {
					$scope.models.codeok = true;
				} else {
					artDialog.tips(data.result_dec);
					$scope.models.seconds = 0;
					$scope.models.code = '';
				}
			})

		};
		//提交密码
		$scope.subnewpwd = function() {
			console.log($scope.models.newpwd + '````' + $scope.models.renewpwd);
			if ($scope.models.newpwd == '' || ($scope.models.newpwd != $scope.models.renewpwd)) {
				artDialog.alert('请输入新密码');
				return false;
			}
			$http({
				method: 'post',
				url: basepath + 'account/resetPassword/?access_token=' + access_token,
				data: {
					phone: $scope.models.username,
					type: 2,
					password: $scope.models.newpwd,
					validateCode: $scope.models.code,
					newPassword: $scope.models.renewpwd
				}
			}).success(function(data) {
				if (data.result_code == '0') {
					artDialog.tips('密码重置成功！');
					$timeout(function() {
						$stat.go('login');
					}, 3000)
				} else {
					artDialog.alert(data.result_dec);
				}
			}).error(function() {
				artDialog.alert('获取验证码异常，请稍后重试！');
			});
		};
	})
	.controller('UserCtrl', function($scope, $http, $ionicLoading, $state, user) {
		//用户中心
		if (!access_token) {
			$state.go("login", {
				'from': $state.current.name
			});
			return;
		}
		$http({
			method: 'get',
			url: basepath + 'user/info/?access_token=' + access_token
		}).success(function(data) {
			if (data.result_code == '0') {
				$scope.info = data.data;
			} else {
				artDialog.alert(data.result_dec)
			}
		}).error(function() {});
		$scope.logout = function() {
			$ionicLoading.show('退出中...');
			$http({
				method: 'get',
				url: basepath + 'user/logout/?access_token=' + access_token
			}).success(function(data) {
				$ionicLoading.hide();
				user.logout();
				if (data.result_code == '0') {
					user.logout();
				} else {
					artDialog.alert(data.result_dec)
				}
			}).error(function(){
				$ionicLoading.hide();
				user.logout();
			});
		};
		$scope.update_user_info = function() {
			var data = {
				nick: '你爹',
				email: 'sqaiyan@126.com',
				sign: '艹你妹的',
				avatar: 'http://p4.music.126.net/nBLDewqHLaMfzgQrVwzgqA==/7698780418596809.jpg',
				bgpic: 'url("http://p1.music.126.net/fF4jCB9KMiWFEmTT3vAD7g==/2054987232330223.jpg")',
				sex: 1
			}
			user.setuserinfo(data).success(function(data) {
				console.log(data);
			})
		}
	}).controller('SuborderCtrl', function($scope, $http, $location, $ionicLoading, $timeout, $filter, orderact, qxcard, updateCart) {
		if (!$location.orderlist) {
			$location.path('#tab/orderlist');
			return;
		}
		$ionicLoading.show();
		$scope.models = {};
		$scope.models.olpayType = "qxcardpay"; //默认支付方式,区享卡支付?
		$scope.models.delivertype = "selfdeliver"; //配送方式，默认送货上门
		$scope.models.qxabled = $scope.hasqxcard = true; //商品可用区享卡，有区享卡
		$scope.delivertime = [{
			timetype: '上午',
			clock: [{
				label: '6点'
			}, {
				label: '7点'
			}, {
				label: '8点'
			}, {
				label: '9点'
			}, {
				label: '10点'
			}, {
				label: '11点'
			}, {
				label: '12点'
			}]
		}, {
			timetype: '下午',
			clock: [{
				label: '13点'
			}, {
				label: '14点'
			}, {
				label: '15点'
			}, {
				label: '16点'
			}, {
				label: '17点'
			}, {
				label: '18点'
			}, {
				label: '19点'
			}]
		}];
		$scope.vm = {};
		$scope.vm.timecontrol = $scope.delivertime;
		//商品列表
		var usproid = $location.orderlist.split(',');
		if (!usproid.length) {
			$timeout(function() {
				artDialog.confirm('您尚未选购任何商品', function() {
					$location.path('tab/main');
				}, function() {
					$location.path('tab/main');
				});
			}, 60);
		};
		//标签转换
		$scope.transtags = function(o, i) {
			return o & (1 << i);
		};
		//获取商品
		updateCart.getproFcart().success(function(data) {
			$scope.orderplist = [];
			var oderprice = 0;
			$ionicLoading.hide();
			angular.forEach(data.data, function(d) {
				angular.forEach(usproid, function(b) {
					if (b == d.product_id) {
						$scope.orderplist.push(d);
						var pprcount = d.product_price * 1 * d.product_amount;
						if (d.wholesale_price) {
							if (pprcount > d.wholesale_price.split('|')[0]) {
								pprcount = pprcount - d.wholesale_price.split('|')[1]
							}
						}
						//不支持区享卡
						if ($scope.transtags(d.tags, 3)) {
							$scope.qxabled = false;
						}
						oderprice += pprcount;
					}
				});
			});
			$scope.oderprice = $filter('number')(oderprice, 2);
			if (!$scope.orderplist.length) {
				artDialog.confirm('获取商品失败', function() {
					$location.path('tab/main');
				}, function() {
					$location.path('tab/main');
				});
				return;
			};
			$scope.loadoff = true;
			//验证区享卡
			qxcard.checkBalance($scope.oderprice).success(function(data) {
				if (data.result_code == 0) { //成功
					$scope.models.olpayType = "qxcardpay";
				} else if (data.result_code == 1 || data.result_code == 2) { //无区享卡
					$scope.models.olpayType = "olpay";
					$scope.hasqxcard = false;
				} else if (data.result_code == 3) { //满足条件但未设置区享卡密码
					$scope.cardnopwd = true;
				}
			});
		}).error(function() {
			$ionicLoading.hide();
			artDialog.confirm('获取数据出错', function() {
				$location.path('tab/main');
			});
		});
		//自提信息
		$http({
			method: 'get',
			url: basepath + 'community/contact/?access_token=' + access_token
		}).success(function(data) {
			$scope.models.selfDaddr = data.data.community_addr;
			$scope.models.selfTel = data.data.property_tel;
		});
		//获取用户地址联系信息
		$http({
			method: 'get',
			url: basepath + 'user/info/?access_token=' + access_token
		}).success(function(data) {
			if (data.result_code == '0') {
				$scope.models.delivertype = "oldeliver";
				$scope.models.phone = data.data.phone;
				$scope.models.address = data.data.communityName + data.data.floor + data.data.room;
			}
		});
		//修改地址
		$scope.editaddr = function() {
			artDialog({
				title: '配送信息',
				content: document.getElementById("modifyaddr"),
				width: '92%',
				padding: '10px 10px 0',
				ok: function() {
					if (!$scope.models.address) {
						artDialog.alert('请输入上门地址');
						return false;
					}
					if (!/^1\d{10}$/.test($scope.models.phone) || !$scope.models.phone) {
						artDialog.alert('请输入正确的手机号码');
						return false;
					}
				},
				cancel: function() {}
			});
		};
		//提交
		$scope.suborder = function() {
			//配送时间
			var dtime = $scope.getime();
			$scope.suborderdata = {
				products: $scope.orderplist,
				delivery_price: 0,
				delivery_type: ($scope.models.delivertype == 'oldeliver' ? 2 : 1),
				pay_type: ($scope.models.olpayType == 'cashpay' ? 1 : 2), //【付费类型 1线下 2线上】
				delivery_time: $filter('date')(dtime, 'yyyy-MM-dd HH:mm:ss'),
				channel: '3',
				pay_type_ext: 11 //【付费类型 11 现金 12 刷卡 13 混合 21 区享卡 22 支付宝 23 微信】
			};
			if ($scope.models.delivertype === 'oldeliver') {
				if (!$scope.models.address) {
					artDialog.prompt('<i class="qx qx-location fs_4 fc_o "></i>上门地址', function(v) {
						$scope.$apply(function() {
							$scope.models.address = v;
						});
					});
					return;
				}
				if (!$scope.models.phone) {
					artDialog.prompt('<i class="qx qx-location fs_4 fc_o "></i>联系电话', function(v) {
						v = /^1\d{10}$/.test(v) ? v : '';
						$scope.$apply(function() {
							$scope.models.phone = v;
						});

					});
					return;
				};
				$scope.suborderdata.delivery_addr = $scope.models.address;
				$scope.suborderdata.order_phone = $scope.models.phone;
			};
			if ($scope.models.olpayType === 'qxcardpay') {
				if (!$scope.qxcardpwd) { //输入或设置密码
					$scope.getcardpwd();
					return;
				}
				$scope.suborderdata.qxcard_pwd = $scope.qxcardpwd;
				$scope.suborderdata.pay_type_ext = '21'; //区享卡支付
			}
			if ($scope.models.olpayType === 'olpay') {
				$scope.suborderdata.pay_type_ext = '23'; //微信支付
			};
			orderact.topay($scope.suborderdata).success(function(data) {
				if (data.result_code == '0') {
					artDialog.alert('提交订单成功' + data.data.order_serial);
					console.log(data.data.paystr);
					$scope.orderid = data.data.order_serial;
					if ($scope.suborderdata.pay_type_ext == '23') {
						artDialog.alert('调用微信支付');
						//return;
					};
					$location.path('tab/orderdetail/');
					$location.orderid = $scope.orderid;
				} else if (data.result_code == '9') {
					$scope.qxcardpwd = '';
					artDialog.alert(data.result_dec);
				} else {
					artDialog.alert(data.result_dec);
				}
			}).error(function(a, b, c, d) {
				console.log(a + b);
			})
		};
		//输入区享卡密码
		$scope.getcardpwd = function() {
			if (!$scope.cardnopwd) {
				artDialog({
					title: '请输入区享卡密码',
					content: '<p>支付金额：<span class="fc_r fs_3 ">￥' + $scope.oderprice + '</span></p>' + thecard_inputpwd,
					cancel: function() {},
					padding: 20,
					width: '92%',
					ok: function() {
						var paypwd = setoboxpwd(1);
						$scope.qxcardpwd = paypwd;
					}
				});
			} else { //未设置密码
				artDialog({
					title: '请先设置区享卡密码',
					content: '请输入六位数字密码' + thecard_inputpwd,
					padding: 20,
					width: '92%',
					cancel: function() {},
					ok: function() {
						var thepwd = setoboxpwd(1);
						if (thepwd.length < 6) {
							return;
						} else {
							artDialog({
								title: '请再次输入区享卡密码',
								padding: 20,
								width: '92%',
								content: '请再次输入六位数字密码' + thecard_inputpwd,
								cancel: function() {},
								ok: function() {
									var thepwd2 = setoboxpwd(1);
									if (thepwd != thepwd2) {
										artDialog.alert('重复密码错误');
										return;
									}
									//设置密码
									var setpwd = qxcard.checkpwd(2, thepwd2);
									setpwd.success(function(data) {
										if (data.result_code == 0) {
											artDialog.alert('密码设置成功');
											$scope.qxcardpwd = thepwd2;
										} else {
											artDialog.alert(data.result_dec);
										}
									}).error(function(a, b, c, d) {
										artDialog.alert('<span class="fc_r ">密码设置失败</span>')
									});
								}
							})
						}
					}
				})
			}
		};
		//设置配送时间
		$scope.getime = function() {
			var curtime = new Date();
			if ($scope.vm.ap) {
				var hours = curtime.getHours();
				var day = curtime.getDate();
				if ($scope.vm.clock.label) {
					var time = $scope.vm.clock.label;
					time = parseInt(time);
					curtime.setHours(time);
					curtime.setMinutes(0);
					curtime.setSeconds(0);
					if (time <= hours) {
						curtime.setDate(day + 1);
					}
					return curtime;
				} else {
					if (($scope.vm.ap.timetype == '上午' && (hours > 12))) {
						curtime.setDate(day + 1);
						curtime.setHours(6);
						curtime.setMinutes(0);
						curtime.setSeconds(0)
					} else if (($scope.vm.ap.timetype == '下午' && (hours < 13))) {
						curtime.setDate(day + 1);
						curtime.setHours(13);
						curtime.setMinutes(0);
						curtime.setSeconds(0)
					}
					return curtime;
				}
			} else {
				return curtime;
			}
		};
	}).controller('OdetailCtrl', function($scope, $http, $location, $ionicLoading, $stateParams, orderact) {
		if (!$stateParams.orderid) {
			$location.path('tab/orderlist');
			return;
		}
		$ionicLoading.show({
			noBackdrop: true
		});
		orderact.orderdetail($stateParams.orderid).success(function(data) {
			$ionicLoading.hide();
			if (data.result_code != '0') {
				artDialog.confirm('订单异常' + data.result_dec, function() {
					$location.path('tab/orderlist');
					return;
				}, function() {
					$location.path('tab/orderlist');
					return;
				});
			} else {
				$scope.orderinfo = data.data;
				$scope.plcount = data.data.order_price;
			}
		}).error(function() {
			$ionicLoading.hide();
			artDialog.confirm('订单获取异常', function() {
				$location.path('tab/orderlist');
			}, function() {
				$location.path('tab/orderlist');
			});
		});
		//配送人列表
		$scope.gethe_deliver = function() {
			if (!$scope.orderinfo.distri_workers) {
				artDialog.alert('暂无配送员');
				return;
			}
			artDialog({
				title: '配送人员',
				width: '92%',
				padding: 0,
				height: '60%',
				content: document.getElementById("deliverlist")
			})
		};
	}).controller('CardCtrl', function($scope, $http) {
		$http({
			method: 'get',
			url: basepath + 'qxcard/list/?access_token=' + access_token + '&type=1'
		}).success(function(data) {
			if (data.result_code == '0' && data.data.length) {
				$scope.cards = data.data;
			}
		}).error(function() {});
		$scope.jh = function() {
			artDialog.prompt('请输入16位区享卡密码', function(v) {
				if (v.length == 16) {
					$http({
						method: 'post',
						url: basepath + 'qxcard/activate/?access_token=' + access_token,
						data: {
							qxcard_cdkey: v
						}
					}).success(function(data) {
						if (data.result_code == '0') {
							artDialog.tips('激活成功');
						} else {
							artDialog.tips(data.result_dec, 20)
						}
					});
				} else {
					artDialog.alert('请输入16位密码');
					return false;
				}
			});
		};
	});