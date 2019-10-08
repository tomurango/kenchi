//Google プロバイダオブジェクトのインスタンスを作成
//var provider;
//docの取得を削減するためにボトルネックを探る戦い
var firestore_get_count = 0;
var firestore_write_count = 0;
var firestore_delete_count = 0;
//rule server に対しての課金
var firestore_extra_count = 0;

//authの情報
var user_info_global;
//dbの情報
var user_doc_global;
var user_job_global;
//var user_community_global;communityのリストは統一させて辞書でインデックスする感じでいいかも
var community_list_global = {};

//click で login させる
function google_login(){
    //セッションの永続性を指定から、ログインしてる感じ
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithRedirect(provider).then(user =>{
            // Get the user's ID token as it is needed to exchange for a session cookie.
            return user.getIdToken();/*.then(idToken => {
                // Session login endpoint is queried and the session cookie is set.
                // CSRF protection should be taken into account.
                // ...
                const csrfToken = getCookie('csrfToken')
                return postIdTokenToSessionLogin('/sessionLogin', idToken, csrfToken);
            });*/
        });
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
}

var db = firebase.firestore();
function check_db(user_info){
    //talkにアイコンぶち込め
    document.getElementById("hidden_wadai_fixed_uicon").src = user_info_global.photoURL;
    //条件によってfulldcreen dialog を表示するかどうか決める
    var docRef = db.collection("users").doc(user_info.uid);
    //localだとデータベース周りが機能しなくなる 機能しますけどｗ
    docRef.get().then(function(doc) {
        if (doc.exists) {
            //名前の書き換え
            document.getElementById("user_name_display").textContent = doc.data().name;
            document.getElementById("user_name_display_renew").textContent = doc.data().name;
            //アイコンボタンをユーザの画像のボタンに切り替える
            insert_image_button(user_info.photoURL);
            //グローバルスコープでユーザのdbを使えるようにする
            user_doc_global=doc.data();
            //user doc から community の情報表示を書き換える関数
            get_user_communities(user_info.uid);
            //jobのデータを取得する
            user_job_data_get(user_info, doc.data().job);
            //dash_card にripple を
            card_ripple_re();
            //notice jsに飛んで処理
            notice_permission(user_doc_global);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");   
            //fullscreen でdetabase を作る 
            fullscreen_dialog_open();
        }
        //取得しなくても＋１
        firestore_get_count += 1;
        //カウントを表示
        console.log("read_one", firestore_get_count);
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    //fullscreen_dialog_open();
}

//redirect 後の挙動を書きたいのだが、これでいいのかわからん
$(document).ready(function(){
    //chart js のグラフが表示されない問題の解決のための検証
    //document.getElementById("chart_contain").textContent = window.devicePixelRatio;
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
        //console.log(token);
        }
        // The signed-in user info.
        var user = result.user;
        user_info_global = user;
        //console.log(user);
        //ここでユーザのログイン状況に応じて処理を書き換える
        //できてたつもりだったがまず、リダイレクトのユーザ確認をしたのちに、永続ユーザの確認をしたらログインできている
        if (user) {
            // User is signed in.
            //login ボタンの切り替え 後でデータベースの処理の関数内で実行させる
            //insert_image_button(user_image);
            //fabを表示する
            //document.getElementById("start_fab").hidden = false;
            //データべースの処理
            check_db(user);
        } else {
            //console.log("No Redirect information");
            // No user is signed in.
            //もう一度ユーザを取得して確認してみる
            var user = firebase.auth().currentUser;
            if (user) {
                //fabを表示する
                //document.getElementById("start_fab").hidden = false;
                // User is signed in.
                user_info_global = user;
                check_db(user);
            } else {
                // No user is signed in.
                console.log("No user is signed in");
                login_anonymously();
            }
        }
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
    });
});

