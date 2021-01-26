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
        "query" :"SELECT * FROM pi_probe;",
        "commit":false
    }
}

const req3 = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT COUNT(*) FROM pi_probe;",
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
    //console.log("現在のページ = " + last_get_page);
    cnt_b = 0;
    cnt_g = 0;
    // console.log(h)
    // console.log(now_page_cnt)
    // console.log(page_cnt)
    // console.log(last_get_page)
    // console.log(display_num)

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
    //document.cookie = "page"+ page_cnt_arr + "=" + now_page;
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
    // console.log(display_num);

    //console.log(data_division);

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
    // console.log(ten_page)
}


window.onload = function (e) {

    if(document.cookie == ""){
        display_num = 50;
    }else{
        var arr = getCookieArray();
        var result = arr["display_num"];
        //console.log(result)
        display_num = result;
    }

    console.log("display_num=" + display_num);

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
            data_cnt = 1;
            //console.log('全データ数:' + data_cnt_max);
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
                    var cnt_arr = 0;

                    const result_attach_1 = document.getElementById('result_picture1');
                    const result_attach_2 = document.getElementById('result_picture2');
                    const detail_title = document.getElementById('detail_title');
                    const env_text = document.getElementById('env_text');
                    let mac_add = '';

                    cnt_arr = Number(id_value) - Number(now_page_cnt);

                    data.arr = arr_j[cnt_arr][3];
                    data.date = arr_j[cnt_arr][2];
                    data.status = JSON.parse(data.arr);
                    data.type = data.status.type;
                    data.number = cnt_arr;
        
                    day = data.date.split('T');
                    day.date = day[0];
                    day.hours = day[1];
        
                    day.detail = day.date.split("-");
                    day.time = day.hours.split(":");
                    day.time[2] = Math.floor(day.time[2]);

                    data.mac = arr_j[cnt_arr][1];
                    (data.mac == null)? mac_add = '――':mac_add = 'A';

                    // arr_j[id_value][3]
                    let arr_table = arr_j[cnt_arr][3];
                    arr_table = JSON.parse(arr_table)
                    let id = '' + id_value;

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
                            +   env_lux
                            +   'lx / 検査ステーション:'
                            +   mac_add;

                    detail_title.insertAdjacentHTML("afterbegin", h);
                    env_text.insertAdjacentHTML("afterbegin",env)

                    hoge = JSON.parse(arr_j[cnt_arr][3]);
                    // console.log(hoge.measured_value);
                    result_generate(hoge);

                }else{
                    html_generate(key,jdata,event);
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

}
function html_generate(key,jdata,event){
    const cnt_result = document.getElementById('cnt_result');
    const cnt_good = document.getElementById('cnt_good');
    const cnt_bad = document.getElementById('cnt_bad');

    const inpe_attach = document.getElementById('inpe_window');
    let mac_add = 0;

    


    var today = new Date();

    var G_B_text;

    
    data.arr = JSON.parse(event.data)[key][3];

    data.date = jdata[key][2];
    
    data.status = JSON.parse(data.arr);
    data.mac = jdata[key][1];

    data.number = key;

    (data.mac == null)? mac_add = '---':mac_add = 'A';

    day = data.date.split('T');
    day.date = day[0];
    day.hours = day[1];

    day.detail = day.date.split("-");
    day.time = day.hours.split(":");
    day.time[2] = Math.floor(day.time[2]);


    arr_j[key] = jdata[key];

    //console.log(jdata[key])
    
    let fuga = JSON.parse(jdata[key][3]);

    env_rh = fuga.status.hr;//湿度
    env_lux = fuga.status.luminance;//輝度
    env_atm = fuga.status.atm;//気圧
    env_temp = fuga.status.temp;//温度

    var yearStr = day.detail[0] ;
    var monthStr = day.detail[1] ;
    var dayStr = day.detail[2];
    var jsMonth = monthStr - 1 ;
    var date_week = new Date( yearStr, jsMonth , dayStr );
    day.week = date_week.getDay();

    h = '<div id="'
    +  arr_j[key][0]
    + '" class="result_element" onclick="getId(this);">'
    + '<div class="dai0_probe">'
    +   String(arr_j[key][0])
    + '</div>'
    + '<div class="dai1_probe">'
    +   day.detail[0] + '/' + ( '00' + day.detail[1] ).slice( -2 ) + '/' +( '00' + day.detail[2] ).slice( -2 )
    + '</div>'
    + '<div class="dai2_probe">'
    + ( '00' + day.time[0] ).slice( -2 ) + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
    + '</div>'
    + '<div class="dai3_probe">'
    + mac_add
    + '</div>'
    + '</div>';

    arr_details[key] = h;

    inpe = document.getElementById(data.number);
    console.log(data_cnt_max[0])
    cnt_result.innerHTML = data_cnt_max;//data_cnt_max;
}

function result_generate(arr_parts){
    const table_ganerate = document.getElementById('popup_table_field');
    const result_attach_1 = document.getElementById('result_picture1');
    var table_element = '';
    var table_th;
    var cnt = 0;

    console.log(arr_parts[14]);


        table_th    =   '<div class="popup_inspection_name">'
            +   '電圧・周波数測定'
            +   '</div><div class="popup_table"><table border="1"><tr><th>ピン名</th><th>電圧</th><th>周波数</th></tr>';

        console.log(arr_parts)  

        for(var key in arr_parts){
            var arr_key = arr_parts[key]
            console.log(arr_key[key]);
            console.log(arr_key);
                table_element   =   table_element + '<tr><td>' + key + '</td><td>' + arr_key["Voltage"] + '</td><td>' + arr_key["Frequency"] + '</td></tr>';
            cnt++;
        }
        table_element = table_element + "</table></div>";
        table_ganerate.insertAdjacentHTML("beforeend",table_th + table_element);
        table_element = '';
        
    var p =    '<image src="'
    +   'img_pro.png'
    +   '" class="picture_1">';
    result_attach_1.insertAdjacentHTML("afterbegin", p);
}


//jsonをcsv文字列に編集する
function jsonToCsv(json, delimiter) {
    var header = [];
    for(var key in arr_j){
        header[key] = arr_j[key] + '\n';
    }

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
    exportCSV(arr_j,',', filename);
}

// const timer = 6000;    // ミリ秒で間隔の時間を指定
// window.addEventListener('load',function(){
//   setInterval('location.reload()',timer);
// });

