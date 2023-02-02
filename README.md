# Markdown blog push tool for node.js

A tool for processing markdown file blogs, supports uploading blog platforms and uploading pictures to image beds

The md files of hexo and docusaurus can be uploaded

This project uses [metaweblog-api](https://github.com/uhavemyword/metaweblog-api) to complete the blog upload
## install

```bash
npm install markdown-blog-push-tool
```

## Usage

### init

```js
const MarkdownBlogPushTool = require("../");
const { resolve } = require("path");
const Authorization = "xxx"; // TODO :  use your smms Authorization
const apiUrl = "xxx"; // TODO : use your blog API instead
const username = "xxx"; // TODO: your username
const password = "xxx"; // TODO: use your password
const replaceURL = true; // TODO: is replaceURL
const replaceURLReg = new RegExp("https://s2.loli.net/"); // TODO: replaceURL rule
const markdownBlogPushTool = new MarkdownBlogPushTool(
  { apiUrl, username, password }, // metaWeblogOptions
  { Authorization, replaceURL, replaceURLReg } // replaceImgOptions
);

```

### upload and replace all images and push all post to apiUrl

```js
// TODO: your md file dir
const path = resolve(__dirname, "./assets");
//  upload and replace all images and push all post to apiUrl
markdownBlogPushTool.pushMarkdownBlog(path, true);

```

### push all post to apiUrl

```js
// push all post to apiUrl
markdownBlogPushTool.pushMarkdownBlog(path);

```

### upload and replace all images

```js
// upload and replace all images
markdownBlogPushTool.replaceImgUrl(path);
```

### example

[example](https://github.com/bitbw/markdown-blog-push-tool/tree/main/__test)
