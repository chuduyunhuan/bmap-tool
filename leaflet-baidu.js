 /**
 * Projection class for Baidu Spherical Mercator
 *
 * @class BaiduSphericalMercator
 * Kerry W, eastcom software
 */
Array.prototype.unique = function(field) {
	var n = {},
	r = []; //n为hash表，r为临时数组
	for (var i = 0,
	len = this.length; i < len; i++) {
		if (!n[this[i][field]]) {
			n[this[i][field]] = true; //存入hash表
			r.push(this[i]); //把当前数组的当前项push到临时数组里面
		}
	}
	return r;
};
Array.prototype.groupByField = function(field) {
 	var map = {},
 	dest = [];
 	for (var i = 0; i < this.length; i++) {
 		var ai = this[i];
 		if (!map[ai[field]]) {
 			var obj = {data: [ai]};
 			obj[field] = ai[field];
 			dest.push(obj);
 			map[ai[field]] = ai;
 		} else {
 			for (var j = 0; j < dest.length; j++) {
 				var dj = dest[j];
 				if (dj[field] == ai[field]) {
 					dj.data.push(ai);
 					break;
 				}
 			}
 		}
 	}
 	return dest;
 };
 Function.prototype.after = function(afterfn) {
    var _self = this;
    return function() {
        var ret = _self.apply(this, arguments); //执行原函数
        afterfn.apply(this, arguments);
        return ret;
    };
 };
 Function.prototype.before = function(beforefn) {
    var _self = this; //原函数的引用
    return function() {
        beforefn.apply(this, arguments); //执行新函数
        return _self.apply(this, arguments); //执行原函数
    };
 };
 var sortByField = function(arr, prop, desc) {
    var props = [],
    ret = [],
    i = 0,
    len = arr.length;
    if (typeof prop == 'string') {
        for (; i < len; i++) {
            var oI = arr[i]; (props[i] = new String(oI && oI[prop] || ''))._obj = oI;
        }
    } else if (typeof prop == 'function') {
        for (; i < len; i++) {
            var oI = arr[i]; (props[i] = new String(oI && prop(oI) || ''))._obj = oI;
        }
    } else {
        throw '参数类型错误';
    }
    props.sort();
    for (i = 0; i < len; i++) {
        ret[i] = props[i]._obj;
    }
    if (desc) ret.reverse();
    return ret;
 };
 


//坐标转换
function wgs84togcj02(k, j) {
    var d = 3.141592653589793 * 3000 / 180;
    var n = 3.141592653589793;
    var m = 6378245;
    var f = 0.006693421622965943;
    var g = transformlat(k - 105, j - 35);
    var i = transformlng(k - 105, j - 35);
    var b = j / 180 * n;
    var l = Math.sin(b);
    l = 1 - f * l * l;
    var h = Math.sqrt(l);
    g = (g * 180) / ((m * (1 - f)) / (l * h) * n);
    i = (i * 180) / (m / h * Math.cos(b) * n);
    var c = j + g;
    var e = k + i;
    return [e, c]
}
function transformlat(e, g) {
    var f = 3.141592653589793 * 3000 / 180;
    var h = 3.141592653589793;
    var c = 6378245;
    var b = 0.006693421622965943;
    var d = -100 + 2 * e + 3 * g + 0.2 * g * g + 0.1 * e * g + 0.2 * Math.sqrt(Math.abs(e));
    d += (20 * Math.sin(6 * e * h) + 20 * Math.sin(2 * e * h)) * 2 / 3;
    d += (20 * Math.sin(g * h) + 40 * Math.sin(g / 3 * h)) * 2 / 3;
    d += (160 * Math.sin(g / 12 * h) + 320 * Math.sin(g * h / 30)) * 2 / 3;
    return d
}
function transformlng(e, g) {
    var f = 3.141592653589793 * 3000 / 180;
    var h = 3.141592653589793;
    var c = 6378245;
    var b = 0.006693421622965943;
    var d = 300 + e + 2 * g + 0.1 * e * e + 0.1 * e * g + 0.1 * Math.sqrt(Math.abs(e));
    d += (20 * Math.sin(6 * e * h) + 20 * Math.sin(2 * e * h)) * 2 / 3;
    d += (20 * Math.sin(e * h) + 40 * Math.sin(e / 3 * h)) * 2 / 3;
    d += (150 * Math.sin(e / 12 * h) + 300 * Math.sin(e / 30 * h)) * 2 / 3;
    return d
}
function gcj02tobd09(i, h) {
    var e = 3.141592653589793 * 3000 / 180;
    var k = 3.141592653589793;
    var j = 6378245;
    var f = 0.006693421622965943;
    var g = Math.sqrt(i * i + h * h) + 0.00002 * Math.sin(h * e);
    var b = Math.atan2(h, i) + 0.000003 * Math.cos(i * e);
    var d = g * Math.cos(b) + 0.0065;
    var c = g * Math.sin(b) + 0.006;
    return [d, c]
}
function bd09togcj02(f, b) {
    var i = 3.141592653589793 * 3000 / 180;
    var h = f - 0.0065;
    var g = b - 0.006;
    var e = Math.sqrt(h * h + g * g) - 0.00002 * Math.sin(g * i);
    var a = Math.atan2(g, h) - 0.000003 * Math.cos(h * i);
    var d = e * Math.cos(a);
    var c = e * Math.sin(a);
    return [d, c]
}
function gcj02towgs84(k, j) {
    var d = 3.141592653589793 * 3000 / 180;
    var n = 3.141592653589793;
    var m = 6378245;
    var f = 0.006693421622965943;
    var g = transformlat(k - 105, j - 35);
    var i = transformlng(k - 105, j - 35);
    var b = j / 180 * n;
    var l = Math.sin(b);
    l = 1 - f * l * l;
    var h = Math.sqrt(l);
    g = (g * 180) / ((m * (1 - f)) / (l * h) * n);
    i = (i * 180) / (m / h * Math.cos(b) * n);
    var c = j + g;
    var e = k + i;
    return [k * 2 - e, j * 2 - c]
}
function bd09towgs84(a, c) {
    var b = bd09togcj02(a, c);
    return gcj02towgs84(b[0], b[1])
};
function wgs84tobd09(lng,lat){
    var temArr = wgs84togcj02(lng,lat);
    return gcj02tobd09(temArr[0],temArr[1]);
}
