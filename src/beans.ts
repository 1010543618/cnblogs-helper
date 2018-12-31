var pangu = require('pangu');

export class Bean {
    constructor(obj ? : Bean) {
        Object.assign(this, obj);
    }

    cloneWithDollarPrefix() {
        let obj = Object.assign(Object.create(this.constructor.prototype), this);
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj["$" + key] = obj[key]
                delete(obj[key]);
            }
        }
        return obj;
    }

    removeEmpty() {
        let obj = Object.assign(Object.create(this.constructor.prototype), this);
        for (const key in obj) {
            !obj[key] && delete(obj[key]);
        }
        return obj;
    }
}
export class UserBean extends Bean {
    user: string = this.user || "";
    pwd: string = this.pwd || "";
    appKey: string = this.appKey || "";
    isCurrent: number = this.isCurrent || 0;
};
export class BlogInfoBean extends Bean {
    blogid: string = this.blogid || "";
    url: string = this.url || "";
    blogName: string = this.blogName || "";
    blogUser: string = this.blogUser || "";
    isCurrent: number = this.isCurrent || 0;
};
export class PostBean extends Bean {
    dateCreated: number = this.dateCreated || 0;
    description: string = this.description || "";
    title: string = this.title || "";
    titlePangu: string = pangu.spacing(this.title);
    categories: string | Array < string > = Object.prototype.toString.call(this.categories) === '[object Array]' ?
        JSON.stringify(this.categories) : this.categories || "[]";
    enclosure: string = this.enclosure || "";
    link: string = this.link || "";
    permalink: string = this.permalink || "";
    postid: string = this.postid || "";
    source: string = this.source || "";
    userid: string = this.userid || "";
    mt_allow_comments: string = this.mt_allow_comments || "";
    mt_allow_pings: string = this.mt_allow_pings || "";
    mt_convert_breaks: string = this.mt_convert_breaks || "";
    mt_excerpt: string = this.mt_excerpt || "";
    mt_keywords: string = this.mt_keywords || "";
    wp_slug: string = this.wp_slug || "";
    addtype: string = this.addtype || "";

    getCBParas() {
        let obj = Object.assign(Object.create(this.constructor.prototype), this);
        obj.dateCreated && delete(obj.dateCreated);
        obj.categories = JSON.parse(obj.categories);
        return obj;
    }
};
export class CategoryInfoBean extends Bean {
    description: string = this.description || "";
    htmlUrl: string = this.htmlUrl || "";
    rssUrl: string = this.rssUrl || "";
    title: string = this.title || "";
    categoryid: string = this.categoryid || ""
};
export class FileDataBean extends Bean {
    bits: string = this.bits || "";
    name: string = this.name || "";
    type: string = this.type || ""
};
export class UrlDataBean extends Bean {
    url: string = this.url || ""
};
export class WpCategoryBean extends Bean {
    name: string = this.name || "";
    slug: string = this.slug || "";
    parent_id: number = this.parent_id || 0;
    description: string = this.description || ""
};
export class EnclosureBean extends Bean {
    length: number = this.length || 0;
    type: string = this.type || "";
    url: string = this.url || ""
};
export class SourceBean extends Bean {
    name: string = this.name || "";
    url: string = this.url || ""
};