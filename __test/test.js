const MarkdownBlogPushTool = require("../");
const { resolve } = require("path");
const Authorization = "C6MqHrvgHZap5CbtpmazERdIbrautb8W"; // TODO :  use your smms Authorization
const apiUrl = "https://rpc.cnblogs.com/metaweblog/bitbw"; //  TODO : use your blog API instead
const username = "bitbw"; // TODO: username
const password =
  "F489768E2E8E25562E36808A6A6097942D444931811E93DBF29078E6299BACF8"; // TODO: use you
const replaceURL = true; // TODO: is  replaceURL
const replaceURLReg = new RegExp("https://s2.loli.net/"); // TODO: replaceURLReg rule
const markdownBlogPushTool = new MarkdownBlogPushTool(
  { apiUrl, username, password }, // metaWeblogOptions
  { Authorization, replaceURL, replaceURLReg } // replaceImgOptions
);
const path = resolve(__dirname, "./assets");
//  upload and replace all images and push all post to apiUrl
markdownBlogPushTool.pushMarkdownBlog(path, true);

// push all post to apiUrl
// markdownBlogPushTool.pushMarkdownBlog(path);

// upload and replace all images
// markdownBlogPushTool.replaceImgUrl(path);
