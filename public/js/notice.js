//auth jsから飛んで処理
function notice_permission(store_data){
    if(store_data["auth"].length > 0){
        for(var i= 0; i< store_data["auth"].length; i++){
            my_permissions[store_data["auth"][i]] = [];
            db.collection("communities").doc(store_data["auth"][i]).collection("permissions").get().then(function(querySnapshot){
                //get カウント
                if(querySnapshot.size == 0){
                    firestore_get_count += 1;
                    firestore_extra_count += 2;
                }else{
                    firestore_get_count += querySnapshot.size;
                    firestore_extra_count += (querySnapshot.size * 2);
                }
                console.log("read", firestore_get_count);
                console.log("extra", firestore_extra_count);
                querySnapshot.forEach(function(doc){
                    //insert_permissions(store_data["auth"][i], doc);
                    my_permissions[doc.data().cid].push(doc.data());
                });
            }).catch(function(error){
                console.log("error", error);
            });
        }
    }
    //model のコミュの通知を取得処理
    if(store_data["model"].length > 0){
        for(var i= 0; i< store_data["model"].length; i++){
            my_permissions[store_data["model"][i]] = [];
            db.collection("communities").doc(store_data["model"][i]).collection("permissions").where("type", "==", "join").get().then(function(querySnapshot){
                //get カウント
                if(querySnapshot.size == 0){
                    firestore_get_count += 1;
                    firestore_extra_count += 2;
                }else{
                    firestore_get_count += querySnapshot.size;
                    firestore_extra_count += (querySnapshot.size * 2);
                }
                console.log("read", firestore_get_count);
                console.log("extra", firestore_extra_count);
                querySnapshot.forEach(function(doc){
                    //insert_permissions(store_data["model"][i], doc);
                    my_permissions[doc.data().cid].push(doc.data());
                })
            }).catch(function(error){
                console.log("error", error);
            });
        }
    }
}

var my_permissions = {};

function display_permission_card(){
    //listを挿入する
    insert_permission_lists();
    //permissionを一覧するための処理
    document.getElementById("permission_list_card").style.display ="block";
    setTimeout(function(){
        //community_detail_displayを左にずらす
        document.getElementById("community_detail_display").classList.add("to_left");
        document.getElementById("permission_list_card").classList.add("active");
    },100);
}
function back_permission_card(){
    //承認ボタンは無効化する
    document.getElementById("permission_decide_dialog_button").style.display = "none";
    //拒否ボタンも
    document.getElementById("permission_reject_dialog_button").style.display = "none";
    //permissionを閉じるための処理
    document.getElementById("permission_list_card").classList.remove("active");
    //community_detail_displayを右にずらす
    document.getElementById("community_detail_display").classList.remove("to_left");
    setTimeout(function(){
        document.getElementById("permission_list_card").style.display ="none";
    },200);
}

