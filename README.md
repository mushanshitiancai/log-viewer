# Log Viewer
查看日志工具。

## 使用

```
Usage log.js <command> [options]
```

可选的命令有：
- list             列出所有匹配日志
- remove           删除所有匹配日志
- all              根据配置，获取所有日志
- tail filepath    以tail方式查看某个日志

### 通用选项
- `-l`: 指定特定的日志系统
- `-r`: 指定正则表达式。默认只会显示匹配的日志条目。
- `-a`: 显示所有日志。与-r配合使用

### tail命令
tail命令用起来和Linux系统的`tail -f`命令基本一样。只是在使用上更方便一些。

```
./log.js tail filepath [-r regex][-o]
```

tail命令会实时输出文件的最新内容，如果指定-r参数，则会高亮匹配的关键字。如果指定了-o参数，则只会显示匹配的日志（和grep不一样，不是以文本的一行为单位，而是以一条日志为单位，具体配置见conf.json的tail_separator和tail_header）

在使用tail命令的过程中，可以按下回车插入一个彩色tag条，用来标记，方便查看。也可以输入单词再按回车作为tag条的标题。

tag条还有一个功能就是会缓存tag开始后的日志。在查看过程中，可以随时输入/开头的正则表达式。按回车会，会输出这段tag缓存中匹配的日志。同时会更新参数中用来匹配的正则。

效果图：

![demo](http://i13.tietuku.com/2405535abf6acbc6.png)

## TODO
- [x] 读取配置文件，获得路径规则，日志规则
- [x] 按日志的一行来处理文件，而不是文本的一行
- [x] 根据分钟来筛选
- [x] -r 正则参数(只显示匹配的行)
- [x] -a 显示所有行
- [x] 高亮颜色可配置
- [x] 列出所有日志
- [x] 删除所有日志
- [x] 实现tail功能
- [x] 方便的tail操作，可以回车插入彩色分割行
- [x] 方便的tail操作，可以输入文本，插入带tag的彩色分割行
- [x] 方便的tail操作，支持正则搜索
- [x] 方便的tail操作，支持随时输入正则，更新搜索正则
- [x] 用上日志系统参数
- [x] 方便的tail操作，支持随时输入正则，搜索上节内容(而且只显示否所内容)
- [x] tail操作，正则过滤只显示匹配行
- [ ] 时间筛选上，没必要每次都比较时间，因为日志是线性的
- [ ] 优化效率
- [ ] 给node-tail提issue

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

## tail问题
用nodejs写tail功能一直失败。。。。目前使用tail库（node库就是多。。），有空了理解下源码，如何实现的。

node-tail也不行。。。。依然会出现从头输出的情况？ TODO 提出issue。 tail-forever可以，但是可以看得出来，是轮询的。 先用后者吧，有空一定弄个明白。

## 命令行问题
"bin": {     "window-size": "cli.js"   },

这个怎么用？

## 效率问题

```
$ time grep -E 'fuck' /home/mazhibin/logs/tools.20151014.log
NOTICE: fuck
NOTICE: fuck

real    0m0.890s
user    0m0.678s
sys    0m0.212s
$ time node log.js all -r 'fuck'
======/home/mazhibin/logs/cp.20151014.log========
======/home/mazhibin/logs/tools.20151014.log========
NOTICE: fuck
NOTICE: fuck

real    0m6.926s
user    0m6.815s
sys    0m0.879s
```
