import plugin from '../../lib/plugins/plugin.js'
import https from 'https'
import fetch from 'node-fetch'
import { segment } from 'oicq'
import fs from 'fs'
import yaml from 'yaml'

const QQconfig = {
  "1072411694": {
    "UID": 10002,
    "token": null
  }
}

const fs_server = {
  server_address: "https://35.tanga.cc:35/opencommand/api",
  server_token: "test1234",
  server_admin: [
    1072411694
  ]
}

const fs_data = {
  "止语": "prop unlockmap 1",
  "给": "give"
}

const fs_command = {
  "全皮肤": [
    "give 340000",
    "give 340001",
    "give 340002",
    "give 340003",
    "give 340004",
    "give 340005",
    "give 340006",
    "give 340007",
    "give 340008",
    "give 340009",
    "give 340000",
    "give 340001",
    "give 340002",
    "give 340003",
    "give 340004",
    "give 340005",
    "give 340006",
    "give 340007",
    "give 340008",
    "give 340009",
  ]
}

if (!fs.existsSync('./resources/api')) {
  fs.mkdirSync('./resources/api')
}
if (!fs.existsSync('./resources/api/config.yaml')) {
  fs.writeFileSync('./resources/api/config.yaml', yaml.stringify(QQconfig))
}
if (!fs.existsSync('./resources/api/server.yaml')) {
  fs.writeFileSync('./resources/api/server.yaml', yaml.stringify(fs_server))
}
if (!fs.existsSync('./resources/api/data.yaml')) {
  fs.writeFileSync('./resources/api/data.yaml', yaml.stringify(fs_data))
}
if (!fs.existsSync('./resources/api/command.yaml')) {
  fs.writeFileSync('./resources/api/command.yaml', yaml.stringify(fs_command))
}
const config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'))
const data = yaml.parse(fs.readFileSync('./resources/api/data.yaml', 'utf8'));
const command = yaml.parse(fs.readFileSync('./resources/api/command.yaml', 'utf8'));
const server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'))

