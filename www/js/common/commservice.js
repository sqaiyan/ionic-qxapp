/*browser*/
var browser = {
		versions: function() {
			var u = navigator.userAgent,
				app = navigator.appVersion;
			return { //移动终端浏览器版本信息
				trident: u.indexOf('Trident') > -1, //IE内核
				presto: u.indexOf('Presto') > -1, //opera内核
				webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
				gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
				mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
				ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
				android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
				iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
				iPad: u.indexOf('iPad') > -1, //是否iPad
				webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
			};
		}(),
		language: (navigator.browserLanguage || navigator.language).toLowerCase()
	}
	/*url params*/

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return(r[2]);
	return null;
};
var thecard_inputpwd = '<div id="enterpaypwd" class="pt"><input type="number" maxlength=6 oninput="setoboxpwd(0)" autofocus="autofocus" autocomplete="off" autofocus="autofocus"/><ul><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li><li><span>．</span></li></div>';

function js_check(t, text) {
	switch(t) {
		case "card":
			return text.test('')
			break;
		case 'tel':
			return /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/.test(text)
	}
};

function setoboxpwd(t) {
	var pwd = $("#enterpaypwd input ").val();
	pwd = pwd.substring(0, 6);
	$("#enterpaypwd input ").val(parseInt(pwd))
	if(t) {
		return pwd;
	}
	$("#enterpaypwd li ").each(function(i, e) {
		$(e).removeClass();
		if(i < pwd.length) {
			$(e).addClass('cur');
		}
	});
}
var access_token = localStorage.getItem('access_token');
var winw = window.screen.width;
angular.module('app.service', ['ionic'])
	.factory('user', ['$http', '$location',
		function($http, $location) {
			return {
				loginmsg: function(data) {
					localStorage.setItem('access_token', data);
					access_token = data;
				},
				logout: function() {
					localStorage.setItem('access_token', '');
					access_token = '';
					$location.path('/tab/main');
				},
				setuserinfo: function(data) {
					return $http({
						method: 'post',
						url: basepath + 'user/updateInfo/?access_token=' + access_token,
						data: data
					})
				},
				getcommunity: function() {},
				getcode: function(tel) {
					return $http({
						method: 'get',
						url: basepath + 'common/getVCode/?mobile=' + tel + '&r=' + new Date()
					})
				}
			}
		}
	]).factory('share', ['$ionicActionSheet',
		function($ionicActionSheet) {
			return {
				share: function(title, des, url, imgurl, success, fail) {
					var hideSheet = $ionicActionSheet.show({
						buttons: [{
							text: '分享给好友'
						}, {
							text: '分享到朋友圈'
						}, {
							text: '收藏到微信'
						}],
						titleText: '分享到微信',
						cancelText: '取消',
						cancel: function() {
							return true;
						},
						buttonClicked: function(index) {
							Wechat.share({
								message: {
									title: title,
									description: des,
									thumb: imgurl,
									media: {
										type: Wechat.Type.LINK,
										webpageUrl: url
									}
								},
								scene: index // share to Timeline
							}, function() {
								return true;
								success;
							}, function(reason) {
								return true;
								fail;
							});
						}
					});
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
						data: {
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
	.factory('orderact', ['$http',
		function($http) {
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
					if(typeof WeixinJSBridge == "undefined") {
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
						if("0" == data.result_code) {
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
									if(res.err_msg == "get_brand_wcpay_request:ok") {
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
	.factory('wechatService', ['$http', '$ionicLoading', function($http, $ionicLoading) {
		return {
			getopenid: function(code) {
				return $http.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx23af185f64e0712c&secret=71a367da83b0e848882c1c4c4af67b0c&code=" + code + "&grant_type=authorization_code");
			},
			getuserinfo: function(token, openid) {
				$http.get('https://api.weixin.qq.com/sns/userinfo?access_token=' + token + '&openid=' + openid);
			}
		}
	}])
	.factory('updateCart', ['$http', '$ionicLoading', '$ionicModal', "$wilddogArray", "$wilddogObject", "$state",
		function($http, $ionicLoading, $ionicModal, $wilddogArray, $wilddogObject, $state) {
			//更新购物车

			return {
				//商品详情
				proinfo: function(pro) {
					$ionicModal.fromTemplateUrl('proinfo.html', {
						scope: pro,
						animation: 'slide-in-up'
					}).then(function(modal) {
						$scope.modal = modal;
					});
				},
				//添加到购物车
				addTcart: function(pro, t) {

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
				},
				templateUrl: 'js/tpl/cartprolist.html', //购物车商品列表模板
				link: function(scope, element, attr) {
					scope.needel = attr.needel;
					scope.scrollStep = 0;
					scope.plst = attr.plist;
					scope.protypesize = scope.plist.length;
					scope.lih = (winw - 5) / scope.minsize;
					scope.sbwidth = winw / 4;
					
					scope.plist.$watch(function(){
						scope.cart_propronum=0;
						scope.cart_count=0
						scope.plist.forEach(function(i){
						scope.cart_count=scope.cart_count+i.product_price*i.amount;
						scope.cart_propronum=scope.cart_propronum+i.amount*1
					})
					})
					
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
				}

			}
		}
	]).directive('prolist', ['$http', '$ionicModal', '$wilddogObject', "$ionicLoading","$state",
		function($http, $ionicModal, $wilddogObject, $ionicLoading,$state) {
			//商品列表指令
			return {
				restrict: 'EA',
				scope: {
					prolist: "=plst",
					cartlist: "=cartlist",
					navcur: "@navcur" //父类id，用于根据父id筛选显示商品
				},
				templateUrl: 'js/tpl/prolist.html', //商品列表模板
				link: function(scope, element, attr) {
					//商品详情
					scope.proinfo = function(pro) {
						//updateCart.proinfo(pro);
					};
					
					scope.cartlist.$watch(function(){
						if(!scope.prolist)return;
						console.log(scope.cartlist);
						scope.prolist.forEach(function(i){
							i.cart=null
							scope.cartlist.forEach(function(j){
								if(i.$id==j.$id){
									i.cart=j
								}
							})
						})
					})
					var cart = $('#indexcart'),
					ct=window.innerHeight - 95
					//添加到购物车动画
					scope.cartanimate = function(t) {
						$('#indexcart').removeClass('shopCartAnimate');
						$('<span class="cart-fly"/>').appendTo("body").show().fly({
							start: {
								left: t.pageX - 20,
								top: t.clientY
							},
							end: {
								left: 15,
								top: ct
							},
							speed: 1.8,
							onEnd: function() {
								this.destroy()
								cart.addClass('shopCartAnimate');
								cart.on("webkitAnimationEnd",
									function() {
										cart.removeClass("shopCartAnimate")
									})
							}
						})
					};
					//更新购物车
					scope.updatecart = function(c, cartlist, pro, t) {
						if(!access_token) {
							$state.go("login");
							return;
						}
						if(c.amount >= pro.product_amount) return;
						c.amount = c.amount + 1;
						cartlist.$save(c).then(function() {
							scope.cartanimate(t);
						}, function(a) {
							alert(a)
						})
					};
					//添加到购物车
					scope.addTocart = function(pro, t) {
						//验证登录
						if(!access_token) {
							$state.go("login");
							return;
						}
						var bagpro = $wilddogObject(ref.child("/bag/" + access_token + "/" + pro.$id));
						bagpro.$loaded().then(function() {
							//可选值大于剩余量时返回
							if(pro.product_amount * 1 >= pro.amount * 1) return;
							bagpro.service_id = pro.service_id;
							bagpro.amount = 1;
							bagpro.product_name = pro.product_name;
							bagpro.product_pic = pro.product_pic;
							bagpro.product_price = pro.product_price;
							bagpro.product_thumbnail = pro.product_thumbnail;
							bagpro.product_unit = pro.product_unit;
							bagpro.$save(bagpro).then(function(e) {
								console.log("add-suc:", e);
								scope.cartanimate(t);
							},function(a,b){
								alert("添加失败",a,b)
							})
						})
					};
					//删减选中的商品
					scope.removeFcart = function(c, cartlist) {
						c.cart.amount = c.cart.amount - 1;
						console.log(c.cart.amount);
						c.cart.amount?cartlist.$save(c.cart): cartlist.$remove(c.cart).then(function(){c.cart=null})
					};
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
	}).directive('orderinfo', ['$http', '$filter', '$ionicActionSheet', '$timeout', 'orderact',
		function($http, $filter, $ionicActionSheet, $timeout, orderact) {
			//boxouter
			return {
				restrict: 'EA',
				scope: {
					order: '='
				},
				templateUrl: 'js/tpl/orderlist.html',
				link: function(scope, element, attr) {
					scope.paytype = function(type) {
						switch(type) {
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
							if(orderstatus == v) {
								is = 1;
							}
						});
						return is;
					};
					scope.stardworker = function() { //快递员点赞
						if(scope.order.distri_worker_isPraised == '1') {
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
							if(data.result_code == '0') {
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
						var mj = 0;
						angular.forEach(scope.order.products, function(v) {
							payinfo += "<li class='c pw'><span class='fl'>" + (v.product_name) + "</span><span class='fr fc_gray fs_1'>" + '￥' + $filter('number')(v.product_price) + '<b>*' + $filter('number')(v.product_amount) + "</b></span></li>";
							if(v.payoff_price != '') {
								mj += Math.floor(v.payoff_price);
							}
						});
						//payinfo += "</ul><ul class='bdt_list payproinfo'>";
						if(mj) {
							payinfo += "<li class='c pw'><span class='fl fc_r'>满减优惠</span><span class='fr fc_r'>-￥" + mj + "</span></li>";
						}
						payinfo += "<li class='c bold pw'><span class='fl'>合计</span><span class='fr fc_r'>￥" + $filter('number')(scope.order.order_price) + "</span></li></ul>";
						artDialog({
							title: '支付详情',
							width: '92%',
							content: payinfo,
							padding: 0,
						})
					};
					scope.topay = function() { //支付订单
						if(scope.order.order_status != '21') return; //不是未支付取消
						if(scope.order.pay_type_ext == '23') {
							orderact.wxpay(scope.order.order_serial, function() { //微信支付
							})
						} else if(scope.order.pay_type_ext == '22') { //支付宝支付
							console.log(scope.order.pay_type_ext);
							orderact.alipay(scope.order.order_serial)

						} else if(scope.order.pay_type_ext == '21') { //区享卡支付

						}
					}
				}
			}
		}
	]);