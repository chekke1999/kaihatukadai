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
let now_id = 0;

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

var csv_flag = 0;

var cnt_csv = 0;


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
        "query" :"SELECT TOP " + display_num + " * FROM pi_probe;",
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

function getid(ele){

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

    // function isOpen(ws) { return ws.readyState === ws.OPEN }
    // if (!isOpen(socket)) return;

}
function pop_up(id){
    var cnt_arr = 0;
    // console.log(arr_j[id]);
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
    id = '' + cnt_arr;

    now_id = id;

    h =  day.detail[0] 
        + '/' 
        + ( '00' + day.detail[1] ).slice( -2 ) + '/' + ( '00' + day.detail[2] ).slice( -2 )
        + "  " 
        + ( '00' + day.time[0] ).slice( -2 )  + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
        +   '　基板ID.'
        +   id;

    let fuga = JSON.parse(arr_j[cnt_arr][3]);
    
    env_rh = fuga.status.hr;//湿度
    env_lux = fuga.status.luminance;//輝度
    env_atm = fuga.status.atm;//気圧
    env_temp = fuga.status.temp;//温度
    var h2  =   '気温:'
    //         +   data.arr[1]

    var env =   '気温:'
            +   env_temp
            +   '℃ / 湿度:'
            +   env_rh
            +   '% / 気圧:'
            +   env_atm
            +   'hPa';

    detail_title.insertAdjacentHTML("afterbegin", h);
    env_text.insertAdjacentHTML("afterbegin",env)


    result_generate(fuga,id);
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


    h = "SELECT * FROM pi_probe WHERE"
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
    console.log(h);
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
    console.log(now_page)
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
    // メッセージの待ち受け

    socket.onmessage = function (event) {
        var h;

        if(data_cnt == 0){
            jdata_cnt = JSON.parse(event.data);
            data_cnt_max =  jdata_cnt[1];
            data_cnt = 1;
            //console.log('全データ数:' + data_cnt_max);
        }

        if(csv_flag==1){

                console.log("ok")
                arr_j = JSON.parse(event.data);
                CSV_generate();
                csv_flag=0;
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
                // console.log(key)
                if(key == "img"){



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
    // console.log(key)
    const cnt_result = document.getElementById('cnt_result');
    const cnt_good = document.getElementById('cnt_good');
    const cnt_bad = document.getElementById('cnt_bad');

    const inpe_attach = document.getElementById('inpe_window');
    let mac_add = 0;



    var today = new Date();

    var G_B_text;


    data.date = jdata[key][2];
    
    // data.status = JSON.parse(data.arr);
    data.mac = jdata[key][1];

    data.number = key;

    (data.mac == null)? mac_add = '---':mac_add = 'A';

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
    day.week = date_week.getDay();

    // console.log(jdata[key][0])

    h = '<div id="'
    +  jdata[key][0]
    + '" class="result_element" onclick="getid(this);">'
    + '<div class="dai0_probe">'
    +   jdata[key][0]
    + '</div>'
    + '<div class="dai1_probe">'
    +   day.detail[0] + '/' + ( '00' + day.detail[1] ).slice( -2 ) + '/' +( '00' + day.detail[2] ).slice( -2 )
    + '</div>'
    + '<div class="dai2_probe">'
    + ( '00' + day.time[0] ).slice( -2 ) + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
    + '</div>'
    + '</div>';

    arr_details[key] = h;

    inpe = document.getElementById(data.number);
    // console.log(data_cnt_max[0])
    cnt_result.innerHTML = data_cnt_max;//data_cnt_max;
    arr_j[key] = jdata[key];
}

function result_generate(arr_parts,id){
    // console.log("ok")
    const table_ganerate = document.getElementById('popup_table_field');
    const prove_Fourier = document.getElementById('prove_Fourier');
    const result_attach_1 = document.getElementById('result_picture1');


    var table_element = '';
    var table_th;
    var cnt = 0;
    var MAX;
    var MIN;
    var AVG;
    var SD;
    var TP;
    var hukidasi = '<div>';

        table_th    =   '<tr><th rowspan="2">ピン名</th>\
            <th colspan="3">電圧(V)</th>\
            <th rowspan="2">標準偏差</th>\
            <th rowspan="2">シミュレーション比較(%)</th></tr>\
            <tr><th>最大</th><th>最小</th><th>平均</th></tr>';

        let    HH =  '<button id="download" type="button" onclick="downloadCSV(1)">Download CSV</button></br>'

        // console.log(arr_parts["measured_value"][9]) 
        
        for(var key in arr_parts["measured_value"]){
            for(var key2 in arr_parts["measured_value"][key]){
                if(key2 == "MAX"){
                    MAX = arr_parts["measured_value"][key][key2];
                }else if(key2 == "MIN"){
                    MIN = arr_parts["measured_value"][key][key2];
                }else if(key2 == "AVG"){
                    AVG = arr_parts["measured_value"][key][key2];
                }else if(key2 == "SD"){
                    SD = arr_parts["measured_value"][key][key2];
                }else if(key2 == "TP"){
                    TP = arr_parts["measured_value"][key][key2];
                }
                if(key == 10 || key >= 12){
                    TP = "---";
                    hukidasi = '<div>'
                }else{
                    hukidasi = '<div class="css-fukidashi">'
                }
                // console.log(arr_parts["measured_value"][key][key2])
            }
            table_element   =   table_element + '<tr class="pro' + key +'"><td >' + key + '</td><td>' + MAX + '</td><td>' + MIN + '</td><td>' + AVG + '</td><td>' + SD + '</td><td>' + TP + '</td>'+'</tr>';
        }

        for(var key in arr_parts){　
            var arr_key = arr_parts[key]
            for(var key in arr_key["9"]){
                // console.log(key)
            }
                
            cnt++;
        }
        table_ganerate.insertAdjacentHTML("beforeend",table_th +table_element);
        table_element = '';

    var p =    '<image src="'
    +   'img_pro.png'
    +   '" class="picture_1">';
    result_attach_1.insertAdjacentHTML("afterbegin", p+HH);
}

function cookie_probe(id,pin){
    var prove_Fourier = document.getElementById("prove_Fourier");
    const fourier_PP = document.getElementById('fourier_PP');
    // fourier_PP.innerHTML = "hello" + pin;

    console.log(JSON.parse(arr_j[id][3])["measured_value"][pin]["adc_data"])

    let arr_fourier = [0];
    let arr_no = [0];
    let arr_lenght = JSON.parse(arr_j[id][3])["measured_value"][pin]["adc_data"].length;

    for(let i = 0;i<arr_lenght;i++){
        arr_fourier[i] =  JSON.parse(arr_j[id][3])["measured_value"][pin]["adc_data"];
        arr_no[i] = i;
    }

    var myLineChart = new Chart(prove_Fourier, {
        type: 'line',
        data: {
            labels: arr_no,
            datasets: [
            {
                label: '気温(度)',
                data: arr_fourier,
                borderColor: "rgba(244,67,22,1)",
                backgroundColor: "rgba(0,0,0,0)"
            }]
        },
        options: {
            title: {
                display: true
            },elements: {
                point:{
                radius: 0
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                    suggestedMax: 40,
                    suggestedMin: 0,
                    stepSize: 0.1,
                    callback: function(value, index, values){
                        return  value +  '度'
                    }
                }
            }],
            xAxes:[{
                ticks:{
                    minRotation: 0,   // ┐表示角度水平
                    maxRotation: 0,   // ┘
                    autoSkip: true,  //なくてもよい
                    maxTicksLimit: 15
                }
            }]
            
            },
        }
        });
    
}

function downloadCSV() {
    console.log("551515")
    num_50_flag = 1;
    csv_flag = 1;
        
        
    h = "SELECT * FROM pi_probe;"

    const req_3 = {
        "sql" : {
            "db":"piscan",
            "query" :h,
            "commit":false
        }
    }

    socket.send(JSON.stringify(req_3)); 
    
}

function CSV_generate(){
    if(cnt_csv == 0){
        cnt_csv = 1;
    console.log("okokoookooko")
    // console.log(arr_j)
    //ダウンロードするCSVファイル名を指定する
    const filename = "download.csv";
    //CSVデータ

    let dataCSV_new = now_id + "\n"
    dataCSV_new = dataCSV_new + "id,MACアドレス,日付,時間,気温(度),湿度(%),気圧(hPa),輝度(lx),";

    let csv_time = 0;
    let csv_date = 0;
    let csv_parts = new Object();
    let csv_parts_text = "";
    let csv_number = "時間(t)\n";
    let csv_pinname =   "No,電極9(V),電極10(V),電極11(V),電極12(V),電極13(V)";

    let csv_status = new Object();
    let parts_flag = 0;
    let a_search = 0;

    var arr_temp = "";
    var i = 0;


console.log(jdata[1])
        // for(var key in jdata[1]){
            console.log(JSON.parse(jdata[now_id][3])["measured_value"][9]["adc_data"][1]);
            // console.log(key);
            for(i = 0; i <= 255 ; i++){
                arr_temp = arr_temp + i + ", ";
                arr_temp = arr_temp + JSON.parse(jdata[now_id][3])["measured_value"][9]["adc_data"][i] + ", ";
                arr_temp = arr_temp + JSON.parse(jdata[now_id][3])["measured_value"][10]["adc_data"][i] + ", ";
                arr_temp = arr_temp + JSON.parse(jdata[now_id][3])["measured_value"][11]["adc_data"][i] + ", ";
                arr_temp = arr_temp + JSON.parse(jdata[now_id][3])["measured_value"][12]["adc_data"][i] + ", ";
                arr_temp = arr_temp + JSON.parse(jdata[now_id][3])["measured_value"][13]["adc_data"][i] + ", " + "\n";
                // console.log(arr_temp[i])
            }


            
        // }
        arr_temp = arr_temp + "\n";
        console.log(arr_temp)
        
        for(let key in arr_j){
            csv_parts[key] = JSON.parse(arr_j[key][3]).parts;
            if(parts_flag == 0){
                for(let key2 in csv_parts[key]){
                    dataCSV_new = dataCSV_new + key2 + ",";
                }
                dataCSV_new = dataCSV_new + "\n";
                parts_flag = 1;
            }
        }

    ////CSVをがんばってつくるところ////
        csv_time = arr_j[1][2];
        csv_date = csv_time.split('T');
        csv_time = csv_date[1].split('.');
        
        csv_parts[1] = JSON.parse(arr_j[1][3]).parts;

        for(let key2 in csv_parts[1]){
            for(let key3 in csv_parts[1][key2]){
                if(key3 == a){
                    a_search++;
                }
            }
        }

        // if(a_search == 0){
        //     alert(inspectionIndex({name: a})+'の検査結果はありません');
        //     return 0;
        // }


        for(let key2 in csv_parts[1]){
            
            // csv_parts_text = csv_parts_text + csv_parts[key][key2]+","

            csv_parts_text  =   csv_parts_text + "{"
                            +   csv_parts[1][key2][a][0]
                            +   "."
                            +   csv_parts[1][key2][a][1] + "},"

        }


        for(i = 0; i <= arr_temp.length ; i++){
            csv_parts_text = csv_parts_text + arr_temp[i] + "\n";
            csv_number = csv_number + i + "\n"; 
        }


        csv_status[1] = JSON.parse(arr_j[1][3]).status;


        if(isNaN(csv_status[1].luminance) == true){
            csv_status[1].luminance = 0;
        }


    
    console.log(arr_temp.length)

    dataCSV_new = dataCSV_new 
                + arr_j[1][0] + ", " 
                + arr_j[1][1]+ ", " 
                +csv_date[0] + ", " 
                +csv_time[0] + ", " 
                +csv_status[1].temp + ", " 
                +csv_status[1].hr + ", " 
                +csv_status[1].atm + ", " 
                +csv_status[1].luminance + ", " 
                +"\n"
                +csv_pinname
                +"\n"
                // +csv_number 
                // +"\n"+ ", "
                +arr_temp
                +"\n";
    csv_parts_text="";

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

    return 0;
}
}