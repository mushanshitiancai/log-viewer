var fs = require('fs');
var path = require('path');
var readline = require('readline')
var windowSize = require('window-size');
var colors = require('colors');
var moment = require('moment');
// var yargs = require('yargs');
// var walkSync = require('walk-sync');
var _ = require('lodash');
var async = require('async');
var Conf = require('./Conf');

module.exports = Util = {

	COLOR: ['black','red','green','yellow','blue','magenta','cyan','white'],
	BG_COLOR: ['bgBlack','bgRed','bgGreen','bgYellow','bgBlue','bgMagenta','bgCyan','bgWhite'],
	orderColorIndex: 0,

	// 移动光标到输入的这行文本的头部
	resetCursor: function(str){
		var len = typeof str == 'string'?str.length:0;
		readline.moveCursor(process.stdout,-len,-1);
	},

	// 获得随机颜色
	getRandomColor: function(excludeArr){
		return _.sample(_.difference(this.COLOR,excludeArr));
	},

	// 按顺序获取颜色，这样就不会出现随机颜色两次颜色一样的情况了
	getOrderColor: function(excludeArr){
		return _.difference(this.COLOR,excludeArr)[(this.orderColorIndex++)%(this.COLOR.length - excludeArr.length)];
	},

	// 获得随机背景色
	getRandomBgColor: function(excludeArr){
		return _.sample(_.difference(this.BG_COLOR.excludeArr));
	},

	// 判断颜色字符串是否合法
	isValidColor: function(color){
		return (this.COLOR.indexOf(color) >=0) || (this.BG_COLOR.indexOf(color)>=0);
	},

	// 获取对应颜色的背景色字符串
	// 如果是gray和green，则当做red  -- 删除了这两个碍手的颜色
	// 为什么colors有这个限制呢？
	getBgColor: function(color){
		if(color && this.isValidColor(color)){
			if(color.indexOf('bg')==0)
				return color;
			else
				return color.replace(/(\w)/,function(v){return 'bg'+v.toUpperCase()});
		}
	},

	// 输出一行彩色行
	// 如果color='random'，则输出随机彩色行
	// 如果color='order' || color=null，则输出随机彩色行
	echoColorLine: function(color){
		var str = new Array(windowSize.width+1).join(' ');

		if(color=='order' || !color || !this.isValidColor(color)){
			color = this.getOrderColor(['black']);
		}else if(color == 'random'){
			color = this.getRandomColor(['black']);
		}
		
		console.log(this.getColorString(str,this.getBgColor(color)));
		return color;
	},

	// 获得颜色渲染过的字符串
	// str:    目标字符串
	// color:  需要的颜色
	// bg:     是否是背景色
	// regex:  如果正则表达式，则只渲染正则表达式匹配的字符串
	getColorString: function(str,color,regex){
		if(!this.isValidColor(color)) return str;

		if(regex){
			if(typeof regex == 'string')
				regex = new RegExp(regex,'g');

			return str.replace(regex,function(v){
				return v[color];
			});
		}else{
			return str[color];
		}		
	},

	// 获取占据一行宽度的字符串
	getWindowWidthString: function(repeatStr,centerStr,leftStr,rightStr,repeatColor,centerColor,leftColor,rightColor){
		if(!repeatStr) repeatStr = '';
		if(!centerStr) centerStr = '';
		if(!leftStr)   leftStr = '';
		if(!rightStr)  rightStr = '';

		var ll = leftStr.length;
		var cl = centerStr.length;
		var rl = rightStr.length;
		var width = windowSize.width;
		if(cl+ll+rl > width){
			return this.getColorString(leftStr,leftColor)
					+this.getColorString(centerStr+centerColor)
					+this.getColorString(rightStr,rightColor);
		}

		var width_2 = parseInt(width/2);
		var cl_2    = parseInt(cl/2);
		var x1 = width_2 - cl_2 - ll;
		var x2 = width - ll - cl -x1 - rl;
		x1 = (new Array(x1+1).join(repeatStr)).substring(0,x1);
		x2 = (new Array(x2+1).join(repeatStr)).substring(0,x2);
		return this.getColorString(leftStr,leftColor)
				+this.getColorString(x1,repeatColor)
				+this.getColorString(centerStr,centerColor)
				+this.getColorString(x2,repeatColor)
				+this.getColorString(rightStr,rightColor);
	},

	// 注册通用参数
	registerParams: function(yargs){
		yargs.option('l',{
			alias: 'log',
			describe: '指定特定日志系统',
			type: 'string'
		});
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


}

function log(str){
	console.log(str);
}
function assert(param){
	console.assert(param);
}

function test(){
	assert(Util.isValidColor('red'));
	assert(Util.isValidColor('fuck') == false);

	log(Util.getRandomColor());

	log(Util.getColorString('getColorString'));
	log(Util.getColorString('getColorString','red'));
	log(Util.getColorString('getColorString','red'));
	log(Util.getColorString('getColorString','red',/Color/));

	// Util.echoColorLine('red');
	// for (var i = 10 - 1; i >= 0; i--) {
	// 	Util.echoColorLine();
	// };
	
	log(Util.getWindowWidthString(' ','fuck',''));
	log(Util.getWindowWidthString('x','fuck','left','right'));
	log(Util.getWindowWidthString('x','fuck','left','right','bgRed','blue','yellow','yellow'));
}

// test();