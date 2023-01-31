import API, { IMetaWeblogOptions, ISMMSOptions } from "./api";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
export default class MarkdownBlogPushTool extends API {
  constructor(
    metaWeblogOptions: IMetaWeblogOptions,
    SMMSOptions?: ISMMSOptions
  ) {
    super(metaWeblogOptions, SMMSOptions);
  }

  /**
   * @description: 发布所有的文章
   * @param {*} dirPath md 文件路径
   * @param {*} replace 是否替换图片
   * @return {*}
   */
  async handleAllPushPost(dirPath: string, replace = false) {
    const files = await fs.readdir(dirPath);
    for (const fileName of files) {
      const filePath = path.resolve(dirPath, fileName);
      // dir 继续递归
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await this.handleAllPushPost(filePath, replace);
        continue;
      }
      if (filePath.indexOf(".md") === -1) continue;
      console.log("[********************************]");
      console.log("[fileName]", fileName);
      if (replace) {
        await this.replaceImgUrl(filePath);
      } else {
        await this.handlePushPost(filePath);
      }
    }
  }

  // 根据path修改或者新建文章
  async handlePushPost(filePath: string) {
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
    // @ts-ignore: Unreachable code error
    const str = grayMatterFile.stringify();
    await fs.writeFile(filePath, str);
    console.log("[回写成功]", fileName);
    // 等待 1分钟 后继续下一个
    await new Promise((r) => setTimeout(r, 3500, true));
  }

  // 替换 md 文件中的图片 url 地址
  async replaceImgUrl(filePath: string) {
    const fileName = path.basename(filePath);
    // 解析 md 文件
    const grayMatterFile = matter.read(filePath);
    const { data } = grayMatterFile;
    let { content } = grayMatterFile;
    if (!data || !data.title) return;
    const reg = /!\[.*\]\((.*)\)/g;
    const reg2 = /!\[.*\]\((.*)\)/;
    const imgUrls = content.match(reg);
    if (!imgUrls || !imgUrls.length) return content;
    for (const [index, imgUrl] of imgUrls.entries()) {
      const url = (imgUrl?.match(reg2) as Array<string>)[1];
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
      } catch (error: any) {
        console.log(`[替换失败 ${index + 1}]`, error.message);
      }
    }
    grayMatterFile.content = content;
    // @ts-ignore: Unreachable code error
    const str = grayMatterFile.stringify();
    await fs.writeFile(filePath, str);
    console.log("[回写成功]", fileName);
  }
  // 下载并上传图片
  async uploadImg(imgPath: string, filePath: string) {
    // 测试是否为 url
    const httpTest = /^http/;
    let res;
    // 网络图片
    if (httpTest.test(imgPath)) {
      const reg = new RegExp("https://bitbw.top/public/img/my_gallery/");
      if (!reg.test(imgPath)) return;
      res = this.downloadAndUploadSM(imgPath);
    } else {
      let curPath;
      if (path.isAbsolute(imgPath)) {
        curPath = imgPath;
      } else {
        const dirname = path.dirname(filePath);
        curPath = path.resolve(dirname, imgPath);
      }
      res = this.readAndUploadSM(curPath);
    }
    return res;
  }
}
