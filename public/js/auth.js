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
var user_alljob_global = {};
//var user_community_global;communityのリストは統一させて辞書でインデックスする感じでいいかも
var community_list_global = {};

//login menu
/*
function display_login_menu(){
    //menu.open
    login_menu.open = true;
}
*/

function log_out(){
    firebase.auth().signOut().then(()=>{
        console.log("ログアウトしました");
        //脳死でリロードするが、変更するかもなぜか → リロードにＵＸ的理由を決めれてないから
        //ただ、リロードしなければ表示がＵＸ的にはおかしくなる。要は、いつか最適化しようという感じ
        //リロードでよくね？ログアウトって感じがしていいと思い始めた
        location.reload();
    })
    .catch( (error)=>{
        console.log(`ログアウト時にエラーが発生しました (${error})`);
    });
}

//google
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

const db = firebase.firestore();
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
            document.getElementById("user_name_in_drawer").textContent = doc.data().name;//drawerにも書く
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
            //sirasuを取得する
            sirasu_get();
            //limits を取得する ここで一日の始めに挙動を分岐させて動作をしっかりできるようにする
            //get_limits(user_info.uid);ここではなく、job_data_get内の日付更新の位置で実行させる
            //tutorial の挙動及び処理を実行する
            tutorial_home();
            //ワイワイユーザか、ノーマルユーザなのかを判断して実行する処理
            if_waiwaiuser();
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
                if(user.isAnonymous){
                    //匿名                    
                    console.log("すでに anonymously");
                    //fabを非表示に
                    document.getElementById("start_fab").style.display = "none";
                    //page_contain_guestを表示して、page_contain_dashをしまう
                    document.getElementById('page_contain_guest').hidden = false;
                    document.getElementById('page_contain_dash').hidden = true;
                    //ログアウトボタンを非表示にする
                    document.getElementById("logout").style.display = "none";
                    //ワダイのinputタグを非表示にして、代替え文字の表示をする
                    document.getElementById("hidden_wadai_fixed_text").hidden = true;
                    document.getElementById("hidden_wadai_text_foranony").hidden = false;
                }else{
                    //匿名じゃない
                    user_info_global = user;
                    check_db(user);
                }
            } else {
                // No user is signed in.
                console.log("No user is signed in");
                login_anonymously();
                //ログアウトボタンを非表示にする
                document.getElementById("logout").style.display = "none";
                //ワダイのinputタグを非表示にして、代替え文字の表示をする
                document.getElementById("hidden_wadai_fixed_text").hidden = true;
                document.getElementById("hidden_wadai_text_foranony").hidden = false;
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
    var button_style = 'style="background-color: #ff9900; background-image:url(' + image + '); border:none; padding:0px; width:32px; height:32px; background-size: contain; border-radius:50%; margin:8px;"';
    var button_tag = '<button class="mdc-top-app-bar__navigation-icon"'+ button_style +' onclick="how_to_login_open()"></button>';
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
        document.getElementById("user_name_in_drawer").textContent = user_info_global.displayName;
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
        document.getElementById("user_name_in_drawer").textContent = name_input;
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
//安易に利用してないよね逆に2020/02/07
function job_update(name, job){
    var new_user = {
        name: name,
        auth: [],
        join: [],
        model: [],
        good: [],
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
            date: new Date(),
            img: user_info_global.photoURL,
            uid: user_info_global.uid,
            main: true
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
                month_time: 0,
                timestamp: new Date(),
                user_id: user_info_global.uid,
                user_image: user_info_global.photoURL,
                job_name: job
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
    //page_contain_guestを表示して、page_contain_dashをしまう
    document.getElementById('page_contain_guest').hidden = false;
    document.getElementById('page_contain_dash').hidden = true;
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
        //alljob_globalでも引用可能にする
        user_alljob_global[doc.id] = doc.data();
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
                //日付が変わるのであれば、リミットはグローバル側を手動で入力
                get_limits(user_info.uid, true);
                get_mojisuu();
            }else{
                insert_level_info(job_name, 0);
                //日付が変わらないのであれば、リミットは取得してきて反映する感じでいいですかね。
                get_limits(user_info.uid, false);
                get_mojisuu();
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

function change_user_name_dialog(){
    console.log("あけあけあけあけごま")
    //change_user_name_dialog.open();
    //change_job_dialog.open();
    change_username_dialog.open();
}
function change_user_name_send(){
    //firebase auth 書き換える
    var new_user_name = document.getElementById("change_user_name_input").value;
    name_update(new_user_name);
    //データベースを書き換える
    db.collection("users").doc(user_info_global.uid).update({
        name: new_user_name
    }).then(function(){
        //書き換えカウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
        //グローバル変数を書き換える
        user_doc_global["name"] = new_user_name;
        //表示を変える
        document.getElementById("user_name_display").textContent = new_user_name;
        document.getElementById("user_name_display_renew").textContent = new_user_name;
    });
}


//googleログイン以外の処理を記述していく
function mail_login(button_element){
    //console.log("mail_transition", button_element.id);
    apper_card(button_element.id, "mail_login_card");
    var mail_login_card = document.getElementById("mail_login_card");
    var mail_login_card_transition = document.getElementById("mail_login_transion");
    var mail_login_card_content = document.getElementById("mail_login_content");
    setTimeout(function(){
        //全体のtransition
        mail_login_card.classList.add("active");
        //変化をわかりやすくするためのtransition
        mail_login_card_transition.classList.add("disactive");
        mail_login_card_transition.style.display = "none";
        setTimeout(function(){
            mail_login_card_content.style.display = "block";
            mail_login_card_content.classList.add("active");
        }, 150);
    },100);
}
function mail_login_back(){
    var mail_login_card = document.getElementById("mail_login_card");
    var mail_login_card_transition = document.getElementById("mail_login_transion");
    var mail_login_card_content = document.getElementById("mail_login_content");
    mail_login_card.classList.remove("active");
    mail_login_card_content.classList.remove("active");
    //transition 後に display none にする
    setTimeout(function(){
        mail_login_card_content.style.display = "none";
        mail_login_card_transition.style.display = "inline-block";
        mail_login_card_transition.classList.remove("disactive");
        setTimeout(function(){
            mail_login_card.style.display = "none";
        }, 150);
    }, 150);
}

function mail_login_send(){
    //input tag から情報をそれぞれ取得する
    var email = document.getElementById("mail_login_adress").value;
    var password = document.getElementById("mail_login_pass").value;
    //そのあとに送信する処理
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
        // パスワードが間違えてるときの処理
        if (errorCode === 'auth/wrong-password') {
            //user登録してないときもこのエラーが出る
            //パスワードを間違えてるとき及び、パスワードを所有していないときに発生するエラーだとされている
            document.getElementById("error_for_mail").textContent = "";
            document.getElementById("error_for_pass").textContent = "※パスワードが正しく入力されていません。";
        } else if(errorCode === 'auth/invalid-email') {
            //メールの形式がダメなときのエラー 例えば lgfilagfihkh とか送信したら帰ってくる
            document.getElementById("error_for_mail").textContent = "※メールアドレスが正しく入力されていません。";
            document.getElementById("error_for_pass").textContent = "";
        }
    });
}

function mail_to_first(){
    document.getElementById("div_for_mail_else").style.display = "none";
    document.getElementById("div_for_mail_first").style.display = "block";
}

function mail_to_else(){
    document.getElementById("div_for_mail_first").style.display = "none";
    document.getElementById("div_for_mail_else").style.display = "block";
}

function mail_login_create(){
    //input tag から情報をそれぞれ取得する
    var email = document.getElementById("mail_login_adress_create").value;
    var password = document.getElementById("mail_login_pass_create").value;
    //そのあとに送信する処理
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        console.log(errorCode, errorMessage);
        // パスワードが間違えてるときの処理
        if (errorCode === 'auth/email-already-in-use') {
            //mail アドレスがすでに使われている
            document.getElementById("error_for_mail_create").textContent = "※すでに使用されているアドレスです。";
            document.getElementById("error_for_pass_create").textContent = "";
        } else if(errorCode === 'auth/invalid-email') {
            //メールの形式がダメなときのエラー 例えば lgfilagfihkh とか送信したら帰ってくる
            document.getElementById("error_for_mail_create").textContent = "※メールアドレスが正しく入力されていません。";
            document.getElementById("error_for_pass_create").textContent = "";
        } else if(errorCode === 'auth/operation-not-allowed') {
            //メールの形式がダメなときのエラー 例えば lgfilagfihkh とか送信したら帰ってくる
            document.getElementById("error_for_mail_create").textContent = "※メールアドレスが正しく入力されていません。";
            document.getElementById("error_for_pass_create").textContent = "";
        } else if(errorCode === 'auth/weak-password') {
            //メールの形式がダメなときのエラー 例えば lgfilagfihkh とか送信したら帰ってくる
            document.getElementById("error_for_mail_create").textContent = "";
            document.getElementById("error_for_pass_create").textContent = "※パスワードが脆弱です。より強固なものにしてください。";
        }
    });
}


