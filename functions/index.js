const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//const firebase = require('firebase');
//firebase.firestore.FieldValue.increment(-1)

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
//コミュニティから抜けるときのイベント
//auther
exports.deleteAuther = functions.firestore.document('communities/{communityID}/auther/{authID}').onDelete((snap, context) => {
    // perform desired operations ...
    db.collection("communities").doc(context.params.communityID).update({
        member: admin.firestore.FieldValue.arrayRemove(context.params.authID),
        number: admin.firestore.FieldValue.increment(-1)
    }).then(function(){
        db.collection("users").doc(context.params.authID).update({
            auth: admin.firestore.FieldValue.arrayRemove(context.params.communityID)
        });
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});
//joiner
exports.deleteJoiner = functions.firestore.document('communities/{communityID}/joiner/{joinID}').onDelete((snap, context) => {
    // perform desired operations ...
    db.collection("communities").doc(context.params.communityID).update({
        member: admin.firestore.FieldValue.arrayRemove(context.params.joinID),
        number: admin.firestore.FieldValue.increment(-1)
    }).then(function(){
        db.collection("users").doc(context.params.joinID).update({
            join: admin.firestore.FieldValue.arrayRemove(context.params.communityID)
        });
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});
//modeler
exports.deleteModeler = functions.firestore.document('communities/{communityID}/modeler/{modelID}').onDelete((snap, context) => {
    // perform desired operations ...
    db.collection("communities").doc(context.params.communityID).update({
        member: admin.firestore.FieldValue.arrayRemove(context.params.modelID),
        number: admin.firestore.FieldValue.increment(-1)
    }).then(function(){
        db.collection("users").doc(context.params.modelID).update({
            model: admin.firestore.FieldValue.arrayRemove(context.params.communityID)
        });
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});

/*コミュニティを作る時のイベント はクライアントサイドでやるからやはり遠慮
exports.cleateCommunity = functions.firestore.document('communities/{communityID}').onCreate((snap, context) => {
    db.collection("communities").doc(request).set()
})*/

//コミュニティに参加申請したときの処理
exports.createPermission = functions.firestore.document('communities/{communityID}/permissions/{permissionID}').onCreate((snap, context) => {
    //管理者若しくはモデラーが一人でもいる時とそれ以外の二つに分岐する
    db.collection("communities").doc(context.params.communityID).collection("auther").limit(1).get().then(snapshot => {
        if (snapshot.empty) {
            db.collection("communities").doc(context.params.communityID).collection("modeler").limit(1).get().then(snapshot =>{
                if(snapshot.empty) {
                    //管理者とモデラーがどっちもいないときの処理
                    console.log("No matching documents.", "管理者、モデラーともに不在です");
                    //参加申請を削除して
                    db.collection("communities").doc(context.params.communityID).collection("permissions").doc(context.params.permissionID).delete();
                }else{
                    console.log('No matching documents.', '管理者が不在です(モデラーはいる)');
                    //管理者のリクエストの場合に申請を消す
                    if(snap.type == "auth"){
                        db.collection("communities").doc(context.params.communityID).collection("permissions").doc(context.params.permissionID).delete();
                    }else{
                        console.log("モデラーに処理してもらおう");
                    }
                }
            })
        }else{
            //管理者もしくはモデラーがいるときの処理
            console.log("申請が承諾されるまで少々お待ちください");
            return 0;
        }
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});
//permission が削除された時の処理 要は申請が受理された体の関数
exports.deletePermission = functions.firestore.document('communities/{communityID}/permissions/{permissionID}').onDelete((snap, context) => {
    if(snap.data().reject){
        //拒否された時の処理
        console.log("permission is rejected");
    }else{
        //申請の種類によって分岐
        if(snap.data().type == "join"){
            //join申請なのでメンバーに入れる
            db.collection("communities").doc(context.params.communityID).collection("joiner").doc(context.params.permissionID).set(
                snap.data()
            ).then(function(){
                console.log("コミュニティに参加しました");
                //modelから削除
                db.collection("communities").doc(context.params.communityID).collection("modeler").doc(context.params.permissionID).delete();
                //authから削除
                db.collection("communities").doc(context.params.communityID).collection("auther").doc(context.params.permissionID).delete();
                return 0;
            })
        }else if(snap.data().type == "model"){
            //model申請なのでモデルにする
            db.collection("communities").doc(context.params.communityID).collection("modeler").doc(context.params.permissionID).set(
                snap.data()
            ).then(function(){
                console.log("モデラーになりました");
                //joinから削除
                db.collection("communities").doc(context.params.communityID).collection("joiner").doc(context.params.permissionID).delete();
                //authから削除
                db.collection("communities").doc(context.params.communityID).collection("auther").doc(context.params.permissionID).delete();
                return 0;
            })
        }else if(snap.data().type == "auth"){
            //auth申請なのでモデルにする
            db.collection("communities").doc(context.params.communityID).collection("auther").doc(context.params.permissionID).set(
                snap.data()
            ).then(function(){
                console.log("管理者になりました");
                //joinから削除
                db.collection("communities").doc(context.params.communityID).collection("joiner").doc(context.params.permissionID).delete();
                //modelから削除
                db.collection("communities").doc(context.params.communityID).collection("modeler").doc(context.params.permissionID).delete();
                return 0;
            })
        }else if(snap.data().type == "what"){
            //what申請なのでどうしよう？
            console.log("what?");
            return 0;
        }else{
            console.log("what_what_?");
            return 0;
        }
    }
    return 0;
})


//コミュニティのメンバーになったときの処理
exports.createJoiner = functions.firestore.document('communities/{communityID}/joiner/{joinID}').onCreate((snap, context) => {
    db.collection("communities").doc(context.params.communityID).update({
        member: admin.firestore.FieldValue.arrayUnion(context.params.joinID),
        number: admin.firestore.FieldValue.increment(1)
    }).then(function(){
        //ユーザの情報も書き換える
        db.collection("users").doc(context.params.joinID).update({
            join: admin.firestore.FieldValue.arrayUnion(context.params.communityID)
        })
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});
//コミュニティのモデラーになったときの処理
exports.createModeler = functions.firestore.document('communities/{communityID}/modeler/{modelID}').onCreate((snap, context) => {
    db.collection("communities").doc(context.params.communityID).update({
        member: admin.firestore.FieldValue.arrayUnion(context.params.modelID),
        number: admin.firestore.FieldValue.increment(1)
    }).then(function(){
        //ユーザの情報も書き換える
        db.collection("users").doc(context.params.modelID).update({
            model: admin.firestore.FieldValue.arrayUnion(context.params.communityID)
        });
    }).catch(function(error){
        console.log("error", error);
    });
    return 0;
});
//コミュニティの管理者になったときの処理
exports.createAuther = functions.firestore.document('communities/{communityID}/auther/{authID}').onCreate((snap, context) => {
    //コミュニティを作った人かそれ以外かを分岐をする 理由は、コミュニティ作る時にも書き換えが発生するのだが、そっちの処理と分けたいから
    if(snap.data().creater){
        //コミュニティを作った人の処理
        //何もしない
        return 0;
    }else{
        //それ以外の処理
        db.collection("communities").doc(context.params.communityID).update({    
            member: admin.firestore.FieldValue.arrayUnion(context.params.authID),
            number: admin.firestore.FieldValue.increment(1)
        }).then(function(){
            //ユーザの情報も書き換える
            db.collection("users").doc(context.params.authID).update({
                auth: admin.firestore.FieldValue.arrayUnion(context.params.communityID)
            }).catch(function(error){
                console.log("error", error);
            });
        }).catch(function(error){
            console.log("error", error);
        });
    }
    return 0;
});

//管理者に関する関数の定義
exports.addAdminClaim = functions.firestore.document('admin_users/{docID}').onCreate((snap) => {
    const newAdminUser = snap.data();
    if (newAdminUser === undefined) return;
    modifyAdmin(newAdminUser.uid, true);
    return 0;
});

exports.removeAdminClaim = functions.firestore.document('admin_users/{docID}').onDelete((snap) => {
    const deletedAdminUser = snap.data();
    if (deletedAdminUser === undefined) return;
    modifyAdmin(deletedAdminUser.uid, false);
    return 0;
});

function modifyAdmin (uid , isAdmin ) {
    admin.auth().setCustomUserClaims(uid, {admin: isAdmin}).then(() => {
    // The new custom claims will propagate to the user's ID token the
    // next time a new one is issued.
    return 0;
});
}

//ジョブ作成で、レベルの情報をその下の階層で作成する
exports.createJob = functions.firestore.document('users/{userID}/jobs/{jobID}').onCreate((snap, context) => {
    var now_time = new Date();
    db.collection("users").doc(context.params.userID).collection("jobs").doc(context.params.jobID).collection("levinfo").doc(context.params.jobID).set({
        level: 1,
        user_id: snap.data().uid,
        job_name: snap.data().name,
        user_image: snap.data().img,
        total_time: 0,
        level_time: 0,
        today_time: 0,
        month_time: 0,
        timestamp: now_time
    });
    return 0;
});
//ジョブの名前変更で稼働する関数 画像変更の未来も考えてそっちも可能にはしておく2019/12/26
exports.updateJob = functions.firestore.document('users/{userID}/jobs/{jobID}').onUpdate((change, context) => {
    var newValue = change.after.data();
    var result = {};
    //ジョブを作成する過程で原因不明のエラーを感知2020/02/05
    if(newValue.name){
        //名前変更の時
        result.job_name = newValue.name;
        //メインを変更した時の処理をのちに分岐して作成するかも2019/12/27
        db.collection("users").doc(context.params.userID).collection("jobs").doc(context.params.jobID).collection("levinfo").doc(context.params.jobID).update(
            result
        );
    }
    //メインジョブを切り替える時に余計なデータべース記録をしないようにする
    //それでもcloudfunctionは呼び出されてしまうから、それに関する料金的な対策を講じることはできないだろうか？
    return 0;
});


//ワーク作成で動く関数 レベルの上下や経験値、タイムスタンプ等を判別して処理
exports.createWork = functions.firestore.document('users/{userID}/jobs/{jobID}/works/{workID}').onCreate((snap, context) => {
    //limitに書き加える
    db.collection("users").doc(context.params.userID).collection("limits").doc("day").update({
        work: admin.firestore.FieldValue.increment(1),
    });
    //基本の時間
    var time = snap.data().time;
    //ユーザのレベルの情報を取得して判断する
    db.collection("users").doc(context.params.userID).collection("jobs").doc(context.params.jobID).collection("levinfo").doc(context.params.jobID).get().then(function(doc){
        var level_info = doc.data();
        //month_timeの追加実装 2019/12/12
        var month_time = level_info.month_time + time;
        //ランキングで画像を表示するために画像の仕組みを追加実装 2019/12/13
        /*update関数なので記述が不要と判明 2019/12/15
        var user_image = level_info.user_image;
        var job_name = level_info.job_name;//こっちも同上で追加実装
        */
        //差し引かれる前の残りの値
        var level_needed = level_exp_needed(level_info.level) - level_info.level_time;
        //取得した経験値との差を求める
        var the_diff = time - level_needed;
        //レベルの上がった数を計測する変数
        var level_result = 0;
        while (the_diff >= 0){
            //上がるレベルをカウントする
            level_result ++;
            //上がったレベルの経験値を取得して評価する +level_result以降を調整のために書き足し2019/12/28
            level_needed = level_exp_needed(level_info.level + level_result);
            the_diff = the_diff - level_needed;
        }
        //差が負の値になったら、diffを一つ前に戻してその値を経験値のプラス値にする
        the_diff = the_diff + level_needed;
        //statusを決める
        var new_level = level_info.level + level_result;
        //var new_total = level_info.total_time + the_diff;
        var new_total = level_info.total_time + the_diff;//総合地にするべきだと考えたので、一個上の行から書き換えたけど、不具合はないだろうか2019/12/31
        //レベルが上がったかどうかで分岐する
        if(level_result == 0){
            //レベルは上がらないので加算して記録する
            var new_levtime = level_info.level_time + the_diff;
        }else{
            //レベルが上がったので、経験値を代入する
            var new_levtime = the_diff;
            //レベルが上がったのでtodayも更新する
            level_info.today_time = 0;
        }
        //日付が変わったかどうかで分岐する
        if(level_info.timestamp.toDate().getDate() != new Date().getDate()){
            //日付が異なったときはタイムスタンプを押して、今日の経験値をクリアする
            var new_timestamp = new Date();
            var new_today = the_diff;
        }else{
            //日付は変わらなかった
            var new_timestamp = level_info.timestamp.toDate();
            var new_today = level_info.today_time + the_diff;
        }
        //アップデートする変数の定義（status）
        var status ={
            level: new_level,
            timestamp: new_timestamp,
            total_time: new_total,
            today_time: new_today,
            month_time: month_time,
            level_time: new_levtime
        }
        //データベースをアップデートする
        db.collection("users").doc(context.params.userID).collection("jobs").doc(context.params.jobID).collection("levinfo").doc(context.params.jobID).update(
            status
        );
    });
    return 0;
});

//今のレベルで必要な経験値を返す関数。引数はレベル
function level_exp_needed(the_level){
    var first = 300;
    var result = 300;
    for(var i= 1; i< the_level; i++){
        result = Math.floor(first*1.1);
        first = Math.floor(first*1.1);
    }
    return result;
};


//ユーザが新しい日時でログインした時の処理
exports.logedNewdate = functions.firestore.document('users/{userID}/logindate/{loginID}').onUpdate((change, context) => {
    //jobのＩＤを取得
    db.collection("users").doc(context.params.userID).get().then(function(doc){
        var job_id = doc.data().job;
        //ログインしたら、ユーザのlevinfoのタイムスタンプを書き換える
        //この状態じゃ一つのジョブしかかけてないから、書き換えが必要では？2020/02/07
        db.collection("users").doc(context.params.userID).collection("jobs").doc(job_id).collection("levinfo").doc(job_id).update({
            today_time: 0,
            timestamp: change.after.data().loginTime
        });
        //こっから下はlimitsに関しての更新
        db.collection("users").doc(context.params.userID).collection("limits").doc("day").update({
            hello: 0,
            work: 0,
            wadai: 0,
        });        
    });
    return 0;
});

//login date を作成した時の挙動 limitを作成するために設置します2020/02/07
exports.createLimit = functions.firestore.document('users/{userID}/logindate/{loginID}').onCreate((change, context) => {
    //limitsに関して
    db.collection("users").doc(context.params.userID).collection("limits").doc("day").set({
        hello: 0,
        work: 0,
        wadai: 0,
    });        
    return 0;
});

//cookieのsamesitecationに対抗するべく、firebaseのドキュメントをコピペしていじってきたコード
//これも見直し、理解、再検証が明らかに必要である
/*
app.post('/sessionLogin', (req, res) => {
  // Get the ID token passed and the CSRF token.
  const idToken = req.body.idToken.toString();
  const csrfToken = req.body.csrfToken.toString();
  // Guard against CSRF attacks.
  if (csrfToken !== req.cookies.csrfToken) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }
  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  // Create the session cookie. This will also verify the ID token in the process.
  // The session cookie will have the same claims as the ID token.
  // To only allow session cookie setting on recent sign-in, auth_time in ID token
  // can be checked to ensure user was recently signed in before creating a session cookie.
  admin.auth().createSessionCookie(idToken, {expiresIn})
    .then((sessionCookie) => {
     // Set cookie policy for session cookie.
     const options = {maxAge: expiresIn, httpOnly: true, secure: true};
     res.cookie('session', sessionCookie, options);
     res.end(JSON.stringify({status: 'success'}));
    }, error => {
     res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});
*/

//Set-Cookie: key=value; SameSite=Lax


/*
var request = require('request');
request.setHeader('Set-Cookie', 'SameSite=Lax');
*/


//only blaze 定期処理
exports.scheduledFunction = functions.pubsub.schedule('1 of month 00:00').timeZone('Asia/Tokyo').onRun((context) => {
    console.log('This will be run every day 1');
    //jobのランキングを初期化する関数を実行する
    db.collectionGroup('levinfo').get().then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            update_month_time(doc.data().user_id, doc.id);
        });
    });
    return null;
});

//シラスを一日ごとにクリアするための記述 //この書き方で0じ0分に毎日実行してくれるはずなのだが、どうだろうか2020/03/05追記
exports.perdaysirasuFunction = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    console.log('This will be run per a day');
    //sirase の情報をクリアする記述
    db.collection('sirasu').doc('6WrFkQ2L0tuoatHbw4Qj').update({
        count: 0,
        users: []
    });
    return null;
});


//月の時間を0にする関数 引数にuidとjobidをとる
function update_month_time(user_id ,job_id){
    db.collection("users").doc(user_id).collection("jobs").doc(job_id).collection("levinfo").doc(job_id).update({
        month_time: 0
    });
    return null
}

//2020/01/04
//課金要素の関数の記述

//秘密鍵の引用テスト
//import "key.js";
var keys = require('./key');

const express = require('express');
const cors = require('cors');
const app = express();
const payjp = require('payjp')(keys.value);

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.post('/',(req,res)=>{
    
    /*
    console.log("http request は届いてる感じだよログ");
    console.log(req.params);
    console.log(req.body);
    console.log(req.body["payjp-token"]);
    */
   
    payjp.charges.create({
        amount: 500,
        currency: 'jpy',
        card: req.body["payjp-token"]
    }).then(console.log).catch(console.error);
    return null
    
});

// Expose Express API as a single Cloud Function:
exports.purchasePlan = functions.https.onRequest(app);


//wadai oncreate で 制限に書き込んでいく
exports.wadaiLimit = functions.firestore.document('communities/{communityID}/nagare/{wadaiID}').onCreate((snap ,context) => {   
    //limitに書き加える
    db.collection("users").doc(snap.data().userId).collection("limits").doc("day").update({
        wadai: admin.firestore.FieldValue.increment(1),
    });
    return 0;
});

//hello oncreate で制限に書き込んでいく
exports.helloLimit = functions.firestore.document('sirasu/6WrFkQ2L0tuoatHbw4Qj').onUpdate((change ,context) => {
    //日付変更でリセットされる場合の分岐処理を記述する2020/02/07じゃなきゃエラー吐くでしょｗ
    if(change.after.data().count != 0){
        //limitに書き加える
        //最後の数値のものが新しく生成されたものであるという考えで動くものである
        var lastnumber = Number(change.after.data().users.length) - 1;
        var user_id = change.after.data().users[lastnumber]["userid"];
        db.collection("users").doc(user_id).collection("limits").doc("day").update({
            hello: admin.firestore.FieldValue.increment(1),
        });
    }else{
        //日付変更処理後
    }
    return 0;
});