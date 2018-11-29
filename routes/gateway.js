import Erc20Gateway from "../lib/utils/Erc20Gateway";
import {
    routerHandle,
    configHandle,
    validation,
    tools
} from '../lib';
import {
    Aes,
    PrivateKey,
    PublicKey,
    ChainStore,
    AccountUtils,
    TransactionBuilder,
    TransactionHelper,
    Signature
} from "yoyowjs-lib";

routerHandle.get('/v1/erc20/bindAccount', null, (req, res) => {
    let uid = req.JParams.uid;
    if (!AccountUtils.validAccountUID(uid)) {
        tools.resultWrapper(res, `无效的uid:${uid}`, 2);
        return;
    }
    Erc20Gateway.bindETHtoUid(uid, (err, eth) => {
        if (err) {
            tools.resultWrapper(res, "" + err, 2);
        } else {
            if (!validation.isEmpty(eth)) {
                let activeKey = PrivateKey.fromWif(global.sysConf.registrar_key);
                let memoKey = PrivateKey.fromWif(global.sysConf.registrar_memo_key);
                let toUid = global.sysConf.erc20byuid;
                let registrar = global.sysConf.registrar;
                //验证注册商的有效性
                let checkReg = new Promise((resolve) => {
                    ChainStore.fetchAccountByUid(registrar).then(uObj => {
                        resolve((uObj.is_registrar && uObj.is_registrar === true));
                    });
                });
                //验证网关账号的有效性
                let checkTo = new Promise((resolve) => {
                    ChainStore.fetchAccountByUid(toUid).then(uObj => {
                        resolve({isuid: (uObj.uid && uObj.uid == toUid), pKey: uObj.memo_key});
                    });
                });
                Promise.all([checkReg, checkTo]).then(allResult => {
                    if (allResult[0] === false) {
                        tools.resultWrapper(res, '操作失败:' + registrar + "不是有效的注册商", 1);
                        return;
                    }

                    if (allResult[1].isuid === false) {
                        tools.resultWrapper(res, '操作失败:' + toUid + "在链上不存在", 1);
                        return;
                    }
                    let memoToKey = PublicKey.fromPublicKeyString(allResult[1].pKey);
                    let nonce = TransactionHelper.unique_nonce_uint64();
                    let asset = {amount: 1, asset_id: 0};
                    let tr = new TransactionBuilder();
                    let opData = tr.get_type_operation("transfer", {
                        from: registrar,
                        to: toUid,
                        amount: asset,
                        memo: {
                            from: memoKey.toPublicKey().toPublicKeyString(),
                            to: memoToKey.toPublicKeyString(),
                            nonce,
                            message: Aes.encrypt_with_checksum(
                                memoKey,
                                memoToKey,
                                nonce,
                                new Buffer(`erc20map#${uid}/${eth}`, 'utf-8')
                            )
                        },
                        extensions: {from_balance: asset, to_balance: asset}
                    });
                    console.log('ak:', activeKey.toPublicKey().toPublicKeyString());
                    console.log('mk:', memoKey.toPublicKey().toPublicKeyString());
                    console.log('tk:', memoToKey.toPublicKeyString());
                    tr.add_operation(opData);
                    tr.update_head_block().then(() => {
                        tr.set_required_fees(registrar, true, true).then(() => {
                            //TODO:暂时不能用memo签名
                            //tr.add_signer(memoKey, memoKey.toPublicKey().toPublicKeyString());
                            tr.add_signer(activeKey, activeKey.toPublicKey().toPublicKeyString());
                            //console.log('transfer:', tr.serialize())
                            tr.broadcast().then(res => {
                                console.log('transfer-res:', res);
                            });
                        });
                    });
                });
            }
            tools.resultWrapper(res, '操作成功', 0, eth);
        }
    })
    ;
})
;

routerHandle.get('/v1/erc20/getAddrByUid', null, (req, res) => {
    let uid = req.JParams.uid;
    if (!AccountUtils.validAccountUID(uid)) {
        tools.resultWrapper(res, `无效的uid:${uid}`, 2);
        return;
    }
    Erc20Gateway.getErc20Addr(uid, (err, infos) => {
        if (infos && infos.length > 0) {//指定的uid已经绑定过，直接返回eth地址
            tools.resultWrapper(res, '操作成功', 0, infos[0].eth);
        } else {
            tools.resultWrapper(res, `账号[${uid}]还未生成erc20的地址`, 1);
        }
    });
});

routerHandle.get('/v1/erc20/checkAddress', null, (req, res) => {
    let address = req.JParams.address;
    Erc20Gateway.checkErc20Addr(address, flag => {
        if(flag){
            tools.resultWrapper(res, '操作成功', 0);
        }else{
            tools.resultWrapper(res, '操作失败', 1);
        }
    });
});


module.exports = routerHandle.instance();