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
        total_time: 0,
        level_time: 0,
        today_time: 0,
        timestamp: now_time
    });
    return 0;
});
//ワーク作成で動く関数 レベルの上下や経験値、タイムスタンプ等を判別して処理
exports.createWork = functions.firestore.document('users/{userID}/jobs/{jobID}/works/{workID}').onCreate((snap, context) => {
    //基本の時間
    var time = snap.data().time;
    //ユーザのレベルの情報を取得して判断する
    db.collection("users").doc(context.params.userID).collection("jobs").doc(context.params.jobID).collection("levinfo").doc(context.params.jobID).get().then(function(doc){
        var level_info = doc.data();
        //差し引かれる前の残りの値
        var level_needed = level_exp_needed(level_info.level) - level_info.level_time;
        //取得した経験値との差を求める
        var the_diff = time - level_needed;
        //レベルの上がった数を計測する変数
        var level_result = 0;
        while (the_diff >= 0){
            //上がるレベルをカウントする
            level_result ++;
            //上がったレベルの経験値を取得して評価する
            level_needed = level_exp_needed(level_info.level);
            the_diff = the_diff - level_needed;
        }
        //差が負の値になったら、diffを一つ前に戻してその値を経験値のプラス値にする
        the_diff = the_diff + level_needed;
        //statusを決める
        var new_level = level_info.level + level_result;
        var new_total = level_info.total_time + the_diff;
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
        db.collection("users").doc(context.params.userID).collection("jobs").doc(job_id).collection("levinfo").doc(job_id).update({
            today_time: 0,
            timestamp: change.after.data().loginTime
        });
    })
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