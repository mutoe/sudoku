# Sudoku

数独, 一个前端学徒的练手作品.

## Introduction

该应用中, 计算机生成数独的思路分为 2 个步骤.

1. 生成一个数独终盘.
1. 在终盘的基础上扣去若干数字.

由此两步得到一个完整的数独.

## Usage

使用方法

### Development

开发环境使用热重载启动本地服务.

__yarn__
``` bash
yarn install --prod=false
yarn dev
```

### Production

生产环境将源码编译到 dist 目录下.

__yarn__
``` bash
yarn install
yarn build
```

启动脚本请参见 `package.json` 中 `script` 部分.

## Technology Stack

该程序使用的技术栈 ( 按重要程度排序 ).

__Dance Links (DLX)__

数独求解的一个高效算法.

__Webpack__

模块化, ES6, Stylus, Postcss, 热重载, 打包.

__Canvas__

绘制游戏区域, 人机交互.

__ES6 \ Stylus \ Pug__

语法糖.

__Yarn__

安装开发环境依赖.

## Directory

项目目录结构

```
./
├─ dist               // 发布目录
│   ├─ css
│   ├─ js
│   └─ index.html
├─ src                // 源码
│   ├─ script
│   │   ├─ dlx.js     // DLX 算法类
│   │   ├─ grid.js    // 宫格类
│   │   ├─ main.js    // 游戏逻辑类
│   │   ├─ sudoku.js  // 数独棋盘类
│   │   └─ util.js    // 工具类
│   ├─ stylus
│   │   └─ main.styl  // stylus 样式
│   ├─ entry.js       // webpack 入口
│   └─ index.pug      // 入口模版
├─ .eslintrc.yml      // js 语法检查
├─ .gititnore         // git 用文件忽略
├─ package.json       // npm 包信息
├─ webpack.config.js  // webpack 配置文件
└─ yarn.lock          // yarn 包管理器
```
