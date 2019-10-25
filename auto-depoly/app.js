const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const shelljs = require('shelljs');
const axios = require('axios')

const app = express();

//bodyParser设置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 自动部署前端代码
app.post('/front-source/', async (req, res) => {
  console.log('========================');
  let cmds = [
    `cd ${config.FRONT_SOURCE_PATH}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  let isSuccess = false;
  if (code !== 0) {
    console.log('fail auto depoly！');
    isSuccess = false;
    res.send({ msg: 'Fail' });
  } else {
    console.log('front-source success auto depoly');
    isSuccess = true;
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail('front-source', isSuccess);
  console.log(`Send Email:${result.data.status}`);
  console.log('========================');
});

// 自动部署后端代码
app.post('/back-source/', async (req, res) => {
  console.log('========================');
  let cmds = [
    `cd ${config.BACK_SOURCE_PATH}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  let isSuccess = false;
  if (code !== 0) {
    console.log('fail auto depoly！');
    isSuccess = false;
    res.send({ msg: 'Fail' });
  } else {
    console.log('back-source success auto depoly');
    isSuccess = true;
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail('back-source', isSuccess);
  console.log(`Send Email:${result.data.status}`);
  console.log('========================');
});

app.post('/user-module/',async (req,res)=>{
  console.log('========================');
  let cmds = [
    `cd ${config.USER_MODULE_PATH}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git pull`,
    `go build -o user-module main.go`,
    `pm2 restart user-module`,
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  let isSuccess = false;
  if (code !== 0) {
    console.log('fail auto depoly！');
    isSuccess = false;
    res.send({ msg: 'Fail' });
  } else {
    console.log('back-source success auto depoly');
    isSuccess = true;
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail('back-source', isSuccess);
  console.log(`Send Email:${result.data.status}`);
  console.log('========================');
})

app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log('自动部署服务已开启...');
})

async function sendEmail(projectName, isSuccess) {
  let res = await axios.post('http://localhost:7001/api/v1/sendMail', {
    authKey: 'BALLCRAZY',
    subject: '【自动部署】',
    to: '774028406@qq.com',
    content: `${projectName} 自动部署${isSuccess ? '成功' : '失败'}`,
  })
  return res;
}