export class api extends plugin {
  constructor() {
    super({
      name: 'GC-API',
      dsc: 'opencommand-API',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: '^/(添加server|添加服务器|添加服务器地址|设置服务器|更改服务器)',
          fnc: 'server',
        },
        {
          reg: '^/(添加token|添加密钥|添加服务器token|添加服务器密钥|设置token|设置密钥|设置服务器token)',
          fnc: 'token',
        },
        {
          reg: '^/(添加管理|添加管理员|设置管理员)',
          fnc: 'admin',
        },
        {
          reg: '^/(删除管理|删除管理员)',
          fnc: 'del',
        },
        {
          reg: '^/(查看管理员|管理员列表|查看管理管理员|管理员|查看服务器|服务器|查看服务器地址|服务器地址|查看多别名|查看单别名|多别名|单别名)',
          fnc: 'check',
        },
        {
          reg: '^/(ping|在线人数|状态|服务器状态|绑定UID|绑定|绑定uid|连接|链接|验证码)',
          fnc: 'base',
        },
        {
          reg: '^/(添加单别名)',
          fnc: "array"
        },
        {
          reg: '^/(添加多别名)',
          fnc: "arrays"
        },
        {
          reg: '(.*)(kfc|KFC)(.*)',
          fnc: 'kfc'
        },
        {
          reg: '^/(.*)$',
          fnc: 'command',
        }
      ]

    })
  }
  async array(e) {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)
    const msg = e.msg.split(' ');
    if (msg.length !== 2) {
      return this.reply(`格式错误，请输入正确的格式：\n${msg[0]} 别名: 命令`);
    }
    const [alias, command] = msg[1].split(/[:：]/).map(str => str.trim());
    if (!alias || !command) {
      return this.reply(`格式错误，请输入正确的格式：\n${msg[0]} 别名: 命令`);
    }
    const data = yaml.parse(fs.readFileSync('./resources/api/data.yaml', 'utf8'));
    data[alias] = command;
    fs.writeFileSync('./resources/api/data.yaml', yaml.stringify(data));
    await this.reply(`已成功添加别名：${alias}`);
  }

  async arrays(e) {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)

    const msg = e.msg.split('\r');
    console.log(msg);
    if (msg.length < 3) {
      return this.reply(`格式错误，请输入正确的格式：\n${msg[0]} 止语\n[test 1]\n[test 2]\n...`);
    }
    const keyword = msg[1].trim();
    const contents = msg.slice(2).map(str => str.trim());
    if (!keyword || !contents || contents.length < 1) {
      return this.reply(`格式错误，请输入正确的格式：\n${msg[0]} 止语\n[test 1]\n[test 2]\n...`);
    }
    const data = yaml.parse(fs.readFileSync('./resources/api/command.yaml', 'utf8')) || {};
    data[keyword] = contents;
    fs.writeFileSync('./resources/api/command.yaml', yaml.stringify(data));
    await this.reply(`已成功添加别名：${keyword}`);
  }



  async server(e) {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)
    this.setContext('monitor')
    await this.reply('请发送server\n格式为：http(s)://127.0.0.1:443', false)
  }
  monitor() {
    const addressPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+(:\d{1,5})?$/
    const newAddress = this.e.message[0].text

    if (!addressPattern.test(newAddress)) {
      this.reply('停止添加,Server格式错误\n请检查你的地址格式是否为:http(s)://127.0.0.1:443', false)
      this.finish('monitor')
      return
    }
    server.server_address = newAddress + '/opencommand/api'
    const yamlString = yaml.stringify(server)
    fs.writeFileSync('./resources/api/server.yaml', yamlString)
    this.reply('server已添加！\n如果后续需要进行修改\n重复该流程即可，默认覆盖已有的server', false)
    this.finish('monitor')
  }


  async token() {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)
    this.setContext('monitora')
    await this.reply('请发送token', false)
  }
  monitora() {
    const newToken = this.e.message[0].text
    server.server_token = newToken
    const yamlString = yaml.stringify(server)
    fs.writeFileSync('./resources/api/server.yaml', yamlString)
    this.reply('token已添加！\n如果后续需要进行修改\n重复该流程即可，默认覆盖已有的token', false)
    this.finish('monitora')
  }

  async admin() {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)
    this.setContext('monitorb')
    await this.reply('请发送新增管理员的QQ', false)
  }

  monitorb() {
    const newadmin = this.e.message[0].text
    const newQQ = Number(newadmin)
    if (server.server_admin.includes(newQQ)) return this.reply('该QQ已经是管理员了哦~')
    const updatedAdminList = server.server_admin.concat(newQQ)
    server.server_admin = updatedAdminList
    const yamlString = yaml.stringify(server)
    fs.writeFileSync('./resources/api/server.yaml', yamlString)
    this.reply(`管理员${newQQ} 已添加！可添加多个管理员!`, true)
    this.finish('monitorb')
  }

  async del() {
    if (!this.e.isMaster) return this.reply('你不是主人，无权进行此操作！', true)
    this.setContext('monitorc')
    await this.reply('请发送要删除的管理员QQ', false)
  }

  monitorc() {
    const adminToRemove = Number(this.e.message[0].text)
    const adminList = server.server_admin
    const indexToRemove = adminList.indexOf(adminToRemove)

    if (indexToRemove === -1) {
      this.reply(`管理员 ${adminToRemove} 不存在`)
      this.finish('monitorc')
      return
    }

    const updatedAdminList = adminList.slice(0, indexToRemove).concat(adminList.slice(indexToRemove + 1))
    server.server_admin = updatedAdminList
    const yamlString = yaml.stringify(server)
    fs.writeFileSync('./resources/api/server.yaml', yamlString)
    this.reply(`管理员 ${adminToRemove} 已被移除！`)
    this.finish('monitorc')
  }

  async check(e) {
    const msg = e.msg.split(' ')
    if (msg[0] === '/查看管理员' || msg[0] === '/查看管理' || msg[0] === '/查看管理员列表' || msg[0] === '/管理员') {
      const adminList = server.server_admin;
      await this.reply(`管理员列表：\n${adminList.join('\n')}`);
    }
    if (msg[0] === '/查看服务器' || msg[0] === '/查看服务器地址' || msg[0] === '/服务器地址' || msg[0] === '/服务器') {
      const serverAddress = server.server_address;
      await this.reply(`服务器地址：\n${serverAddress.join('\n ')}`);
    }
    if (msg[0] === '/查看多别名' || msg[0] === '/多别名') {
      const arrayAlias = Object.keys(command);
      const arrayAliasWithNumber = arrayAlias.map((alias, index) => `${(index + 1).toString().padStart(2, '')}. ${alias}`);
      const forwardMsg = await this.makeForwardMsg('多别名列表', `以下为详细的多别名列表\n多别名可以一次执行多条指令，但是缺点为不能组合指令。\n\n${arrayAliasWithNumber.join('\n')}`);
      await this.reply(forwardMsg);
    }

    if (msg[0] === '/查看单别名' || msg[0] === '/单别名') {
      const singleAlias = Object.entries(data).map(([key, value], index) => `${(index + 1).toString().padStart(2, ' ')}. "${key}": "${value}"`);
      const forwardMsg = await this.makeForwardMsg('单别名列表', `以下为详细的单别名列表\n单别名可以自由组合别名，缺点是每次只能发一条，你可以发挥你的想象力~\n\n${singleAlias.join('\n')}`);
      await this.reply(forwardMsg);
    }
  }

  async base(e) {
    let UID
    let config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'))
    let server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'))
    const configFile = './resources/api/config.yaml'
    let msg = e.msg.split(' ')
    const url = server.server_address
    const QQ = e.user_id

    if (msg[0] === '/服务器状态' || msg[0] === '/在线人数' || msg[0] === '/ping' || msg[0] === '/状态') {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: '',
          action: 'online',
          data: '',
        }),
        agent: new https.Agent({ rejectUnauthorized: false }),
      }

      const response = await fetch(url, options)
      const result = await response.json()

      if (result.retcode === 200) {
        const { count, playerList } = result.data
        const onlineUsers = `在线人数:${count}\n在线玩家：${playerList.join(', ')}`
        await this.reply(`opencommand插件状态：√\n${onlineUsers}`)
      } else
        await this.reply(`opencommand插件状态：×`)
    }
    if (msg[0] === '/绑定uid' || msg[0] === '/绑定UID' || msg[0] === '/绑定') {
      const UID = msg[1]
      const config = yaml.parse(fs.readFileSync(configFile, 'utf8')) || {}
      config[QQ.toString()] = { UID: parseInt(UID), token: null }
      fs.writeFileSync(configFile, yaml.stringify(config), 'utf8')
      await this.reply(`绑定 UID ${UID} 成功\n请使用“/连接”获取验证码`)
    }

    if (msg[0] === '/连接' || msg[0] === '/链接') {
      for (const key in config) {
        if (key === QQ.toString()) {
          UID = config[key].UID
          break
        }
      }
      if (!UID) {
        await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`)
      } else {
        const url = server.server_address
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: '',
            action: 'sendCode',
            data: UID,
          }),
          agent: new https.Agent({ rejectUnauthorized: false }),
        }

        try {
          const response = await fetch(url, options)
          const result = await response.json()

          if (result.retcode === 200) {
            const token = result.data
            config[QQ] = { UID: UID, token: token }
            fs.writeFileSync('./resources/api/config.yaml', yaml.stringify(config), 'utf8')
            await this.reply(`消息token获取成功\n请使用“/验证码 1234”进行连接\n1234为游戏里面的验证码`)
          } else {
            await this.reply('token获取失败，请检查你的UID是否正确或者短时间获取次数上限')
          }
        } catch (e) {
          if (e.toString().includes("Invalid URL")) {
            await this.reply("请求出错：无效的服务器地址，请检查服务器地址\n文件位置：resources\api\server.yaml")
          } else {
            await this.reply(`请求出错：\n无效的API地址\n若无上述无问题，请检查检查服务器地址的端口`)
          }
        }
      }
    }

    if (msg[0] === '/验证码') {
      for (const key in config) {
        if (key === QQ.toString()) {
          UID = config[key].UID
          break
        }
      }
      if (!UID) {
        await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`)
      } else {
        const { token } = config[QQ] || {}
        if (!token) {
          await this.reply('token不存在\n请使用“/连接”重新获取token')
          return
        }
        const url = server.server_address
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            action: 'verify',
            data: parseInt(msg[1]),
          }),
          agent: new https.Agent({ rejectUnauthorized: false }),
        }
        const response = await fetch(url, options)
        const result = await response.json()
        if (result.retcode === 200) {
          await this.reply(`key验证成功\n愉快的进行玩耍吧！\n指令格式为/list\n每天晚上12点清空所有token哦`)
        } else {
          await this.reply('key验证失败\n请检查你的验证码并重试')
        }
      }

    }
  }

  async command(e) {
    const userId = e.user_id
    const url = server.server_address
    const Msg = e.raw_message.trim().substring(1).split(' ')
    const dataconfig = yaml.parse(fs.readFileSync('./resources/api/data.yaml', 'utf8'))
    const command = yaml.parse(fs.readFileSync('./resources/api/command.yaml', 'utf8'))

    let newMsg;
    const commandmsg = Msg.map(msg => {
      if (command.hasOwnProperty(msg)) {
        return command[msg];
      } else {
        return msg;
      }
    });

    const datamsg = Msg.map(msg => {
      if (dataconfig.hasOwnProperty(msg)) {
        return dataconfig[msg];
      } else {
        return msg;
      }
    });

    if (commandmsg.join(' ') === Msg.join(' ')) {
      newMsg = datamsg.join(' ');
    } else {
      newMsg = commandmsg;
    }
    let token = null
    if (server.server_admin.includes(userId)) token = server.server_token

    if (token == null) {
      const userConfig = config[userId]
      if (userConfig == null) return this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`)
      token = userConfig.token
    }

    if (token == null) {
      await this.reply('token不存在\n请使用“/连接”重新获取token')
      return
    }

    if (typeof newMsg[0] === 'string') {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'command',
          data: newMsg,
        }),
        agent: new https.Agent({ rejectUnauthorized: false }),
      }
      const response = await fetch(url, options)
      const responseBody = await response.json();
      const retcode = responseBody.retcode;
      const data = retcode === 200 ? responseBody.data || 'OK' : `${retcode}，token错误`;
      await this.reply(`发送指令：${newMsg}\n执行结果：${data}`);
      return;
    } else {

      // 通过 Promise.all() 方法同时执行多个 POST 请求
      const promiseArr = newMsg.map(msgs => {
        const subPromiseArr = msgs.map(msg => {
          const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              action: 'command',
              data: msg,
            }),
            agent: new https.Agent({ rejectUnauthorized: false }),
          };
          return fetch(url, options);
        });

        return Promise.all(subPromiseArr);
      }).flat(); // 需要使用 flat() 将嵌套的数组展开

      Promise.all(promiseArr)
        .then(responses => {
          const responseData = responses.map(responseArr => {
            return responseArr.map(response => {
              if (response.ok) {
                return response.json(); // 返回 Promise 对象
              } else {
                throw new Error(`请求失败，HTTP 状态码为 ${response.status}`);
              }
            });
          });
          return Promise.all(responseData.flat());
        })

        .then(async data => {
          const msgs = newMsg.flat();
          const msgAndStatusArr = msgs.map((msg, i) => {
            const obj = data[i];
            if (obj.retcode === 200) {
              return `发送指令：${msg}\n执行结果：${obj.data || 'OK'}`;
            } else {
              return `发送指令：${msg}\n执行结果：${obj.retcode}，token不正确`;
            }
          });
          const result = msgAndStatusArr.join('\n\n');

          const forwardMsg = await this.makeForwardMsg(`指令执行结果`, result); 
          await this.reply(forwardMsg); 
        })
    }



  }

  async makeForwardMsg(title, msg) {
    let nickname = Bot.nickname
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.card ?? info.nickname
    }
    let userInfo = {
      user_id: Bot.uin,
      nickname
    }

    let forwardMsg = [
      {
        ...userInfo,
        message: title
      },
      {
        ...userInfo,
        message: msg
      }
    ]

    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)

    return forwardMsg
  }

  // 群友要的小彩蛋~
  async kfc(e) {
    await this.reply('肯德基疯狂星期V我50！谢谢。', true)
    await this.e.reply(segment.image(`./resources/api/kfc.png`))
  }
}