//チュートリアルのメッセージを表示する関数
function tutorial_message(type){
    setTimeout(function(){
        if(type == "home"){
            //最初の画面に表示される、アプリの概要若しくは、homeの使い方に関する記述かな？
            tutorial_home_dialog.open();
        }else if(type == "work"){
            tutorial_work_dialog.open();
        }else if(type == "wadai"){
            tutorial_wadai_dialog.open();
        }
    },1000);
}

//homeのチューとリアルの時はドキュメントの存在が怪しい状況での実行になるので、他と異なるね恐らく
//と思っていたが、あんま変わらないかもしれない
function tutorial_home(){
    //user doc global の tutorial が歩かないかの確認
    if(user_doc_global.tutorialHome === undefined || user_doc_global.tutorialHome == false ){
        //未定義の場合の処理
        //message を表示
        tutorial_message("home");
        //firebase の上書き
        db.collection("users").doc(user_info_global.uid).update({
            tutorialHome: true 
        }).then(function(){
            //実行後はグローバル doc の書き換えを行う
            user_doc_global.tutorialHome = true;
        }).catch(function(e){
            console.log("error => ", e);
        });
    }else if(user_doc_global.tutorialHome == true){
        return
    }
}

// work のチュートリアル
function tutorial_work(){
    //user doc global の tutorial が歩かないかの確認
    try{
        if(user_doc_global.tutorialWork === undefined || user_doc_global.tutorialWork == false ){
            //未定義の場合の処理
            //message を表示
            tutorial_message("work");
            //firebase の上書き
            db.collection("users").doc(user_info_global.uid).update({
                tutorialWork: true 
            }).then(function(){
                //実行後はグローバル doc の書き換えを行う
                user_doc_global.tutorialWork = true;
            }).catch(function(e){
                console.log("error => ", e);
            });
        }else if(user_doc_global.tutorialWork == true){
            return
        }
    }catch(e){
        //匿名ユーザであるときにエラーが出る→user_doc_globalが未定義なのに、その情報を引き出すことができないので出力
        console.log("error", e);
    }
}

// wadai のチュートリアル
function tutorial_wadai(){
    //user doc global の tutorial が歩かないかの確認
    try{
        if(user_doc_global.tutorialWadai === undefined || user_doc_global.tutorialWadai == false ){
            //未定義の場合の処理
            //message を表示
            tutorial_message("wadai");
            //firebase の上書き
            db.collection("users").doc(user_info_global.uid).update({
                tutorialWadai: true 
            }).then(function(){
                //実行後はグローバル doc の書き換えを行う
                user_doc_global.tutorialWadai = true;
            }).catch(function(e){
                console.log("error => ", e);
            });
        }else if(user_doc_global.tutorialWadai == true){
            return
        }
    }catch(e){
        console.log("error", e);
    }
}