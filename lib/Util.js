


function echoColorLine(color){
	var str = '';
	_.times(windowSize.width,function(){
		str+=' ';
	});
	color = color.replace(/(\w)/,function(v){return v.toUpperCase()});
	console.log(str['bg'+color]);
}
