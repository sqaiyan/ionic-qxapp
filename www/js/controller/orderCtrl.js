angular.module('qx.controllers').controller('OrderlistCtrl', function($scope, $http, $state, $ionicLoading, orderact) {
		//订单列表
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
	}).controller('SuborderCtrl', function($scope, $http, $location, $ionicLoading, $timeout, $filter, orderact, qxcard, updateCart) {
		if (!$location.orderlist) {
			$location.path('#tab/orderlist');
			return;
		}
		$ionicLoading.show();
		$scope.models = {};
		$scope.models.loadoff = false;
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
			$scope.models.loadoff = true;
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
	})