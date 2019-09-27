//データベースの変更のイベントを取得したのちに処理を行う
//levelが上がったかどうかの判別を行う（上がったら書き換え）
//処理の変更により未使用
/*
function event_level(){
    var level_listen = db.collection("users").doc(user_info_global.uid).collection("jobs").doc(user_doc_global.job).onSnapshot(function(doc) {
        //get カウント
        firestore_get_count += 1;
        console.log("read", firestore_get_count);
        //rules count
        firestore_extra_count += 2;
        console.log("extra", firestore_extra_count);
        //一個したの source の行の処理内容よくわかってない
        var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", doc.data());
        user_job_global = doc.data();
        //表示の書き換え処理(Lv)
        document.getElementById("user_job_level_display").textContent = "Lv " + String(doc.data().level);
        clearTimeout(listen_time);
    });
    //snapshot 取り消す処理 100秒後
    var listen_time = setTimeout(function(){
        level_listen();
        console.log("level listen デタッチ");
    }, 100000);
}*/

//
//auth 46 dis_card 239 で実行（関数作成現在）
//global user docの情報から、参加コミュニティの情報と管理コミュニティの情報を見ることのできるカードを発行する
//引数、auth list  join list  community doc
//
var user_community_get_state = 0;
function get_user_communities(the_uid){
    user_community_get_state = 1;
    var count_user_joined_communities = 0;
    db.collection("communities").where("member", "array-contains", the_uid).get().then(function(querySnapshot) {
        //get カウント
        if(querySnapshot.size == 0){
            firestore_get_count += 1;
        }else{
            firestore_get_count += querySnapshot.size;
        }
        console.log("read", firestore_get_count);
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            community_list_global[doc.id] = doc.data();
            count_user_joined_communities ++;
        });
        document.getElementById("user_community_display").textContent = String(count_user_joined_communities) + "コに参加中";
        document.getElementById("user_community_display_renew").textContent = String(count_user_joined_communities) + "コに参加中";
        //コールバックでカードを表示する関数実行
        insert_user_joined();
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}

//連想配列でtrueのものだけカウントする
function get_rensou_amount(dict){
    var count_dict_amount = 0;
    for(var key in dict){
        if(dict[key]){
            count_dict_amount ++;
        }
    }
    return count_dict_amount;
}

//list を community の ところに挿入する関数
function insert_user_joined(){
    var ul = document.getElementById("communities_ul_user_joined");
    ul.innerHTML = "";
    var user_joined_all = user_doc_global.auth;
    user_joined_all = user_joined_all.concat(user_doc_global.model);
    user_joined_all = user_joined_all.concat(user_doc_global.join);
    //console.log(user_joined_all, typeof user_joined_all);
    var move_count = user_joined_all.length;
    //idを探して取得
    //console.log(move_count, typeof move_count);
    for(var i= 0; i< move_count; i++){
        var id_user_joined = user_joined_all[i];
        var community_icon_display = community_list_global[id_user_joined]["icon"];
        var community_name_display = community_list_global[id_user_joined]["name"];
        var community_text_display = community_list_global[id_user_joined]["text"];
        var image_tag = '<img class="community_icon_in_list" src="' + community_icon_display + '">';
        var name_tag = '<span class="community_name_in_list mdc-list-item__primary-text noto_font">' + community_name_display + '</span>';
        var text_tag = '<span class="community_text_in_list mdc-list-item__secondary-text noto_font">' + community_text_display + '</span>';
        //挿入していく
        ul.insertAdjacentHTML("beforeend", '<li id="user_joined_' + id_user_joined + '" class="mdc-list-item community_li mdc-ripple-surface" onclick="detail_of_the_com(this)">' + image_tag + '<span class="mdc-list-item__text community_texts_inlist">' + name_tag + text_tag + '</span>' + '</li>');
    }
    //card 内の他の要素の高さを取得して全体値からの差を当てはめる
    var head_height = document.getElementById("dash_community_first_div").clientHeight;
    var foot_height = document.getElementById("dash_community_final_div").clientHeight;
    document.getElementById("user_join_list_div").style.height = 'calc(100vh - 80px - ' + head_height + ' - ' + foot_height +' - 40px)';
    //rippleをlistに
    lists_ripple_re();
}

