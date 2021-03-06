var basepath = "http://115.159.93.15/scframe/";
var postion = '';
var ref="";
var authObj;
var wdurl="https://shopvue.wilddogio.com/";
var checkroute = ['tab.account', 'tab.orderlist', 'tab.service',"tab.account"];
angular.module('starter', ['ionic', 'ngCordova', 'ngIOS9UIWebViewPatch', 'qx.controllers', "wilddog"])
	.run(function($rootScope, $state, $ionicPlatform,$wilddogAuth) {
		ref = new Wilddog("https://shopvue.wilddogio.com");
   		authObj = $wilddogAuth(ref);
		authObj.$onAuth(function(authData) {
			if(authData) {
				console.log("Logged in as:", authData.uid);
				access_token=authData.uid;
			} else {
				console.log("Logged out");
				access_token=null;
				$state.go("tab.main");
			}
		});
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toStateParams, fromState, fromStateParams) {
			$rootScope.fromstate = fromState.name;
			$rootScope.tostate = toState.name;
			if(!access_token) {
				angular.forEach(checkroute, function(data, i) {
					if(data == $rootScope.tostate) {
						console.log(data);
						$state.go("login");
					}
				})
			};
			var list = art.dialog.list;
			for(var i in list) {
				list[i].close();
			};
		});
		$ionicPlatform.ready(function() {
			if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				localStorage.setItem('device', cordova.device());
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if(window.StatusBar) {
				StatusBar.styleLightContent();
			}
		});
	})
	.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
		$ionicConfigProvider.platform.android.tabs.style('standard');
		$ionicConfigProvider.platform.android.tabs.position('standard');
		$ionicConfigProvider.views.swipeBackEnabled(false);
		$ionicConfigProvider.navBar.alignTitle('center');
		$ionicConfigProvider.backButton.icon('qx-back').text('返回');
		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: 'templates/tabs.html'
			})
			.state('tab.main', {
				url: '/main',
				views: {
					'tab-main': {
						templateUrl: 'templates/main.html',
						controller: 'MainCtrl'
					}
				}
			}).state('tab.search', {
				url: '/search',
				cache: false,
				views: {
					'tab-main': {
						templateUrl: 'templates/search.html',
						controller: 'searchController'
					}
				}
			})
			.state('tab.service', {
				url: '/service',
				views: {
					'tab-service': {
						templateUrl: 'templates/service.html',
						controller: 'ServiceCtrl'
					}
				}
			})
			.state('login', {
				url: '/login',
				cache: 'false',
				params: {
					from: null,
					formtype: 1
				},
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
			})
			.state('product', {
				url: '/product',
				cache: 'false',
				templateUrl: 'templates/addproduct.html',
				controller: 'productController'
			})
			.state('register', {
				url: '/register',
				cache: 'false',
				templateUrl: 'templates/login.html',
				params: {
					formtype: '2'
				},
				controller: 'LoginCtrl'
			})
			.state('bindtel', {
				url: '/bindtel',
				cache: 'false',
				templateUrl: 'templates/bindtel.html',
				controller: 'BindTel'
			})
			.state('resetpwd', {
				url: '/resetpwd',
				cache: 'false',
				templateUrl: 'templates/resetpwd.html',
				controller: 'resetpwdCtrl'
			})
			.state('tab.shangmen', {
				url: '/shangmen',
				views: {
					'tab-service': {
						templateUrl: 'templates/shangmen.html',
						controller: 'shangmenctrl'
					}
				}

			})
			.state('tab.account', {
				url: '/account',
				views: {
					'tab-account': {
						templateUrl: 'templates/user.html',
						controller: 'UserCtrl'
					}
				}
			}).state('tab.testplugins', {
				url: '/testplugins',
				views: {
					'tab-account': {
						templateUrl: 'templates/testplugins.html',
						controller: 'testPluginsCtrl'
					}
				}
			})
			.state('tab.qxcard', {
				url: '/qxcard',
				views: {
					'tab-account': {
						templateUrl: 'templates/qxcard.html',
						controller: 'CardCtrl'
					}
				}
			})
			.state('tab.bag', {
				url: '/bag',
				cache: false,
				views: {
					'tab-bag': {
						templateUrl: 'templates/bag.html',
						controller: 'bagCtrl'
					}
				}
			})
			.state('tab.orderlist', {
				url: '/orderlist',
				cache: true,
				views: {
					'tab-orderlist': {
						templateUrl: 'templates/order/orderlist.html',
						controller: 'OrderlistCtrl'
					}
				}
			}).state('suborder', {
				url: '/suborder',
				cache: false,
				templateUrl: 'templates/order/suborder.html',
				controller: 'SuborderCtrl'

			}).state('tab.address', {
				url: '/address',
				cache: false,
				views: {
					'tab-account': {
						templateUrl: 'templates/address.html',
						controller: 'AddressCtrl'
					}
				}

			}).state('tab.orderdetail', {
				url: '/orderdetail/{orderid}',
				cache: true,
				views: {
					'tab-orderlist': {
						templateUrl: 'templates/order/order-detail.html',
						controller: 'OdetailCtrl'
					}
				}

			});
		$urlRouterProvider.otherwise('/tab/main');
	});
angular.module('qx.controllers', ['ionic', 'ngCordova', 'app.service']);