# Log Viewer

查看日志工具。

## 使用

```
Usage log.js <command> [options]
```

可选的命令有：
- all 根据配置，获取所有日志

### 通用选项

- `-r`: 指定正则表达式。默认只会显示匹配的日志条目。
- `-a`: 显示所有日志。与-r配合使用

## TODO
- [x] 读取配置文件，获得路径规则，日志规则
- [x] 按日志的一行来处理文件，而不是文本的一行
- [x] 根据分钟来筛选
- [x] -r 正则参数(只显示匹配的行)
- [x] -a 显示所有行
- [x] 高亮颜色可配置

- [ ] 优化效率
- [ ] 删除日志
- [ ] 实现tail功能
- [ ] 方便的tail操作，可以回车插入彩色分割行
- [ ] 方便的tail操作，可以输入文本，插入带tag的彩色分割行
- [ ] 方便的tail操作，支持正则搜索
- [ ] 方便的tail操作，支持随时输入正则，搜索上节内容

## Config

配置规则demo：

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
	"search_color":"red"
}
```

### logs配置项

logs中指定了多个日志配置。每个日志配置，可以指定：
- paths： 文件夹路径，数组。
- file_regex: 过滤文件名的正则表达式，数组。
- log_header_regex：匹配一行日志的正则表达式。直到遇到下一个下一个匹配，都认为是这一行的日志。
- log_time_regex： 匹配日志中时间信息，用来进行时间过滤

**扩展：**

- <1>: 指定文件夹路径，可以使用`@(param)`的表达式，这个表达式，会在运行的时候被对应的运行参数的值替换掉。举个例子：

```
node log.js --user "toybn"
```

使用这条语句运行时，<1>处的paths的值为：`["test","test/tobyn"]`

- <2>: 过滤日志文件的正则表达式，可以使用`T(YYYY-MM-DD)`这样的表达式，这个表达式，会在运行的时候替换成对应的时间。
  
  举个例子，在2015年10月14日运行脚本，<2>处的file_regex为`[ "input","20151014-log" ]`

### search_color配置项

指定搜索(-r)高亮的颜色，选择有：

- black
- red
- green
- yellow
- blue
- magenta
- cyan
- white
- gray
- grey

- bgBlack
- bgRed
- bgGreen
- bgYellow
- bgBlue
- bgMagenta
- bgCyan
- bgWhite

具体参考：https://www.npmjs.com/package/colors

## 效率问题

```
$ time grep -E 'fuck' /home/mazhibin/logs/tools.20151014.log
NOTICE: fuck
NOTICE: fuck

real	0m0.890s
user	0m0.678s
sys	0m0.212s
$ time node log.js all -r 'fuck'
======/home/mazhibin/logs/cp.20151014.log========
======/home/mazhibin/logs/tools.20151014.log========
NOTICE: fuck
NOTICE: fuck

real	0m6.926s
user	0m6.815s
sys	0m0.879s
```

## tail问题

用nodejs写tail功能一直失败。。。。目前使用tail库（node库就是多。。），有空了理解下源码，如何实现的。

node-tail也不行。。。。依然会出现从头输出的情况？ TODO 提出issue。
tail-forever可以，但是可以看得出来，是轮询的。
先用后者吧，有空一定弄个明白。

## 命令行问题

"bin": {
    "window-size": "cli.js"
  },

这个怎么用？
