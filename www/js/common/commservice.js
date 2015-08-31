/**/
/*url params*/
function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return (r[2]);
	return null;
};
var thecard_inputpwd = '<div id="enterpaypwd" class="pt"><input type="number" maxlength=6 oninput="setoboxpwd(0)" autofocus="autofocus" autocomplete="off" autofocus="autofocus"/><ul><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li></div>';

function setoboxpwd(t) {
	var pwd = $("#enterpaypwd input ").val();
	pwd = pwd.substring(0, 6);
	$("#enterpaypwd input ").val(parseInt(pwd))
	if (t) {
		return pwd;
	}
	$("#enterpaypwd li ").each(function(i, e) {
		$(e).removeClass();
		if (i < pwd.length) {
			$(e).addClass('cur');
		}
	});
}
var basepath = "http://115.159.93.15/scframe/";
var access_token = localStorage.getItem('access_token');
var winw = window.screen.width;
angular.module('app.service', [])
	.factory('user', ['$http', '$location',
		function($http, $location) {
			return {
				loginmsg: function(data) {
					localStorage.setItem('access_token', data.access_token);
					access_token = data.access_token;
				},
				logout: function() {
					localStorage.setItem('access_token', null);
					access_token = null;
					$location.path('/tab/main');
				},
				setuserinfo: function(data) {
					return $http({
						method: 'post',
						url: basepath + 'user/updateInfo/?access_token=' + access_token,
						data: data
					})
				}
			}
		}
	])
	.factory('qxcard', ['$http',
		function($http) {
			return {
				checkBalance: function(price) { //验证余额
					return $http({
						method: 'post',
						url: basepath + 'qxcard/checkBalance/?access_token=' + access_token,
						data: { //"result_code": 0, 【0 成功1 无区享卡 2 余额不足 3 满足条件但未设置区享卡密码】
							price: price
						}
					});
				},
				checkpwd: function(type, qxcard_pwd, validateCode) {
					return $http({
						method: 'post',
						url: basepath + 'qxcard/checkpwd/?access_token=' + access_token,
						data: {
							type: type,
							qxcard_pwd: qxcard_pwd,
							validateCode: validateCode
						}
					});
				}
			};
		}
	])
	.factory('orderact', ['$http',function($http) {
			return {
				topay: function(params) { //提交订单
					return $http({
						method: 'post',
						url: basepath + 'order/submit3/?access_token=' + access_token,
						data: params
					});
				},
				alipay: function(orderid) {
					$http({
						method: 'get',
						url: basepath + 'order/toPay/?access_token=' + access_token + '&order_serial=' + orderid
					}).success(function(data) {
						console.log(data.paystr);
					});
				},
				wxpay: function(orderid, ok, fail) { //微信支付
					if (typeof WeixinJSBridge == "undefined") {
						artDialog.alert('请在微信环境中打开并支付');
						return;
					}
					$http({
						method: 'post',
						url: basepath + '/wxpay',
						data: {
							order_serial: orderid
						}
					}).success(function(data) {
						if ("0" == data.result_code) {
							WeixinJSBridge.invoke(
								'getBrandWCPayRequest', {
									"appId": data.appId,
									"timeStamp": data.timestamp,
									"nonceStr": data.noncestr,
									"package": data.package_str,
									"signType": data.signType,
									"paySign": data.paySign
								},
								function(res) {
									if (res.err_msg == "get_brand_wcpay_request:ok") {
										callback();
									} else {
										artDialog.alert(res.err_msg);
										fail();
									}
								});
						} else {
							artDialog.alert(data.result_dec);
							fail();
						}

					}).error(function(a, b, c, d) {
						fail();
					});
				},
				ordercancel: function(id) { //取消订单，订单id
					return $http({
						method: 'post',
						url: basepath + 'order/cancel/access_token=' + access_token,
						data: {
							order_serial: id
						}
					});
				},
				orderdetail: function(orderid) { //订单详情
					return $http({
						method: 'get',
						url: basepath + 'order/view3/?access_token=' + access_token + '&order_serial=' + orderid
					});
				},
				orderlist: function(type, size) { //订单列表
					return $http({
						method: 'get',
						url: basepath + "order/list3/?access_token=" + access_token + '&index=1&size=' + size + '&type=' + type
					});
				}
			};
		}
	])
	.factory('updateCart', ['$http',
		function($http) {
			//更新购物车
			var updateCart = function(proid, pronum, type) {
				type = type || 2;
				return $http({
					method: 'POST',
					url: basepath + 'cart/operation/?access_token=' + access_token,
					data: {
						'product_id': proid, //商品id
						'product_amount': pronum, //商品数量
						'op_type': type //【1 添加 2 修改 3 删除】
					}
				});
			};
			return {
				//商品详情
				proinfo: function(pro) {
					artDialog.open(pro.description_url, {
						title: pro.product_name,
						width: 300,
						padding: 10,
						height: '80%'
					});
				},
				//添加到购物车
				addTcart: function(pro) {
					//可选值大于剩余量时返回
					if (pro.loading) return;
					pro.loading = true;
					if (pro.product_amount >= pro.amount) return;
					//product_amount>0为修改，否则为添加
					var up = updateCart(pro.product_id, (1 + Number(pro.product_amount)), (Number(pro.product_amount) > 0 ? 2 : 1));
					up.success(function(data) {
						pro.loading = false;
						if (data.result_dec == 'OK') {
							pro.product_amount = Number(pro.product_amount) + 1;
						} else {
							artDialog.tips(data.result_dec);
						}
					}).error(function(a, b, c, d) {
						pro.loading = false;
					});
				},
				//从购物车中删除
				removeFcart: function(pro, del) {
					if (del) {
						return updateCart(pro.product_id, 0, 3);
					}
					if (pro.loading) return;
					pro.loading = true;
					if (pro.product_amount == 0) return;
					var up = updateCart(pro.product_id, (pro.product_amount - 1), 2);
					up.success(function(data) {
						pro.loading = false;
						if (data.result_dec == 'OK') {
							pro.product_amount = del ? 0 : (pro.product_amount - 1);
						} else {
							artDialog.alert(data.result_dec);
						}
					}).error(function(a, b, c, d) {
						pro.loading = false;
					})
				},
				getproFcart: function() {
					return $http({
						method: 'get',
						url: basepath + 'cart/list3/?access_token=' + access_token
					});
				}
			}
		}
	]).directive('cartprolist', ['$http', 'updateCart',
		function($http, updateCart) {
			//购物车商品列表指令
			return {
				restrict: 'EA',
				scope: {
					plist: "=plist",
					protypesize: "@pronum"
				},
				templateUrl: 'js/tpl/cartprolist.html', //购物车商品列表模板
				link: function(scope, element, attr) {
					scope.needel = attr.needel;
					scope.scrollStep = 0;
					scope.plst = attr.plist;
					scope.minsize = 4;
					scope.lih = (winw - 5) / scope.minsize;
					scope.sbwidth = winw / scope.minsize;
					scope.$watch('protypesize', function() {
						scope.scrollStep = scope.scrollStep < (4 - scope.protypesize) ? (4 - scope.protypesize) : scope.scrollStep;
						scope.scrollStep = scope.scrollStep >= 0 ? 0 : scope.scrollStep;
					});
					//向左滚动
					scope.prosL = function() {
							scope.scrollStep -= scope.minsize;
							scope.scrollStep = scope.scrollStep < (scope.minsize - scope.protypesize) ? (scope.minsize - scope.protypesize) : scope.scrollStep
						}
						//向右滚动
					scope.prosR = function() {
						scope.scrollStep += scope.minsize;
						scope.scrollStep = scope.scrollStep > 0 ? 0 : scope.scrollStep
					};
					//商品详情
					scope.proinfo = function(proid, proname) {
						updateCart.proinfo(proid, proname);
					};
					//删减选中的商品
					scope.removeFcart = function(pro) {
						updateCart.removeFcart(pro)
					};
				}

			}
		}
	]).directive('prolist', ['$http', 'updateCart',
		function($http, updateCart) {
			//商品列表指令
			return {
				restrict: 'EA',
				scope: {
					prolist: "=plst",
					navcur: "@navcur" //父类id，用于根据父id筛选显示商品
				},
				templateUrl: 'js/tpl/prolist.html', //商品列表模板
				link: function(scope, element, attr) {
					//商品详情
					scope.proinfo = function(pro) {
						updateCart.proinfo(pro);
					};
					scope.transtags = function(o, i) {
							return o & (1 << i);
						}
						//添加到购物车
					scope.addTocart = function(pro) {
						updateCart.addTcart(pro)
					};
					//删减选中的商品
					scope.removeFcart = function(pro) {
						updateCart.removeFcart(pro)
					}
				}
			}
		}
	]).directive('radio',
		function() {
			return {
				restrict: 'EA',
				scope: {
					radiovalue: '=radiovalue',
					truev: '@truev' //选中时的值
				},
				templateUrl: 'js/tpl/radio.html',
				link: function(scope, element, attrs) {
					scope.radiocheck = function() {
						scope.radiovalue = scope.truev;
					}
				}
			}
		}
	).directive('checkbox', function() {
		//checkbox多选
		return {
			restrict: 'EA',
			scope: {
				selected: '=selected', //
				disvalue: '@disvalue' //禁用的条件,不禁用不传值
			},
			templateUrl: 'js/tpl/checkbox.html',
			link: function(scope, element, attr) {
				scope.checktoogle = function() {
					scope.selected = scope.selected == 'false' ? 'true' : 'false';
				}
			}
		}
	}).directive('boxouter', function() {
		//models
		//boxouter
		return {
			restrict: 'EA',
			transclude: true,
			scope: {
				title: "@boxtitle",
				title_txt: '@titletxt',
				needtoggle: '@needtoggle'
			},
			templateUrl: 'js/tpl/boxouter.html',
			link: function(scope, element, attr) {
				scope.toggle = true
				scope.togglebox = function() {
					scope.toggle = !scope.toggle;
				}

			}
		}
	}).directive('boxinner', function() {
		//boxouter
		return {
			restrict: 'EA',
			transclude: true,
			scope: {
				title: "@boxtitle",
				title_txt: '@titletxt',
				needtoggle: '@needtoggle'
			},
			templateUrl: 'js/tpl/boxinner.html',
			link: function(scope, element, attr) {
				scope.toggle = true
				scope.togglebox = function() {
					scope.toggle = !scope.toggle;
				}

			}
		}
	}).directive('orderinfo', ['$http', '$filter','$ionicActionSheet', '$timeout', 'orderact',
		function($http, $filter,$ionicActionSheet,$timeout, orderact) {
			//boxouter
			return {
				restrict: 'EA',
				scope: {
					order: '='
				},
				templateUrl: 'js/tpl/orderlist.html',
				link: function(scope, element, attr) {
					scope.paytype = function(type) {
						switch (type) {
							case '11':
								return "现金支付";
								break;
							case '21':
								return '区享卡支付';
								break;
							case '22':
								return '支付宝支付';
								break;
							case '23':
								return "微信支付";
								break;
						}
					};
					scope.orderstatus = function(orderstatus, type) {
						//0，待支付;1,待发货;2,交易成功;3,交易取消;4,未到货
						//
						var status = [
							[21],
							[1, 2, 22, 11, 12],
							[3, 4],
							[23],
							[5]
						];
						scope.status = status[type];
						var is = 0;
						angular.forEach(scope.status, function(v) {
							if (orderstatus == v) {
								is = 1;
							}
						});
						return is;
					};
					scope.stardworker = function() { //快递员点赞
						if (scope.order.distri_worker_isPraised == '1') {
							artDialog.tips('您已经点过赞了');
							return;
						}
						scope.order.distri_worker_isPraised = 1;
						$http({
							method: 'post',
							url: basepath + 'order/praiseWorker/?access_token=' + access_token,
							data: {
								order_serial: scope.order.order_serial
							}
						}).success(function(data) {
							if (data.result_code == '0') {
								scope.order.distri_worker_isPraised = 1;
								scope.order.distri_worker_praise++;
							} else {
								artDialog.tips(data.result_dec);
								scope.order.distri_worker_isPraised = 0;
							}
						}).error(function(a, b, c, d) {
							scope.order.distri_worker_isPraised = 0;
						})
					};
					scope.delorder = function() { //取消订单
						var hideSheet = $ionicActionSheet.show({
						buttons: [{
							text: '立刻支付'
						}, {
							text: '再来一份'
						}],
						destructiveText: '删除订单',
						titleText: '订单操作',
						cancelText: '取消',
						cancel: function() {
							// add cancel code..
						},
						buttonClicked: function(index) {
							return true;
						}
					});
//						artDialog.confirm('您确定要取消该笔订单吗？', function() {
//							$http({
//								method: 'post',
//								url: basepath + 'order/cancel/?access_token=' + access_token,
//								data: {
//									order_serial: scope.order.order_serial
//								}
//							}).success(function(data) {
//								if (data.result_code == '0') {
//									scope.order.order_status = '23';
//								} else {
//									artDialog.tips(data.result_dec);
//								}
//							}).error(function(a, b, c, d) {
//								artDialog.tips(b);
//							});
//						});
					};
					scope.payinfo = function() { //支付详情
						var payinfo = "<ul class='bdt_list payproinfo'>";
						angular.forEach(scope.order.products, function(v) {
							payinfo += "<li class='c pw'><span class='fl'>" + (v.product_name) + "</span><span class='fr fc_gray fs_1'>" + '￥' + $filter('number')(v.product_price) + '<b>*' + $filter('number')(v.product_amount) + "</b></span></li>";
						});
						payinfo += "</ul><ul class='bdt_list'>";
						if (scope.order.payoff_price) {
							payinfo += "<li class='c fc_r pw'><span class='fl'>优惠总额</span><span class='fr fc_r'>-￥" + scope.order.payoff_price + "</span></li>";
						}
						payinfo += "<li class='c bold pw' style='border-top:1px solid #ddd'><span class='fl'>合计</span><span class='fr fc_r'>￥" + $filter('number')(scope.order.order_price) + "</span></li>";
						artDialog({
							title: '支付详情',
							width: '92%',
							content: payinfo,
							padding: 0,
						})
					};
					scope.topay = function() { //支付订单
						if (scope.order.order_status != '21') return; //不是未支付取消
						if (scope.order.pay_type_ext == '23') {
							orderact.wxpay(scope.order.order_serial, function() { //微信支付
							})
						} else if (scope.order.pay_type_ext == '22') { //支付宝支付
							console.log(scope.order.pay_type_ext);
							orderact.alipay(scope.order.order_serial)

						} else if (scope.order.pay_type_ext == '21') { //区享卡支付

						}
					}
				}
			}
		}
	]);