function detail_of_the_com(com_li){
    //取得した要素のidからコミュニティに関しての表示をする
    var the_com_id = com_li.id.split("_",3)[2];
    var the_head = document.getElementById("community_detail_display_head");
    var the_mid = document.getElementById("community_detail_display_mid");
    var member_count = community_list_global[the_com_id]["number"];
    the_head.style.backgroundImage = "url(" + community_list_global[the_com_id]["icon"] + ")";
    the_mid.insertAdjacentHTML("beforeend",'<p style="font-weight: 900; font-size: 2em; margin: 0px;">' + community_list_global[the_com_id]["name"] + '</p>');
    if(user_doc_global["auth"].indexOf(the_com_id) >= 0){
        var role_state = "管理者";
    }else if(user_doc_global["model"].indexOf(the_com_id) >= 0){
        var role_state = "モデラー";
    }else if(user_doc_global["join"].indexOf(the_com_id) >= 0){
        var role_state = "メンバー";
    }else{
        var role_state = "未参加";
    }
    the_mid.insertAdjacentHTML("beforeend",'<p style="color: #555555; margin: 0px;">メンバー' + String(member_count) + '人　あなたは' + role_state + 'です。</p><br>');
    the_mid.insertAdjacentHTML("beforeend",'<p style="color: #555555;">' + community_list_global[the_com_id]["text"] + '</p>');
    //未参加の時に参加ボタンを表示する
    if(role_state == "未参加"){
        the_mid.insertAdjacentHTML("beforeend",'<button id="join_this_community_button" class="mdc_button" onclick="join_this_community_dialog(this)"><span class="mdc-button__label">このコミュニティに参加する</span></button>');
        //material button のインスタンス化 現状めんどくさいからボタンまとめてインスタンス化して有効にしますリップルを
        //var the_button = document.querySelector('#join_this_community_button');
        //new mdc.ripple.MDCRipple(the_button); 仕様としたけどうまくいかないから、cssで整える
    }
    //クリックした要素の情報を取得
    var rect = com_li.getBoundingClientRect();
    var left = rect.left;
    var top = rect.top;  
    var width = rect.width;
    var height = rect.height;
    //それをdetail_divに反映
    var detail_div = document.getElementById("community_detail_display");
    detail_div.style.top = String(top) + "px";
    detail_div.style.left = String(left) + "px";
    detail_div.style.width = String(width) + "px";
    detail_div.style.height = String(height) + "px";
    detail_div.style.display = "block";
    //時間差で拡大させるモーションをさせる
    com_li.classList.add("active");
    setTimeout(function(){
        detail_div.classList.add("active");
        document.getElementById("community_detail_display_head").hidden = false;
        document.getElementById("community_detail_display_mid").hidden = false;
        setTimeout(function(){
            document.getElementById("community_detail_display_head").classList.add("active");
            document.getElementById("community_detail_display_mid").classList.add("active");
        },100);
    },50);
}
function detail_of_the_com_close(){
    var the_head = document.getElementById("community_detail_display_head");
    var the_mid = document.getElementById("community_detail_display_mid");
    the_head.classList.remove("active");
    the_mid.classList.remove("active");
    setTimeout(function(){
        var detail_div = document.getElementById("community_detail_display");
        detail_div.classList.remove("active");
        setTimeout(function(){
            try{
                document.querySelector(".community_li.active").classList.remove("active");
            }catch{
                console.log("コミュニティに所属していないので、リストのアクティブを取り除こうとしてエラー", "その対処をする");
            }finally{
                the_head.hidden = true;
                the_mid.innerHTML = "";
                detail_div.style.display = "none";
            }
        },200);
    },100);
}

