#!/usr/bin/env node
var argv = require('yargs').argv;
var fs = require('fs');
var path = require('path');
var readline = require('path')

var logPath = argv._[0];
var logContent = fs.readFileSync(logPath,'utf-8');
//console.log(logContent);
//console.log("\033[0;31;1mhello\033[0m");
