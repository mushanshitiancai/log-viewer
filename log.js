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

yargs.usage('Usage $0 <command> [options]');
yargs.help('h');

// 获取配置中配置的路径下的所有日志
yargs.command('all','fetch all log',function(yargs) {
	var argv = yargs.reset()
		.usage('Usage: $0 all user minute')
		.help('h')
		.option('m',{
			alias: 'minute',
			describe: '查看提前多少分钟到现在的日志',
			type: 'string'
		})
		.argv;

	if(argv.m){
		var startTime = moment().subtract(argv.m,'m');
	}else{
		var startTime = 0;
	}

	Conf.init(argv);
	fetchAllLog(startTime,process.stdout);
});
yargs.command('test','test',function(yargs){
	test();
});
var argv = yargs.argv;


function fetchAllLog(startTime,output){
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
							return fetchLog(filePath,startTime,output,logConf,cb);
						});
					}
				}
			});
		}
	}

	// log(jobs);
	async.series(jobs,function(err){});
}

function fetchLog(logPath,startTime,output,logConf,callback){
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
				dealWithLogLine(logLine,startTime,output,logConf);
			}
			logLine = line+"\n";
			return;
		}
		logLine += line+"\n";
	});

	rl.on('close',function(){
		dealWithLogLine(logLine,startTime,output,logConf);
		callback(null)
	})
}

function dealWithLogLine(logLine,startTime,output,logConf){
	if(startTime == 0){
		output.write(logLine);
		return;
	}

	var match = logLine.match(new RegExp(logConf.log_time_regex));
	var timeStr = match[0];
	if(!timeStr) return;

	// console.log(startTime.format());
	// console.log(timeStr);
	if(moment(timeStr).isAfter(startTime)){
		output.write(logLine);
	}
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


