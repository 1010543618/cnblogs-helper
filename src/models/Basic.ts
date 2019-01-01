import config from "../config/config";
import { Bean } from '../beans';
import log from "../utils/log";

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
            let sql = `insert or replace into ${this.tablename} (${columns}) values (${dollerColumns})`;
            let promises = [];
            let statement = _db.prepare(`insert or replace into ${this.tablename} (${columns}) values (${dollerColumns})`);
            beans.forEach(d => {
                promises.push(new Promise((res, rej) => {
                    statement.run(d.cloneWithDollarPrefix(), err => {
                        if (err) {
                            log("error", [err, sql]);
                            rej(err);
                            return;
                        }
                        res(true);
                    })
                }));
            });

            Promise.all(promises).then(d => {
                let errs = d.filter(d => d !== true);
                if (errs.length > 0) {
                    log("error", [errs, sql]);
                    rej(errs)
                } else {
                    res(true)
                }
            });
        });
    }

    edit(bean: T, where: Array<string | object>): Promise < boolean > {
        if (!where) {
            throw new Error("未设置修改条件！");
        }
        bean = bean.removeEmpty();
        let dollerBean = Object.assign(bean.cloneWithDollarPrefix(), where[1]);
        let columns = Object.keys(bean)
            .map(d => `${d} = $${d}`).join(",");
        let _db = this.db;
        return new Promise((res, rej) => {
            let sql = `update ${this.tablename} set ${columns} where ${where[0]}`;
            try {
                _db.run(sql, dollerBean, err => {
                    if (err) {
                        log("error", [err, sql]);
                        rej(err);
                        return;
                    }
                    res(true);
                })
            } catch (error) {
                log("error", [error, sql]);
                rej(error);
            }
        });
    }

    get(where: Array<string | object>): Promise < Array < T > > {
        var _db = this.db;
        return new Promise((res, rej) => {
            let sql = `select * from ${this.tablename} where ${where[0]}`;
            try {
                let beans = [];
                _db.each(sql, where[1], (err, row) => {
                    if (err) { rej(err); return; }
                    beans.push(new this.bean(row));
                }, (err) => {
                    if (err) {
                        log("error", [err, sql]);
                        rej(err);
                        return;
                    }
                    res(beans);
                });
            } catch (error) {
                log("error", [error, sql]);
                rej(error);
            }
        });
    }
}