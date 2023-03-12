# Yunzai-GC-API
 使用Yunzai在你的QQ群里面执行gc指令

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
目前手动到`resources\api`目录下创建\server.yaml，后续解决此问题。

需要注意格式，双引号后面需要带空格。
```
server_address: https://35.tanga.cc:35/opencommand/api
````






## bug：

config.yaml

`
<[GC-API][gcapi]
 [YzBot][14:31:11.795][ERRO] Error: ENOENT: no such file or directory, open './resources/gm/config.yaml'
 at Object.openSync (node:fs:585:3)
 at Object.readFileSync (node:fs:453:35)
 at api.gcapi (file:///D:/Game/Yunzai-Bot/plugins/example/Yunzai-api.js?1678601426355:141:36)
 at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
 at async PluginsLoader.deal (file:///D:/Game/Yunzai-Bot/lib/plugins/loader.js:251:52)>
`

