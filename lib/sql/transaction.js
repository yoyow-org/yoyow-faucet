/**
 * Created by BenJ on 2017/9/12.
 */
import dbHandle from '../utils/dbHandle';
import queues from 'mysql-queues';

class Transaction {
    constructor(){ }

    init(){
        return new Promise((resolve, reject) => {
            this.transaction = null;
            this.errCount = 0;
            this.queryCount = 0;
            this.queryLen = 0;
            this.callback = null;
            dbHandle.getConnection(conn => {
                if(conn != null){
                    queues(conn);
                    this.transaction = conn.startTransaction();
                    resolve(this);
                }
            });
        });
    }

    __queryResult(err){
        this.queryCount ++;
        if(err) this.errCount ++;
        if(this.queryCount == this.queryLen) {
            if (this.errCount == 0) {
                this.transaction.commit();
                this.callback(null);
            }else{
                this.transaction.rollback();
                console.log("queryResult:",err);
                this.callback({code: -1, message: '数据操作异常'});
            }
        }
    }

    /**
     * 处理事务
     * @param queries 执行数组 仅适用sql/base 中的 sqlParamsEntity对象
     * @param callback 回调，第一个参数为err，若为null则视为处理完成
     */
    exec(queries, callback){
        this.queryLen = queries.length;
        this.callback = callback;
        if(this.transaction == null){
            callback({code: -1, message: '事务初始化失败'});
            return;
        }
        try{
            for(let i=0; i<queries.length; i++){
                let query = queries[i];
                this.transaction.query(query.sql, query.params, this.__queryResult.bind(this));
            }
            this.transaction.execute();
        }catch (err){
            callback({code: -1, message: err.message});
        }
    }

}

module.exports = Transaction;