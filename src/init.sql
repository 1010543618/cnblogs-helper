CREATE TABLE IF NOT EXISTS User (
  user TEXT,
  pwd TEXT,
  appKey TEXT,
  isCurrent INTEGER, -- 0 or 1
  PRIMARY KEY(user)
);
CREATE TABLE IF NOT EXISTS BlogInfo (
  blogid TEXT,
  url TEXT,
  blogName TEXT,
  blogUser TEXT,
  FOREIGN KEY(blogUser) REFERENCES User(user)
);
CREATE TABLE IF NOT EXISTS Post (
  dateCreated NUMERIC,
  description TEXT,
  title TEXT,
  categories TEXT, -- array of string
  enclosure TEXT, -- struct Enclosure
  link TEXT,
  permalink TEXT,
  postid TEXT,
  source TEXT,-- struct Source
  userid TEXT,
  mt_allow_comments TEXT,
  mt_allow_pings TEXT,
  mt_convert_breaks TEXT,
  mt_text_more TEXT,
  mt_excerpt TEXT,
  mt_keywords TEXT,
  wp_slug TEXT
);
CREATE TABLE IF NOT EXISTS CategoryInfo (
  description TEXT,
  htmlUrl TEXT,
  rssUrl TEXT,
  title TEXT,
  categoryid TEXT
);
CREATE TABLE IF NOT EXISTS FileData (
  bits BLOB,
  name TEXT,
  type TEXT
);
CREATE TABLE IF NOT EXISTS UrlData (
  url TEXT
);
CREATE TABLE IF NOT EXISTS WpCategory (
  name TEXT,
  slug TEXT,
  parent_id INTEGER,
  description TEXT
);
CREATE TABLE IF NOT EXISTS Enclosure (
  length INTEGER,
  type TEXT,
  url TEXT
);
CREATE TABLE IF NOT EXISTS Source (
  name TEXT,
  url TEXT
);