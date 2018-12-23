import config from "../config/config";
import { Bean } from '../beans';

const path = require("path");
export default class Basic {
    public client: any;
    public db: any;
    protected tablename: string;
    constructor() {
        const xmlrpc = require('xmlrpc');
        const sqlite3 = require('sqlite3').verbose();
        this.client = xmlrpc.createClient(config.MetaWeblogURL);
        this.db = new sqlite3.Database(path.resolve(config.userDataPath, config.dataFolder, config.dbName));
    }
    add(beans: Array < Bean > ): Promise < boolean > {
        var dollerBean = beans[0].cloneWithDollarPrefix();
        var columns = Object.keys(beans[0]).join(",");
        var dollerColumns = Object.keys(dollerBean).join(",");
        var _db = this.db;
        return new Promise((res, rej) => {
            try {
                _db.serialize(() => {
                    let statement = _db.prepare(`insert into ${this.tablename} (${columns}) values (${dollerColumns})`);
                    beans.forEach(d => {
                        statement.run(d.cloneWithDollarPrefix(), err => {
                            if (err) { rej(err); return; }
                        })
                    })
                    statement.finalize(() => res(true));
                })
            } catch (error) {
                rej(error);
            }
        });
    }
}