function insert_permission_lists(){
    //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
    var active_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
    //管理 モデラー 参加 の中身をすべて空にする
    document.getElementById("permission_ul_container_auth").innerHTML = '';
    document.getElementById("permission_ul_container_model").innerHTML = '';
    document.getElementById("permission_ul_container_join").innerHTML = '';
    //役職ごとに当てはめていく
    if(user_doc_global["auth"].indexOf(active_com_id) >= 0){
        //表示を整えるための高さ調節    
        document.getElementById("permission_list_container_auth").style.height = 'auto';
        document.getElementById("permission_list_container_model").style.height = 'auto';
        document.getElementById("permission_list_container_join").style.height = 'auto';
        //コミュニティの管理者として
        document.getElementById("wana_auth_permission_text").hidden = false;
        document.getElementById("wana_model_permission_text").hidden = false;
        document.getElementById("wana_join_permission_text").hidden = false;
        //どの申請が何個あるかのカウント
        var auth_count= 0;
        var model_count= 0;
        var join_count= 0;
        //liを作って当てはめていく
        for(var i= 0; i<my_permissions[active_com_id].length; i++ ){
            //list 一つのコードが長すぎだったから分けて記述しようと思ったが、それでも長すぎやねｗ
            var list_insert = '<li class="mdc-list-item" role="checkbox" aria-checked="false" style="height: 72px"><img src="'+ my_permissions[active_com_id][i].img +'" style="height: 40px; width:40px; object-fit: cover; border-radius: 50%; margin-right: 16px;"><span class="mdc-list-item__primary-text" for="demo-list-checkbox-item-1" style="position: absolute; top: 0px; left: 72px">'+ my_permissions[active_com_id][i].name +'</span>';
            list_insert = list_insert + '<span class="mdc-list-item__secondary-text" for="demo-list-checkbox-item-1" style="position: absolute; top: 32px; left: 72px">'+ my_permissions[active_com_id][i].job +'</span><span class="mdc-list-item__graphic"><div class="mdc-checkbox" style="right: 16px; position: absolute;"><input value='+ my_permissions[active_com_id][i].uid +' type="checkbox" class="mdc-checkbox__native-control permission_check" name="permission_checkbox" />';
            list_insert = list_insert + '<div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/></svg><div class="mdc-checkbox__mixedmark"></div></div></div></span></li>';
            console.log(my_permissions[active_com_id][i].type);
            if(my_permissions[active_com_id][i].type == "auth"){
                //authのulに書き足す
                document.getElementById("permission_ul_container_auth").insertAdjacentHTML('beforeend', list_insert);
                auth_count ++;
            }else if(my_permissions[active_com_id][i].type == "model"){
                //modelのulに書き足す
                document.getElementById("permission_ul_container_model").insertAdjacentHTML('beforeend', list_insert);
                model_count ++;
            }else if(my_permissions[active_com_id][i].type == "join"){
                //joinのulに書き足す
                document.getElementById("permission_ul_container_join").insertAdjacentHTML('beforeend', list_insert);
                join_count ++;
            }else{
                console.log("what 属性の申請とか？ 変な挙動です");
            }
        }
        //申請のカウントが0のとき、追加処理する auth model join それぞれ
        if(auth_count == 0){
            //authのulに書き足す
            document.getElementById("permission_ul_container_auth").insertAdjacentHTML('beforeend', '<li class="mdc-list-item"><span class="mdc-list-item__text" style="margin: 24px;">申請なし</span></li>');
        }
        if(model_count == 0){
            document.getElementById("permission_ul_container_model").insertAdjacentHTML('beforeend', '<li class="mdc-list-item"><span class="mdc-list-item__text" style="margin: 24px;">申請なし</span></li>');
        }
        if(join_count == 0){
            document.getElementById("permission_ul_container_join").insertAdjacentHTML('beforeend', '<li class="mdc-list-item"><span class="mdc-list-item__text" style="margin: 24px;">申請なし</span></li>');
        }
    }else if(user_doc_global["model"].indexOf(active_com_id) >= 0){
        //表示を整えるための高さ調節    
        document.getElementById("permission_list_container_auth").style.height = '0px';
        document.getElementById("permission_list_container_model").style.height = '0px';
        document.getElementById("permission_list_container_join").style.height = 'auto';
        //コミュニティのモデラーとして
        console.log(active_com_id, "のモデラーです");
        document.getElementById("wana_auth_permission_text").hidden = true;
        document.getElementById("wana_model_permission_text").hidden = true;
        document.getElementById("wana_join_permission_text").hidden = false;
        //join が何個あるかカウント
        var join_count= 0;
        //liを作って当てはめていく
        for(var i= 0; i<my_permissions[active_com_id].length; i++ ){
            //list 一つのコードが長すぎだったから分けて記述しようと思ったが、それでも長すぎやねｗ
            var list_insert = '<li class="mdc-list-item" role="checkbox" aria-checked="false" style="height: 72px"><img src="'+ my_permissions[active_com_id][i].img +'" style="height: 40px; width:40px; object-fit: cover; border-radius: 50%; margin-right: 16px;"><span class="mdc-list-item__primary-text" for="demo-list-checkbox-item-1" style="position: absolute; top: 0px; left: 72px">'+ my_permissions[active_com_id][i].name +'</span>';
            list_insert = list_insert + '<span class="mdc-list-item__secondary-text" for="demo-list-checkbox-item-1" style="position: absolute; top: 32px; left: 72px">'+ my_permissions[active_com_id][i].job +'</span><span class="mdc-list-item__graphic"><div class="mdc-checkbox" style="right: 16px; position: absolute;"><input value='+ my_permissions[active_com_id][i].uid +' type="checkbox" class="mdc-checkbox__native-control permission_check" name="permission_checkbox" />';
            list_insert = list_insert + '<div class="mdc-checkbox__background"><svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/></svg><div class="mdc-checkbox__mixedmark"></div></div></div></span></li>';
            //joinのulに書き足す
            document.getElementById("permission_ul_container_join").insertAdjacentHTML('beforeend', list_insert);
            join_count ++;        
        }
        if(join_count == 0){
            document.getElementById("permission_ul_container_join").insertAdjacentHTML('beforeend', '<li class="mdc-list-item"><span class="mdc-list-item__text" style="margin: 24px;">申請なし</span></li>');
        }
    }else{
        console.log("joiner などとして処理をしているのか？、おかしい挙動");
        document.getElementById("wana_auth_permission_text").hidden = true;
        document.getElementById("wana_model_permission_text").hidden = true;
        document.getElementById("wana_join_permission_text").hidden = true;
        //特に何もしません
    }
    //作ったチェックボックスすべてにイベントを書き足していくpermission_check" name="permission_checkbox
    $('.permission_check').click(function(){
        if($('[name="permission_checkbox"]:checked').prop("checked")){
            //ボタンを有効化する
            document.getElementById("permission_decide_dialog_button").style.display = "inline-block";
            document.getElementById("permission_reject_dialog_button").style.display = "inline-block";
        }else{
            //checkedがないならボタンは無効化する
            document.getElementById("permission_decide_dialog_button").style.display = "none";
            document.getElementById("permission_reject_dialog_button").style.display = "none";
        }
    });
}

