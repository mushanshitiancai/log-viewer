# Log Viewer

查看日志工具。

## TODO
- [ ] 读取配置文件，获得路径规则，日志规则


## Config

```
{
	"logs":{
		"test":{
			"paths"            : [ "test","test/@(user) ],                     // <1>
			"file_regex"       : [ "input" ],                   
			"log_header_regex" : "^DEBUG|^TRACE|^NOTICE|^WARNING|^FATAL",
			"log_time_regex"   : "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"
		},
		"test2":{
			"paths"            : [ "test" ],                          
			"file_regex"       : [ "input","T(YYYYMMDD)-log" ],                  // <2>
			"log_header_regex" : "^DEBUG|^TRACE|^NOTICE|^WARNING|^FATAL",
			"log_time_regex"   : "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}"
		},
	}
}
```

- <1>: 指定文件夹路径，可以使用`@(param)`的表达式，这个表达式，会在运行的时候被对应的运行参数的值替换掉。举个例子：

```
node log.js --user "toybn"
```

使用这条语句运行时，<1>处的paths的值为：`["test","test/tobyn"]`

- <2>: 过滤日志文件的正则表达式，可以使用`T(YYYY-MM-DD)`这样的表达式，这个表达式，会在运行的时候替换成对应的时间。
  
  举个例子，在2015年10月14日运行脚本，<2>处的file_regex为`[ "input","20151014-log" ]`