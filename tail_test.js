var fs = require('fs');

// var ws = fs.createWriteStream('test/tailtest');

// setInterval(function(){
// 	ws.write("fuck\n");
// },1000);


// setTimeout(function(){
// 	ws.end();
// },1000*15);

var filePath = 'test/tailtest';
fs.writeFileSync(filePath,'');
var index = 0;

setInterval(add,5000);

function add(){
	for (var i = 50 - 1; i >= 0; i--) {
		fs.writeFileSync(filePath,'fuck'+(index++)+"\na\n",{flag:'a'});
	};
}


// fs.writeFileSync(filePath,'');