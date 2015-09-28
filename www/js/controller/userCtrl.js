angular.module('qx.controllers').controller('LoginCtrl', function($scope, $http, $ionicLoading, $stateParams, $state, user) {
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
				artDialog.alert('http请求失败'+a+'```'+b+'```'+c);
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
			}).error(function() {
				$ionicLoading.hide();
				user.logout();
			});
		};
		$scope.update_user_info = function() {
			var data = {
				nick: '紫烟薄旭',
				email: 'sqaiyan@126.com',
				sign: '当只有在你的心里仍停留的我的青春还正如山般葱茏水般澄清',
				avatar: 'http://p4.music.126.net/nBLDewqHLaMfzgQrVwzgqA==/7698780418596809.jpg',
				bgpic: 'url("http://p1.music.126.net/fF4jCB9KMiWFEmTT3vAD7g==/2054987232330223.jpg")',
				sex: 1
			}
			user.setuserinfo(data).success(function(data) {
				console.log(data);
			})
		}
	}).controller('CardCtrl', function($scope, $http) {
		//quxiangka
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
	})