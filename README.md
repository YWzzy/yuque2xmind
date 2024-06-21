# 🌈 yuquetoxmind

## 介绍

- 基于 Node.js ，cheerio ，inquirer ，jszip ，xml2js ，等开发的文件转换工具
- 可以将语雀思维导图 .lakeboard 格式文件转换为 XMind 思维导图

## 注意事项

- node >=14 ,npm >=6

### 依赖

| 框架                                                | 说明                                                                              | 版本        |
| --------------------------------------------------- | --------------------------------------------------------------------------------- | ----------- |
| [Node](https://nodejs.org/en)                       | 常见 js 环境容器                                                                  | 18.17.1     |
| [cheerio](https://www.npmjs.com/package/cheerio)    | 常见爬虫框架                                                                      | 1.0.0-rc.12 |
| [inquirer ](https://www.npmjs.com/package/inquirer) | 常见交互式命令行用户界面的集合                                                    | 9.2.23      |
| [jszip ](https://www.npmjs.com/package/jszip)       | 一个使用 JavaScript 创建、读取和编辑 .zip 文件的库，具有可爱且简单的 API          | 3.10.1      |
| [xml2js ](https://www.npmjs.com/package/xml2js)     | 简单的 XML 到 JavaScript 对象转换器。它支持双向转换。使用 sax-js 和 xmlbuilder-js | 0.6.2       |

### 推荐 VScode 开发，插件如下

- WindiCSS IntelliSense WindiCSS --- 自动完成、语法突出显示、代码折叠和构建等高级功能
- TypeScript Vue Plugin (Volar) --- 用于 TypeScript 的 Vue 插件
- Vue Language Features (Volar) --- Vue3.0 语法支持
- Iconify IntelliSense --- Iconify 预览和搜索
- i18n Ally --- 国际化智能提示
- Stylelint --- css 格式化
- DotENV --- .env 文件高亮
- Prettier --- 代码格式化
- ESLint --- 脚本代码检查

### 安装 npm 并启动项目

- 查看当前 npm 源

```bash
npm config ls
```

- 如果执行上面命令您并未看到 registry = "https://registry.npmjs.org/"，说明使用的非npm官方源，请执行下面命令

```bash
npm config set registry https://registry.npmjs.org
```

- mac 用户遇到安装报错请在命令前加上 sudo

- 安装依赖

```bash
npm install
```

- 运行项目

```bash
npm run start
```

1. 选择需要转换的文件夹
2. 选择该文件夹下需要转换的文件
3. 转换成功后，文件会存放在项目目录的 result/output 目录下
4. 使用 XMind 打开后就可以进行各种编辑了，或者导出为其他各种格式

- 设置镜像源

```bash
npm config set registry https://registry.npm.taobao.org/
```

- 其他命令请看 package.json scripts

## 浏览器支持

本地开发推荐使用 `Chrome 80+` 浏览器

支持现代浏览器, 不支持 IE ,QQ 等

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                                                                                                                   not support                                                                                                                    |                                                                                            last 2 versions                                                                                             |                                                                                                  last 2 versions                                                                                                  |                                                                                                last 2 versions                                                                                                |                                                                                                last 2 versions                                                                                                |

## 运行截图

- 处理结果
  <img src="https://ossk.cc/file/a1a03ca58ffa05c59bed7.jpg" alt="处理结果">

- 语雀思维导图
  <img src="https://ossk.cc/file/c4ef651923549858bf515.jpg" alt="语雀思维导图">

- 转换后的 xmind 思维导图
  <img src="https://ossk.cc/file/47445aed16d3fb121ef4e.jpg" alt="转换后的xmind思维导图">
