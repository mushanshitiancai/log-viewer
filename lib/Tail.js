var fs = require('fs');
var moment = require('moment');
var Util = require('./Util');
var Conf = require('./Conf');
var readline = require('readline');
var async = require('async');
var TTail = require('tail-forever');

module.exports = Tail ={
	autoTag: 0,
	
	tail: function(argv,filePath){
		var t = new TTail(filePath,{});
		t.on('line',function(data){
			if(argv.r == undefined){
				console.log(data);
			}else{
				console.log(Util.getColorString(data,Conf.get('search_color'),argv.r));
			}
		});

		process.stdin.on('data',function(data){
			var str = data.toString();
			Tail.echoTagLine(str);
		});
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