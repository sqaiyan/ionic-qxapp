angular.module('qx.controllers').controller('productController', ['$scope', '$http', "$wilddogArray",
	function($scope, $http, $wilddogArray) {
		$scope.navlist = $wilddogArray(new Wilddog(wdurl + "protype")); //类别
		$scope.models = {}
		$scope.t={}
		$scope.models.uid = access_token;
		var list =ref.child("prolist");
		$scope.prolist=$wilddogArray(list);
		
		console.log($scope.prolist);
		$scope.subpro = function() {
			$scope.prolist.$add($scope.models).then(function(ref) {
				var id=ref.key()
				console.log("added record with id " + id);
			});
		};
		
		$scope.subtype=function(){
			console.log($scope.t);
			$wilddogArray(ref.child("protype")).$add($scope.t).then(function(data){
				console.log(data.key());
			})
		}
	}
])