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
    // console.log(req3)
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
    false_cnt();
    // Pareto_generate();


    // // const result_attach_2 = document.getElementById('result_picture2');
    // // メッセージの待ち受け
    socket.onmessage = function (event) {
        // console.log("onmessage_ok")
        jdata = JSON.parse(event.data);
        for(var key in jdata){
            arr_j[key] = jdata[key];
        }
        
    }

}


function func_reset(){
    document.getElementById("term1").value = "";
    document.getElementById("term2").value = "";
    document.getElementById("term3").value = "";
    document.getElementById("term4").value = "";
}

function plot(){
    console.log("ok");
}

function date_Divide(value){
    var counter = function(str,seq){
        return str.split(seq).length - 1;
    }
    var result = value.split( '/' );
    if(result[0].length == 4 && result[1].length == 2 && result[2].length == 2 && counter(value,"/") == 2 && (value.split( '/' )|| value.match(/[^0-9]/))){
        var result = value.replace(/\//g,'-');
    }else{
        console.log('error');
    }
    return result;
}

function time_Divide(value){
    var counter = function(str,seq){

        return str.split(seq).length - 1;
    }

    var result = value.split( ':' );
    if(result[0].length == 2 && result[1].length == 2 && counter(value,":") == 1 && (value.split( ':' )|| value.match(/[^0-9]/))){
        var result = value.replace(/\//g,'-');
    }else{
        var result = 'error'
        console.log('error');
    }
    return result;
}

function func1() {
    var term1 = document.getElementById("term1").value;
    var term2 = document.getElementById("term2").value;
    var term3 = document.getElementById("term3").value;
    var term4 = document.getElementById("term4").value;
    var term001 = document.getElementById("form3");
    console.log( term001 ) ;
    send_data_term(term1,term2,term3,term4,term001);
}

function send_data_term(s_date,e_date,s_time,e_time,radio){
    const result_table1 = document.getElementById("result_timetable1");
    const result_table2 = document.getElementById("result_timetable2");
    var radioNodeList = radio.cr3 ;
    var a = radioNodeList.value ;
    
    console.log( a ) ;
    for(var key in arr_j){
        console.log(arr_j[key])
    }




    (s_date == "")? sel_str_Sdate = "*":sel_str_Sdate=date_Divide(s_date);
    (e_date == "")? sel_str_Edate = "*":sel_str_Edate=date_Divide(e_date);
    (s_time == "")? sel_str_Stime = "*":sel_str_Stime=time_Divide(s_time);
    (e_time == "")? sel_str_Etime = "*":sel_str_Etime=time_Divide(e_time);

    result_table1.innerHTML = "期間："+ sel_str_Sdate + "~" + sel_str_Edate;
    result_table2.innerHTML = "時間："+ sel_str_Stime + "~" + sel_str_Etime;

    h = "SELECT * FROM pi_camera while scan_id <= 10;";


    const req_2 = {
        "sql" : {
            "db":"piscan",
            "query" :h,
            "commit":false
        }
    }
    socket.onopen = () => socket.send(JSON.stringify(req_2)); //バリバリ大事
    var startMsec = new Date();
    socket.onmessage = function (event) {
        jdata = JSON.parse(event.data);
        for(var key in jdata){
            arr_j[key] = jdata[key];
        }
    }
}
function false_cnt(){
    // let arr_insp = new Object();
    // arr_insp.value = 0;
    // arr_insp.sum = 0;
    var arr_insp = {
        sum:0,
        value:{
            mounted_parts:0,
            misalignment:0,
            angle:0,
            foreign_matter:0,
            scratch:0,
            soiled:0
        }
    }
    // let cnt = 0;
    // let mounted_parts_cnt = 0;
    // let misalignment_cnt = 0;
    // let angle_cnt = 0;
    // let foreign_matter_cnt = 0;
    // let scratch_cnt = 0;
    // let soiled_cnt = 0;
    let other = 0;


    for(key in arr_j){

        // console.log(arr_j[key]);
        arr_key = JSON.parse(arr_j[key][5]).parts;

        for(i=0;i<Math.max(Object.keys(arr_key).length);i++){
            const inspection = {
                name: Object.keys(arr_key)[i]
            };
            insp = Object.keys(arr_key)[i];
            for(key in arr_key[insp]){
                // console.log("---"+insp+"---")
                if(arr_key[insp][key] == false){
                    // console.log(arr_key[insp][key])
                    if(key == "mounted_parts"){arr_insp.value.mounted_parts++;arr_insp.sum++;}
                    else if(key == "misalignment"){arr_insp.value.misalignment++;arr_insp.sum++;}
                    else if(key == "angle"){arr_insp.value.angle++;arr_insp.sum++;}
                    else if(key == "foreign_matter"){arr_insp.value.foreign_matter++;arr_insp.sum++;}
                    else if(key == "scratch"){arr_insp.value.scratch++;arr_insp.sum++;}
                    else if(key == "soiled"){arr_insp.value.soiled++;arr_insp.sum++;}
                    else{other++;arr_insp.sum++;}

                }
            }
        }
    }
    // arr_insp[1] = mounted_parts_cnt;
    // arr_insp.value[2] = foreign_matter_cnt;
    // arr_insp.value[3] = scratch_cnt;
    // arr_insp.value[4] = soiled_cnt;
    // arr_insp.value[5] = other;

    return arr_insp
}

function Cumulative_ratio(arr_parts){
    let ratio = [0];
    let before = 0;
    for(i = 0;i<5;i++){
        ratio[i] = arr_parts[i+1] / arr_parts[0]*100 + before;
        before = ratio[i];
    }
    // console.log(arr_parts)
    return ratio
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

// function Pareto_generate(){
//     const plot_resultdata = document.getElementById('plot_resultdata');
//     const result_title_plot = document.getElementById("result_title_plot");
//     let arr_insp = false_cnt();

//     var counter = function(str,seq){
//         return str.split(seq).length - 1;
//     }
//     const Pareto = document.getElementById('Pareto');//パレート

//     var salesData = [0];
    


//     var arr = Object.keys(arr_insp.value).map(function (key) {return arr_insp.value[key]});
    
//     Object.keys(arr_insp.value).map(key => arr_insp.value[key])
    
//     var arr = Object.values(arr_insp.value);
//     arr.sort(function(a,b){
//         if( a > b ) return -1;
//         if( a < b ) return 1;
//         return 0;
//     });

//     for(i = 0;i < 5;i++){
//         salesData[i] = arr[i];
//     }

//     var labels = ["部品の位置", "値・型", "角度", "異物","傷", "汚れ"];

//     var percentage = Cumulative_ratio(arr);
//     var chart = new Chart(Pareto,{
//     type: 'bar',
//     data: {
//         labels: labels,
//         datasets: [{
//             label: '比率の累計',
//             data: percentage,
//             backgroundColor: 'rgba(99, 132, 255, 0)',
//             borderColor: 'rgba(99, 132, 255, 1)',
//             pointBackgroundColor:'rgba(99, 132, 255, 1)',
//             borderWidth: 2,
//             type: 'line',
//             yAxisID: 'y-axis-percentage'
//         },{
//         label: '不良品数',
//         data: salesData,
//         backgroundColor: 'rgba(255, 99, 132, 1)',
//         borderColor: 'rgba(255, 99, 132, 1)',
//         borderWidth: 1,
//         yAxisID: 'y-axis-sales'
//         }]
//     },
//     options: {
//         scales: {
//         yAxes: [{
//             id: 'y-axis-sales',
//             type: 'linear',
//             display: true,
//             position: 'left',
//             ticks: {
//                 beginAtZero: true,

//             },
//             scalelabel: {                 //追加部分
//                 display: true,              //追加部分
//                 labelString: '縦軸ラベル1',  //追加部分
//             }
//         }, {
//             id: 'y-axis-percentage',
//             type: 'linear',
//             display: true,
//             position: 'right',
//             ticks: {
//             beginAtZero: true
//             }
//         }]
//         }
//     }
//     });
    
//     let plot_h = "<div class="+"result_title_plot"+">結果</div>";
//     // result_title_plot.remove();
//     plot_resultdata.insertAdjacentHTML("afterbegin",plot_h);
// }

// const output_csv = document.getElementById('color_list');

function getCSV() {
    console.log("getCSV")
    //Form要素を取得する
    var form = document.forms.myform;
    
    form.myfile.addEventListener( 'change', function(e) {
 
        //読み込んだファイル情報を取得
        var result = e.target.files;
     
        splitCSV(result.responseText)
    })
}


// function Fourier_generate(){
//     console.log("Fourier_generate")
//     var file = document.getElementById('file');
//     var result = document.getElementById('result');
//     var h="";

//     if(window.File && window.FileReader && window.FileList && window.Blob) {
//         function loadLocalCsv(e) {
//             // ファイル情報を取得
//             var fileData = e.target.files[0];
//             console.log(fileData); // 取得した内容の確認用
     
//             // CSVファイル以外は処理を止める
//             if(!fileData.name.match('.csv$')) {
//                 alert('CSVファイルを選択してください');
//                 return;
//             }
     
//             // FileReaderオブジェクトを使ってファイル読み込み
//             var reader = new FileReader();

//             // ファイル読み込みに成功したときの処理
//             reader.onload = function() {
//                 var cols = reader.result.split('\n');
//                 var data = [];
//                 for (var i = 0; i < cols.length; i++) {
//                     data[i] = cols[i].split(',');
//                 }
//                 // var insert = createTable(data);
//                 // result.appendChild(insert);
//                 for(i = 0;i < data.length-1;i++){
//                     h = h + '"'+ data[i] + '",'
                    
//                 }
//                 data = h

//                 const Pareto = document.getElementById('Pareto');//パレート
//                 var data1 = {
//                     labels: ["1月", "2月", "3月", "4月", "5月",5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
//                     datasets: [{
//                         label: 'プリンター販売台数',
//                         data: data,
//                         borderColor: 'rgba(255, 100, 100, 1)'
//                     }]
//                 };
//                 console.log(h)
//                 var options = {};
                
//                 var ex_chart = new Chart(Pareto, {
//                     type: 'line',
//                     data: data1,
//                     options:  {
//                         scales: {
//                           yAxes: [
//                             {
//                               ticks: {
//                                 beginAtZero: true,
//                                 min: 0,
//                                 max: 10
//                               }
//                             }
//                           ]
//                         }
//                       }
//                     });




//             }
//             // ファイル読み込みを実行
//             reader.readAsText(fileData, 'Shift_JIS');

//         }
//         file.addEventListener('change', loadLocalCsv, false);
//                  console.log("ok")
//     } else {
//         file.style.display = 'none';
//         result.innerHTML = 'File APIに対応したブラウザでご確認ください';
//     }

//     const Pareto = document.getElementById('Pareto');//パレート
//     var data1 = {
//         labels: ["1月", "2月", "3月", "4月", "5月"],
//         datasets: [{
//             label: 'プリンター販売台数',
//             data: [880, 740, 900, 520, 930],
//             borderColor: 'rgba(255, 100, 100, 1)'
//         }]
//     };
    
//     var options = {};
    
//     var ex_chart = new Chart(Pareto, {
//         type: 'line',
//         data: data1,
//         options: options
//     });
// }