var basepath = "http://115.159.93.15/scframe/";
var postion = '';
angular.module('starter', ['ionic','ngIOS9UIWebViewPatch', 'qx.controllers'])
	.run(function($rootScope, $state, $ionicPlatform) {
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toStateParams, fromState, fromStateParams) {
			//console.log('tostate：' + toState.name);
			//console.log('fromstate：' + fromState.name);
			var list = art.dialog.list;
			for (var i in list) {
				list[i].close();
			};
		});
		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				localStorage.setItem('device', cordova.device());
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.StatusBar) {
				StatusBar.styleLightContent();
			}
		});
	})
	.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
		$ionicConfigProvider.platform.android.tabs.style('standard');
		$ionicConfigProvider.platform.android.tabs.position('standard');
		$ionicConfigProvider.views.swipeBackEnabled(false);
		$ionicConfigProvider.navBar.alignTitle('center');
		$stateProvider
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: 'templates/tabs.html'
			})
			.state('tab.main', {
				url: '/main',
				cache: false,
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
			.state('register', {
				url: '/register',
				cache: 'false',
				templateUrl: 'templates/login.html',
				params: {
					formtype: '2'
				},
				controller: 'LoginCtrl'
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
						templateUrl: 'templates/bag.html'
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
			}).state('tab.suborder', {
				url: '/suborder',
				cache: false,
				views: {
					'tab-orderlist': {
						templateUrl: 'templates/order/suborder.html',
						controller: 'SuborderCtrl'
					}
				}

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
	angular.module('qx.controllers', ['ionic', 'app.service']);