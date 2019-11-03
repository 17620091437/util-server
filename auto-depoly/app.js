const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const shelljs = require('shelljs');
const axios = require('axios')

const app = express();

//bodyParser设置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 前端
app.post('/front-source', async (req, res) => {
  let projectPath = config["front-source"]
  let cmds = [
    `cd ${projectPath}`,
    `git checkout .`,
    `git pull`,
    `cp -rf ${projectPath}/static/. ${config["static-path"]}`
  ];
  let shellRes = shelljs.exec(cmds.join(' && '));
  if (shellRes.code != 0) {
    res.send({ msg: 'Fail' });
  } else {
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail("front-source", shellRes.code == 0 ? true : false, shellRes.code == 0 ? shellRes.stdout : shellRes.stderr);
  console.log(`Send Email:${result.data.status}`);
})

// 自动部署node代码
app.post('/node/:name', async (req, res) => {
  let projectName = req.params.name
  let data = depolyNode(projectName)
  if (!data.res) {
    res.send({ msg: 'Fail' });
  } else {
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail(projectName, data.res, data.msg);
  console.log(`Send Email:${result.data.status}`);
});

// 自动部署go代码
app.post('/go/:name', async (req, res) => {
  let projectName = req.params.name
  let data = depolyGo(projectName)
  if (!data.res) {
    res.send({ msg: 'Fail' });
  } else {
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail(projectName, data.res, data.msg);
  console.log(`Send Email:${result.data.status}`);
})

app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log('自动部署服务已开启...');
})

async function sendEmail(projectName, isSuccess, stdout) {
  let arr = stdout.split("\n");
  arr.splice(1, 1);
  let detail;
  for (let i = 0; i < arr.length; i++) {
    detail += `<p>${arr[i]}</p>`
  }
  // console.log(detail)
  let res = await axios.post('http://localhost:7001/api/v1/sendMail', {
    authKey: 'BALLCRAZY',
    subject: '【自动部署】',
    to: '774028406@qq.com',
    content: `<h2>${projectName} 自动部署${isSuccess ? '成功' : '失败'}</h2>${detail}`,
  })
  return res;
}

function depolyGo(projectName) {
  let projectPath = config[projectName];
  if (!projectPath) {
    return {
      res: false,
      msg: "项目路径不存在",
    }
  };
  let cmds = [
    `cd ${projectPath}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git pull`,
    `go build -o ${projectName} main.go`,
    `pm2 reload ${projectName}`,
  ];
  let shellRes = shelljs.exec(cmds.join(' && '));
  let code = shellRes.code;
  let out = `===[Error]===\n${shellRes.stderr}\n===[INFO]===\n${shellRes.stdout}`
  if (code !== 0) {
    return {
      res: false,
      msg: out,
    }
  } else {
    let status = getPM2Status()
    return {
      res: true,
      msg: `${out}\n${status}`,
    }
  }
}

function depolyNode(projectName) {
  let projectPath = config[projectName];
  if (!projectPath) {
    return {
      res: false,
      msg: "项目路径不存在",
    }
  };
  let cmds = [
    `cd ${projectPath}`,
    `git checkout .`, // 本地新增了一堆文件(并没有git add到暂存区)，想放弃修改。
    `git pull`,
    `pm2 reload ${projectName}`,
  ];
  let shellRes = shelljs.exec(cmds.join(' && '));
  let code = shellRes.code;
  let out = `===[Error]===\n${shellRes.stderr}\n===[INFO]===\n${shellRes.stdout}`
  if (code !== 0) {
    return {
      res: false,
      msg: out,
    }
  } else {
    let status = getPM2Status()
    return {
      res: true,
      msg: `${out}\n${status}`,
    }
  }
}

function getPM2Status() {
  let shellRes = shelljs.exec(`pm2 jlist`);
  if (shellRes.code != 0) {
    return shellRes.stderr
  }
  let html = "===[Status]===\n<table border=1>"
  let list = JSON.parse(shellRes.stdout)
  html += "<tr><th>id(pid)</th><th>name</th><th>monit</th><th>status</th><th>restart_time</th></tr>"
  list.forEach(task => {
    html += `<tr><th>${task.pm_id}(${task.pid})</th><th>${task.name}</th><th>mem:${parseInt(task.monit.memory / 1024 / 1024)}M cpu:${task.monit.cpu}</th><th>${task.pm2_env.status}</th><th>${task.pm2_env.restart_time}</th></tr>`
  });
  html += "</table>"
  return html
}