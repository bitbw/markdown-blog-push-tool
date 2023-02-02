import API, { IMetaWeblogOptions, ISMMSOptions } from "./api";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
// TODO: log 打印优化
export interface IReplaceImgOptions extends ISMMSOptions {
  replaceURL?: boolean;
  replaceURLReg?: RegExp;
}
export default class MarkdownBlogPushTool extends API {
  replaceURL: boolean;
  replaceURLReg: RegExp;
  constructor(
    metaWeblogOptions: IMetaWeblogOptions,
    replaceImgOptions?: IReplaceImgOptions
  ) {
    super(metaWeblogOptions, replaceImgOptions);
    this.replaceURL = replaceImgOptions?.replaceURL || false;
    this.replaceURLReg = replaceImgOptions?.replaceURLReg || new RegExp("");
  }
  isDir(pathname: string) {
    return fs.stat(pathname).then((stats) => stats.isDirectory());
  }
  /**
   * @description: 通过 metaweblog-api 推送 md 文件
   * @param {*} pathname 文件路径 可以是文件路径 或者文件夹路径
   * @param {*} replaceImg 是否需要替换 md 文件内部图片
   * @return {*}
   */
  async pushMarkdownBlog(pathname: string, replaceImg = false) {
    const isDir = await this.isDir(pathname);
    const handler = replaceImg
      ? this.pushAndReplaceImgUrl.bind(this)
      : this.handlePushMarkdownBlog.bind(this);
    if (isDir) {
      this.deepDir(pathname, handler);
    } else {
      handler(pathname);
    }
  }
  /**
   * @description: 通过 smms 推送 md 文件中的图片
   * @param {*} pathname 文件路径 可以是文件路径 或者文件夹路径
   * @return {*}
   */
  async replaceImgUrl(pathname: string) {
    const isDir = await this.isDir(pathname);
    if (isDir) {
      this.deepDir(pathname, this.handleReplaceImgUrl.bind(this));
    } else {
      this.handleReplaceImgUrl(pathname);
    }
  }
  /**
   * @description:  通过 metaweblog-api 推送 md 文件 && 通过 smms 推送 md 文件中的图片
   * @param {string} filePath 只能是文件路径
   * @return {*}
   */
  async pushAndReplaceImgUrl(filePath: string) {
    await this.handleReplaceImgUrl(filePath);
    await this.handlePushMarkdownBlog(filePath);
  }
  /**
   * @description: 递归处理处理文件夹
   * @param {*} dirPath md 所在文件夹路径
   * @param {*} handle 处理 md 文件的函数
   * @return {*}
   */
  async deepDir(
    dirPath: string,
    handler: (filePath: string, ...arg: any[]) => Promise<any>,
    ...arg: any[]
  ) {
    const files = await fs.readdir(dirPath);
    for (const fileName of files) {
      const filePath = path.resolve(dirPath, fileName);
      // dir 继续递归
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await this.deepDir(filePath, handler, ...arg);
        continue;
      }
      if (filePath.indexOf(".md") === -1) continue;
      console.log("[********************************]");
      console.log("[fileName]", fileName);
      await handler(filePath, ...arg);
    }
    console.log(`[INFO] dirPath: "${dirPath}"  is complete`);
  }

  /**
   * @description: 推送单个 md 文件
   * @param {*} filePath md 文件路径
   * @return {*}
   */
  async handlePushMarkdownBlog(filePath: string) {
    if (filePath.indexOf(".md") === -1) return;
    const fileName = path.basename(filePath);
    // 解析 md 文件
    const grayMatterFile = matter.read(filePath);
    const { data, content } = grayMatterFile;
    if (!data || !data.title) return;
    // 获取当前哈希值 对比 之前的 哈希
    const hash = crypto.createHash("sha256");
    hash.update(content);
    const nowContentHash = hash.digest("hex");
    const { cnblogs, hash: contentHash } = data;
    if (contentHash && contentHash == nowContentHash) {
      console.log("[hash值未变退出当前循环]");
      return;
    }
    // yaml中添加 hash
    data.hash = nowContentHash;
    // 文章数据
    const categories = Array.isArray(data.tags) ? data.tags : [];
    // TODO: data.? 看自己的 md 文档是如何配置
    const post = {
      description: content,
      title: data.title,
      // 注意 要以 Markdown 格式发布 必须在 categories 中 添加  "[Markdown]"
      categories: ["[Markdown]"].concat(categories),
    };
    let res;
    // 请求
    if (cnblogs && cnblogs.postid) {
      console.log("[-------------修改-------------]");
      try {
        res = await this.editPost(cnblogs.postid, post, true);
      } catch (error: any) {
        console.log("[修改失败]", error.message);
        throw Error(error.message);
      }
      console.log("[修改成功]", res);
    } else {
      console.log("[-------------新建-------------]");
      data.cnblogs = {};
      try {
        res = await this.newPost(post, true);
      } catch (error: any) {
        console.log("[上传失败]", error.message);
        throw Error(error.message);
      }
      console.log("[上传成功]", res);
      // yaml中添加 postid
      data.cnblogs.postid = res;
    }
    // 回写数据
    const str = matter.stringify(content, data);
    await fs.writeFile(filePath, str);
    console.log("[回写成功]", fileName);
    // 等待 3500 后继续下一个
    await new Promise((r) => setTimeout(r, 3500, true));
  }

  /**
   * @description: 替换 md 文件中的图片 url 地址
   * @param {string} filePath md 文件路径
   * @return {*}
   */
  async handleReplaceImgUrl(filePath: string) {
    if (filePath.indexOf(".md") === -1) return;
    const fileName = path.basename(filePath);
    // 解析 md 文件
    const grayMatterFile = matter.read(filePath);
    const { data } = grayMatterFile;
    let { content } = grayMatterFile;
    if (!data || !data.title) return;
    const reg = /!\[.*\]\((.*)\)/g;
    const reg2 = /!\[.*\]\((.*)\)/;
    const imgUrls = content.match(reg);
    if (!imgUrls || !imgUrls.length) return;
    let replaceCount = 0;
    for (const [index, imgUrl] of imgUrls.entries()) {
      const url = (imgUrl?.match(reg2) as Array<string>)[1];
      if (this.replaceURLReg.test(url)) continue;
      console.log(`[替换URL ${index + 1}]`, url);
      try {
        const newUrl: any = await this.uploadImg(url, filePath);
        if (!newUrl) {
          console.log(`[不符合替换条件 URL ${index + 1}]`, url);
          continue;
        }
        if (newUrl.message) {
          throw Error(newUrl.message);
        }
        content = content.replace(url, newUrl);
        console.log(`[替换成功 ${index + 1}]`, newUrl);
        replaceCount++;
      } catch (error: any) {
        console.log(`[替换失败 ${index + 1}]`, error.message);
      }
    }
    if (replaceCount === 0) {
      console.log(`[无需要替换的img]`);
      return;
    }
    const str = matter.stringify(content, data);
    await fs.writeFile(filePath, str);
    console.log("[回写成功]", fileName);
  }
  /**
   * @description: 上传图片 本地图片 或者 网络图片
   * @param {string} imgPath 图片路径 或者 图片 url
   * @param {string} filePath md 文件路径
   * @return {*}
   */
  async uploadImg(imgPath: string, filePath: string) {
    // 测试是否为 url
    const httpTest = /^http/;
    let res;
    // 网络图片
    if (httpTest.test(imgPath)) {
      if (!this.replaceURL) return;
      if (this.replaceURLReg.test(imgPath)) return;
      res = await this.downloadAndUploadSM(imgPath);
    } else {
      let curPath;
      if (path.isAbsolute(imgPath)) {
        curPath = imgPath;
      } else {
        const dirname = path.dirname(filePath);
        curPath = path.resolve(dirname, imgPath);
      }
      res = await this.readAndUploadSM(curPath);
    }
    return res;
  }
}
