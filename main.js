#!/usr/bin/env node
// "use strict";
var fs = require('fs');
var path = require('path');
var readline = require('readline')
var window_size = require('window-size');
var colors = require('colors');
var moment = require('moment');
var yargs = require('yargs');
var walkSync = require('walk-sync');
var _ = require('lodash');
var Conf = require('./lib/config');

yargs.usage('Usage $0 <command> [options]');
yargs.help('h');

// 获取配置中配置的路径下的所有日志
yargs.command('all','fetch all log',function(yargs) {
	var argv = yargs.reset()
		.usage('Usage: $0 all user minute')
		.help('h')
		.argv;

	var user = argv._[0];
	var minute = argv._[1];
	var startTime   = moment().subtract(minute,'m');

	fetchAllLog(user,startTime,process.stdout);
});
yargs.command('test','test',function(yargs){
	test();
});
var argv = yargs.argv;


function fetchAllLog(user,startTime,output){
	var conf = Conf.getConf();
	for(var logName in conf.logs){
		log('logName: '+logName);
		var logConf = conf.logs[logName];
		for(var logConfPathIndex in logConf.paths){
			var logConfPath = logConf.paths[logConfPathIndex];
			// log('logConfPath: '+logConfPath);
			var filePaths = walkSync(logConfPath,{directories:false});
			// log(filePaths);
			filePaths.forEach(function(filePath){
				for(fileNameRegIndex in logConf.file_regex){
					var fileNameReg = logConf.file_regex[fileNameRegIndex];
					filePath = path.join(logConfPath,filePath);
					if(new RegExp(fileNameReg).test(filePath)){
						fetchLog(filePath,startTime,output,logConf);
					}
				}
			});
		}
	}
}

function fetchLog(logPath,startTime,output,logConf){
	log('======'+logPath+'========');
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
				log('==>'+logPath+'<==');
				dealWithLogLine(logLine,startTime,output,logConf);
			}
			logLine = line+"\n";
			return;
		}
		logLine += line+"\n";
	});

	rl.on('close',function(){
		dealWithLogLine(logLine,startTime,output,logConf);
		log('======================');
	})
}

function dealWithLogLine(logLine,startTime,output,logConf){
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

function test(){
	var r = walkSync('.');
	log(r);
}


