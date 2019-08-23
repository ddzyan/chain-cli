#!/usr/bin/env node

const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const inquirer = require('inquirer');
const symbols = require('log-symbols');

program
  .version('1.0.0')
  .command('init <name>')
  .action(name => {
    if (!fs.existsSync(name)) {
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'author',
            message: '请输入作者名称'
          },
          {
            type: 'input',
            name: 'description',
            message: '请输入项目描述信息'
          }
        ])
        .then(answers => {
          const spinner = ora('正在下载模板...');
          spinner.start();
          download('https://gitlab.billionway.cn:dingdongzhao/chain-gateway#master', name, { clone: true }, err => {
            if (err) {
              spinner.fail();
              console.log(symbols.error, chalk.red(err));
            } else {
              spinner.succeed();
              const { author, description } = answers;
              const fileName = `${name}/package.json`;
              const meta = {
                name,
                description,
                author: author
              };
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(fileName, result);
                console.log(symbols.success, chalk.green('package.json 覆盖完成完成'));
              }
              console.log(symbols.success, chalk.green('项目初始化完成'));
            }
          });
        });
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  });

program.parse(process.argv);
