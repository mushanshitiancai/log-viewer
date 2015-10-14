var fs = require('fs');
var moment = require('moment')
var _  = require('lodash');

var confPath = "conf.json";
var conf = null;

exports.getConf = function(){
	if(conf === null){
		try{
			var content = fs.readFileSync(confPath,'utf-8');
			var ret = JSON.parse(content);
			return dealWithTimeInRegex(ret);
		}catch(e){
			console.error('读取配置文件失败。'+ e.message);
		}
	}
}

// 把配置文件中的正则表达式中的时间字符串更改为当前时间
// 支持的时间字符串：YYYY,YY,MM,M,DD,D
// 具体参考moment.js文档：http://momentjs.com/docs/
function dealWithTimeInRegex(conf){
	_.map(conf.logs,function(aLogConf,aLogConfKey){
		_.map(aLogConf,function(confItem,confItemKey){
			if(confItemKey.endsWith('_regex')){
				if(typeof confItem == 'object'){
					_.map(confItem,function(item,itemKey){
						conf.logs[aLogConfKey][confItemKey][itemKey] = replaceTimeInString(item);
					});
				}else{
					conf.logs[aLogConfKey][confItemKey] = replaceTimeInString(confItem);
				}
			}
		});
	});
	return conf;
}

function replaceTimeInString(str){
	var keywords = [
		"YYYY","YY","MM","M","DD","D"
	];
	_.map(keywords,function(keyword){
		str = str.replace(new RegExp(keyword,'g'),moment().format(keyword));
	});
	return str;
}

// console.log(JSON.stringify(exports.getConf(),null,2));
// exports.getConf();
// console.log(replaceTimeInString('aaaYYYYdddDDYYYY'));

// var a = {
// 	a:1,
// 	b:{
// 		x:2
// 	}
// };

// // var a = [1,2,3];

// _.map(a,function(a,b,c){
// 	console.log(a);
// 	console.log(b);
// 	console.log(c);
// });