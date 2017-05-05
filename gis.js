// 百度地图API功能
    var map = new BMap.Map('map');
    var poi = new BMap.Point(121.494457,31.192427);
    map.centerAndZoom(poi, 10);
    map.enableScrollWheelZoom();  
	map.disableDoubleClickZoom();
	var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
	map.addControl(top_left_navigation);  
    var overlays = [];
	var polygons = [];
		
	var delPolygon  = function( poly){
		var name = poly.properties.name
		var ov = [];
		var ps = [];
		for(var i in  overlays){
			var nm = overlays[i].properties.name;
			if(nm !== name){
				ov.push(overlays[i]);
			}
		}
		for(var j in  polygons){
			var nm = polygons[j].properties.name;
			if(nm !== name){
				ps.push(polygons[j]);
			}
		}
		polygons = ps;
		overlays = ov;
	}
	var removeMarker = function(e,ee,marker){	
		map.removeOverlay(marker);
		delPolygon(marker);
	}
	
	var activedPolygon = null;		//选中多边形
	var edit = function(e,ee,marker){	
	//	console.log(marker);
		activedPolygon = marker;
		marker.enableEditing();
	}
	var editComplete = function(e,ee,marker){	
		marker.disableEditing();
		activedPolygon = null;
	}
	var toFeature = function(e,ee,marker){	
		var f = polygon2Feature(marker);
		console.log(f);
	}
	var editName= function(){
		prompt("输入地区名称：","");
	}
	
	//完成编辑
	var overlaycomplete = function(e){
		//创建右键菜单
		var markerMenu=new BMap.ContextMenu();
		markerMenu.addItem(new BMap.MenuItem('删除',removeMarker));		
		e.overlay.addContextMenu(markerMenu);
        overlays.push(e.overlay);
		var areaName = prompt("输入地区名称：","");
		var opts = {
		  title : "地区名称:" , // 信息窗口标题
		  enableMessage:false//设置允许信息窗发送短息
		}
		var infoWindow = new BMap.InfoWindow(areaName, opts);  // 创建信息窗口对象 
		e.overlay.addEventListener("click", function(e){          
			map.openInfoWindow(infoWindow,e.point); //开启信息窗口
		});
		var properties = {name:areaName};
		e.overlay["properties"] = properties;
		if(e.drawingMode == "polygon"){
			markerMenu.addItem(new BMap.MenuItem('编辑',edit));
			markerMenu.addItem(new BMap.MenuItem('完成编辑',editComplete));			
			markerMenu.addItem(new BMap.MenuItem('toFeature',toFeature));			
			polygons.push(e.overlay);
		}
    };
    var styleOptions = {
        strokeColor:"green",    //边线颜色。
        fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 0.5,       //边线的宽度，以像素为单位。
        strokeOpacity: 1,	   //边线透明度，取值范围0 - 1。
        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    }
    //实例化鼠标绘制工具
    var drawingManager = new BMapLib.DrawingManager(map, {
        isOpen: true, //是否开启绘制模式
        enableDrawingTool: true, //是否显示工具栏
		drawingType: BMAP_DRAWING_POLYGON,
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
            offset: new BMap.Size(5, 5), //偏离值
            scale: 0.8, //工具栏缩放比例
			drawingModes : [           
				BMAP_DRAWING_POLYGON
			]
        },
        polygonOptions: styleOptions //多边形的样式
    });  
	drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);
	 //添加鼠标绘制工具监听事件，用于获取绘制结果
    drawingManager.addEventListener('overlaycomplete', overlaycomplete);
    function clearAll() {
		for(var i = 0; i < overlays.length; i++){
            map.removeOverlay(overlays[i]);
        }
        overlays.length = 0 ;
	    polygons= [];
    }
	
	
	//地图拖拽功能
	$("#dragBtn").data("isDrag",true).val("禁止拖拽");
	$("#dragBtn").on("click",function(){
		var $this = $(this);
		var isDrag = $this.data("isDrag");
		if(isDrag){
			$this.data("isDrag",false);
			$this.val("启用拖拽");
			map.disableDragging(); 
		}else{
			$this.data("isDrag",true);
			$this.val("禁止拖拽");
			map.enableDragging();
		}
	});
	
	$("#geoBtn").on("click",function(){
		var geoJson = polygons2GeoJSON();
		$("#geoContent").val(JSON.stringify(geoJson,null,2));
	});
	
	$("#updatePolygons").on("click",function(){
		clearAll();
		var geoJson = JSON.parse($("#geoContent").val());
		var ps =  geoJSON2Polygon(geoJson);
		polygons = $.extend(true,[],ps);
		overlays = $.extend(true,[],ps);
		addPloys2map(polygons);		
	});
	
	
	var sClick = function(e){
		var p = e.point.lng + "," + e.point.lat;
		$("#sTxt").val(p).data("point",e.point);
	};
	var eClick = function(e){
		var p = e.point.lng + "," + e.point.lat;
		$("#eTxt").val(p).data("point",e.point);
	};
	$("#sSelect").data("isFinished",false);
	$("#sSelect").on("click",function(){
		var $this = $(this);
		var isFinished =  $this.data("isFinished");
		if(isFinished ==false){
			$this.val("完成选择");
			map.addEventListener("click",sClick);
			$this.data("isFinished",true);
		}else{
			$this.val("选择多边形起点");
			map.removeEventListener("click", sClick);
			$this.data("isFinished",false);
		}				
	});
	$("#eSelect").data("isFinished",false);
	$("#eSelect").on("click",function(){
		var $this = $(this);
		var isFinished =  $this.data("isFinished");
		if(isFinished ==false){
			$this.val("完成选择");
			map.addEventListener("click",eClick);
			$this.data("isFinished",true);
		}else{
			$this.val("选择多边形终点");
			map.removeEventListener("click", eClick);
			$this.data("isFinished",false);
		}				
	});
