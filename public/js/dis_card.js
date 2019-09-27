//1,cardをclickしたときの関数群
//2,communityに参加または作成するときの関数群

//1 cardclickから全画面表示に関して
//個々の関数は全てrenewにて書き換えられました

//2 communityに参加若しくは新規作成に関する関数
//2.1 新規作成
function create_community_active(){
    document.getElementById("create_community_card").style.display = "block";
    setTimeout(function(){
        document.getElementById("dash_community").classList.add("create");
        document.getElementById("create_community_card").classList.add("active");
    },100);
}
function create_community_active_back(){
    document.getElementById("create_community_card").classList.remove("active");
    document.getElementById("dash_community").classList.remove("create");
    setTimeout(function(){
        document.getElementById("create_community_card").style.display = "none";
        //valueを空にして入力値のクリアをする
        document.getElementById("community_icon_create").value = "";
        document.getElementById("community_name_create").value = "";
        document.getElementById("community_text_create").value = "";
        //imageの表示も戻す
        document.getElementById("community_icon_upload_label_div").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';    
    },1000);
}
//community画像に関してのイベントリスナ
//input type file の値が切り替わったら起動する。画像をプレビューする
$(document).ready(function(){
    $('#community_icon_create').on('change', function (e) {
        var community_icon_create = document.getElementById("community_icon_create").value.split('.');
        if(con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase())){
            //入力されている処理
            document.getElementById("community_icon_upload_label_div").innerHTML = '<img id="preview">';
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#preview").attr('src', e.target.result);
            }
            reader.readAsDataURL(e.target.files[0]);
        }else{
            //入力されていない処理
            document.getElementById("community_icon_upload_label_div").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
            alert("svg, png, jpg, gif のいずれかの形式でアップロードしてください");
        }
    });
});
//コミュニティ新規作成の送信
function create_community_send(){
    console.log("submit");
    var community_icon_create = document.getElementById("community_icon_create").value.split('.');
    var community_name_create = document.getElementById("community_name_create");
    var community_text_create = document.getElementById("community_text_create");
    //値が入力されているか確認
    if(con_file_ext(community_icon_create[community_icon_create.length - 1].toLowerCase())){
        console.log("画像おｋ");
        if(community_name_create.value != ""){
            console.log("名前おｋ");
            if(community_text_create.value != ""){
                console.log("説明おｋ");
                //firebaseでアップロードする関数
                community_create_dialog.open();
            }else{
                document.getElementById("community_create_caution_description").textContent = "説明を入力してください";
                community_create_caution_dialog.open();
            }
        }else{
            document.getElementById("community_create_caution_description").textContent = "名前を入力してください";
            community_create_caution_dialog.open();
        }
    }else{
        document.getElementById("community_create_caution_description").textContent = "画像を入力してください";
        community_create_caution_dialog.open();
    };
}
//ファイルの拡張子を確かめる
function con_file_ext(the_extention){
    var extentions = ["svg","svgz","gif","png","jpg","jpeg","jpe","jfif","pjpeg","pjp"];
    for(var i = 0; i < extentions.length; i++){
        if(the_extention == extentions[i]){
            return true;
        }
    }
    return false;
}
//firebase sdk でアップロードする関数 だが、ポートフォリオのコピーが大部分
var place = "";
function community_create_send_send(){
    //画面を戻す関数 ここで戻したら値も更新されてしまい、テキスト等が未入力になる
    //create_community_active_back();
    //onclickをdiakog表示に切り替える。処理が完了したら、onclickを元に戻す。
    document.getElementById("create_community_send").onclick = function(){
        document.getElementById("community_create_caution_description").textContent = "処理中です。しばらくお待ちください。";
        community_create_caution_dialog.open();
    };
    console.log("アップロードする処理");
    //以下コピペ
    var fileList = document.getElementById("community_icon_create").files;
    for(var i=0; i<fileList.length; i++){
        place += fileList[i].name;
    }
    place = "images/" + place;
    var storageRef = firebase.storage().ref();
    var ref = storageRef.child(place);
    var file = document.getElementById("community_icon_create").files[0]; // use the Blob or File API
    ref.put(file).then(function() {
        console.log('Uploaded or file!');
        image_place = firebase.storage().ref().child(place).getDownloadURL().then(function(url){
            community_create_send_database(url);
        });
    });
}
//firebase firestoreでデータベースにコミュニティを登録する関数
function community_create_send_database(url){
    db.collection("communities").add({
        name: document.getElementById("community_name_create").value,
        text: document.getElementById("community_text_create").value,
        icon: url,
        start: new Date(),
        number: 1,
        member: [user_info_global.uid]
    })
    .then(function(docref) {
        //write カウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
        //console.log(docref.data());
        //community_list_globalに書き足し
        community_list_global[docref.id] = {
            name: document.getElementById("community_name_create").value,
            text: document.getElementById("community_text_create").value,
            icon: url,
            start: new Date(),
            number: 1,
            member: [user_info_global.uid]
        }
        //userのデータベースにコミュニティの管理者である情報の記載の処理 auth に docref.id を追加する
        //user_doc_globalの書き換え
        user_doc_global.auth.push(docref.id);
        //ユーザ情報をサブコレクションにぶち込んでから処理を持ってくるようにする
        db.collection("communities").doc(docref.id).collection("auther").doc(user_info_global.uid).set({
            id: user_info_global.uid,
            name: user_doc_global["name"],
            job: user_doc_global["name"],
            date: new Date(),
            type: "auth",
            creater: true
        }).then(
            function(){
                //write カウント
                firestore_write_count += 1;
                //rules カウント
                firestore_extra_count += 2;
                console.log("write =>", firestore_write_count);
                console.log("rules =>", firestore_extra_count);
                db.collection("users").doc(user_info_global.uid).update({
                    auth: user_doc_global.auth
                }).then(function(){
                    //write カウント
                    firestore_write_count += 1;
                    console.log("write", firestore_write_count);
                    //上３つの処理をユーザ書き換え後に持ってくる    
                    console.log("Document successfully written!");
                    //snackbar 表示させる
                    snackbar.open();
                    //画面戻して、入力の無効化
                    create_community_active_back();
                    //onclickも戻す
                    document.getElementById("create_community_send").onclick = function(){create_community_send()};
                    console.log(user_doc_global);
                    //user doc から community の情報表示を書き換える関数
                    //コミュニティを作ったときに、新しいものを表示する関数
                    use_joined_all = user_doc_global.auth.concat(user_doc_global.model).concat(user_doc_global.join).length;
                    document.getElementById("user_community_display").textContent = use_joined_all + "コに参加中";
                    document.getElementById("user_community_display_renew").textContent = use_joined_all + "コに参加中";
                    insert_user_joined();
                })
            }
        )
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

//2.2参加
function join_community_active(){
    //communities の情報を取得ー＞表示
    display_community_list();
    document.getElementById("join_community_card").style.display = "block";
    setTimeout(function(){
        //dash_communityにcreateするのは動作共通なので問題ない
        document.getElementById("dash_community").classList.add("create");
        document.getElementById("join_community_card").classList.add("active");
    },100);
}
function join_community_active_back(){
    document.getElementById("join_community_card").classList.remove("active");
    document.getElementById("dash_community").classList.remove("create");
    setTimeout(function(){
        document.getElementById("join_community_card").style.display = "none";
    },1000);
}
//他でも参照できるようにする community_collection
var community_get_state = 0;
function display_community_list(){
    //community_listの中身があったら取得する必要なし if分岐の処理を書く
    if(community_get_state == 0){
        get_community_list();
        /*console.log("取得関数まわる");*/
    }else{
        //すでに取得したので、書き換えだけ。
        console.log(community_list_global);
        //一度空にしてから挿入していく
        var ul = document.getElementById("communities_ul");
        ul.innerHTML = "";
        for( var community_id in community_list_global) {
            var community_icon_display = community_list_global[community_id]["icon"];
            var community_name_display = community_list_global[community_id]["name"];
            var community_text_display = community_list_global[community_id]["text"];
            var image_tag = '<img class="community_icon_in_list" src="' + community_icon_display + '">';
            var name_tag = '<span class="community_name_in_list mdc-list-item__primary-text">' + community_name_display + '</span>';
            var text_tag = '<span class="community_text_in_list mdc-list-item__secondary-text">' + community_text_display + '</span>';
            //挿入していく
            ul.insertAdjacentHTML("beforeend", '<li id="user_notjoined_' + community_id + '" class="mdc-list-item community_li" onclick="detail_of_the_com(this)">' + image_tag + '<span class="mdc-list-item__text community_texts_inlist">' + name_tag + text_tag + '</span>' + '</li>');
        }
        //list_ripple re
        lists_ripple_re()
    }
}
function get_community_list(){
    //この関数とコールバックの display_community_card の回数指定
    community_get_state = 1;
    //取得しよう collection communities
    db.collection("communities").limit(5).get().then(function(querySnapshot) {
        //get カウント
        if(querySnapshot.size == 0){
            firestore_get_count += 1;    
        }else{
            firestore_get_count += querySnapshot.size;
        }
        console.log("read" ,firestore_get_count);
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            /*console.log(doc.id, " => ", doc.data());*/
            community_list_global[doc.id] = doc.data();
        });
        //for in の位置を変えてトライ
        console.log(community_list_global);
        //一度空にしてから挿入していく
        var ul = document.getElementById("communities_ul");
        ul.innerHTML = "";
        for( var community_id in community_list_global) {
            var community_icon_display = community_list_global[community_id]["icon"];
            var community_name_display = community_list_global[community_id]["name"];
            var community_text_display = community_list_global[community_id]["text"];
            var image_tag = '<img class="community_icon_in_list" src="' + community_icon_display + '">';
            var name_tag = '<span class="community_name_in_list mdc-list-item__primary-text">' + community_name_display + '</span>';
            var text_tag = '<span class="community_text_in_list mdc-list-item__secondary-text">' + community_text_display + '</span>';
            //挿入していく
            ul.insertAdjacentHTML("beforeend", '<li id="user_notjoined_' + community_id + '" class="mdc-list-item community_li" onclick="detail_of_the_com(this)">' + image_tag + '<span class="mdc-list-item__text community_texts_inlist">' + name_tag + text_tag + '</span>' + '</li>');
        }
        lists_ripple_re()
        //display_community_card(user_doc_global.auth, user_doc_global.join, community_list_global);
    });
}
function join_this_community_dialog(){
    console.log("join_this_community_dialog");
    community_wana_join_dialog.open();
}
function join_this_community_send(){
    //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
    var join_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
    //コミュニティに参加する許可申請の記述
    db.collection("communities").doc(join_com_id).collection("permissions").doc(user_info_global.uid).set({
        uid: user_info_global.uid,
        cid: join_com_id,
        name: user_doc_global["name"],
        job: user_doc_global["job"],
        date: new Date(),
        type: "join",
        img: user_info_global.photoURL
    }).then(function(){
        //write カウント
        firestore_write_count += 1;
        //rules カウント
        firestore_extra_count += 2;
        //server カウント サーバー側で自動で書き変わりが行われる前提の数値
        firestore_extra_count += 2;
        firestore_delete_count += 3;
        firestore_write_count += 3;
        console.log("write", firestore_write_count);
        console.log("extra", firestore_extra_count);
        console.log("delete", firestore_delete_count);
        //カードを戻す
        detail_of_the_com_close();
        console.log("許可申請しました");
        //snackbar 表示させる
        snackbar.open();
        //管理者がいないときにすぐに作用する
        /*cloud functionからのリスナは現状取りやめ → 理由は遅い、など
        あとで開放するとき nagare 7 の community_state_change のことを考えろ いや、nagare のtimestamp書き換えればいい希ガス
        var there_is_no_auth = db.collection("users").doc(user_info_global.uid).onSnapshot(function(doc) {
            user_doc_global = doc.data();
            //表示を書き換える
            var user_joined_all = user_doc_global.auth;
            user_joined_all = user_joined_all.concat(user_doc_global.model);
            user_joined_all = user_joined_all.concat(user_doc_global.join);
            document.getElementById("user_community_display").textContent = String(user_joined_all.length) + "コに参加中";
            //ユーザが参加してるコミュニティリストの書き換え
            insert_user_joined();
            //ユーザが参加したコミュニティディのデータを取得
            db.collection("communities").doc(join_com_id).get().then(function(doc){
                //グローバル変数の書き換え
                community_list_global[doc.id] = doc.data();
                //表示を書き換える
                //いや、これで詳細と顔して切り替えたら表示も切り替わってるか
            }).catch(function(error){
                console.log("error", error);
            })
        });
        setTimeout(function(){
            there_is_no_auth();
            console.log("帯域幅が停止しました");
        }, 30000);
        */
    }).catch(function(error){
        console.log("error", error);
    });
}