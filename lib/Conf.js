var fs = require('fs');
var moment = require('moment')
var _  = require('lodash');

var confPath = "conf.json";
var conf = null;

var REGEX_PARAM = /@\((.*)\)/g;

exports.init = function(argv){
	try{
		var content = fs.readFileSync(confPath,'utf-8');
		var ret = JSON.parse(content);
		ret = dealWithTimeInRegex(ret);
		ret = dealWithParamsInPath(ret,argv);
		conf = ret;
	}catch(e){
		console.error('读取配置文件失败。'+ e.message);
	}
}

exports.get = function(){
	if(conf != null){
		return conf;
	}
	console.error('Conf didnt init!');
}

// 把配置文件中的正则表达式中的时间字符串更改为当前时间
// 规定的格式：T(YYY-MM-DD)。也就是需要替换的时间部分需要使用T()包裹起来
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
	str = str.replace(/T\((.*)\)/g,moment().format(RegExp.$1));
	return str;
}

function dealWithParamsInPath(conf,argv){
	for(var logConfIndex in conf.logs){
		var logConf = conf.logs[logConfIndex];
		if(logConf.paths){
			for(var pathIndex in logConf.paths){
				var path = logConf.paths[pathIndex];
				if(REGEX_PARAM.test(path)){
					if(typeof argv[RegExp.$1] === 'undefined'){
						console.error("错误：配置文件需要运行参数"+RegExp.$1+"!");
					}else{
						conf.logs[logConfIndex].paths[pathIndex] = path.replace(REGEX_PARAM,argv[RegExp.$1]);
					}
				}
			}
		}
	}
	return conf;
}

