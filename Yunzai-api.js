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
  if (!fs.existsSync('./resources/api')) {
    fs.mkdirSync('./resources/api');
  }
  if (!fs.existsSync('./resources/api/config.yaml')) {
    fs.writeFileSync('./resources/api/config.yaml',yaml.stringify(QQconfig));
  }
  if (!fs.existsSync('./resources/api/server.yaml')) {
    fs.writeFileSync('./resources/api/server.yaml', 'server_address: 127.0.0.1:443');
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
          reg: '^/(.*)$',
          fnc: 'gcapi',
        },
      ],
    });
  }

  async gcapi(e) {
    let UID;
    let config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'));
    let server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    const configFile = './resources/api/config.yaml';
    let msg = e.msg.split(' ');
    const url = server.server_address;
    const QQ = e.user_id; // 获取消息触发者的QQ号

    try {
      const data = fs.readFileSync('./path/to/file', 'utf8');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
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
      const UID = msg[1]; // 获取绑定的UID
      // 将QQ、UID和token添加到./resources/gm/config.yaml文件中
      const config = yaml.parse(fs.readFileSync(configFile, 'utf8')) || {};
      config[QQ] = { UID: parseInt(UID), token: null };
      fs.writeFileSync(configFile, yaml.stringify(config), 'utf8');
      await this.reply(`绑定 UID ${UID} 成功\n请使用“/连接”获取验证码`);
    }

    if (msg[0] === '/连接'|| msg[0] === '/链接') {
      for (const key in config) {
        if (config[key].QQ === QQ) {
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
          console.log('请求结果：', result);
    
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
            await this.reply(`请求出错：\n无效的API地址\n若无上述无问题，请检查你的端口是否开放`);
            console.log(JSON.stringify(e))
          }
        }
      }
    }
    
    if (msg[0] === '/验证码') {
      for (const key in config) {
        if (config[key].QQ === QQ) {
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
        console.log(options);
        const response = await fetch(url, options);
        const result = await response.json();
        console.log('请求结果：', result);
        if (result.retcode === 200) {
          await this.reply(`key验证成功\n愉快的进行玩耍吧！\n指令格式为/list\n每天晚上12点清空所有token哦`);
        } else {
          await this.reply('key验证失败\n请检查你的验证码并重试');
        }
      }

    }


    if (msg[0].startsWith('/')) {
      // 查找对应QQ号的UID
      let UID;
      for (const key in config) {
        if (config[key].QQ === QQ) {
          UID = config[key].UID;
          break;
        }
    
      if (!UID) {
        await this.reply(`没有找到对应的UID\n请先绑定UID\n指令格式：/绑定 UID`);
      } else {
        msg[0] = msg[0].substr(1);
        let newMsg = msg.join(' ');
    
        const { token } = config[QQ];
        if (token) {
          const url = server.server_address;
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
          console.log('请求结果：', result);
          const data = (`${result.data}`);
          this.reply(data);
        }
      }
    }
  }
}
}
/*
1.定时任务，每天晚上12点清空token
2.服主token处理
3.别名指令
4.添加url
5.查看当前url
6.添加别名
7.删除别名
8.服务器列表
*/