/////////////////////
 var polygon2Feature = function(polygonArr){
	var f = {
		"type": "Feature",
		"properties": {
			"name": ""
		},
		"geometry": {
			"type": "MultiPolygon",
			"coordinates": []
		}
	}
	
	var feature = $.extend(true,{},f);
	
	if(polygonArr instanceof Array){
		feature.properties = polygonArr[0].properties;
		for(var i in polygonArr){
			var polygon = polygonArr[i];
			var ps = polygon.getPath();
			var points = [];
			for(var j in ps){
				var p = ps[j];
				var pArr = [p.lng,p.lat];
				points.push(pArr);
			}
			points.push([ps[0].lng,ps[0].lat]);
			var a = [points]; 
			feature.geometry.coordinates[i]= a;		
		}		
	}
	return feature;
}

//多边形2GeoJSON
//var areaMap = {name:[]};
var  getAreaMap = function( polygonArr ){
	var areaMap = {};
	for(var i in polygonArr){
		var poly = polygonArr[i];
		var areaName = poly.properties.name;
		if(!areaMap[areaName]){
			areaMap[areaName] =  [];
			areaMap[areaName].push(poly);
		}else{			
			areaMap[areaName].push(poly);
		}
	}
	return areaMap;
}


var polygons2GeoJSON = function(){
	var geoJson ={
		"type": "FeatureCollection",
		"features": []
	};
	var features = [];
	var polygonArr = $.extend(true,[] ,polygons);
	var areaMap = getAreaMap(polygonArr);
	//console.log(areaMap);
	for(var i in areaMap){
		var f = polygon2Feature(areaMap[i]);
		features.push(f);
	}
	geoJson.features = features;
	return geoJson;
};


//
var geoJSON2Polygon = function( geoGson ){
	var features = geoGson.features;
	var ploys = [];
	for(var i in  features){
		var f = features[i];
		var  coordinates  = f.geometry.coordinates;
		for (var j in coordinates){
			var pointArr = coordinates[j][0];		
			pointArr.pop();
			var pArray = [];
			for(var k in pointArr){
				var dot = pointArr[k];
				var p = new BMap.Point(parseFloat(dot[0]),parseFloat(dot[1]));
				pArray.push(p);
			}
			var ploy = new BMap.Polygon(pArray,styleOptions);
			ploy["properties"] =   f.properties ? f.properties : {};
			map.addOverlay(ploy);
			ploys.push(ploy);
		}
	}
	return ploys;	
}

