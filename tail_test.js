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

setInterval(add,1000);

function add(){
	for (var i = 3 - 1; i >= 0; i--) {
		fs.writeFileSync(filePath,'fuck'+(index++)+"\n",{flag:'a'});
	};
}


// fs.writeFileSync(filePath,'');