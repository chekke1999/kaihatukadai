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

var myLineChart;

const inspectionList = [
    { name: "mounted_parts", display: '検査項目：部品の位置' },
    { name: "misalignment", display: '検査項目：部品の値・型' },
    { name: "angle", display: '検査項目：部品の傾き' },
    { name: "foreign_matter", display: '検査項目：異物'},
    { name: "scratch", display: '検査項目：傷'},
    { name: "soiled", display: '検査項目：汚れ'}
  ];

var filename = 'test_CSV';

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


function getId_close(){
    const element = document.querySelector('section');
    element.remove();
}

window.addEventListener('beforeunload', function(e){
  /** 更新される直前の処理 */
  socket.close();
});
function max_generate(data){
    data = data.filter(v => v);
    data = data.reduce((a,b)=>a>b?a:b);
    return data;
}

function length_ticks(No){
    No = (No.length)/10
    return No;
}

window.onload = function (e) {
    // ctx1 = document.getElementById("temp");

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

    var arr_temp = [0];
    var arr_hr = [0];
    var arr_atm = [0];
    var arr_lum = [0];
    var arr_no=[0];

    var max_data = new Object();

    socket.onmessage = function (event) {
        // console.log("onmessage_ok")
        jdata = JSON.parse(event.data);

        for(var key in jdata){
            arr_j[key] = JSON.parse(jdata[key][5])
        }
        for(var key in arr_j[1]["status"]){
            var i = 0;
            for(var key2 in arr_j){
                if(key == "temp"){
                    arr_temp[i] = arr_j[key2]["status"][key];

                }else if(key == "hr"){
                    arr_hr[i] = arr_j[key2]["status"][key];
                }else if(key == "atm"){
                    arr_atm[i] = arr_j[key2]["status"][key];
                }else{
                    arr_lum[i] = arr_j[key2]["status"][key];
                }
                // arr_temp[key] = arr_j[key2]["status"][key];
                arr_no[i] = i;
                i++;
                
            }


        }

    // max_data.temp = max_generate(arr_temp)
    // max_data.hr = max_generate(arr_hr)
    // max_data.atm = max_generate(arr_atm)
    // max_data.lum = max_generate(arr_lum)

    max_data.temp = 50
    max_data.hr = 50
    max_data.atm = 50
    max_data.lum = 50

    var length_ticks = (arr_no.length)/10;

        
    var ctx1 = document.getElementById("temp");
    var ctx2 = document.getElementById("humidity");
    var ctx3 = document.getElementById("barometric");
    var ctx4 = document.getElementById("luminance");

    var max_lab = new Object();
    max_lab.temp = max_data.temp.length/10;
    max_lab.hr = max_data.hr.length/10;
    max_lab.atm = max_data.atm.length/10;
    max_lab.lum = max_data.lum.length/10;

    console.log(max_lab)

    var myLineChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: arr_no,
        datasets: [
        {
            label: '気温(度)',
            data: arr_temp,
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
                stepSize: max_lab.temp,
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
                maxTicksLimit: length_ticks
            }
        }]
        
        },
    }
    });
    var myLineChart2 = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: arr_no,
            datasets: [
            {
                label: '湿度(%)',
                data: arr_hr,
                borderColor: "rgba(15,96,166,1)",
                backgroundColor: "rgba(0,0,0,0)"
            }],
        },
        options: {
            title: {
            display: true,
            text: ''
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
                stepSize: max_lab.hr,
                callback: function(value, index, values){
                    return  value +  '%'
                }
                }
            }],
            xAxes:[{
                ticks:{
                    minRotation: 0,   // ┐表示角度水平
                    maxRotation: 0,   // ┘
                    autoSkip: true,  //なくてもよい
                    maxTicksLimit: length_ticks
                }
            }]
            
            },
        }
    });
    var myLineChart3 = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: arr_no,
            datasets: [
            {
                label: '気圧(hPa)',
                data: arr_atm,
                borderColor: "rgba(35,15,166,1)",
                backgroundColor: "rgba(0,0,0,0)"
            }],
        },
        options: {
            title: {
            display: true,
            text: ''
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
                stepSize: max_lab.atm,
                callback: function(value, index, values){
                    return  value +  'hPa'
                }
                }
            }],
            xAxes:[{
                ticks:{
                    minRotation: 0,   // ┐表示角度水平
                    maxRotation: 0,   // ┘
                    autoSkip: true,  //なくてもよい
                    maxTicksLimit: length_ticks
                }
            }]
            
            },
        }
        });
    var myLineChart4 = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: arr_no,
            datasets: [
            {
                label: '輝度(lx)',
                data: arr_lum,
                borderColor: "rgba(166,136,15,1)",
                backgroundColor: "rgba(0,0,0,0)"
            }],
        },
        options: {
            title: {
            display: true,
            text: ''
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
                stepSize: max_lab.lum,
                callback: function(value, index, values){
                    return  value +  'lx'
                }
                }
            }],
            xAxes:[{
                ticks:{
                    minRotation: 0,   // ┐表示角度水平
                    maxRotation: 0,   // ┘
                    autoSkip: true,  //なくてもよい
                    maxTicksLimit: length_ticks
                }
            }]
            
            },
        }
        });
    }


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
        console.log('error');
    }
    return result;
}


function send_data_term(s_date,e_date,s_time,e_time){
    const result_table1 = document.getElementById("result_timetable1");
    const result_table2 = document.getElementById("result_timetable2");

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