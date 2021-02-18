const socket = new WebSocket('ws://192.168.11.199:8080');
let xhr = new XMLHttpRequest()
xhr.responseType="";

let arr_j = [];
var day = new Object();
var data = new Object();
var id_value;
var page_cnt;
var cnt_b = 0;
var cnt_g = 0;

var display_num = 10;　/////データ表示数


let arr_details = [];

var now_page = 1;
var cnt = 0;
var data_cnt = 0;
var data_cnt_max = 0;
var ccc = 0;

let inpe;
let inpe_num = 0;

let env_rh = 0;
let env_lux = 0;
let env_atm = 0;
let env_temp = 0;
let arr_parts = 0;
let page_cnt_arr = 0;
var hoge;

var now_page_cnt = 0;


const inspectionList = [
    { name: "mounted_parts", display: '検査項目：部品の位置' },
    { name: "misalignment", display: '検査項目：部品の値・型' },
    { name: "angle", display: '検査項目：部品の傾き' },
    { name: "foreign_matter", display: '検査項目：異物'},
    { name: "scratch", display: '検査項目：傷'},
    { name: "soiled", display: '検査項目：汚れ'}
  ];

var filename = 'test_CSV';


function getCookieArray(){
    var arr = new Array();
    if(document.cookie != ''){
      var tmp = document.cookie.split('; ');
      for(var i=0;i<tmp.length;i++){
        var data = tmp[i].split('=');
        arr[data[0]] = decodeURIComponent(data[1]);
      }
    }
    return arr;
}

if(document.cookie == ""){
    display_num = 50;
}else{
    var arr = getCookieArray();
    var result = arr["display_num"];
    //console.log(result)
    display_num = result;
}



function check(){
    if(input_message.value == ""){
        display_num = display_num
    }else if(input_message.value > data_cnt_max){
        display_num = data_cnt_max;
    }else{
        display_num = input_message.value;
    }

    //console.log(display_num);
    document.cookie = "display_num=" + display_num;
    //console.log("cookie=" +document.cookie);
    location.reload();
    page_generate();
}


const inspectionIndex = inspection => {
    const inspectionNumber = inspectionList.find(p => p.name === inspection.name).display;
  
    return inspectionNumber;
};
  


const req = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT TOP " + display_num + " scan_id,plc_mac,datetime,scan_data FROM pi_camera;",
        "commit":false
    }
}

const req3 = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT COUNT(*) FROM pi_camera;",
        "commit":false
    }
}




// 接続が開いたときのイベント
socket.onopen = function (event) {

    if(data_cnt == 0){
        socket.send(JSON.stringify(req3)); 
        
    }
    socket.send(JSON.stringify(req)); 
};

function getId(ele){

    //console.log(ele.id)
    let box = document.getElementById("box");//読み込みたい位置を指定

    let h;
	xhr.open("GET", "./parts.html", true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
            let restxt=xhr.responseText;//重要
            //console.log(restxt);
            box.insertAdjacentHTML("afterbegin", restxt);
            pop_up(id_value)
		}
	};
    xhr.send();
    id_value = ele.id; // eleのプロパティとしてidを取得
    

    //console.log(id_value); //「id01」
    const req2 = {
        "get_img" : {
            "db":"piscan",
            "id":id_value
        }
    }
    socket.send(JSON.stringify(req2)); 
}
function pop_up(id_value){
    var cnt_arr = 0;
    const detail_title = document.getElementById('detail_title');
    const env_text = document.getElementById('env_text');

        cnt_arr = Number(id_value) - Number(now_page_cnt);

        // console.log(arr_j[cnt_arr][3]);

        data.arr = arr_j[cnt_arr][3];
        data.date = arr_j[cnt_arr][2];
        data.status = JSON.parse(data.arr);
        data.type = data.status.type;
        data.number = cnt_arr;
        let O_N = 0;

        day = data.date.split('T');
        day.date = day[0];
        day.hours = day[1];

        day.detail = day.date.split("-");
        day.time = day.hours.split(":");
        day.time[2] = Math.floor(day.time[2]);

        // arr_j[id_value][3]
        let arr_table = arr_j[cnt_arr][3];
        arr_table = JSON.parse(arr_table)
        let id = 'P' + id_value;


        let fuga = JSON.parse(arr_j[cnt_arr][3]);

        env_rh = fuga.status.hr;//湿度
        env_lux = fuga.status.luminance;//輝度
        env_atm = fuga.status.atm;//気圧
        env_temp = fuga.status.temp;//温度

    h =  day.detail[0] 
        + '/' 
        + ( '00' + day.detail[1] ).slice( -2 ) + '/' + ( '00' + day.detail[2] ).slice( -2 )
        + "  " 
        + ( '00' + day.time[0] ).slice( -2 )  + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
        +   '　基板ID.'
        +   id;

    // var h2  =   '気温:'
    //         +   data.arr[1]

    var env =   '気温:'
            +   env_temp
            +   '℃ / 湿度:'
            +   env_rh
            +   '% / 気圧:'
            +   env_atm
            +   'hPa / 輝度:'
            // +   env_lux
            +   496.487
            +   'lx / 基板タイプ:'
            +   data.type;
    // console.log(env_text);
    detail_title.insertAdjacentHTML("afterbegin", h);
    env_text.insertAdjacentHTML("afterbegin",env)

    hoge = JSON.parse(arr_j[cnt_arr][3]);

    result_generate(hoge.parts);
}


