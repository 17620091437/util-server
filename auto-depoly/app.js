const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const shelljs = require('shelljs');

const app = express();

//bodyParser设置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// 自动部署前端代码
app.post('/front-source/', (req, res) => {
  console.log('========================');
  let cmds = [
    `cd ${config.FRONT_SOURCE_PATH}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git clean -xdf`, // 本地修改/新增了一堆文件，已经git add到暂存区，想放弃修改。
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  if (code !== 0) {
    console.log('fail auto depoly！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('front-source success auto depoly');
    res.send({ msg: 'Success' });
  }
  console.log('========================');
});

// 自动部署后端代码
app.post('/back-source/', (req, res) => {
  console.log('========================');
  let cmds = [
    `cd ${config.BACK_SOURCE_PATH}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git clean -xdf`, // 本地修改/新增了一堆文件，已经git add到暂存区，想放弃修改。
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  if (code !== 0) {
    console.log('fail auto depoly！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('back-source success auto depoly');
    res.send({ msg: 'Success' });
  }
  console.log('========================');
});

app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log('自动部署服务已开启...');
})