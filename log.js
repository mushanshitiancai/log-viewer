#!/usr/bin/env node
// "use strict";
var fs = require('fs');
var path = require('path');
var readline = require('readline')
var windowSize = require('window-size');
var colors = require('colors');
var moment = require('moment');
var yargs = require('yargs');
var walkSync = require('walk-sync');
var _ = require('lodash');
var async = require('async');
var Conf = require('./lib/Conf');
var Util = require('./lib/Util');
var Tail = require('./lib/Tail');

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}

yargs.usage('Usage $0 <command> [options]');
yargs.help('h');

// 获取配置中配置的路径下的所有日志
yargs.command('all','fetch all log',function(yargs) {
	yargs.reset()
		.usage('Usage: $0 all')
		.help('h')
	Util.registerParams(yargs);
	var argv = yargs.argv;

	if(argv.m){
		var startTime = moment().subtract(argv.m,'m');
	}else{
		var startTime = 0;
	}

	Conf.init(argv);
	fetchAllLog(argv,startTime,process.stdout);
});

yargs.command('tail','tail command',function(yargs){
	yargs.reset();
	yargs.usage('Usage: $0 tail filepath [options]');
	yargs.help('h');
  yargs.option('o',{
    alias: 'only',
    describe: '只输出匹配的日志行',
    type: 'boolean'
  });
	Util.registerParams(yargs);
	var argv = yargs.argv;

	// console.log(argv);
	if(argv._[0] == undefined){
		console.error('请输入目标文件路径');
	}else{
		Conf.init(argv);
		Tail.tail(argv,argv._[1]);
	}
});

yargs.command('list','list all relate log file accond config',function(yargs){
	yargs.reset();
	yargs.usage('Usage: $0 list');
	yargs.help('h');
	var argv = yargs.argv;

	Conf.init(argv);
	listAllLogs(argv);
});

yargs.command('remove','remove all relate log file acconding to config',function(yargs){
	yargs.reset();
	yargs.usage('Usage: $0 list');
	yargs.help('h');
	var argv = yargs.argv;

	Conf.init(argv);
	removeAllLogs(argv);
});

yargs.command('test','test',function(yargs){
	test();
});
var argv = yargs.argv;


function fetchAllLog(argv,startTime,output){
	var conf = Conf.get();
	var jobs = [];
	for(var logName in conf.logs){
		// log('logName: '+logName);
		var logConf = conf.logs[logName];
		for(var logConfPathIndex in logConf.paths){
			var logConfPath = logConf.paths[logConfPathIndex];
			// log('logConfPath: '+logConfPath);
			var filePaths = walkSync(logConfPath,{directories:false});
			// log(filePaths);
			filePaths.forEach(function(filePath){
				for(var fileNameRegIndex in logConf.file_regex){
					var fileNameReg = logConf.file_regex[fileNameRegIndex];
					filePath = path.join(logConfPath,filePath);
					if(new RegExp(fileNameReg).test(filePath)){
						jobs.push(function(cb){
							return fetchLog(argv,filePath,startTime,output,logConf,cb);
						});
					}
				}
			});
		}
	}

	// log(jobs);
	async.series(jobs,function(err){});
}

function fetchLog(argv,logPath,startTime,output,logConf,callback){
	logColor('======'+logPath+'========','red');
	var input = fs.createReadStream(logPath);
	var rl = readline.createInterface({
		input:input,
		output:output,
		terminal:false
	});

	var logLine = undefined;
	rl.on('line',function(line){
		if(line.match(new RegExp(logConf.log_header_regex))){
			if(logLine){
				dealWithLogLine(argv,logLine,startTime,output,logConf);
			}
			logLine = line+"\n";
			return;
		}
		logLine += line+"\n";
	});

	rl.on('close',function(){
		dealWithLogLine(argv,logLine,startTime,output,logConf);
		callback(null)
	})
}

function dealWithLogLine(argv,logLine,startTime,output,logConf){
	if(startTime == 0){
		echoLogLine(argv,logLine,output);
		return;
	}

	var match = logLine.match(new RegExp(logConf.log_time_regex));
	var timeStr = match[0];
	if(!timeStr) return;

	// console.log(startTime.format());
	// console.log(timeStr);
	if(moment(timeStr).isAfter(startTime)){
		echoLogLine(argv,logLine,output);
	}
}

function echoLogLine(argv,line,output){
	if(argv.r){
		var reg = new RegExp(argv.r,'g');
		if(reg.test(line)){
			// var lineSplit = line.split(reg);
			// var lineMatch = line.match(reg);

			// var str = '';
			// for(var i in lineSplit){
			// 	if(Conf.get().search_color[1] ){
			// 		str = lineSplit[i][Conf.get().search_color[1]]
			// 	}else{
			// 		str = lineSplit[i];
			// 	}
			// 	output.write(str);
			// 	if(lineMatch[i]){
			// 		if(Conf.get().search_color[0]){
			// 			str = lineMatch[i][Conf.get().search_color[0]]
			// 		}else{
			// 			str = lineMatch[i].red;
			// 		}
			// 	}
			// 	output.write(str);
			// }

			output.write(line.replace(reg,function(v){
				if(Conf.get().search_color){
					return v[Conf.get().search_color];
				}else{
					return v.red;
				}
			}));
		}else{
			if(argv.a){
				output.write(line);
			}
		}
		return;
	}
	output.write(line);
}


function listAllLogs(argv){
	var conf = Conf.get();
	var legalPaths = [];

	for(var logName in conf.logs){
		var logConf = conf.logs[logName];

		for(var logConfPathIndex in logConf.paths){
			var logConfPath = logConf.paths[logConfPathIndex];
			var filePaths = walkSync(logConfPath,{directories:false});

			log(Util.getColorString(logConfPath+":",'red'));
			filePaths.forEach(function(filePath){
				for(var fileNameRegIndex in logConf.file_regex){
					var fileNameReg = logConf.file_regex[fileNameRegIndex];
					filePath = path.join(logConfPath,filePath);
					if(new RegExp(fileNameReg).test(filePath)){
						legalPaths.push(filePath);
						log(filePath);
					}
				}
			});
		}
	}
	return legalPaths;
}

function removeAllLogs(argv){
	var paths = listAllLogs(argv);
	if(paths.length == 0){
		log('没有日志文件');
		return ;
	}

	process.stdout.write('确定删除以上日志? (y/n):');

	process.stdin.resume()
	process.stdin.on('data',function(data){
		if(data.toString().indexOf('y')!=-1){
			for(var i in paths){
				fs.unlinkSync(paths[i]);
			}
			log('删除完成');
			process.stdin.pause();
		}
	});


}


function log(str){
	console.log(str);
}

function logColor(str,color){
	console.log(str[color]);
}


function test(){
	echoColorLine('blue');
}
