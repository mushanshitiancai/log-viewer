var fs = require('fs');
var moment = require('moment');
var Util = require('./Util');
var Conf = require('./Conf');
var readline = require('readline');
var async = require('async');
var TTail = require('tail-forever');

module.exports = Tail ={
	autoTag: 0,
	tagSegment: '',

	// 用于-o参数的
	tempLine: undefined,
	keepEcho: false,

	tail: function(argv,filePath){
		var t = new TTail(filePath,{});
		t.on('line',function(data){
			if(argv.r == undefined){
				console.log(data);
			}else{
				if(argv.o){
					var headerRegexp = new RegExp(Conf.get('tail_header'),'g');
					var searchRegexp = new RegExp(argv.r,'g');

					if(headerRegexp.test(data)){
						Tail.tempLine = data+"\n";
						Tail.keepEcho = false;
					}else{
						Tail.tempLine += data+"\n";
					}

					if(searchRegexp.test(Tail.tempLine) || Tail.keepEcho){
						process.stdout.write(Util.getColorString(Tail.tempLine,Conf.get('search_color'),argv.r));
						Tail.tempLine = '';
						Tail.keepEcho = true;
					}
				}else{
					console.log(Util.getColorString(data,Conf.get('search_color'),argv.r));
				}
			}
			Tail.tagSegment += (data+"\n");
		});

		process.stdin.on('data',function(data){
			var str = data.toString();
			if(str.indexOf('/') == 0){
				argv.r = str.substr(1);
				argv.r = argv.r.replace(/\n$/,'');

				// 显示上一节的搜索内容
				Tail.heightLog(Tail.tagSegment,argv.r);
			}else{
				Tail.echoTagLine(str);
				Tail.tagSegment = '';
			}
		});
	},

	heightLog: function(text,regex){
		var logArr = text.split(new RegExp(Conf.get('tail_separator')));
		r = new RegExp(regex,'g');
		for(var i in logArr){
			if(r.test(logArr[i])){
				console.log(Util.getColorString(logArr[i],Conf.get('search_color'),regex));
			}
		}
	},

	echoTagLine: function(tag){
		Util.resetCursor(tag);

		if(tag == undefined || tag == "\n") tag = 'autoTag: '+(this.autoTag++);
		tag = tag.replace(/\n$/,'');
		var lineColor = Conf.get('tag_line_color');

		lineColor = Util.echoColorLine(lineColor);
		var lineStr = Util.getWindowWidthString(' ',' '+tag+' ','',' '+moment().format('YYYY-MM-DD HH:mm:ss')+' ',
												Util.getBgColor(lineColor),lineColor,lineColor,lineColor);
		console.log(lineStr);
		Util.echoColorLine(lineColor);
	}


}

function test(){
	Conf.init();
	Tail.tail({},'test/tailtest');
}

// test();
