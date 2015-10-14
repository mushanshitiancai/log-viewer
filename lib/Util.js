


function echoColorLine(color){
	var str = '';
	_.times(windowSize.width,function(){
		str+=' ';
	});
	color = color.replace(/(\w)/,function(v){return v.toUpperCase()});
	console.log(str['bg'+color]);
}

exports.registerParams = function(yargs){
	yargs.option('m',{
		alias: 'minute',
		describe: '查看提前多少分钟到现在的日志',
		type: 'string'
	});
	yargs.option('r',{
		alias: 'regex',
		describe: "正则表达式搜索，只会显示匹配的日志",
		type: 'string'
	});
	yargs.option('a',{
		alias: 'all',
		describe: "显示所有日志，与-r配合使用",
		type: 'boolean'
	});
}

