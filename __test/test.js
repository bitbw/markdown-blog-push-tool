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
// TODO: your md file dir
const path = resolve(__dirname, "./assets");
//  upload and replace all images and push all post to apiUrl
markdownBlogPushTool.pushMarkdownBlog(path, true);

// push all post to apiUrl
// markdownBlogPushTool.pushMarkdownBlog(path);

// upload and replace all images
// markdownBlogPushTool.replaceImgUrl(path);