function page_html_send(ele){


    let box = document.getElementById("inpe_window");//読み込みたい位置を指定
    const add_details = document.getElementById("add_details");


    const add_page = document.getElementById("add_page");

    add_details.remove();
    add_page.remove();

    let last_get_page = 0;

    now_page_cnt = (now_page - 1) * display_num;
    let h;

    if(now_page == page_cnt){
        last_get_page = data_cnt_max % display_num + now_page_cnt;

    }else{
        last_get_page = (now_page_cnt + parseInt(display_num));
    }

    for(i in arr_details){
        arr_details[i] = '';
    }


    h = "SELECT scan_id,plc_mac,datetime,scan_data FROM pi_camera WHERE"
        +   " scan_id > "
        +   now_page_cnt
        +   " AND scan_id <= "
        +   last_get_page
        +   ";"

    const req_2 = {
        "sql" : {
            "db":"piscan",
            "query" :h,
            "commit":false
        }
    }
    cnt_b = 0;
    cnt_g = 0;

    socket.send(JSON.stringify(req_2)); 
    cnt = 0;
    window.scrollTo(0, 0);  //ページ上部に移動
    page_generate();
}

function getId_close(){
    const element = document.querySelector('section');
    element.remove();
}

window.addEventListener('beforeunload', function(e){
  /** 更新される直前の処理 */
  socket.close();
});


function page_Move(ele){
    page_cnt_arr++;
    now_page = ele;
    page_html_send();
}

function page_generate(){
    
    const pages_attach = document.getElementById('nav-links');

    var i = 0;
    var previous_page;
    (now_page <= 1)? previous_page = 1:previous_page = now_page - 1 ;

    var data_division = 0;
    var page_html = '<div id="add_page"><ul>';
    var for_num = 1;
    var i_cnt = 1;
    var ten_page = 10;

    (data_cnt_max % display_num == 0)? data_division = page_cnt - 1:data_division = page_cnt;


    if(now_page >= 7){
        for_num = now_page - 5;
        if(now_page + 4 > data_division){
            for_num = data_division - 9;
            data_division
        }
    }
    
    if(data_division < 10){
        ten_page = data_division;
    }

    for(i=for_num;i_cnt<=ten_page;i++){
        i_cnt++;
        if(i == now_page){
            page_html   =   page_html +   '<li class="page_box detail_link_current" onclick="page_Move(' + i + ');">' + i + '</li>';
        }else{
            page_html   =   page_html + '<li class="page_box" onclick="page_Move(' + i + ');">' + i　+ '</li>';
        }   
    }
    page_html   =   page_html +'</ul><div>';
    pages_attach.insertAdjacentHTML("afterbegin", page_html);
}


