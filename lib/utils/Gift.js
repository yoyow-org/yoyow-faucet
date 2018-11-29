import {Apis} from "yoyowjs-ws";
import {TransactionBuilder, PrivateKey} from "yoyowjs-lib";

class Gift {
    constructor() {

    }

    /**
     * 按配置执行赠送yoyo
     * @param uid
     */
    doGiftYoyo(uid) {
        let yoyo = global.sysConf.giftYoyo;
        if (yoyo == null || yoyo < 1) return;
        yoyo = Number(yoyo) * 100000;//处理精度
        let from = global.sysConf.registrar;
        let nPKey = PrivateKey.fromWif(global.sysConf.registrar_key);
        let asset = {amount: yoyo, asset_id: 0};
        let tr = new TransactionBuilder();
        let tr_op = tr.get_type_operation("transfer", {
            from: from,
            to: uid,
            amount: asset,
            extensions: {
                from_balance: asset,
                to_balance: asset
            }
        });
        tr.update_head_block().then(() => {
            tr.add_operation(tr_op);
            tr.set_required_fees(from,true,true).then(()=>{
                let pPKeyStr = nPKey.toPublicKey().toPublicKeyString();
                tr.add_signer(nPKey, pPKeyStr);
                tr.broadcast();
            });
        });
    }

    /**
     * 赠送积分
     */
    doGiftCsaf(uid) {
        this.__collectCsaf(uid);
        this.__checkCsafBalance();
    }

    __collectCsaf(uid, amount = global.sysConf.giftCsaf) {
        return new Promise((resolve, reject) => {
            Apis.instance().db_api().exec("get_objects", [["2.1.0"]]).then(res => {
                let from = global.sysConf.registrar;
                let timesec = Math.max((new Date(res[0].time).getTime() / 1000), (Date.now() / 1000));
                if (amount == null || amount < 1) {
                    return;
                }
                let nPKey = PrivateKey.fromWif(global.sysConf.registrar_key);
                let op_data = {
                    from: global.sysConf.registrar,
                    to: uid,
                    amount: {amount: parseInt(amount * 100000), asset_id: 0},
                    time: timesec - (timesec % 60)
                };
                let tr = new TransactionBuilder();
                tr.add_type_operation('csaf_collect', op_data);
                tr.set_required_fees(from, true, true).then(() => {
                    tr.add_signer(nPKey);
                    tr.broadcast();
                });
            });
        })
    }

    __checkCsafBalance(){
        return new Promise((resolve, reject) => {
            let uid = global.sysConf.registrar;
            Apis.instance().db_api().exec("get_full_accounts_by_uid", [[uid], {fetch_statistics: true}])
            .then(res => {
                console.log('账号 '+uid);
                console.log('剩余积分 '+res[0][1].statistics.csaf);
                if(res.length > 0 && res[0][1].statistics.csaf < 50000000){
                    return this.__collectCsaf(uid, 100);
                }
            });
        })
    }
}

export default new Gift();