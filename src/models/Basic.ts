import config from "../config";

const path = require("path");
export class Basic {
    public client: any;
    public db: any;
    constructor() {
        const xmlrpc = require('xmlrpc');
        const sqlite3 = require('sqlite3').verbose();
        this.client = xmlrpc.createClient(config.MetaWeblogURL);
        this.db = new sqlite3.Database(path.resolve(config.userDataPath, config.dataFolder, config.dbName));
    }
}