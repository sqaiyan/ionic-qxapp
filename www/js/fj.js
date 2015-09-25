var mapApp = angular.module('mapApp', []);
var mapCtrl = mapApp.controller('mapCtrl', function($scope, $http) {
	$scope.map = new BMap.Map('map');
	$scope.drew;
	$scope.city = 0;
	$scope.areaCst = {};
	$scope.citylist = {}
	$scope.citypoints = {};
	$http.get('https://meiguoyouxian.com/statistics/admin/controller/city.php?method=getCityList').success(function(data) {
		$scope.citylist = data;
		$scope.changecity()
	})
	$scope.changecity = function() {
		//选择城市
		$scope.map.centerAndZoom($scope.citylist[$scope.city].city_name, 12);
		$http.get('https://meiguoyouxian.com/statistics/admin/controller/sorting.php?method=getSortingList&city_id=' + $scope.citylist[$scope.city].city_id).success(function(data) {
			$scope.citypoints = data;
			$scope.drewplist();
		})
	};


	$scope.defaultcss = {
		disable: {
			poly: {
				strokeColor: "#E6705B", //边线颜色。
				fillColor: "#555", //填充颜色。当参数为空时，圆形将没有填充效果。
				strokeWeight: 1, //边线的宽度，以像素为单位。
				strokeOpacity: 1, //边线透明度，取值范围0 - 1。
				fillOpacity: 0.4, //填充的透明度，取值范围0 - 1。
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
				if ((undefined != $scope.areaCst.sorting_area) && ($scope.areaCst.sorting_area.length)) {
					e.overlay.remove();
					alert('已经画过配送区域多边形了，可右键删除重新画')
					return;
				}
				$scope.areaCst.sorting_area = $scope.getpoly(e.overlay.W);
				console.log($scope.areaCst.sorting_area);
				$scope.$apply();
				e.overlay.addEventListener("lineupdate", function(a) {
					$scope.areaCst.sorting_area = $scope.getpoly(a.currentTarget.W);
					console.log($scope.areaCst);
					$scope.$apply();
				});
				e.overlay.addEventListener('rightclick', function() {
				if (window.confirm('您确定删除此配送范围多边形吗？')) {
					$scope.areaCst.sorting_area = [];
					e.overlay.remove()
					$scope.$apply();
				}
			})
			} else {
				if ($scope.areaCst.longitude) {
					alert('已经标注过配送点，可拖拽移动修改，请勿重复添加');
					e.overlay.remove();
					return;
				}
				e.overlay.enableDragging();
				console.log(e);
				$scope.areaCst.longitude = e.overlay.point.lng;
				$scope.areaCst.latitude = e.overlay.point.lat;
				$scope.$apply();
				e.overlay.addEventListener('dragend', function(a) {
					console.log(a);
					$scope.areaCst.longitude = a.point.lng;
					$scope.areaCst.latitude = a.point.lat;
					$scope.$apply();
				})
			}
		}
		//e.overlay.enableEditing();
	};
	$scope.getpoly = function(w) {
		var a = [];
		for (var i = 0; i < w.length - 1; i++) {
			a.push({
				lng: w[i].lng,
				lat: w[i].lat
			})
		}
		return a;
	}
	$scope.drewoverlay = function(i, area, css, isedit) {
		$scope.maplist[i] = {};
		var po = [];
		angular.forEach(area.sorting_area, function(g, j) {
			po.push(new BMap.Point(g.lng, g.lat));
		});
		$scope.maplist[i].marker = new BMap.Marker(new BMap.Point(area.longitude, area.latitude));
		$scope.maplist[i].poly = new BMap.Polygon(po, css.poly);
		$scope.maplist[i].label = new BMap.Label(area.sorting_name + '--' + area.team_name, {
			position: new BMap.Point(area.longitude, area.latitude),
			offset: new BMap.Size(0, -60)
		});
		$scope.maplist[i].label.setStyle(css.label);
		$scope.map.addOverlay($scope.maplist[i].marker);
		$scope.map.addOverlay($scope.maplist[i].poly);
		$scope.map.addOverlay($scope.maplist[i].label);

		if (isedit) {
			$scope.maplist[i].poly.enableEditing();
			$scope.maplist[i].marker.enableDragging();
			$scope.maplist[i].marker.addEventListener('dragend', function(e) {
				$scope.areaCst.longitude = e.point.lng;
				$scope.areaCst.latitude = e.point.lat;
				$scope.$apply();
			});
			$scope.maplist[i].poly.addEventListener('rightclick', function() {
				if (window.confirm('您确定删除此配送范围多边形吗？')) {
					$scope.maplist[i].poly.remove()
					$scope.areaCst.sorting_area = [];
					$scope.$apply();
				}
			})
			$scope.maplist[i].poly.addEventListener("lineupdate", function(a) {
				$scope.areaCst.sorting_area = $scope.getpoly(a.currentTarget.W);
				$scope.$apply();
			});
		}
	};
	$scope.updatefj = function() {
			//提交
			if (!$scope.areaCst.longitude) {
				alert('请选择配送点');
				return;
			}
			if (!$scope.areaCst.sorting_area.length) {
				alert('请画出配送范围');
				return;
			}
			var poiinpoll = {
				lng: $scope.areaCst.longitude,
				lat: $scope.areaCst.latitude
			};
			console.log(poiinpoll);
			poiinpoll = $scope.isInsidePolygon(poiinpoll, $scope.areaCst.sorting_area);
			if (!poiinpoll) {
				alert('配送点竟然不在画的配送范围内，are you sure?')
			}
			console.log($scope.areaCst);
			$http({
				method:'get',
				url:'https://meiguoyouxian.com/statistics/admin/controller/sorting.php?method=updateSorting',
				params:{
					params:$scope.areaCst
				}
			}).success(function(data){
				if(data.success==1){
					alert('更新成功')
				}
			})
	};
	//新增
	$scope.addfj=function(){
		console.log($scope.areaCst);
	};
	//jingtai tu
	$scope.getjingt=function(){
		var p="";
		angular.forEach($scope.areaCst.sorting_area,function(data){
			p+=data.lng+','+data.lat+';'
		});
		console.log(p);
		$('#jingtai').attr('src','http://api.map.baidu.com/staticimage?width=400&height=400&center='+$scope.areaCst.longitude+','+$scope.areaCst.latitude+'&zoom=14&paths='+p+'&pathStyles=0xff2200,1,.5,0xffaa00&scale=2');
		$scope.jingt=true;
	}
		//画图层
	$scope.drewplist = function() {
		if (!!!$scope.citypoints.length) return;
		$scope.maplist = new Array($scope.citypoints.length);
		//清除所有图层
		$scope.map.clearOverlays();
		$scope.map.setZoom(12)
			//	$scope.map.centerAndZoom($scope.citylist[$scope.city].city_name, 12);
			//判断是否选择某个配送点
		angular.forEach($scope.citypoints, function(data, i) {
			if (($scope.areaCst.city_id != '') && (data.sorting_id == $scope.areaCst.sorting_id)) {
				$scope.drewoverlay(i, $scope.areaCst, $scope.defaultcss.enable, true);
				console.log("2222");
				$scope.map.centerAndZoom(new BMap.Point($scope.areaCst.longitude, $scope.areaCst.latitude), 15);
			} else {
				$scope.drewoverlay(i, data, $scope.defaultcss.disable);

			}
		})
	};
	$scope.changeopts = function() {
			$scope.areaCst = ($scope.cp < 0) ? {} : $scope.citypoints[$scope.cp];
			
		}
		//分拣中心
	$scope.$watch('areaCst.sorting_id', function() {
		$scope.drewplist();
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
	//判断点在多边形内
	$scope.isInsidePolygon = function(pt, poly) {
		for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].lat <= pt.lat && pt.lat < poly[j].lat) || (poly[j].lat <= pt.lat && pt.lat < poly[i].lat)) &&
			(pt.lng < (poly[j].lng - poly[i].lng) * (pt.lat - poly[i].lat) / (poly[j].lat - poly[i].lat) + poly[i].lng) &&
			(c = !c);
		return c;
	};
	$scope.actinfo = function() {
		alert("1.选择城市后默认列出所有配送点\n2.选择配送点即可编辑信息，提交修改，此时地图操作只可拖动配送点位置和修改配送范围，编辑配送范围多边形鼠标右键可删除多边形重新添加编辑\n3.新增配送点信息可点击地图右上方第二个图标为新增配送点位置，第五个为添加编辑配送范围的多边形，双击鼠标左键为完成多边形绘制")
	}
});