function insert_image_button(image){
    var button_style = 'style="background-image:url(' + image + '); border:none; padding:0px; width:32px; height:32px; background-size: contain; border-radius:50%; margin:8px;"';
    var button_tag = '<button class="mdc-top-app-bar__navigation-icon"'+ button_style +' onclick="google_login()"></button>';
    document.getElementById("user_login").innerHTML = button_tag;
    //console.log("user is signed in");''
}


//スクロール禁止の記述（ただのコピペ）機能しなかった
/*
function handleTouchMove(event) {
    event.preventDefault();
}
*/
function fullscreen_dialog_open(){
    document.getElementById("dialog_div").hidden = false;
    document.getElementById("user_login_button").style.display = "none";
    //スクロール禁止 機能しなかった
    //document.addEventListener('touchmove', handleTouchMove, { passive: false });
    //力ずく
    //動かせる間に動いてトップアップバーが見えなくなるときの対処
    scrollTo(0,0);
    document.getElementById("my_body").style.overflowY = "hidden";
    //inputのchangeイベントでチップを表示する html にonchangeで記述する
    /*var job_input = document.getElementById("new_job");
    job_input.on('input',function(event){
        console.log(event);
        console.log(job_input.value);
    })*/
}
function fullscreen_dialog_close(){
    document.getElementById("dialog_div").hidden = true;
    document.getElementById("user_login_button").style.display = "block";
    //スクロール復帰 機能しなかった
    //document.removeEventListener('touchmove', handleTouchMove, { passive: false });
    //力ずく
    document.getElementById("my_body").style.overflowY = "scroll";
    //アイコンボタンをユーザの画像のボタンに切り替える
    insert_image_button(user_info_global.photoURL);
    //名前をゲストユーザから書き換える 入力値が空欄なら、すでにあるユーザの名前 入力されているなら入力値
    var name_input = document.getElementById("new_name").value;
    var job_input = document.getElementById("new_job").value;
    if(name_input == ""){
        document.getElementById("user_name_display").textContent = user_info_global.displayName;
        document.getElementById("user_name_display_renew").textContent = user_info_global.displayName;
        //firebase authentication の書き換え
        name_update(user_info_global.displayName);
        //データベースの書き換え
        if(job_input == ""){
            //ジョブの表示切替
            document.getElementById("user_job_display").textContent = "職探し";
            document.getElementById("user_job_display_renew").textContent = "職探し";
            job_update(user_info_global.displayName, "職探し");
        }else{
            //ジョブの表示切替
            document.getElementById("user_job_display").textContent = job_input;
            document.getElementById("user_job_display_renew").textContent = job_input;
            job_update(user_info_global.displayName, job_input);
        }
    }else{
        document.getElementById("user_name_display").textContent = name_input;
        document.getElementById("user_name_display_renew").textContent = name_input;
        //firebase authentication の書き換え
        name_update(name_input);
        //こっからデータベースの書き換え
        if(job_input == ""){
            //ジョブの表示切替
            document.getElementById("user_job_display").textContent = "職探し";
            document.getElementById("user_job_display_renew").textContent = "職探し";
            job_update(name_input, "職探し");
        }else{
            //ジョブの表示切替
            document.getElementById("user_job_display").textContent = job_input;
            document.getElementById("user_job_display_renew").textContent = job_input;
            job_update(name_input, job_input);
        }
    }
}
//require する必要があるらしい
//const firebase = require("firebase");
// Required for side-effects
//require("firebase/firestore");
//やはりエラーが出た


//fullscreen_dialog_close内のユーザ情報の変更やデータベースに関する処理を書く。↓
function name_update(name){
    user_info_global.updateProfile({
        displayName: name,
    }).then(function() {
        // Update successful.
        console.log("ユーザの名前更新完了");
    }).catch(function(error) {
        // An error happened.
        console.log(error);
    });
}


