angular.module('qx.controllers').controller('searchController', ['$scope', '$http', 'updateCart',
				function($scope, $http, updateCart) {
					$scope.isloading = false;
					//热门搜索关键词
					$http({
						method: 'get',
						url: basepath + "product/search_words/?access_token=" + access_token
					}).success(function(data) {
						$scope.hotwords = data.data;
					});
					//搜索
					$scope.searchByword = function(word) {
						$scope.keyword=word||$scope.keyword;
						if (!$scope.keyword) {
							artDialog.alert('请输入关键词');
							return;
						}
						$scope.prolis = [];
						$scope.isloading = true;
						$http({
							method: 'get',
							url: basepath + "product/search3/?access_token=" + access_token + "&name=" +
								encodeURIComponent(encodeURIComponent($scope.keyword))
						}).success(function(data) {
							$scope.isloading = false;
							$scope.prolist = data.data;
							if (!$scope.prolist.length) {
								$scope.keyword="";
								artDialog.alert('暂无商品，换个关键词试试');
							}
						}).error(function(a, b, c, d) {
							$scope.isloading = false;
							artDialog.alert('搜索失败');
						})
					}
				}
			])