var addPloys2map = function(polys){
	for(var i in polys){
		var ploy = polys[i];
		var markerMenu=new BMap.ContextMenu();
		markerMenu.addItem(new BMap.MenuItem('删除',removeMarker));		
		markerMenu.addItem(new BMap.MenuItem('编辑',edit));
		markerMenu.addItem(new BMap.MenuItem('完成编辑',editComplete));			
		markerMenu.addItem(new BMap.MenuItem('toFeature',toFeature));		
		ploy.addContextMenu(markerMenu);
		var opts = {
		  title : "地区名称:" , // 信息窗口标题
		  enableMessage:false//设置允许信息窗发送短息
		}
		var infoWindow = new BMap.InfoWindow(ploy["properties"].name, opts);  // 创建信息窗口对象 
		ploy.addEventListener("click", function(e){          
			map.openInfoWindow(infoWindow,e.point); //开启信息窗口
		});
		map.addOverlay(ploy);
	}	
}


function createMouseMoveLabel(c) {
    var a = map.pixelToPoint(new BMap.Pixel(0, 0));
    var b = c.lng + "," + c.lat;
    var d = new BMap.Label(b, {point: a,offset: new BMap.Size(13, 20),enableMassClear: false});
    d.setStyle({background: "#fff",border: "#999 solid 1px",zIndex: 10000000});
    map.addOverlay(d);
    temp.mouseLabel = d
}
var temp = {pt: [],mk: [],iw: [],iwOpenIndex: null,mouseLabel: null,poiSearchMark: null,geoCoder: null};
 map.addEventListener("mousemove", function(c) {
	// console.log(arguments);
        if (!temp.mouseLabel) {
            createMouseMoveLabel(c.point)
        }
        if (!temp.mouseLabel.isVisible()) {
            temp.mouseLabel.show()
        }
        var k = temp.mouseLabel;
        var h = map.getContainer();
        var g = h.clientWidth;
        var f = h.clientHeight;
        var j = 132;
        var i = 19;
        var n = map.pointToPixel(c.point).x + 13;
        var l = map.pointToPixel(c.point).y + 20;
        var m = map.pixelToPoint(new BMap.Pixel(g - j - 13, f - i - 20));
        var b = map.pixelToPoint(new BMap.Pixel(n - j - 33, f - i - 20));
        var d = c.point;
        if (g - n < j) {
            d = new BMap.Point(m.lng, d.lat)
        }
        if (f - l < i) {
            d = new BMap.Point(d.lng, m.lat)
        }
        if (g - n - 16 < j && f - l < i) {
            d = b
        }
        k.setPosition(d);
        k.setContent(c.point.lng + "," + c.point.lat)
    });
	
	
   var mathUtils = {
		toRad : function (d){
		    return d * Math.PI / 180.0;
		},
		toDegree :function(rad){
			return 180 * rad / Math.PI;
		}
	};
	var EARTH_RADIUS = 6378.1370;	
	/**
	 * 计算两经纬度距离（球面）
	 * @param pointSrc {x:lng,y:lat} 
	 * @param pointOffset {x:lng,y:lat}
	 * @return Float 
	 */
	var calcDistance = function(pointSrc,pointOffset){
		var distance = 0;
		var radLat1 = mathUtils.toRad( parseFloat(pointSrc.y) );
		var radLat2 = mathUtils.toRad( parseFloat(pointOffset.y) );
		var dlat = radLat1 - radLat2;
		var dlng = mathUtils.toRad( parseFloat(pointSrc.x)) - mathUtils.toRad(parseFloat(pointOffset.x));
		distance = 2 * EARTH_RADIUS * Math.asin(Math.sqrt(
				Math.pow(Math.sin(dlat / 2), 2)
				+ Math.cos(radLat1)
				* Math.cos(radLat2)
				* Math.pow(Math.sin(dlng / 2), 2)));
		return distance;
	};
	
	
