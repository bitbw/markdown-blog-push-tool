# rollup 入门 demo

## 参考

[插件](https://github.com/rollup/plugins)
[Rollup 创建一个库的官方示例](https://github.com/rollup/rollup-starter-lib)
[一个支持TS语法、类型声明、CommonJS和ESModule规范的npm库模板](https://github.com/awefeng/npm-template)
[TypeScript + Babel 示例](https://github.com/a-tarasyuk/rollup-typescript-babel)

## 安装

### rollup 主体

```bash
npm i --save-dev rollup 

```

### 常用插件 plugin

```bash
npm i --save-dev @rollup/plugin-node-resolve #  使用 node 模版解析方式解析模块 （就是可以 import 的方式 node_modules 中的模块和 node 的内置模块）
npm i --save-dev @rollup/plugin-commonjs # 可以用 import 的方式 导入 commonjs 模块 
npm i --save-dev @rollup/plugin-json # 可以用 import 的方式 导入 .json 文件
```

## babel

```bash
npm install --save-dev @rollup/plugin-babel @babel/core # 核心
npm install @babel/preset-env --save-dev # 预设 polyfill

```

## typescript

```bash
npm install --save-dev typescript # ts cli 必须
npm install --save-dev @types/node #  node 的 typescript 类型定义 （判断是否需要 如果node_modules 中有 就不用下 ）
npm install --save-dev @babel/preset-typescript # babel 的 typescript 预设

## 使用 @rollup/plugin-typescript 的情况 （@rollup/plugin-typescript 和  @rollup/plugin-babel 没必要同时安装 babel 添加预设可以处理 ts）
npm install @rollup/plugin-typescript --save-dev
npm install tslib --save-dev # @rollup/plugin-typescript  需要
```

## eslint

[eslint 指南](https://eslint.bootcss.com/docs/user-guide/getting-started)

```bash
npm install --save-dev eslint # eslint cli
npm install @rollup/plugin-eslint --save-dev # rollup eslint
```

### 生成 eslint 配置文件

```bash
./node_modules/.bin/eslint --init # or npm init @eslint/config
```

根据提示生成对应配置文件即可

### 创建 .eslintignore 排除文件

### 配置 rollup.config.js

```js
import eslint from '@rollup/plugin-eslint';

export default {
  input: 'main.js',
  plugins: [
    eslint({
      /* your options */
    })
  ]
};

```

## prettier

[prettier 与 ESLint 集成](https://prettier.io/docs/en/related-projects.html#eslint-integrations)

```bash
npm install --save-dev prettier # prettier cli
npm install --save-dev eslint-config-prettier # 关闭所有不必要的或可能与 Prettier 冲突的 ESLint 规则
npm install --save-dev eslint-plugin-prettier # 将 Prettier 作为 ESLint 规则运行，并将差异报告为单个 ESLint 问题
npm install --save-dev prettier-eslint #   prettier 输出传递给 eslint --fix ( 不一定要用)

```

### eslint 配置

```js
 extends: [
    "plugin:prettier/recommended",
    ...
  ],
```

## rollup.config.js 配置文件

```js
// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
import json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";
const extensions = [".js", ".jsx", ".ts", ".tsx"];
const config = {
  input: "src/main.ts",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
  ],
  plugins: [
    resolve({
      extensions,
    }),
    json(),
    commonjs({
      transformMixedEsModules: true,
    }),
    babel({
      extensions,
      babelHelpers: "bundled",
      include: ["src/**/*"],
    }),
  ],
};

export default config;
```

## npm 脚本
