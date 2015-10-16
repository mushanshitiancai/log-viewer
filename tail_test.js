var fs = require('fs');

// var ws = fs.createWriteStream('test/tailtest');

// setInterval(function(){
// 	ws.write("fuck\n");
// },1000);


// setTimeout(function(){
// 	ws.end();
// },1000*15);
var logLine = "DEBUG: 2015-11-09 19:27:24 : tools [/home/mazhibin/xxx.php:59] a log ";

var filePath = 'test/tailtest';
fs.writeFileSync(filePath,'');
var index = 0;

setInterval(add,5000);

function add(){
	for (var i = 5 - 1; i >= 0; i--) {
		fs.writeFileSync(filePath,logLine+(index++)+"\n      mutile line.\n",{flag:'a'});
	};
}


// fs.writeFileSync(filePath,'');
