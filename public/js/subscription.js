// test 公開鍵
//Payjp.setPublicKey("pk_test_9fd0175be5f918882aa96643");
//payjpじゃなくて、ストライプのほうが連携機能が優れているのか？

//正常な申請の時に呼び出される関数
function onCreated(res){
    console.log("成功プラン", res);
}

//error の時に実行される関数
function onFailed(res, error){
    console.log("失敗しましたよプラン", res, error);
}