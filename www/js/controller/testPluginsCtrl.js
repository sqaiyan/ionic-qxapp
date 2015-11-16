angular.module('qx.controllers').controller('testPluginsCtrl', ['$scope', '$http', '$cordovaToast', '$cordovaBarcodeScanner', '$cordovaMedia', '$cordovaBadge', '$cordovaDialogs', '$cordovaSpinnerDialog', '$cordovaPinDialog', '$cordovaCamera', '$cordovaContacts', '$cordovaTouchID', '$cordovaLocalNotification', '$cordovaClipboard', '$cordovaAppRate', '$cordovaImagePicker',
	function($scope, $http, $cordovaToast, $cordovaBarcodeScanner, $cordovaMedia, $cordovaBadge, $cordovaDialogs, $cordovaSpinnerDialog, $cordovaPinDialog, $cordovaCamera, $cordovaContacts, $cordovaTouchID, $cordovaLocalNotification, $cordovaClipboard, $cordovaAppRate, $cordovaImagePicker) {
		$scope.clipboard = function() {
			$cordovaClipboard.copy('text to copy').then(function() {
				alert('复制成功')
			}, function() {
				alert('复制失败')
			});
		};
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