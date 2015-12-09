angular.module('qx.controllers').controller('testPluginsCtrl', ['$scope', '$http', '$cordovaToast', '$cordovaBarcodeScanner', '$cordovaMedia', '$cordovaBadge', '$cordovaDialogs', '$cordovaSpinnerDialog', '$cordovaPinDialog', '$cordovaCamera', '$cordovaContacts', '$cordovaTouchID', '$cordovaLocalNotification', '$cordovaClipboard', '$cordovaAppRate', '$cordovaImagePicker', '$ionicLoading',
	function($scope, $http, $cordovaToast, $cordovaBarcodeScanner, $cordovaMedia, $cordovaBadge, $cordovaDialogs, $cordovaSpinnerDialog, $cordovaPinDialog, $cordovaCamera, $cordovaContacts, $cordovaTouchID, $cordovaLocalNotification, $cordovaClipboard, $cordovaAppRate, $cordovaImagePicker, $ionicLoading) {
		$scope.clipboard = function() {
			$cordovaClipboard.copy('text to copy').then(function() {
				alert('复制成功')
			}, function() {
				alert('复制失败')
			});
		};
		$scope.pay = function() {
			try {


				$ionicLoading.show()
				$http.get('https://dev1.meiguoyouxian.com/version/2110/api/newapp/place_order_new_v220.php?goods_list=[[490,1],[586,1],[637,1],[638,1]]&amount=13.30&name=%E6%B5%8B%E8%AF%95&tel=13382761314&address=%E6%B1%89%E4%B8%AD%E8%B7%AF27%E5%8F%B7cshi&remark=%E7%95%99%E8%A8%80%E5%A4%87%E6%B3%A8&mobile=13382761314&freight=0&shipping_time=%E4%B8%80%E5%91%A8%E4%B9%8B%E5%86%85%E5%85%A8%E5%A4%A9%E5%8F%AF%E6%94%B6%E8%B4%A7&shipping_type=%E9%85%8D%E9%80%81%E4%B8%8A%E9%97%A8&payment=weixin&device_id=undefined&city=%E5%8D%97%E4%BA%AC%E5%B8%82&district=%E7%8E%84%E6%AD%A6%E5%8C%BA&area=%E5%8D%97%E4%BA%AC%E6%96%B0%E8%A1%97%E5%8F%A3%E5%88%86%E6%8B%A3%E4%B8%AD%E5%BF%83&delivery_time=1%E5%B0%8F%E6%97%B6%E6%9E%81%E9%80%9F%E8%BE%BE&saletype=').success(function(data) {
					console.log(data.data);
					$ionicLoading.hide();
					var p = data.data;
					Wechat.sendPaymentRequest({
						appid:p.appid,
						mch_id: p.partnerid, // merchant id
						prepay_id: p.prepayid, // prepay id
						nonce: p.noncestr, // nonce
						timestamp: p.timestamp, // timestamp
						sign: p.sign, // signed string
					}, function() {
						alert("Success");
					}, function(reason) {
						alert("Failed: " + reason);
					});
				}).error(function() {
					$ionicLoading.hide();
					alert("qingqiu shibai")
				})
			} catch (e) {
				console.log(e);
			}

		};
		$scope.login = function() {
				var scope = "snsapi_userinfo";
				Wechat.auth(scope, function(response) {
					// you may use response.code to get the access token.
					//获取token
					$http.get("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx23af185f64e0712c&secret=71a367da83b0e848882c1c4c4af67b0c&code=" + response.code + "&grant_type=authorization_code").success(function(d) {
						console.log(d);
						$http.get('https://api.weixin.qq.com/sns/userinfo?access_token=' + d.access_token + '&openid=' + d.openid).success(function(c) {
							console.log(c);
							$scope.user=c;
							$scope.$apply();
						})
					})
				}, function(reason) {
					alert("Failed: " + reason);
				});
			}
			//点赞提示
		$scope.apprate = function() {
			$cordovaAppRate.promptForRating(true).then(function(result) {
				console.log(result);
			});
		};
		//toast
		$scope.toast = function() {
			$cordovaToast.showLongBottom("long-bottom");
		};
		//scanner
		$scope.scanner = function() {
			$cordovaBarcodeScanner.scan().then(function(r) {
				alert(JSON.stringify(r))
			}, function(error) {

			});
		};
		//scanner
		$scope.scanner_encode = function() {
			$cordovaBarcodeScanner.encode("TEXT_TYPE", "http://www.nytimes.com").then(function(r) {
				alert("编码成功" + JSON.stringify(r));
				$('#myImage').attr('src', r.file)
			}, function(e) {
				$cordovaToast.showLongBottom(e)
			})
		};
		//media
		$scope.music = {}
		$scope.media = function() {
			$scope.music = $cordovaMedia.newMedia("http://m2.music.126.net/kOUWMKYdVeHu7Hl6-Wd8Vg==/1295224697540643.mp3");
			$cordovaDialogs.confirm('', '播放一个歌曲？', ['播放', '停止'])
				.then(function(buttonIndex) {
					// no button = 0, 'OK' = 1, 'Cancel' = 2
					var btnIndex = buttonIndex;
					if (buttonIndex == 1) {
						$scope.music.play()
					} else {
						$scope.music.stop();
					}
				});

		};
		//
		$scope.bage = function() {
			$cordovaBadge.set(3).then(function() {
				$cordovaDialogs.alert('设置成功', 'ok', '确定')
					// You have permission, badge set.
			}, function(err) {
				$cordovaDialogs.alert('设置失败', 'ok', '确定')
					// You do not have permission.
			});
		};
		//spinnerdialog
		$scope.spinnerdialog = function() {
				$cordovaSpinnerDialog.show("title", "spinnerdialog");
			}
			//dialog
		$scope.dialog = function() {
			$cordovaDialogs.confirm('点击确定取消试试？', '确认框', ['确定', '取消'])
				.then(function(buttonIndex) {
					// no button = 0, 'OK' = 1, 'Cancel' = 2
					var btnIndex = buttonIndex;
					if (buttonIndex == 1) {
						$cordovaDialogs.alert('你点击的是确定按钮', '提示框', '确定')
					} else {
						$cordovaDialogs.prompt('msg', 'title', ['确定', '取消'], '哈哈哈哈哈')
							.then(function(result) {
								var input = result.input1;
								// no button = 0, 'OK' = 1, 'Cancel' = 2
								$cordovaDialogs.alert(input, '提示框', '确定')
							});
					}
				});
		};
		//pindialog
		$scope.pindialog = function() {
			$cordovaPinDialog.prompt('pindialog 提示').then(
				function(result) {
					alert(result)
				},
				function(error) {
					alert(error)
				})
		};
		//camera
		$scope.camera = function() {
			$cordovaDialogs.confirm('', '获取图片', ['本地图片', '拍照'])
				.then(function(buttonIndex) {
					// no button = 0, 'OK' = 1, 'Cancel' = 2
					var btnIndex = buttonIndex;
					if (buttonIndex == 1) {
						var options = {
							maximumImagesCount: 10,
							width: 800,
							height: 800,
							quality: 80
						};

						$cordovaImagePicker.getPictures(options)
							.then(function(results) {
								for (var i = 0; i < results.length; i++) {
									console.log('Image URI: ' + results[i]);
								}
								var image = document.getElementById('myImage');
								image.src = results[0];
							}, function(error) {

								// error getting photos
							});
					} else {
						var options = {
							quality: 100,
							destinationType: Camera.DestinationType.DATA_URL,
							sourceType: Camera.PictureSourceType.CAMERA,
							allowEdit: true,
							encodingType: Camera.EncodingType.JPEG,
							targetWidth: 300,
							targetHeight: 300,
							popoverOptions: CameraPopoverOptions,
							saveToPhotoAlbum: false,
							correctOrientation: true
						};

						$cordovaCamera.getPicture(options).then(function(imageData) {
							var image = document.getElementById('myImage');
							image.src = "data:image/jpeg;base64," + imageData;
						}, function(err) {
							alert('拍照失败')
						});
						$cordovaCamera.cleanup();
					}
				});
		};
		//contact
		$scope.contact = function() {
			// find all contacts
			var options = new ContactFindOptions();
			options.filter = "";
			var filter = ["displayName", "addresses"];
			navigator.contacts.find(filter, function(r) {
				alert(JSON.stringify(r))
			}, function(a) {
				alert(a)
			}, options);
		};
		//iostouchid
		$scope.iostouchid = function() {
			$cordovaTouchID.authenticate("text").then(function() {
				alert('验证成功')
			}, function() {
				alert('验证失败')
			});
		};
		//localnotification
		$scope.localnotification = function() {
			$cordovaLocalNotification.schedule({
				id: 1,
				title: 'Title here',
				text: 'Text here',
				data: {
					customProperty: 'custom value'
				}
			}).then(function(result) {
				alert(result);
			});
		};
	}
])