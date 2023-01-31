import { HTTP } from "./axios";
import FormData from "form-data";
import fs, { ReadStream } from "fs";
import MetaWeblog from "metaweblog-api";

export interface ISMMSRes {
  code: string;
  images?: any[];
  data?: { url: string };
}
export interface IMetaWeblogOptions {
  apiUrl: string;
  username: string;
  password: string;
  blogid?: string;
  appKey?: string;
  numberOfPosts?: number;
}
export interface ISMMSOptions {
  Authorization: string;
}

export default class API {
  metaWeblog;
  username;
  password;
  appKey;
  blogid;
  numberOfPosts;
  Authorization;
  constructor(
    metaWeblogOptions: IMetaWeblogOptions,
    SMMSOptions?: ISMMSOptions
  ) {
    //  check metaWeblogOptions
    if (typeof metaWeblogOptions !== "object") {
      throw new Error("metaWeblogOptions must be an object");
    }
    const { apiUrl, username, password, appKey, numberOfPosts, blogid } =
      metaWeblogOptions;
    if (!apiUrl || !username || !password) {
      throw new Error("apiUrl,username,password must be required");
    }
    //  init metaWeblog and params
    this.metaWeblog = new MetaWeblog(metaWeblogOptions.apiUrl);
    this.username = username;
    this.password = password;
    this.appKey = appKey || "";
    this.blogid = blogid || "";
    this.numberOfPosts = numberOfPosts || 1;
    if (SMMSOptions) {
      this.Authorization = SMMSOptions.Authorization || "";
    }
  }
  /**
   * @description:   upload image to smms
   * @param {ReadStream} stream
   * @return {*}
   */
  async uploadSM(stream: ReadStream) {
    const formdata = new FormData();
    formdata.append("smfile", stream);
    const res: ISMMSRes = await HTTP.uploadFile(
      "https://smms.app/api/v2/upload",
      formdata,
      {
        headers: { Authorization: this.Authorization },
      }
    );
    if (res && res.code === "image_repeated") {
      return res.images;
    }
    if (!res.data) return res;
    return res.data.url;
  }
  /**
   * @description:  download image from url and upload to smms
   * @param {string} url
   * @return {*}
   */
  async downloadAndUploadSM(url: string) {
    const stream: ReadStream = await HTTP.get(encodeURI(decodeURI(url)), {
      responseType: "stream",
    });
    return this.uploadSM(stream);
  }
  /**
   * @description:  read image from local and upload to smms
   * @param {string} path
   * @return {*}
   */
  async readAndUploadSM(path: string) {
    const stream: ReadStream = fs.createReadStream(path);
    return this.uploadSM(stream);
  }
  getUsersBlogs() {
    return this.metaWeblog.getUsersBlogs(
      this.appKey,
      this.username,
      this.password
    );
  }
  getRecentPosts() {
    return this.metaWeblog.getRecentPosts(
      this.blogid,
      this.username,
      this.password,
      this.numberOfPosts
    );
  }

  getCategories() {
    return this.metaWeblog.getCategories(
      this.blogid,
      this.username,
      this.password
    );
  }
  getPost(postid: string) {
    return this.metaWeblog.getPost(postid, this.username, this.password);
  }
  newPost(post: MetaWeblog.Post, publish: boolean) {
    return this.metaWeblog.newPost(
      this.blogid,
      this.username,
      this.password,
      post,
      publish
    );
  }

  editPost(postid: string, post: MetaWeblog.Post, publish: boolean) {
    return this.metaWeblog.editPost(
      postid,
      this.username,
      this.password,
      post,
      publish
    );
  }
  deletePost(postid: string, publish: boolean) {
    return this.metaWeblog.deletePost(
      this.appKey,
      postid,
      this.username,
      this.password,
      publish
    );
  }
}
