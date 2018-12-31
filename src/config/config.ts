export default {
    // 危险区：您可能不需要使用这些选项，除非您知道自己在做什么!
    userDataPath: process.env.APPDATA ||
        (process.platform == 'darwin' ?
            process.env.HOME + 'Library/Preferences' :
            '/var/local'),// 用户数据文件夹（待仔细测试）
    dataFolder: "cnblogsHelper", // 数据存放的文件夹名
    dbName: "cnblogs.db", // 数据库名

    MetaWeblogURL: "https://rpc.cnblogs.com/metaweblog/jffun-blog",
}