function permission_decide_dialog_display(){
    permission_decide_dialog.open();
}


function permission_decide_send(){
    console.log("decide");
    $('[name="permission_checkbox"]:checked').each(function(){
        //console.log("uid =>", r);
        //console.log("cid =>", active_com_id);
        var r = $(this).val();
        //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
        var active_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
        console.log(r, active_com_id);
        //my_permissionsからデータを取り除く
        my_permissions[active_com_id] = my_permissions[active_com_id].filter(function(value){
            return value["uid"] != r;
        });
        console.log(my_permissions);
        insert_permission_lists();
        db.collection("communities").doc(active_com_id).collection("permissions").doc(r).delete().then(function(){
            snackbar.open();
            //delete カウント
            firestore_delete_count += 1;
            //delete server side
            firestore_delete_count += 2;
            //extra rule
            firestore_extra_count += 2;
            firestore_extra_count += 2;//server sides rules
            //write server side
            firestore_write_count += 2;
            console.log("delete", firestore_delete_count);
            console.log("extra", firestore_extra_count);
            console.log("write", firestore_write_count);
        }).catch(function(error){
            console.log("error", error);
        });
    });
}

function permission_reject_dialog_display(){
    permission_reject_dialog.open();
}

function permission_reject_send(){
    console.log("reject");
    $('[name="permission_checkbox"]:checked').each(function(){
        //console.log("uid =>", r);
        //console.log("cid =>", active_com_id);
        var r = $(this).val();
        //community_li と active の二つのクラスを含む要素を取得して、その要素のidから閲覧中のコミュニティ情報をとる
        var active_com_id = document.querySelector(".community_li.active").id.split("_",3)[2];
        console.log(r, active_com_id);
        //my_permissionsからデータを取り除く
        my_permissions[active_com_id] = my_permissions[active_com_id].filter(function(value){
            return value["uid"] != r;
        });
        console.log(my_permissions);
        insert_permission_lists();
        db.collection("communities").doc(active_com_id).collection("permissions").doc(r).update({
            reject: true
        }).then(function(){
            //write カウント
            firestore_write_count += 1;
            firestore_extra_count += 2;
            console.log("write", firestore_write_count);
            db.collection("communities").doc(active_com_id).collection("permissions").doc(r).delete().then(function(){
                snackbar.open();
                //delete
                firestore_delete_count +=1;
                console.log("delete", firestore_delete_count);
            });
        }).catch(function(error){
            console.log("error", error);
        });
    });
}