var mapApp = angular.module('mapApp', []);
var mapCtrl = mapApp.controller('mapCtrl', function($scope, $http) {
	$scope.map = new BMap.Map('map');
	$scope.drew;
	$scope.citylist = [{
		name: '南京市',
		id: 0
	}, {
		name: '上海市',
		id: 1
	}];
	$scope.city = 0;
	$scope.$watch('city', function() {
		//选择城市
		$scope.map.centerAndZoom($scope.citylist[$scope.city].name, 12);
	});
	$scope.areaCst = {};
	$scope.citypoints = po; //网点数组
	$scope.defaultcss = {
		disable: {
			poly: {
				strokeColor: "red", //边线颜色。
				fillColor: "pink", //填充颜色。当参数为空时，圆形将没有填充效果。
				strokeWeight: 1, //边线的宽度，以像素为单位。
				strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
				fillOpacity: 0.3, //填充的透明度，取值范围0 - 1。
				strokeStyle: 'solid' //边线的样式，solid或dashed。
			},
			label: {
				color: "red",
				fontSize: "12px",
				borderRadius: '2px',
				padding: '5px',
				height: '20px',
				transform: 'translate3d(-50%,0,0)',
				lineHeight: "20px"
			}
		},
		enable: {
			poly: {
				strokeColor: "blue", //边线颜色。
				fillColor: "orange", //填充颜色。当参数为空时，圆形将没有填充效果。
				strokeWeight: 1, //边线的宽度，以像素为单位。
				strokeOpacity: 0.7, //边线透明度，取值范围0 - 1。
				fillOpacity: 0.5, //填充的透明度，取值范围0 - 1。
				strokeStyle: 'dashed' //边线的样式，solid或dashed。
			},
			label: {
				color: "#666",
				fontSize: "12px",
				borderRadius: '2px',
				padding: '5px',
				height: '20px',
				transform: 'translate3d(-50%,0,0)',
				lineHeight: "20px",
			}
		}
	};
	$scope.overlaycomplete = function(e) {
		console.log(e);
		//画图完成事件，判断是marker或是矩形区域，否则删除图形
		var mode = e.drawingMode;
		if ((e.drawingMode != 'marker') && (e.drawingMode != 'polygon')) {
			console.log("不是标记或多边形");
			alert('只能使用标记或多边形工具')
			e.overlay.remove()
		} else {
			$scope.drew.close();
			if (e.drawingMode == 'polygon') {
				e.overlay.enableEditing();
				e.overlay.addEventListener("lineupdate", function(e) {});
			} else {
				e.overlay.enableDragging();
				e.overlay.addEventListener('dragend', function(e) {
					console.log(e);
				})
			}
		}
		//e.overlay.enableEditing();
	};
	$scope.drewoverlay = function(i, area, css, isedit) {
			$scope.maplist[i] = {};
			var po = [];
			angular.forEach(area.polygon, function(g, j) {
				po.push(new BMap.Point(g.x, g.y));
			});
			$scope.maplist[i].marker = new BMap.Marker(new BMap.Point(area.poi.lng, area.poi.lat));
			$scope.maplist[i].poly = new BMap.Polygon(area.pollatgon, css.poly);
			$scope.maplist[i].label = new BMap.Label(area.name, {
				position: new BMap.Point(area.poi.lng, area.poi.lat),
				offset: new BMap.Size(0, -60)
			});
			$scope.maplist[i].label.setStyle(css.label);
			$scope.map.addOverlay($scope.maplist[i].marker);
			$scope.map.addOverlay($scope.maplist[i].poly);
			$scope.map.addOverlay($scope.maplist[i].label);
			isedit ? $scope.maplist[i].poly.enableEditing() : '';
			isedit ? $scope.maplist[i].marker.enableDragging() : '';
		}
		//更新城市后监听配送点信息，画图层
	$scope.$watch('citypoints', function() {
			$scope.drewplist();
		})
		//画图层
	$scope.drewplist = function() {
		$scope.maplist = new Array($scope.citypoints.length);
		//清除所有图层
		$scope.map.clearOverlays();
		$scope.maplist = {};
		//判断是否选择某个配送点

		angular.forEach($scope.citypoints, function(data, i) {
			if ($scope.areaCst.id == data.id) {
				$scope.drewoverlay(i, $scope.areaCst, $scope.defaultcss.enable, true);
				console.log($scope.areaCst.poi.lng);
				$scope.map.centerAndZoom(new BMap.Point($scope.areaCst.poi.lng, $scope.areaCst.poi.lat), 16);
			} else {
				$scope.drewoverlay(i, data, $scope.defaultcss.disable)
			}
		})
	}


	//选择分拣中心
	$scope.changecp = function() {
		$scope.areaCst = $scope.citypoints[$scope.cp];
	};
	//分拣中心
	$scope.$watch('areaCst', function() {
		//if($scope.areaCst.poi&&$scope.areaCst.pollatgon){
			$scope.drewplist();

		//}
		//$scope.map.removeOverlay($scope.areaCst.name);
	}, true);
	//画图工具
	$scope.drew = new BMapLib.DrawingManager($scope.map, {
		isOpen: false, //是否开启绘制模式
		enableDrawingTool: true, //是否显示工具栏
		drawingToolOptions: {
			anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
			offset: new BMap.Size(5, 5), //偏离值
			scale: 0.8 //工具栏缩放比例
		},
		polygonOptions: $scope.defaultcss.enable.poly //多边形的样式-可编辑样式
	});
	//监听画图完成动作
	$scope.drew.addEventListener('overlaycomplete', $scope.overlaycomplete);

});