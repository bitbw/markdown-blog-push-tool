const MarkdownBlogPushTool = require("../");
const { resolve } = require("path");
const Authorization = "xxx"; // TODO :  use your smms Authorization
const apiUrl = "https://rpc.cnblogs.com/metaweblog/xx"; // use your blog API instead
const username = "xxx";
const password =
  "xxx"; // TODO: use your password
const markdownBlogPushTool = new MarkdownBlogPushTool(
  { apiUrl, username, password },
  { Authorization }
);
const path = resolve(__dirname, "./assets");
// upload and replace all images
markdownBlogPushTool.handleAllPushPost(path, true);

// push all post to apiUrl
markdownBlogPushTool.handleAllPushPost(path);