//communityに関してその他の操作を行うmenuを開く関数
function detail_of_the_com_more_verb(){
    var auth_li_elemnts = document.querySelectorAll(".auth_list_verb");
    for(var i = 0; i< auth_li_elemnts.length; i++){
        auth_li_elemnts[i].remove();
    }
    //menu はrolestate によって表示を変えていく
    //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
    var the_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
    var member_li_display = document.getElementById("menu_community_member_list");
    if(user_doc_global["auth"].indexOf(the_com_id) >= 0){
        console.log("管理者のメニュー");
        var auth_lis = '<li class="mdc-list-item auth_list_verb" role="menuitem" onclick="leave_the_community_dialog()"><span class="mdc-list-item__text noto_font">コミュニティから抜ける</span></li>';
        //参加申請のリストに関する処理を書き足し
        auth_lis = '<li class="mdc-list-item auth_list_verb" role="menuitem" onclick="display_permission_card()"><span class="mdc-list-item__text noto_font">申請リスト</span></li>' + auth_lis;
        member_li_display.insertAdjacentHTML("afterend", auth_lis);
    }else if(user_doc_global["model"].indexOf(the_com_id) >= 0){
        console.log("モデラーのメニュー");
        var join_lis = '<li id="wana_auth" class="mdc-list-item auth_list_verb" role="menuitem" onclick="change_the_role_dialog(this)"><span class="mdc-list-item__text noto_font">管理者になる</span></li><li class="mdc-list-item auth_list_verb" role="menuitem" onclick="leave_the_community_dialog()"><span class="mdc-list-item__text noto_font">コミュニティから抜ける</span></li>';
        join_lis = '<li class="mdc-list-item auth_list_verb" role="menuitem" onclick="display_permission_card()"><span class="mdc-list-item__text noto_font">申請リスト</span></li>' + join_lis;
        member_li_display.insertAdjacentHTML("afterend", join_lis);
    }else if(user_doc_global["join"].indexOf(the_com_id) >= 0){
        console.log("メンバーのメニュー");
        var join_lis = '<li id="wana_model" class="mdc-list-item auth_list_verb" role="menuitem" onclick="change_the_role_dialog(this)"><span class="mdc-list-item__text noto_font">モデラーになる</span></li><li id="wana_auth" class="mdc-list-item auth_list_verb" role="menuitem" onclick="change_the_role_dialog(this)"><span class="mdc-list-item__text noto_font">管理者になる</span></li><li class="mdc-list-item auth_list_verb" role="menuitem" onclick="leave_the_community_dialog()"><span class="mdc-list-item__text noto_font">コミュニティから抜ける</span></li>';
        member_li_display.insertAdjacentHTML("afterend", join_lis);
    }else{
        console.log("未参加のメニュー");
    }
    menu.open = true;
}
//コミュニティを抜ける関数
function leave_the_community_dialog(){
    community_leave_caution_dialog.open();
}
function leave_the_community(){
    //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
    var the_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
    //ユーザの役割によって処理を分岐させて考える
    if(user_doc_global.auth.indexOf(the_com_id) >= 0){
        console.log("管理者から削除する処理を行います");
        //コミュニティ側のデータ削除
        db.collection("communities").doc(the_com_id).collection("auther").doc(user_info_global.uid).delete().then(function(){
            //delete カウント
            firestore_delete_count += 1;
            console.log("delete", firestore_delete_count);
            //rules count
            firestore_extra_count += 1;
            //write in server side
            firestore_write_count += 2;
            console.log("write", firestore_write_count);
            console.log("extra", firestore_extra_count);
            //ユーザ側のデータ削除の帯域幅受付
            var there_is_no_auth = db.collection("users").doc(user_info_global.uid).onSnapshot(function(doc) {
                //get カウント
                firestore_get_count += 1;
                console.log("read", firestore_get_count);
                user_doc_global = doc.data();
                console.log("user_doc updated", user_doc_global);
                //画面表示を切り替える処理をする
                after_remove_community();
                clearTimeout(timeout_id);
            });
            var timeout_id = setTimeout(function(){
                there_is_no_auth();
                console.log("帯域幅が停止しました");
            }, 30000);
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
    }else if(user_doc_global.model.indexOf(the_com_id) >= 0){
        console.log("モデレータから削除する処理を行います");
        //コミュニティのサブコレクション modeler から削除する
        db.collection("communities").doc(the_com_id).collection("modeler").doc(user_info_global.uid).delete().then(function(){
            //delete カウント
            firestore_delete_count += 1;
            console.log("delete", firestore_delete_count);
            //rules count
            firestore_extra_count += 1;
            //write in server side
            firestore_write_count += 2;
            console.log("write", firestore_write_count);
            console.log("extra", firestore_extra_count);
            //ユーザ側のデータ削除の帯域幅受付
            var there_is_no_auth = db.collection("users").doc(user_info_global.uid).onSnapshot(function(doc) {
                //get カウント
                firestore_get_count += 1;
                console.log("read", firestore_get_count);
                user_doc_global = doc.data();
                console.log("user_doc updated", user_doc_global);
                //画面表示を切り替える処理をする
                after_remove_community();
                clearTimeout(timeout_id);
            });
            var timeout_id = setTimeout(function(){
                there_is_no_auth();
                console.log("帯域幅が停止しました");
            }, 30000);
        })
    }else if(user_doc_global.join.indexOf(the_com_id) >= 0){
        console.log("参加者から削除する処理を行います");
        //コミュニティのサブコレクション joiner から削除する
        db.collection("communities").doc(the_com_id).collection("joiner").doc(user_info_global.uid).delete().then(function(){
            //delete カウント
            firestore_delete_count += 1;
            console.log("delete", firestore_delete_count);
            //rules count
            firestore_extra_count += 2;
            //write in server side
            firestore_write_count += 2;
            console.log("write", firestore_write_count);
            console.log("extra", firestore_extra_count);
            //ユーザ側のデータ削除の帯域幅受付
            var there_is_no_auth = db.collection("users").doc(user_info_global.uid).onSnapshot(function(doc) {
                //get カウント
                firestore_get_count += 1;
                console.log("read", firestore_get_count);
                user_doc_global = doc.data();
                console.log("user_doc updated", user_doc_global);
                //画面表示を切り替える処理をする
                after_remove_community();
                clearTimeout(timeout_id);
            });
            var timeout_id = setTimeout(function(){
                there_is_no_auth();
                console.log("帯域幅が停止しました");
            }, 30000);
        })
    }else{
        console.log("この操作ができる時点でおかしい。異常な挙動をしています")
    };
}
//コミュニティを抜けた後に表示を整える関数
function after_remove_community(){
    //カードを戻す
    detail_of_the_com_close();
    //listを書き換える
    insert_user_joined();
    //参加しているコミュニティの数
    var user_joined_all = user_doc_global.auth;
    user_joined_all = user_joined_all.concat(user_doc_global.model);
    user_joined_all = user_joined_all.concat(user_doc_global.join);
    document.getElementById("user_community_display").textContent = String(user_joined_all.length) + "コに参加中";
}

//役職を変える申請
function change_the_role_dialog(list_element){
    var list_id = list_element.id;
    console.log("id", list_id);
    if(list_id == "wana_model"){
        console.log("wana model の処理をします");
        community_wana_model_dialog.open();
    }else if(list_id == "wana_auth"){
        console.log("wana_auth");
        community_wana_auth_dialog.open();
    }else{
        console.log("これなんの処理だよｗ");
    }
}
function change_role_send(send_button){
    if(send_button.id == "change_model"){
        var type = "model";
    }else if(send_button.id == "change_auth"){
        var type = "auth";
    }else{
        var type = "what";
    }
    //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
    var join_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
    //コミュニティの役職変更申請の記述
    db.collection("communities").doc(join_com_id).collection("permissions").doc(user_info_global.uid).set({
        uid: user_info_global.uid,
        cid: join_com_id,
        name: user_doc_global["name"],
        job: user_doc_global["job"],
        date: new Date(),
        type: type,
        img: user_info_global.photoURL
    }).then(function(){
        //write カウント
        firestore_write_count += 1;
        console.log("write", firestore_write_count);
        //カードを戻す
        detail_of_the_com_close();
        console.log("許可申請しました");
        //snackbar 表示させる
        snackbar.open();
        //管理者がいないときにすぐに作用する
        /*クラウドファンクションをもちいた listen は遅いので現状打ち止め
        あとで開放するとき nagare 7 の community_state_change のことを考えろ いや、nagare のtimestamp書き換えればいい希ガス
        var there_is_no_auth = db.collection("users").doc(user_info_global.uid).onSnapshot(function(doc) {
            user_doc_global = doc.data();
            //ユーザが参加したコミュニティディのデータを取得
            db.collection("communities").doc(join_com_id).get().then(function(doc){
                //グローバル変数の書き換え
                community_list_global[doc.id] = doc.data();
                //表示を書き換える
                //いや、これで詳細と顔して切り替えたら表示も切り替わってるか
                console.log("帯域幅で変化を受け取りました");
            }).catch(function(error){
                console.log("error", error);
            })
        });
        setTimeout(function(){
            there_is_no_auth();
            console.log("帯域幅が停止しました");
        }, 20000);
        */
    }).catch(function(error){
        console.log("error", error);
    })
}