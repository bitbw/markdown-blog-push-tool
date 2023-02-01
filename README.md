# Markdown blog push tool for node.js

## install

```bash
npm install markdown-blog-push-tool
```

## Usage

```js
const MarkdownBlogPushTool = require("markdown-blog-push-tool");
const { resolve } = require("path");
const Authorization = "xxx"; //  use your smms Authorization
const apiUrl = "https://rpc.cnblogs.com/metaweblog/xxx"; // use your blog API instead
const username = "xxx";
const password = "xxx"; // use your password
const markdownBlogPushTool = new MarkdownBlogPushTool(
  { apiUrl, username, password },
  { Authorization }
);
// TODO : your md file dir
const path = resolve(__dirname, "your_dirpath");
markdownBlogPushTool.handleAllPushPost(path);

``
