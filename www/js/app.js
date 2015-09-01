var basepath = "http://115.159.93.15/scframe/";
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
	.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
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
				params:{from:null},
				templateUrl: 'templates/login.html',
				controller: 'LoginCtrl'
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
				cache:true,
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
						templateUrl: 'order/orderlist.html',
						controller: 'OrderlistCtrl'
					}
				}
			}).state('tab.suborder', {
				url: '/suborder',
				cache: false,
				views: {
					'tab-orderlist': {
						templateUrl: 'order/suborder.html',
						controller: 'SuborderCtrl'
					}
				}

			}).state('tab.orderdetail', {
				url: '/orderdetail/{orderid}',
				cache: true,
				views: {
					'tab-orderlist': {
						templateUrl: 'order/order-detail.html',
						controller: 'OdetailCtrl'
					}
				}

			});
		$urlRouterProvider.otherwise('/tab/main');
	});