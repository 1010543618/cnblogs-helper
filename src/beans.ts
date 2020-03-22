var pangu = require("pangu");

export class Bean {
  constructor(obj?: any) {
    Object.assign(this, obj);
  }

  cloneWithDollarPrefix() {
    let obj = Object.assign(Object.create(this.constructor.prototype), this);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj["$" + key] = obj[key];
        delete obj[key];
      }
    }
    return obj;
  }

  removeEmpty() {
    let obj = Object.assign(Object.create(this.constructor.prototype), this);
    for (const key in obj) {
      !obj[key] && delete obj[key];
    }
    return obj;
  }
}
export class UserBean extends Bean {
  user: string;
  pwd: string;
  appKey: string;
  isCurrent: number;

  constructor(obj?: any) {
    super(obj);
    this.user = this.user || "";
    this.pwd = this.pwd || "";
    this.appKey = this.appKey || "";
    this.isCurrent = this.isCurrent || 0;
  }
}
export class BlogInfoBean extends Bean {
  blogid: string;
  url: string;
  blogName: string;
  blogUser: string;
  isCurrent: number;

  constructor(obj?: any) {
    super(obj);
    this.blogid = this.blogid || "";
    this.url = this.url || "";
    this.blogName = this.blogName || "";
    this.blogUser = this.blogUser || "";
    this.isCurrent = this.isCurrent || 0;
  }
}
export class PostBean extends Bean {
  dateCreated: number;
  description: string;
  title: string;
  categories: string | Array<string>;
  enclosure: string;
  link: string;
  permalink: string;
  postid: string;
  source: string;
  userid: string;
  mt_allow_comments: string;
  mt_allow_pings: string;
  mt_convert_breaks: string;
  mt_excerpt: string;
  mt_keywords: string;
  wp_slug: string;
  p_state: string;
  constructor(obj?: any) {
    super(obj);
    this.dateCreated = this.dateCreated || 0;
    this.description = this.description || "";
    this.title = this.title || "";
    this.enclosure = this.enclosure || "";
    this.link = this.link || "";
    this.permalink = this.permalink || "";
    this.postid = this.postid || "";
    this.source = this.source || "";
    this.userid = this.userid || "";
    this.mt_allow_comments = this.mt_allow_comments || "";
    this.mt_allow_pings = this.mt_allow_pings || "";
    this.mt_convert_breaks = this.mt_convert_breaks || "";
    this.mt_excerpt = this.mt_excerpt || "";
    this.mt_keywords = this.mt_keywords || "";
    this.wp_slug = this.wp_slug || "";
    this.p_state = this.p_state || "";

    if (this.categories) {
      if (
        Object.prototype.toString.call(this.categories) === "[object Array]"
      ) {
        this.categories = JSON.stringify(this.categories);
      }
    } else {
      this.categories = "[]";
    }
  }
  getCBParas() {
    let obj = Object.assign(Object.create(this.constructor.prototype), this);
    obj.dateCreated && delete obj.dateCreated;
    obj.description || (obj.description = "null");
    obj.categories = JSON.parse(obj.categories);
    return obj;
  }

  removeEmpty() {
    let obj = Object.assign(Object.create(this.constructor.prototype), this);
    obj.categories === "[]" && delete obj.categories;
    for (const key in obj) {
      !obj[key] && delete obj[key];
    }
    return obj;
  }
}
export class CategoryInfoBean extends Bean {
  description: string;
  htmlUrl: string;
  rssUrl: string;
  title: string;
  categoryid: string;

  constructor(obj?: any) {
    super(obj);
    this.description = this.description || "";
    this.htmlUrl = this.htmlUrl || "";
    this.rssUrl = this.rssUrl || "";
    this.title = this.title || "";
    this.categoryid = this.categoryid || "";
  }
}
export class FileDataBean extends Bean {
  bits: string;
  name: string;
  type: string;

  constructor(obj?: any) {
    super(obj);
    this.bits = this.bits || "";
    this.name = this.name || "";
    this.type = this.type || "";
  }
}
export class UrlDataBean extends Bean {
  url: string;
  constructor(obj?: any) {
    super(obj);
    this.url = this.url || "";
  }
}
export class WpCategoryBean extends Bean {
  name: string;
  slug: string;
  parent_id: number;
  description: string;

  constructor(obj?: any) {
    super(obj);
    this.name = this.name || "";
    this.slug = this.slug || "";
    this.parent_id = this.parent_id || 0;
    this.description = this.description || "";
  }
}
export class EnclosureBean extends Bean {
  length: number;
  type: string;
  url: string;

  constructor(obj?: any) {
    super(obj);
    this.length = this.length || 0;
    this.type = this.type || "";
    this.url = this.url || "";
  }
}
export class SourceBean extends Bean {
  name: string;
  url: string;
  constructor(obj?: any) {
    super(obj);
    this.name = this.name || "";
    this.url = this.url || "";
  }
}
