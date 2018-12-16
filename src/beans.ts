export class UserBean {
    user: string;
    pwd: string;
    appKey: string;
    isCurrent: number;
};
export class BlogInfoBean {
    blogid: string;
    url: string;
    blogName: string;
    blogUser: string;
};
export class PostBean {
    dateCreated: number;
    description: string;
    title: string;
    categories: string;
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
    wp_slug: string
};
export class CategoryInfoBean {
    description: string;
    htmlUrl: string;
    rssUrl: string;
    title: string;
    categoryid: string
};
export class FileDataBean {
    bits: string;
    name: string;
    type: string
};
export class UrlDataBean {
    url: string
};
export class WpCategoryBean {
    name: string;
    slug: string;
    parent_id: number;
    description: string
};
export class EnclosureBean {
    length: number;
    type: string;
    url: string
};
export class SourceBean {
    name: string;
    url: string
};