window.onload = function (e) {
    const disp_num = document.getElementById('disp_num');

    var cnt_page_processing = 0;
    let box = document.getElementsByClassName('container')[0];//読み込みたい位置を指定
    const inpe_attach = document.getElementById('inpe_window');

	xhr.open("GET", "./menu.html", true);
	xhr.onreadystatechange = function () {
		if(xhr.readyState === 4 && xhr.status === 200) {
            let restxt = xhr.responseText;//重要
            box.insertAdjacentHTML("afterbegin", restxt);
		}
	};
    xhr.send();
    
    // const result_attach_2 = document.getElementById('result_picture2');
    // メッセージの待ち受け
    socket.onmessage = function (event) {
        var h;

        if(data_cnt == 0){
            jdata_cnt = JSON.parse(event.data);
            data_cnt_max =  jdata_cnt[1];
            //console.log(data_cnt_max);
            data_cnt = 1;
            // console.log('全データ数:' + data_cnt_max);
        }



        (data_cnt_max >= 50)?display_num = 50:display_num = data_cnt_max;
        

        (display_num > data_cnt_max)?display_num = data_cnt_max:display_num = display_num;


        if(cnt_page_processing==0){
            var page_max_text;
            cnt_page_processing = 1;
            page_cnt = parseInt(jdata_cnt[1] / display_num) + 1 ;
            //page_cnt = 6;
            page_generate(page_cnt);
        }else{
            jdata = JSON.parse(event.data);

            for(var key in jdata){
                if(key == "img"){

                    const result_attach_1 = document.getElementById('result_picture1');
                    const result_attach_2 = document.getElementById('result_picture2');
                    var p =    '<image src="data:image/png;base64,'
                    +   jdata["img"][0]
                    +   '" class="picture_1">';

                    var p2 =    '<image src="data:image/png;base64,'
                    +   jdata["img"][1]
                    +   '" class="picture_2">';
                    result_attach_1.insertAdjacentHTML("afterbegin", p);
                    result_attach_2.insertAdjacentHTML("afterbegin", p2);

                }else{
                    html_generate(key,jdata,event);
                    
                    //console.log(jdata[key])
                }

            }

        if(cnt == 0){
            
            h = '<div id="add_details">'
            + arr_details.join("") ;
            +'</div>';
            inpe_attach.insertAdjacentHTML("afterbegin", h);
            cnt = 1;

        }
    }
    }
    const download = document.getElementById("download");
    //ボタンがクリックされたら「downloadCSV」を実行する
    download.addEventListener("click", downloadCSV, false);


}
function html_generate(key,jdata,event){
    //key = Number(now_page_cnt) + Number(key);

    // const search_date_o = document.getElementById('S_date_year_old');
    // const search_date_n = document.getElementById('S_date_year_new');
    // const search_time_o = document.getElementById('S_date_start_H');
    // const search_time_n = document.getElementById('S_date_now_H');
    const cnt_result = document.getElementById('cnt_result');
    const cnt_good = document.getElementById('cnt_good');
    const cnt_bad = document.getElementById('cnt_bad');

    const inpe_attach = document.getElementById('inpe_window');


    var today = new Date();

    var G_B_text;

    // search_date_o.value = "*";
    // search_date_n.value = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate();
    // search_time_o.value = "00:00";
    // search_time_n.value = today.getHours() + ":" + today.getMinutes();
    //console.log(key);
    
    data.arr = JSON.parse(event.data)[key][3];

    data.date = jdata[key][2];
    // console.log(data.arr)
    data.status = JSON.parse(data.arr);
    data.type = data.status.type;

   　//console.log(jdata[key]);
    data.number = key;
    let O_N = 0;

    day = data.date.split('T');
    day.date = day[0];
    day.hours = day[1];

    day.detail = day.date.split("-");
    day.time = day.hours.split(":");
    day.time[2] = Math.floor(day.time[2]);

    var yearStr = day.detail[0] ;
    var monthStr = day.detail[1] ;
    var dayStr = day.detail[2];
    var jsMonth = monthStr - 1 ;
    var date_week = new Date( yearStr, jsMonth , dayStr );
    // console.log(dayOfWeekStrJP[date_week.getDay()] + '曜日');
    day.week = date_week.getDay();

    var false_cnt = 0;
    var gb_t = '';
    false_cnt = jdata[key][3].indexOf(-1);

    if(false_cnt <= 0){
        O_N = '〇';
        cnt_g++;
        G_B_text = '<div class="dai4">'
    }else{
        O_N = '×';
        cnt_b++;
        G_B_text = '<div class="dai4 bad">'
        gb_t = 'bad';
    }

    arr_j[key] = jdata[key];


    // console.log(jdata[key])
    


    h = '<div id="'
    +  arr_j[key][0]
    + '" class="result_element '
    + gb_t
    + '" onclick="getId(this);">'
    + '<div class="dai0">'
    +   String(arr_j[key][0])
    + '</div>'
    + '<div class="dai1">'
    +   day.detail[0] + '/' + ( '00' + day.detail[1] ).slice( -2 ) + '/' +( '00' + day.detail[2] ).slice( -2 )
    + '</div>'
    + '<div class="dai2">'
    + ( '00' + day.time[0] ).slice( -2 ) + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
    + '</div>'
    + '<div class="dai3">'
    + data.type
    + '</div>'
    + G_B_text
    + O_N
    + '</div>'
    + '</div>';



    arr_details[key] = h;

    inpe = document.getElementById(data.number);

    cnt_result.innerHTML = data_cnt_max;//data_cnt_max;
    cnt_good.innerHTML = cnt_g;
    cnt_bad.innerHTML = cnt_b;
}
function result_generate(arr_parts){
    const table_ganerate = document.getElementById('popup_table_field');
    var table_element = '';
    var table_th;
    var f_t = 0;
    var font_red_x = '';
    var font_red_y = '';
    var i;
    var cnt = 0;
    var insp = '';
    var x = 0;
    var y = 0;

    for(var key in arr_parts){
        var arr_key = arr_parts[key];
    }
    for(i=0;i<Math.max(Object.keys(arr_key).length);i++){
        const inspection = {
            name: Object.keys(arr_key)[i]
        };
        insp = Object.keys(arr_key)[i];

            table_th    =   '<div class="popup_inspection_name">'
            +    inspectionIndex(inspection)
            +   '</div>';


        table_ganerate.insertAdjacentHTML("beforebegin",table_th);

        table_th    =   '<tr><th>部品名</th><th>X軸</th><th>Y軸</th><th>判定</th></tr>';

        for(var key in arr_parts){
            var arr_key = arr_parts[key]
            if (insp in arr_key) {
                for(i = 0;i < 2;i++){
                    if(arr_key[insp][0] > -1){
                        x = arr_key[insp][0];
                    }else{
                        x = "×";
                    }

                    if(arr_key[insp][1] > -1){
                        y = arr_key[insp][1];
                    }else{
                        y = "×";
                    }

                    false_cnt = arr_key[insp].indexOf(-1);
                }
                if(false_cnt == -1){
                    f_t = "〇";
                    font_red = 'class="font_green"'
                }else{
                    f_t = "×";
                    font_red = 'class="font_red"';
                }
                table_element   =   table_element + '<tr ' + font_red +'><td>' + key + '</td><td ' + font_red_x + '>' + x + '</td><td>' + y + '</td><td>' + f_t + '</td></tr>';
                
                font_red = '';
            }
            cnt++;
        }
        table_element = table_element + "</table></div>";
        table_ganerate.insertAdjacentHTML("beforeend",table_th + table_element);
        table_element = '';
    }
}


