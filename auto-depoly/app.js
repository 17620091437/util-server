const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const shelljs = require('shelljs');
const axios = require('axios')

const app = express();

//bodyParser设置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// 自动部署node代码
app.post('/node/:name', async (req, res) => {
  console.log('========================');
  let projectName = req.params.name
  let data = depolyNode(projectName)
  if (!data.res) {
    console.log('fail auto depoly！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('user-module success auto depoly');
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail('user-module', data.res, data.msg);
  console.log(`Send Email:${result.data.status}`);
  console.log('========================');
});

// 自动部署go代码
app.post('/go/:name',async (req,res)=>{
  console.log('========================');
  let projectName = req.params.name
  let data = depolyGo(projectName)
  if (!data.res) {
    console.log('fail auto depoly！');
    res.send({ msg: 'Fail' });
  } else {
    console.log('user-module success auto depoly');
    res.send({ msg: 'Success' });
  }
  let result = await sendEmail('user-module', data.res, data.msg);
  console.log(`Send Email:${result.data.status}`);
  console.log('========================');
})

app.listen(3001, (err) => {
  if (err) console.log(err);
  console.log('自动部署服务已开启...');
})

async function sendEmail(projectName, isSuccess,stdout) {
  let arr = stdout.split("\n");
  let detail;
  for(let i=0;i<arr.length;i++){
    detail += `<p>${arr[i]}</p>`
  }
  let res = await axios.post('http://localhost:7001/api/v1/sendMail', {
    authKey: 'BALLCRAZY',
    subject: '【自动部署】',
    to: '774028406@qq.com',
    content: `<h2>${projectName} 自动部署${isSuccess ? '成功' : '失败'}</h2>${detail}`,
  })
  return res;
}

function depolyGo(projectName){
  let projectPath = config[projectName];
  if(!projectPath) {
    return {
      res:false,
      msg:"项目路径不存在",
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
  let stdout = shellRes.stdout;
  if(code!==0){
    return {
      res:false,
      msg:stdout,
    }
  }else{
    return {
      res:true,
      msg:stdout,
    }
  }
}

function depolyNode(projectName){
  let projectPath = config[projectName];
  if(!projectPath) {
    return {
      res:false,
      msg:"项目路径不存在",
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
  let stdout = shellRes.stdout;
  if(code!==0){
    return {
      res:false,
      msg:stdout,
    }
  }else{
    return {
      res:true,
      msg:stdout,
    }
  }
}