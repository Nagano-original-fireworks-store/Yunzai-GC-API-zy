# Yunzai-GC-API
 使用Yunzai在你的QQ群里面执行gc指令

 使用[jie65535-opencommand](https://github.com/jie65535/gc-opencommand-plugin)的API。
 需要在服务器先安装此插件。

## bot相关
Gitee：
* [Miao-Yunzai：](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)（推荐使用）喵版Yunzai，需要安装 `miao-plugin` 插件
* [Yunzai-V3-ICQQ：](https://gitee.com/yoimiya-kokomi/Yunzai-Bot)（推荐使用）修复原版的`QQ版本过低问题`（推荐使用）
* [Yunzai-V3-OICQ：](https://gitee.com/Le-niao/Yunzai-Bot)（不推荐使用）乐神原版，目前已经暂停维护

GitHub:
* [Miao-Yunzai：](https://github.com/yoimiya-kokomi/Miao-Yunzai)（推荐使用）喵版Yunzai，需要安装 `miao-plugin` 插件
* [Yunzai-V3-ICQQ：](https://github.com/yoimiya-kokomi/Yunzai-Bot)（推荐使用）修复原版的`QQ版本过低问题`（推荐使用）
* [Yunzai-V3-OICQ：](https://github.com/Le-niao/Yunzai-Bot)（不推荐使用）乐神原版，目前已经暂停维护

## 使用说明
[点击下载 Yunzai-api](https://github.com/Zyy-boop/Yunzai-GC-API/releases/download/1.0/Yunzai-api.js)

把Yunzai-api.js放到`plugins\example`里面

```
结构说明
resources\api\config.yaml  储存QQ，UID，token
resources\api\server.yaml  储存server的api
```
每次启动之前，会检测这两个文件是否存在，不存在则进行创建~

## 群友要的小彩蛋
触发：包含`kfc`或者`KFC`的消息。

因为每个人要的不一样，所以图片内容需自行添加。

你需要把一个图片重命名为 `kfc.png`，储存到`resources/api`目录下。

## 普通指令
`/ping` `/在线人数` `/状态` `/服务器状态`

```
opencommand插件状态：√
在线人数:7
在线玩家：123456, FzDiary, 10169029, 岩VanDeep君, 123, aｄmin, 10427
```
<br>

`/绑定UID` `/绑定` `/绑定uid`
```
绑定 UID 1234 成功
请使用“/连接”获取验证码
```
<br>

`/连接` `/链接` 
```
获取成功：
消息token获取成功
请使用“/验证码 1234”进行连接
1234为游戏里面的验证码

获取失败：
token获取失败，请检查你的UID是否正确或者短时间获取次数上限
```

<br>

`/验证码`

```
验证成功：
key验证成功
愉快的进行玩耍吧！
指令格式为/list
每天晚上12点清空所有token哦

验证失败：
key验证失败
请检查你的验证码并重试
```

## 管理员指令

以下需要Yunzai-bot主人设置
>设置服务器地址
> 
>`/添加server` `/添加服务器` `/添加服务器地址` `/设置服务器` `/更改服务器`

>设置`opencommand`的`token`
> 
> `/添加token` `/添加密钥` `/添加服务器token` `/添加服务器密钥` `/设置token` `/设置密钥` `/设置服务器token`
> 
> 注意事项：
> 
> 设置用户为`服务器管理员`之后，该用户的所有指令都会输出到服务端控制台。
> 
> 可以使用在指令后面添加参数 `@UID` 或使用 `/target @UID` 来指定默认目标。

>设置服务器管理员
> 
> `/添加管理` `/添加管理员` `/设置管理员`

>删除服务器管理员
> 
 > `/删除管理` `/删除管理员`



