# Yunzai-GC-API
 使用Yunzai在你的QQ群里面执行gc指令

 使用[jie65535-opencommand](https://github.com/jie65535/gc-opencommand-plugin)的API。
 需要在服务器先安装此插件。

## 使用说明
把Yunzai-api.js放到`plugins\example`里面
```
resources\api\config.yaml  储存QQ，UID，token
resources\api\server.yaml  储存server的api
```
每次启动之前，会检测这两个文件是否存在，不存在则进行创建~


## 基本指令
```

/ping
/服务器状态
/在线人数
/状态

返回

opencommand插件状态：√
在线人数:X
在线玩家：X, X, X
```

```
/绑定 10002
/绑定UID 10002
/绑定uid 10002

返回

绑定 UID 10002 成功
请使用“/连接”获取验证码
```

```
/连接

返回

消息token获取成功
请使用“/验证码 1234”进行连接
1234为游戏里面的验证码
```

```
/验证码 1234

返回

key验证成功
愉快的进行玩耍吧！
指令格式为/list
每天晚上12点清空所有token哦
```

## server.yaml
需要注意格式，双引号后面需要带空格。
```
server_address: https://35.tanga.cc:35/opencommand/api
````






## bug：

config.yaml

`
暂无bug捏
`

