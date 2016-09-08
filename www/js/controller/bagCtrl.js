angular.module('qx.controllers').controller('bagCtrl', function($scope, $state, $wilddogArray) {
	//购物袋
	$scope.models = {};
	$scope.models.cart_count = $scope.models.price_count = 0; //商品数量和总价
	$scope.checkall = false;
	$scope.models.prolist = $wilddogArray(ref.child("bag/" + access_token));
	$scope.models.prolist.$loaded().then(function(){});
	$scope.$watch("modes.prolist",function(){
		$scope.models.price_count=0;
		console.log("2");
		//if(!$scope.models.prolist.length)return
		$scope.models.prolist.forEach(function(i) {
			console.log(i);
			if(i.selected){
				console.log(i);
				$scope.models.price_count=$scope.models.price_count+i.product_price*i.amount
			}
		})
		console.log($scope.models.price_count);
	})
		//全选
	$scope.selectall = function() {
		if(!$scope.models.checkall) {
			$scope.models.prolist.forEach(function(i) {
				i.selected = true;
			})
			$scope.models.checkall = true;
		} else {
			$scope.models.checkall = false;
		}
	};
})