$("#genArc").click(function(){
	var sp = $("#sTxt").data("point");
	var ep = $("#eTxt").data("point");
	var spobj = {x:sp.lng,y:sp.lat};
	var epobj = {x:ep.lng,y:ep.lat};
	if(!activedPolygon){
		alert("使多边形处于编辑状态");
		return;
	}
	var points = activedPolygon.getPath();
	var  sminIndex ,eminIndex ;
	var sminDis = -1; 
	var eminDis = -1;
	for(var i in points){
		var p = points[i];
		var pobj = {x:p.lng,y:p.lat};
		var sdis = calcDistance(spobj,pobj);
		var edis = calcDistance(spobj,pobj);
		if(sminDis < 0){
			sminDis = sdis;
			sminIndex = 0;
		}else{			
			if(sdis < sminDis ){
				sminDis = sdis;
				sminIndex = i;
			}
		}
		if(eminDis < 0){
			eminDis = edis;
			eminIndex = 0;
		}else{			
			if(edis < eminDis ){
				eminDis = edis;
				eminIndex = i;
			}
		}		
	//	console.log(points[i]);
	}	
	//console.log(sminIndex+"," +eminIndex);
	//console.log(points[sminIndex]);
	//console.log(points[eminIndex]);
	var pointsCopy = $.extend(true,[],points);
	var isBig =  sminIndex > eminIndex;
	var arc = [];
	var arcB = [];
	var rmArc = [];
	var minIndex = null;
	var maxIndex = null;
	if(isBig){
		 minIndex = eminIndex;
		 maxIndex = sminIndex;
		 arc =  pointsCopy.slice(eminIndex,sminIndex +1);
	}else{
		minIndex = sminIndex;
		maxIndex = eminIndex;
		 arc = pointsCopy.slice(sminIndex,eminIndex +1);
	}
	//console.log(arc);
	for(var j in pointsCopy){
		if( j< minIndex || j> maxIndex){
			arcB.push(pointsCopy[j]);
		}
	}	
//	console.log(arcB);		
	var parcA = toPointArray(arc);
	$("#p1Content").val(JSON.stringify(parcA)).data("parcA",parcA);
	var parcB= toPointArray(arcB);
	$("#p2Content").val(JSON.stringify(parcB)).data("parcB",parcB);
});
$("#sRev").click(function(){
	var data =$("#p1Content").data("parcA");
	if(data){
		data = data.reverse();
		$("#p1Content").val(JSON.stringify(data)).data("parcA",data);
	}
});
$("#eRev").click(function(){
	var data =$("#p2Content").data("parcB");
	if(data){
		data = data.reverse();
		$("#p2Content").val(JSON.stringify(data)).data("parcB",data);
	}
});
var toPointArray = function( points ){
	var ps = [];
	for(var j in points){
		var p = [points[j].lng , points[j].lat];
		ps.push(p);
	}
	return ps;	
};

function addHotDis() {
	$.ajax({
		url: 'http://10.221.247.7:8080/services/ws/fast_query/area/ipmsdm/cfg-hotConfigQueryContent',
		// url: 'http://10.221.247.7:8080/INAS/sml/query/area-cfg-hotConfigQueryContent',
		type: 'GET',
		data: {}
	})
		.done(function(data){
			var targetObj = data[0];
			var content = JSON.parse(targetObj.content);
			var lat = parseFloat(content.lat),
				lng = parseFloat(content.lon);
			var heatIndexDis = targetObj.name;
			var urlCluster = 'http://10.221.247.7:8080/services/ws/fast_query/area/re/re_cellByHotname?hotspot=' + encodeURIComponent(heatIndexDis);
			$.ajax({
				url: urlCluster,
				type: 'get'
			})
				.done(function(res) {
					var point;
					res.map(function(obj) {
						var lat = parseFloat(obj.lat);
						var lng = parseFloat(obj.lon);
						var bd_point = wgs84tobd09(lng,lat);
						point = new BMap.Point(bd_point[0],bd_point[1]);
						addMarker(point);
					});
					map.centerAndZoom(point, 14);
				});
		}); 
}
// 编写自定义函数,创建标注
function addMarker(point) {
	var marker = new BMap.Marker(point);
	map.addOverlay(marker);
}
	
	
	
	
	