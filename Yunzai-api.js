import plugin from '../../lib/plugins/plugin.js';
import https from 'https';
import fetch from 'node-fetch';
import { segment } from 'oicq';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

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
    const configFile = './resources/api/config.yaml';
    const serverFile = './resources/api/server.yaml';
      // 如果配置文件不存在，创建默认配置
      if (!fs.existsSync(configFile)) {
        fs.mkdirSync('./resources/api', { recursive: true });
        fs.writeFileSync(configFile, yaml.stringify({}));
      }

    let msg = e.msg.split(' ');
    const config = yaml.parse(fs.readFileSync('./resources/api/config.yaml', 'utf8'));
    const server = yaml.parse(fs.readFileSync('./resources/api/server.yaml', 'utf8'));
    const url = server.server_address;

    const QQ = e.user_id; // 获取消息触发者的QQ号
    
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
    if (msg[0] === '/绑定uid' || msg[0] === '/绑定UID'|| msg[0] === '/绑定') {
      const UID = msg[1]; // 获取绑定的UID
      // 将QQ、UID和token添加到./resources/gm/config.yaml文件中
      const config = yaml.parse(fs.readFileSync(configFile, 'utf8')) || {};
      config[QQ] = { UID: parseInt(UID), token: null };
      fs.writeFileSync(configFile, yaml.stringify(config), 'utf8');
      await this.reply(`绑定 UID ${UID} 成功\n请使用“/连接”获取验证码`);
    }

    if (msg[0] === '/连接') {
      const { UID } = config[QQ]; // 使用对象解构获取 UID 值
      if (!UID) {
        await this.reply(`请使用“/绑定UID ${QQ}”来绑定你的个人UID。`);
      } else {
        const url = 'https://35.tanga.cc:35/opencommand/api';
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

        const response = await fetch(url, options);
        const result = await response.json();
        console.log('请求结果：', result);

        if (result.retcode === 200) {
          const token = result.data;
          config[QQ] = { UID: UID, token: token };
          fs.writeFileSync('./resources/gm/config.yaml', yaml.stringify(config), 'utf8');
          await this.reply(`消息token获取成功\n请使用“/验证码 1234”进行连接\n1234为游戏里面的验证码`);
        } else {
          await this.reply('token获取失败，请检查你的UID是否正确或者短时间获取次数上限');
        }
      }
    }
    if (msg[0] === '/验证码') {
      const { UID } = config[QQ]; // 使用对象解构获取 UID 值
      if (!UID) {
        await this.reply(`请使用“/绑定UID ${QQ}”来绑定你的个人UID。`);
      } else {
        const config = yaml.parse(fs.readFileSync('./resources/gm/config.yaml', 'utf8'));
        const { token } = config[QQ] || {};
        if (!token) {
          await this.reply('token不存在\n请使用“/连接”重新获取token');
          return;
        }
        const url = 'https://35.tanga.cc:35/opencommand/api';
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
      const config = yaml.parse(fs.readFileSync('./resources/gm/config.yaml', 'utf8'));
      const { token } = config[QQ]; // 使用对象解构获取 UID 值      
      msg[0] = msg[0].substr(1); // 去除开头的/
      let newMsg = msg.join(' '); // 以空格组合成一个新的字符串

      if (token) {
        const url = 'https://35.tanga.cc:35/opencommand/api';
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
        this.reply(data)
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
*/