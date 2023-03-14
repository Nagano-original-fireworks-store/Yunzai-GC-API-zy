import plugin from '../../lib/plugins/plugin.js';
import https from 'https';
import fetch from 'node-fetch';
import { segment } from 'oicq';
import fs from 'fs';
import yaml from 'yaml';

const QQconfig = {
  "1072411694": {
    "UID": 10002,
    "token": null
  }
};
const fs_server = {
  server_address: "https://35.tanga.cc:35/opencommand/api",
  server_token: "test1234",
  server_admin: [
    1072411694
  ]
};

if (!fs.existsSync('./resources/api')) {
  fs.mkdirSync('./resources/api');
}
if (!fs.existsSync('./resources/api/config.yaml')) {
  fs.writeFileSync('./resources/api/config.yaml', yaml.stringify(QQconfig));
}
if (!fs.existsSync('./resources/api/server.yaml')) {
  fs.writeFileSync('./resources/api/server.yaml', yaml.stringify(fs_server));
}


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
          reg: '^/(ping|在线人数|状态|服务器状态|绑定UID|绑定|绑定uid|连接|链接|验证码)',
          fnc: 'base',
        },
        {
          reg: '^/(.*)$',
          fnc: 'command',
        },
        {
          reg: '(.*)(kfc|KFC)(.*)',
          fnc: 'kfc'
        }
      ]

    });
  }

  async server(e) {
    if (!this.e.isMaster) {
      await this.reply('你没有添加server的权限', true)
      return
    }
    if (this.e.isMaster)
      this.setContext('monitor')
    await this.reply('请发送server\n格式为：http(s)://127.0.0.1:443', false)
  }

  monitor() {
    const addressPattern = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+(:\d{1,5})?$/;
    const newAddress = this.e.message[0].text;
    if (!addressPattern.test(newAddress)) {
      this.reply('停止添加,Server格式错误\n请检查你的地址格式是否为:http(s)://127.0.0.1:443', false);
      this.finish('monitor');
      return;
    }

    const serverConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    serverConfig.server_address = newAddress + '/opencommand/api';
    const yamlString = yaml.stringify(serverConfig);
    fs.writeFileSync('./resources/api/server.yaml', yamlString);
    const updatedConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    this.reply('server已添加！\n如果后续需要进行修改\n重复该流程即可，默认覆盖已有的server', false)
    this.finish('monitor');
  }


  async token() {
    if (!this.e.isMaster) {
      await this.reply('你没有添加token的权限', true)
      return
    }
    if (this.e.isMaster)
      this.setContext('monitora')
    await this.reply('请发送token', false)
  }
  monitora() {
    const serverConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    const newToken = this.e.message[0].text;
    serverConfig.server_token = newToken;
    const yamlString = yaml.stringify(serverConfig);
    fs.writeFileSync('./resources/api/server.yaml', yamlString);
    const updatedConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    this.reply('token已添加！\n如果后续需要进行修改\n重复该流程即可，默认覆盖已有的token', false)
    this.finish('monitora')
  }

  async admin() {
    if (!this.e.isMaster) {
      await this.reply('你没有添加服务器管理员的权限', true)
      return
    }
    if (this.e.isMaster)
      this.setContext('monitorb')
    await this.reply('请发送新增管理员的QQ', false)
  }
  monitorb() {
    const serverConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    const newadmin = this.e.message[0].text;
    const newQQ = Number(newadmin);

    if (serverConfig.server_admin.includes(newQQ)) {
      this.reply('该QQ已经是管理员了哦~');
      return;
    }
    const updatedAdminList = serverConfig.server_admin.concat(newQQ);
    serverConfig.server_admin = updatedAdminList;
    const yamlString = yaml.stringify(serverConfig);
    fs.writeFileSync('./resources/api/server.yaml', yamlString);
    this.reply(`管理员${newQQ} 已添加！可添加多个管理员!`);
    this.finish('monitorb');
  }

  async del() {
    if (!this.e.isMaster) {
      await this.reply('你没有删除服务器管理员的权限', true)
      return
    }
    if (this.e.isMaster)
      this.setContext('monitorc')
    await this.reply('请发送要删除的管理员QQ', false)
  }

  monitorc() {
    const serverConfig = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'))
    const adminToRemove = Number(this.e.message[0].text)
    const adminList = serverConfig.server_admin
    const indexToRemove = adminList.indexOf(adminToRemove)

    if (indexToRemove === -1) {
      this.reply(`管理员 ${adminToRemove} 不存在`)
      this.finish('monitorc')
      return
    }

    const updatedAdminList = adminList.slice(0, indexToRemove).concat(adminList.slice(indexToRemove + 1))
    serverConfig.server_admin = updatedAdminList

    const yamlString = yaml.stringify(serverConfig)
    fs.writeFileSync('./resources/api/server.yaml', yamlString)
    this.reply(`管理员 ${adminToRemove} 已被移除！`)
    this.finish('monitorc')
  }




  async base(e) {
    let UID;
    let config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'));
    let server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    const configFile = './resources/api/config.yaml';
    let msg = e.msg.split(' ');
    const url = server.server_address;
    const QQ = e.user_id;

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
      };
      const response = await fetch(url, options);
      const result = await response.json();

      if (result.retcode === 200) {
        const { count, playerList } = result.data;
        const onlineUsers = `在线人数:${count}\n在线玩家：${playerList.join(', ')}`;
        await this.reply(`opencommand插件状态：√\n${onlineUsers}`);
      } else
        await this.reply(`opencommand插件状态：×`);
    }
    if (msg[0] === '/绑定uid' || msg[0] === '/绑定UID' || msg[0] === '/绑定') {
      const UID = msg[1];
      const config = yaml.parse(fs.readFileSync(configFile, 'utf8')) || {};
      config[QQ.toString()] = { UID: parseInt(UID), token: null };
      fs.writeFileSync(configFile, yaml.stringify(config), 'utf8');
      await this.reply(`绑定 UID ${UID} 成功\n请使用“/连接”获取验证码`);
    }

    if (msg[0] === '/连接' || msg[0] === '/链接') {
      for (const key in config) {
        if (key === QQ.toString()) {
          UID = config[key].UID;
          break;
        }
      }
      if (!UID) {
        await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`);
      } else {
        const url = server.server_address;
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: '',
            action: 'sendCode',
            data: UID,
          }),
          agent: new https.Agent({ rejectUnauthorized: false }),
        };

        try {
          const response = await fetch(url, options);
          const result = await response.json();

          if (result.retcode === 200) {
            const token = result.data;
            config[QQ] = { UID: UID, token: token };
            fs.writeFileSync('./resources/api/config.yaml', yaml.stringify(config), 'utf8');
            await this.reply(`消息token获取成功\n请使用“/验证码 1234”进行连接\n1234为游戏里面的验证码`);
          } else {
            await this.reply('token获取失败，请检查你的UID是否正确或者短时间获取次数上限');
          }
        } catch (e) {
          if (e.toString().includes("Invalid URL")) {
            await this.reply("请求出错：无效的服务器地址，请检查服务器地址\n文件位置：resources\api\server.yaml");
          } else {
            await this.reply(`请求出错：\n无效的API地址\n若无上述无问题，请检查检查服务器地址的端口`);
          }
        }
      }
    }

    if (msg[0] === '/验证码') {
      for (const key in config) {
        if (key === QQ.toString()) {
          UID = config[key].UID;
          break;
        }
      }
      if (!UID) {
        await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`);
      } else {
        const { token } = config[QQ] || {};
        if (!token) {
          await this.reply('token不存在\n请使用“/连接”重新获取token');
          return;
        }
        const url = server.server_address;
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            action: 'verify',
            data: parseInt(msg[1]),
          }),
          agent: new https.Agent({ rejectUnauthorized: false }),
        };
        const response = await fetch(url, options);
        const result = await response.json();
        if (result.retcode === 200) {
          await this.reply(`key验证成功\n愉快的进行玩耍吧！\n指令格式为/list\n每天晚上12点清空所有token哦`);
        } else {
          await this.reply('key验证失败\n请检查你的验证码并重试');
        }
      }

    }
  }

  async command(e) {
    let UID;
    const QQ = e.user_id;
    const server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    let config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'));
    const url = server.server_address;

    for (const admin of server.server_admin) {
      if (QQ == admin) {
        const token = server.server_token;
        const newMsg = e.raw_message.trim().substring(1);
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            action: 'command',
            data: newMsg,
          }),
          agent: new https.Agent({ rejectUnauthorized: false }),
        };
        const response = await fetch(url, options);
        const result = await response.json();
        const { retcode, data } = result;
        if (retcode !== 200) {
          await this.reply(`token无效\n请重新获取\n指令格式：/连接\n请求结果：${JSON.stringify(result)}`);
          return;
        }
        this.reply(data);
        return;
      }
    }

    for (const key in config) {
      if (key === QQ.toString()) {
        UID = config[key].UID;
        break;
      }
    }

    if (!UID) {
      await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`);
    } else {
      const { token } = config[QQ] || {};
      if (!token) {
        await this.reply('token不存在\n请使用“/连接”重新获取token');
        return;
      }
      const newMsg = e.raw_message.trim().substring(1);
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          action: 'command',
          data: newMsg,
        }),
        agent: new https.Agent({ rejectUnauthorized: false }),
      };
      const response = await fetch(url, options);
      const result = await response.json();
      const { retcode, data } = result;
      if (retcode !== 200) {
        await this.reply(`token无效\n请重新获取\n指令格式：/连接\n请求结果：${JSON.stringify(result)}`);
        return;

      }
      this.reply(data);
      return;
    }
  }
  // 群友要的小彩蛋~
  async kfc(e) {
    await this.reply('肯德基疯狂星期V我50！谢谢。', true)
  }
}

