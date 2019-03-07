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
  let cmds = [
    `cd ${config.FRONT_SOURCE_PATH}`,
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  if (code !== 0) {
    console.log('自动部署失败！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('前端代码自动部署成功！');
    res.send({ msg: 'Success' });
  }
});

// 自动部署后端代码
app.post('/back-source/', (req, res) => {
  let cmds = [
    `cd ${config.BACK_SOURCE_PATH}`,
    `git pull`
  ];
  let code = shelljs.exec(cmds.join(' && ')).code;
  if (code !== 0) {
    console.log('自动部署失败！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('后端代码自动部署成功！');
    res.send({ msg: 'Success' });
  }

});

app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log('自动部署服务已开启...');
})