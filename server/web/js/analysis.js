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
        "query" :"SELECT * FROM pi_camera;",
        "commit":false
    }
}




// 接続が開いたときのイベント
socket.onopen = function (event) {

    if(data_cnt == 0){
        socket.send(JSON.stringify(req3)); 
        
    }
    console.log(req3)
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

    console.log(data_division);

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
    func1();
    chart_generate();


    // // const result_attach_2 = document.getElementById('result_picture2');
    // // メッセージの待ち受け
    // socket.onmessage = function (event) {
    //     var h;

    //     if(data_cnt == 0){
    //         jdata_cnt = JSON.parse(event.data);
    //         data_cnt_max =  jdata_cnt[1];
    //         //console.log(data_cnt_max);
    //         data_cnt = 1;
    //         // console.log('全データ数:' + data_cnt_max);
    //     }

    //     (data_cnt_max >= 50)?display_num = 50:display_num = data_cnt_max;
        

    //     (display_num > data_cnt_max)?display_num = data_cnt_max:display_num = display_num;


    //     if(cnt_page_processing==0){
    //         var page_max_text;
    //         cnt_page_processing = 1;
    //         page_cnt = parseInt(jdata_cnt[1] / display_num) + 1 ;
    //         //page_cnt = 6;
    //         page_generate(page_cnt);
    //     }else{
    //         jdata = JSON.parse(event.data);

    //         for(var key in jdata){
    //             if(key == "img"){

    //                 var cnt_arr = 0;

    //                 const result_attach_1 = document.getElementById('result_picture1');
    //                 const result_attach_2 = document.getElementById('result_picture2');
    //                 const detail_title = document.getElementById('detail_title');
    //                 const env_text = document.getElementById('env_text');

    //                 var p =    '<image src="data:image/png;base64,'
    //                         +   jdata["img"][0]
    //                         +   '" class="picture_1">';

    //                 var p2 =    '<image src="data:image/png;base64,'
    //                         +   jdata["img"][1]
    //                         +   '" class="picture_2">';

    //                     // console.log(id_value);

    //                     cnt_arr = Number(id_value) - Number(now_page_cnt);
    //                     // console.log(cnt_arr);
    //                     // console.log(arr_j[cnt_arr][3]);

    //                     data.arr = arr_j[cnt_arr][3];
    //                     data.date = arr_j[cnt_arr][2];
    //                     data.status = JSON.parse(data.arr);
    //                     data.type = data.status.type;
    //                     data.number = cnt_arr;
    //                     let O_N = 0;
            
    //                     day = data.date.split('T');
    //                     day.date = day[0];
    //                     day.hours = day[1];
            
    //                     day.detail = day.date.split("-");
    //                     day.time = day.hours.split(":");
    //                     day.time[2] = Math.floor(day.time[2]);



    //                     // arr_j[id_value][3]
    //                     let arr_table = arr_j[cnt_arr][3];
    //                     arr_table = JSON.parse(arr_table)
    //                     let id = 'P' + id_value;

    //                 h =  day.detail[0] 
    //                     + '/' 
    //                     + ( '00' + day.detail[1] ).slice( -2 ) + '/' + ( '00' + day.detail[2] ).slice( -2 )
    //                     + "  " 
    //                     + ( '00' + day.time[0] ).slice( -2 )  + ':' + ( '00' + day.time[1] ).slice( -2 ) + ':' + ( '00' + day.time[2] ).slice( -2 )
    //                     +   '　基板ID.'
    //                     +   id;

    //                 // var h2  =   '気温:'
    //                 //         +   data.arr[1]

    //                 var env =   '気温:'
    //                         +   env_temp
    //                         +   '℃ / 湿度:'
    //                         +   env_rh
    //                         +   '% / 気圧:'
    //                         +   env_atm
    //                         +   'hPa / 輝度:'
    //                         +   env_lux
    //                         +   'lx / 基板タイプ:'
    //                         +   data.type;

    //                 detail_title.insertAdjacentHTML("afterbegin", h);
    //                 env_text.insertAdjacentHTML("afterbegin",env)
    //                 result_attach_1.insertAdjacentHTML("afterbegin", p);
    //                 result_attach_2.insertAdjacentHTML("afterbegin", p2);

    //                 hoge = JSON.parse(arr_j[cnt_arr][3]);
    //                 //console.log(hoge);
    //                 result_generate(hoge.parts);

    //             }else{
    //                 html_generate(key,jdata,event);
                    
    //                 //console.log(jdata[key])
    //             }

    //         }

    //     if(cnt == 0){
            
    //         h = '<div id="add_details">'
    //         + arr_details.join("") ;
    //         +'</div>';
    //         inpe_attach.insertAdjacentHTML("afterbegin", h);
    //         cnt = 1;

    //     }
    // }
        
    // }
    // disp_num.insertAdjacentHTML("afterbegin",  display_num + '件中');



}

