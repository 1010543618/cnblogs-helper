import config from "../config/config";
import { Bean } from '../beans';

const path = require("path");
export default class Basic < T extends Bean > {
    public client: any;
    public db: any;
    protected tablename: string;
    protected bean = Bean;

    constructor() {
        const xmlrpc = require('xmlrpc');
        const sqlite3 = require('sqlite3').verbose();
        this.client = xmlrpc.createSecureClient(config.MetaWeblogURL);
        this.db = new sqlite3.Database(path.resolve(config.userDataPath, config.dataFolder, config.dbName));
    }

    add(beans: Array < T > ): Promise < boolean > {
        var dollerBean = beans[0].cloneWithDollarPrefix();
        var columns = Object.keys(beans[0]).join(",");
        var dollerColumns = Object.keys(dollerBean).join(",");
        var _db = this.db;
        return new Promise((res, rej) => {
            let promises = [];
            let statement = _db.prepare(`insert into ${this.tablename} (${columns}) values (${dollerColumns})`);
            beans.forEach(d => {
                promises.push(new Promise((res, rej) => {
                    statement.run(d.cloneWithDollarPrefix(), err => {
                        if (err) { rej(err); return; }
                        res(true);
                    })
                }));
            });

            Promise.all(promises).then(d => {
                let errs = d.filter(d => d !== true);
                errs.length > 0 ? rej(errs) : res(true);
            });
        });
    }

    edit(bean: T, where: String): Promise < boolean > {
        if (!where) {
            throw new Error("未设置修改条件！");
        }
        bean = bean.removeEmpty();
        let dollerBean = bean.cloneWithDollarPrefix();
        let columns = Object.keys(bean)
            .map(d => `${d} = $${d}`).join(",");
        let _db = this.db;
        return new Promise((res, rej) => {
            try {
                _db.run(`update ${this.tablename} set ${columns} where ${where}`, dollerBean, err => {
                    if (err) { rej(err); return; }
                    res(true);
                })
            } catch (error) {
                rej(error);
            }
        });
    }

    get(where: String): Promise < Array < T > > {
        var _db = this.db;
        return new Promise((res, rej) => {
            try {
                let beans = [];
                _db.each(`select * from ${this.tablename} where ${where}`, (err, row) => {
                    if (err) { rej(err); return; }
                    beans.push(new this.bean(row));
                }, (err) => {
                    if (err) { rej(err); return; }
                    res(beans);
                });
            } catch (error) {
                rej(error);
            }
        });
    }
}