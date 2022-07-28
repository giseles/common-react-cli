const program = require('commander'); //设计命令行
const download = require('download-git-repo'); //github仓库下载
const inquirer = require('inquirer'); //命令行答询
const handlebars = require('handlebars'); //修改字符
const ora = require('ora'); //命令行中加载状态标识
const chalk = require('chalk'); //命令行输出字符颜色
const logSymbols = require('log-symbols'); //命令行输出符号

const fs = require('fs');
const package = require('./package.json');

const version = `x-cli cli v${package.version}`;

const templates = {
  'v3e': {
    downloadUrl: 'github:giseles/common-react#main'
  },
  'v3a': {
    downloadUrl: 'github:giseles/common-react#main'
  }
};

// create <project>
program
  .command('create <project>')
  .description('创建项目')
  .action((projectName) => {
    //命令行答询
    console.clear();
    console.log(chalk.blue(version));
    console.log('');

    inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: '请输入项目名称',
        default: projectName
      }, {
        type: 'list',
        name: 'templateName',
        message: '请选择项目模版',
        choices: [
          `v3e (${chalk.yellow('Vue3 Element-Plus Admin')})`,
          `v3a (${chalk.yellow('Vue3 Antd Admin')})`
        ],
        filter: function (val) {
          return val.substr(0, 3);
        }
      }
    ]).then(answers => {

      let downloadUrl = templates[answers.templateName].downloadUrl;
      //下载github项目，下载墙loading提示
      console.log('');
      const spinner = ora('正在下载模板...').start();

      //第一个参数是github仓库地址，第二个参数是创建的项目目录名，第三个参数是clone
      download(downloadUrl, projectName, { clone: true }, err => {
        if (err) {
          console.log(logSymbols.error, chalk.red(err));
        } else {
          spinner.succeed('项目模板下载成功');
          console.log('');
          //根据命令行答询结果修改package.json文件
          let packageContent = fs.readFileSync(`${projectName}/package.json`, 'utf8');
          let packageResult = handlebars.compile(packageContent)(answers);
          fs.writeFileSync(`${projectName}/package.json`, packageResult);

          console.log(' ', chalk.gray('$'), chalk.yellow(`cd ${projectName}`));
          console.log(' ', chalk.gray('$'), chalk.magentaBright('git init'));
          console.log(' ', chalk.gray('$'), chalk.cyan('yarn'));
          console.log(' ', chalk.gray('$'), chalk.green('yarn serve'));
          console.log('');
        }
      })
    })
  });