//userのdbも書き換えてるから、安易に利用するのは危ない
function job_update(name, job){
    var new_user = {
        name: name,
        auth: [],
        join: [],
        model: [],
        date: new Date()
    };
    db.collection("users").doc(user_info_global.uid).set(new_user).then(function(docref_user) {
        //logindateもクリエイトする
        db.collection("users").doc(user_info_global.uid).collection("logindate").doc(user_info_global.uid).set({
            loginTime: new Date(),
            createdAt: new Date()
        });
        //writeカウント
        firestore_write_count +=2;
        console.log("write", firestore_write_count);
        //user_doc_globalに代入
        user_doc_global = new_user;
        console.log("Document successfully written!");
        //ついでjobの階層にもデータを登録するようにする
        db.collection("users").doc(user_info_global.uid).collection("jobs").add({
            name: job,
            date: new Date()
        }).then(function(docref_job) {
            //server側のoncreateでlevel info を作る
            firestore_write_count += 2;
            console.log("write", firestore_write_count);
            console.log("Document successfully written!");
            //user情報のjobのところを書き換える
            console.log("job_id =>" ,docref_job.id); 
            console.log("user_info_global", user_info_global.uid)
            try {console.log("user_id =>" , docref_user.id);} catch (e) {console.log("error", e)}
            db.collection("users").doc(user_info_global.uid).update({
                job: docref_job.id
            }).then(function() {
                //writeカウント
                firestore_write_count +=1;
                console.log("write", firestore_write_count);
                //user_doc_globalに代入
                user_doc_global["job"] = docref_job.id;
            });
            //levinfoを作成して、グローバルに代入→グラフも表示する
            //したかったが、初期値の変更をして書き換えることができそうなので却下
            //そのかア割、グローバル変数に代入して、グラフを表示することに関しては賛成である
            level_info_global[docref_job.id] = {
                level: 1,
                total_time: 0,
                level_time: 0,
                today_time: 0,
                timestamp: new Date()
            }
            insert_level_info(docref_job.id, 0);
        });
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

function login_anonymously(){
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode);
        console.log(errorMessage);
    });
    console.log("anonymously login");
    //fabを非表示に
    document.getElementById("start_fab").style.display = "none";
}

var level_info_global = {};
function user_job_data_get(user_info, job_name){
    //userごとにjobのデータを取得して、その情報をhomeに表示する
    db.collection("users").doc(user_info.uid).collection("jobs").doc(job_name).get().then(function(doc) {
        //get カウント
        firestore_get_count += 1;
        console.log("get", firestore_get_count);
        //仕事の書き換え
        document.getElementById("user_job_display").textContent = doc.data().name;
        document.getElementById("user_job_display_renew").textContent = doc.data().name;
        //console.log("you got job data");
        //globalで利用可能にする
        user_job_global = doc.data();
        //levelの情報を取得
        db.collection("users").doc(user_info.uid).collection("jobs").doc(job_name).collection("levinfo").doc(job_name).get().then(function(doc){
            level_info_global[job_name] = doc.data();
            //タイムスタンプを見て、日付が異なる時に上書きする
            if(doc.data().timestamp.toDate().getDate() != new Date().getDate()){
                var now_time = new Date();
                db.collection("users").doc(user_info.uid).collection("logindate").doc(user_info.uid).update({
                    loginTime: now_time
                }).then(function(){
                    //日付を変えたデータに書き換えてから
                    level_info_global[job_name].timestamp = firebase.firestore.Timestamp.now();
                    level_info_global[job_name].today_time = 0;
                    //writeカウント
                    firestore_write_count += 2;
                    console.log("write", firestore_write_count);
                    //read count on server side
                    firestore_get_count += 1;
                    console.log("read", firestore_get_count);
                    insert_level_info(job_name, 0);
                });
            }else{
                insert_level_info(job_name, 0);
            }
            //get カウント
            firestore_get_count += 1;
            console.log("get", firestore_get_count);
        });
    }).catch(function(error) {
        console.log("Error getting document:", error);
        //スマホだけ表示されないエラーに関する検証
        //document.getElementById("chart_contain").innerHTML = "error >" + String(error);
    });
}