//jsonをcsv文字列に編集する
function jsonToCsv(json, delimiter) {
    //console.log("ok");
    //console.log(json);
    var header = [];
    for(var key in arr_j){
        header[key] = arr_j[key] + '\n';
        //console.log(arr_j[key]);
    }
    // console.log(header);

    return header;
}

//csv変換
function exportCSV(items, delimiter, filename) {

    //文字列に変換する
    var csv = jsonToCsv(items, delimiter);
    //console.log(csv);

    //拡張子
    var extention = delimiter==","?"csv":"tsv";

    //出力ファイル名
    var exportedFilenmae = (filename  || 'export') + '.' + extention;

    //BLOBに変換
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    if (navigator.msSaveBlob) { // for IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
        //anchorを生成してclickイベントを呼び出す。
        var link = document.createElement("a");
        if (link.download !== undefined) {
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilenmae);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

var filename = 'testCSV';

function output(){
    console.log("クリックok");
    exportCSV(arr_j,',', filename);
    console.log("処理完了")
}

// const timer = 6000;    // ミリ秒で間隔の時間を指定
// window.addEventListener('load',function(){
//   setInterval('location.reload()',timer);
// });




function downloadCSV() {
    console.log("ok")

    h = "SELECT scan_id,plc_mac,datetime,scan_data FROM pi_camera;"

    const req_3 = {
        "sql" : {
            "db":"piscan",
            "query" :h,
            "commit":false
        }
    }

    socket.send(JSON.stringify(req_3)); 

    socket.onmessage = function (event) {
            console.log("ok")
            arr_j = JSON.parse(event.data);
            CSV_generate();
    }

}

function CSV_generate(){
    
    console.log("clickok")
    csv_flag = 1;
    //ダウンロードするCSVファイル名を指定する
    const filename = "download.csv";
    //CSVデータ
    const dataCSV = [
        {num:1,time:"20:11",R1:12},
        {num:2,time:"20:11",R1:12},
        {num:3,time:"20:11",R1:12},
        {num:4,time:"20:11",R1:12},
        {num:5,time:"20:11",R1:12},
        {num:6,time:"20:11",R1:12},
    ];

    let dataCSV_new = "id,MACアドレス,日付,時間,気温,湿度,気圧\n";

    let csv_time = 0;
    let csv_date = 0;
    let csv_parts = new Object();
    let csv_parts_text = "";

    let csv_status = new Object();
    

    ////CSVをがんばってつくるところ////
    for(let key in arr_j){
        csv_time = arr_j[key][2];
        csv_date = csv_time.split('T');
        csv_time = csv_date[1].split('.');
        
        csv_parts[key] = JSON.parse(arr_j[key][3]).parts;

        for(let key2 in csv_parts[key]){
            // csv_parts_text = csv_parts_text + csv_parts[key][key2]+","

            csv_parts_text  =   csv_parts_text + "{"
                            +   csv_parts[key][key2]["mounted_parts"][0].replace(/{/g, ' ')
                            +   "."
                            +   csv_parts[key][key2]["mounted_parts"][1] + "},"
                            console.log(csv_parts[key][key2]["mounted_parts"][0])
        }

        console.log("-------------------");

        csv_status[key] = JSON.parse(arr_j[key][3]).status;

        dataCSV_new = dataCSV_new 
                    + arr_j[key][0] + ", " 
                    + arr_j[key][1]+ ", " 
                    +csv_date[0] + ", " 
                    +csv_time[0] + ", " 
                    +csv_status[key].temp + ", " 
                    +csv_status[key].hr + ", " 
                    +csv_status[key].atm + ", " 
                    +csv_parts_text
                    +"\n";
        csv_parts_text="";
    }
    // console.log(dataCSV_new)
    // for(let key in dataCSV){
    //     for(let key2 in dataCSV[key]){
    //         dataCSV_new = dataCSV_new + dataCSV[key][key2] + ","
    //     }
    //     dataCSV_new = dataCSV_new + "\n";
    // }
    ///////がんばって作り終わった//////

    //BOMを付与する（Excelでの文字化け対策）
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    //Blobでデータを作成する
    const blob = new Blob([bom, dataCSV_new], { type: "text/csv"});

    //IE10/11用(download属性が機能しないためmsSaveBlobを使用）
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename);
    //その他ブラウザ
    } else {
        //BlobからオブジェクトURLを作成する
        const url = (window.URL || window.webkitURL).createObjectURL(blob);
        //ダウンロード用にリンクを作成する
        const download = document.createElement("a");
        //リンク先に上記で生成したURLを指定する
        download.href = url;
        //download属性にファイル名を指定する
        download.download = filename;
        //作成したリンクをクリックしてダウンロードを実行する
        download.click();
        //createObjectURLで作成したオブジェクトURLを開放する
        (window.URL || window.webkitURL).revokeObjectURL(url);
    }
}