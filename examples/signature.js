import {aes, Signature, PrivateKey, PublicKey} from "yoyowjs-lib";


var oPkey = PublicKey.fromPublicKeyString("YYW7HF1trYvJXMBghC43E2WYPX8BaGjPLfUUtb1rEjanb2nfXfy3z", "YYW");
var oKey = PrivateKey.fromWif("5JnREgu9VGDXoipvR3TcMSZQe3AJ9D7krv9MNt2aSvgCFqk19cL");
let sendObj={
    "platform": 247731382,
    "time": (new Date()).getTime()
}

var strObj = JSON.stringify(sendObj);

var signed = Signature.signBuffer(new Buffer(strObj), oKey);

sendObj.checksum = signed.toHex();
console.log(sendObj);

var verify = Signature.fromHex(sendObj.checksum).verifyBuffer(new Buffer(strObj), oPkey);
console.log(verify);