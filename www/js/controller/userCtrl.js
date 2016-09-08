angular.module('qx.controllers').controller('LoginCtrl', function($rootScope, $scope, $http, $ionicLoading, $stateParams, $state, $interval,$wilddogAuth, $location, user, wechatService) {
		$ionicLoading.hide();
		$scope.models = {};
		var from = $rootScope.fromstate || 'tab.main';
		$scope.models.formtype = $stateParams.formtype || 1;
		$scope.models.formsg = ($scope.models.formtype == 1) ? '登录' : '注册';;
		$scope.toggleRL = function(t) {
			$scope.models.formtype = t;
			$scope.models.formsg = (t == 1) ? '登录' : '注册';
		}
		authObj.$onAuth(function(authData) {
			if(authData) {
				console.log("Logged in as:", authData.uid);
				access_token=authData.uid;
				user.loginmsg(authData.uid);
				$state.go(from);
			}
		});
		$scope.login = function() {
			$ionicLoading.show();
			//登录
			if($scope.models.formtype == 1) {
				authObj.$authWithPassword({
					email: $scope.models.name,
					password: $scope.models.pwd
				}).then(function(authData) {
					console.log("Logged in as:", authData.uid);
					$ionicLoading.hide();
					user.loginmsg(authData.uid);
					$state.go(from);
				}).catch(function(error) {
					console.error("Authentication failed:", error);
					$ionicLoading.hide();
					artDialog.tips(error);
				});
			} else {
				//注册
				authObj.$createUser({
					email: $scope.models.name,
					password: $scope.models.pwd
				}).then(function(userData) {
					console.log("User " + userData.uid + " created successfully!");
					return authObj.$authWithPassword({
						email: $scope.models.name,
						password: $scope.models.pwd
					});
				}).then(function(authData) {
					console.log("Logged in as:", authData.uid);
					$ionicLoading.hide();
					user.loginmsg(authData.uid);
					$state.go(from);
				}).catch(function(error) {
					console.error("Authentication failed:", error);
					$ionicLoading.hide();
					artDialog.tips(error);
				});
			}

		};
		$scope.loginBwb = function() {
				authObj.$authWithOAuthRedirect("weibo").then(function(authData) {
					console.log("Logged in as:", authData.uid);
					user.loginmsg(authData.uid);
					$state.go(from);
				}).catch(function(error) {
					console.error("Authentication failed:", error);
					$ionicLoading.hide();
					artDialog.tips(error);
				});
			}
			//微信登陆
		$scope.loginBwechat = function(channel) {
			Wechat.auth("snsapi_userinfo", function(response) {
				$ionicLoading.show()
				console.log(response.code);
				wechatService.getopenid(response.code).success(function(data) {
					console.log(data.openid);
					$http({
						method: 'post',
						url: basepath + "user/weixinLogin/",
						data: {
							openid: data.openid
						}
					}).success(function(d) {
						$ionicLoading.hide();
						console.log(d);
						var from = $rootScope.fromstate || 'tab.main';
						if(d.result_code == '0') {
							user.loginmsg(d.data);
							$state.go(from);
						} else if(d.result_code == '1') {
							$location.gourl = from;
							$location.openid = response.code
							$state.go('bindtel');
						} else {
							artDialog.alert(d.result_dec);
						}
					}).error(function(a, b, c, d) {
						$ionicLoading.hide();
						artDialog.alert(b);
					})
				})
			})
		}
	})
	.controller('BindTel', function($scope, $http, $state, $location, $ionicLoading, $interval, user) {
		$scope.models = {};
		$scope.models.seconds = 0;
		$scope.getcode = function() {
			user.getcode($scope.models.username).success(function(data) {
				if(data.result_code == '0') {
					artDialog.tips('短信发送成功');
					$scope.models.seconds = 60;
					$scope.interval = $interval(function() {
						if($scope.models.seconds == 0) {
							$interval.cancel($scope.interval)
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
		$scope.bindtel = function() {
			$http({
				method: 'post',
				url: basepath + 'user/weixinBind/',
				data: {
					openid: $location.openid,
					phone: $scope.models.username,
					vcode: $scope.models.code
				}
			}).success(function(data) {
				console.log(data);
				if(data.result_code == '0') {
					user.loginmsg(data.data);
					$state.go($location.gourl);
				} else {
					artDialog.alert(data.result_dec + ',请重试！');
					$scope.models.username = $scope.models.code = '';
				}
			})
		}
	})
	.controller('resetpwdCtrl', function($scope, $http, $interval, user) {
		//重置密码
		$scope.models = {};
		$scope.models.seconds = 0;
		$scope.models.cnt = access_token ? 1 : 2; //
		$scope.models.haslogin = access_token ? true : false;
		//获取验证码
		$scope.getcode = function() {
			user.getcode($scope.models.username).success(function(data) {
				if(data.result_code == '0') {
					artDialog.tips('短信发送成功');
					$scope.models.seconds = 60;
					$scope.interval = $interval(function() {
						if($scope.models.seconds == 0) {
							$interval.cancel($scope.interval)
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
				if(data.result_code == '0') {
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
			if($scope.models.newpwd == '' || ($scope.models.newpwd != $scope.models.renewpwd)) {
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
				if(data.result_code == '0') {
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
		$scope.info = {
			nick: '紫烟薄旭',
			email: 'sqaiyan@126.com',
			sign: '当只有在你的心里仍停留的我的青春还正如山般葱茏水般澄清',
			avatar: 'http://p4.music.126.net/nBLDewqHLaMfzgQrVwzgqA==/7698780418596809.jpg',
			bgpic: 'url("http://p1.music.126.net/fF4jCB9KMiWFEmTT3vAD7g==/2054987232330223.jpg")',
			sex: 1
		}
		$scope.logout = function() {
			authObj.$unauth();
		};
	}).controller('CardCtrl', function($scope, $http) {
		//quxiangka
		$http({
			method: 'get',
			url: basepath + 'qxcard/list/?access_token=' + access_token + '&type=1'
		}).success(function(data) {
			if(data.result_code == '0' && data.data.length) {
				$scope.cards = data.data;
			}
		}).error(function() {});
		$scope.jh = function() {
			artDialog.prompt('请输入16位卡密码', function(v) {
				if(v.length == 16) {
					$http({
						method: 'post',
						url: basepath + 'qxcard/activate/?access_token=' + access_token,
						data: {
							qxcard_cdkey: v
						}
					}).success(function(data) {
						if(data.result_code == '0') {
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
	})