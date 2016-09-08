angular.module('qx.controllers').controller('bagCtrl', function($scope, $state,$wilddogArray) {
	//购物袋
	$scope.models = {};
	$scope.models.cart_count = $scope.models.price_count = 0; //商品数量和总价
	$scope.checkall = false;
		$scope.models.prolist=$wilddogArray(ref.child("bag/"+access_token));
		$scope.models.prolist.$loaded().then(function(data){})
	//全选
	$scope.selectall = function() {
		if(!$scope.models.checkall) {
			$scope.models.prolist.forEach(function(i){
				i.selected = 'true';
			})
			 $scope.models.checkall = true;
		} else {
			$scope.models.checkall = false;
		}
	};
})