function func1() {
    var term1 = document.getElementById("term1").value;
    var term2 = document.getElementById("term2").value;
    var term3 = document.getElementById("term3").value;
    var term4 = document.getElementById("term4").value;
    send_data_term(term1,term2,term3,term4);
}

function func_reset(){
    document.getElementById("term1").value = "";
    document.getElementById("term2").value = "";
    document.getElementById("term3").value = "";
    document.getElementById("term4").value = "";
}

function date_Divide(value){
    var counter = function(str,seq){
        return str.split(seq).length - 1;
    }
    var result = value.split( '/' );
    if(result[0].length == 4 && result[1].length == 2 && result[2].length == 2 && counter(value,"/") == 2 && (value.split( '/' )|| value.match(/[^0-9]/))){
        // var result = value.split( '/' );
        var result = value.replace(/\//g,'-');
        console.log(result)
    }else{
        console.log('error');
    }
}

function time_Divide(value){
    
}

function send_data_term(s_date,e_date,s_time,e_time){
    console.log(s_date);
    console.log(e_date);
    console.log(s_time);
    console.log(e_time);

    let sel_str_Sdate ="";
    let sel_str_Edate ="";
    let sel_str_Stime ="";
    let sel_str_Etime ="";

    (s_date == "")? sel_str_Sdate = "*":sel_str_Sdate=date_Divide(s_date);
    (e_date == "")? sel_str_Edate = "*":sel_str_Edate=date_Divide(e_date);
    (s_time == "")? sel_str_Stime = "*":sel_str_Stime=time_Divide(s_time);
    (e_time == "")? sel_str_Etime = "*":sel_str_Etime=time_Divide(e_time);


// console.log("str_sdata="+sel_str_Sdate)    

    h = "SELECT * FROM pi_camera;";

    const req_2 = {
        "sql" : {
            "db":"piscan",
            "query" :h,
            "commit":false
        }
    }
    socket.onopen = () => socket.send(JSON.stringify(req_2)); //バリバリ大事

    socket.onmessage = function (event) {
        jdata = JSON.parse(event.data);
        for(var key in jdata){
            // console.log(jdata[key]) 
        }
        console.log("ok")
    }
}

function chart_generate(){
    var mydata = {
        labels: ["１月", "２月", "３月", "４月", "５月"],
        datasets: [
          {
            label: '数量',
            hoverBackgroundColor: "rgba(255,99,132,0.3)",
            data: [65, 59, 80, 81, 56],
          }
        ]
      };
      
      //「オプション設定」
      var options = {
        animation: {
            duration: 0
        },
        title: {    
          display: true,
          text: 'サンプルチャート'
        }
      };
      
      const canvas = document.getElementById('canvas');
      console.log(canvas)
      var chart = new Chart(canvas, {
      
        type: 'bar',  //グラフの種類
        data: mydata,  //表示するデータ
        options: options  //オプション設定
      
      });
      
      var dataURL = canvas.toDataURL();
    //   console.log(dataURL);

    //   '<image src="data:image/png;base64,' + dataURL
}

function result_generate(arr_parts){
    const table_ganerate = document.getElementById('popup_table_field');
    var table_element = '';
    var table_th;
    var f_t = 0;
    var font_red = '';
    var i;
    var cnt = 0;
    var insp = '';

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
            +   '</div><div class="popup_table"><table border="1"><tr><th>部品名</th><th>判定</th></tr>';

        for(var key in arr_parts){
            var arr_key = arr_parts[key]
            if (insp in arr_key) {
                if(arr_key[insp] == false){
                    f_t = '×'; font_red = 'class="font_red"';
                }else{ f_t = '〇'}
                table_element   =   table_element + '<tr ' + font_red + '><td>' + key + '</td><td>' + f_t + '</td></tr>';
                
                font_red = '';
            }
            cnt++;
        }
        table_element = table_element + "</table></div>";
        table_ganerate.insertAdjacentHTML("beforeend",table_th + table_element);
        table_element = '';
    }
}

