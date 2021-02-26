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


var data_for = 1000;
var data_wav = 9;

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
        "query" :"SELECT TOP " + display_num + " * FROM pi_probe;",
        "commit":false
    }
}

const req3 = {
    "sql" : {
        "db":"piscan",
        "query" :"SELECT * FROM pi_probe;",
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
  if (sessionStorage.getItem("data_for")) {
  data_for = sessionStorage.getItem('data_for');
  data_wav = sessionStorage.getItem('data_wav');
  }

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
    var i = 0;
    var array1 = new Array(0);

    var Z_COS = [0];
    var Z_SIN = [0];
    var IMDIV_arr = [0];
    var IMABS_arr = [0];
    var IMABS_arr_50 = [0];
    var plot_length = [0];

    let probe_NUM = 1000;
    let PIN_NUM = 9;
    let data_lenght = 0;

    var max_data = new Object();

    socket.onmessage = function (event) {
        // console.log("onmessage_ok")
        jdata = JSON.parse(event.data);
        for(var key in jdata){
          arr_j[key] = jdata[key]
        }

        test(data_for,data_wav);
      }



}

function func1() {
    var term1 = document.getElementById("term1").value;
    var term2 = document.getElementById("term2").value;
    var search_cnt_1 = 0;
    var search_cnt_2 = 0;

    if(term1 == ""){
      term1 = 1;
    }

    if(term2 == ""){
      term2 = 9;
    }

    for(var key in arr_j){
      if(term1 == key){
        search_cnt_1++;
      }
    }

  
    if(search_cnt_1 >= 1){
      for(var key in JSON.parse(arr_j[term1][3])["measured_value"]){
        if(term2 == key){
          search_cnt_2++;
        }
      }
      if(search_cnt_2 >= 1){
        sessionStorage.setItem('data_for', term1);
        sessionStorage.setItem('data_wav', term2);
        location.reload();
      }else{
        alert("電極No."+term2+"の結果データが見つかりませんでした。")
      }
    }else{
      alert("プローブ検査No."+term1+"の結果データが見つかりませんでした。")
    }



}

function func_reset(){
    document.getElementById("term1").value = "";
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


    h = "SELECT * FROM pi_probe";

    for(key in arr_j){
      console.log(key)
    }


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


///////////////////////


function COS_calc(x,y,n,C_S){
  let result = 0;
  if(C_S == 0){   //COS
      for(let i = 0;i < n;i++){
          result =  result + (y[i] * Math.cos(2 * Math.PI * i * x / n));

      }
  }else if(C_S == 1){ //SIN
      for(let i = 0;i < n;i++){
          result = result + (-1 * y[i] * Math.sin(2 * Math.PI * i * x / n));
          // console.log("result = " + result)
      }
  }else{
      result = null;
  }
  return result;
}

function IMDIV(a,b,c){
  let result_A = 0;
  let result_B = 0;
  let result = [0];

  result_A = a / c;
  result_B = b / c;

  result[0] = result_A;
  result[1] = result_B;

  return result;

}

function IMABS(C,Si){

  let result = 0;

  result = Math.sqrt(Math.pow(C,2)+Math.pow(Si,2));

  return result;

}


function test(probe_NUM,PIN_NUM){
  const testimg = document.getElementById('testimg');
  testimg.innerHTML = "プローブ検査No."+probe_NUM+"-電極:"+PIN_NUM;//;

  console.log(probe_NUM +":"+PIN_NUM)

  var ctx1 = document.getElementById("probe_Waveform");
  var ctx2 = document.getElementById("probe_Fourier");

  var arr_temp = [0];
  var arr_hr = [0];
  var arr_atm = [0];
  var arr_lum = [0];
  var arr_no=[0];
  var i = 0;
  var array1 = new Array(0);

  var Z_COS = [0];
  var Z_SIN = [0];
  var IMDIV_arr = [0];
  var IMABS_arr = [0];
  var IMABS_arr_50 = [0];
  var plot_length = [0];

  let data_lenght = 0;

  var max_data = new Object();



  for(var key in JSON.parse(arr_j[1000][3])["measured_value"][9]["adc_data"]){
    arr_temp[key] = (JSON.parse(arr_j[1000][3])["measured_value"][9]["adc_data"][key]);
    arr_no[i] = i;
    i++;
  }

  data_lenght = JSON.parse(jdata[probe_NUM][3])["measured_value"][PIN_NUM]["adc_data"].length;




  for(let i = 0;i < data_lenght;i++){
      array1[i] = JSON.parse(jdata[probe_NUM][3])["measured_value"][PIN_NUM]["adc_data"][i]
  }

  for(let i = 0;i<data_lenght;i++){
      Z_COS[i] = COS_calc(i,array1,data_lenght,0);
      Z_SIN[i] = COS_calc(i,array1,data_lenght,1);
      IMDIV_arr = IMDIV(Z_COS[i],Z_SIN[i],data_lenght)
      IMABS_arr[i] = IMABS(IMDIV_arr[0],IMDIV_arr[1]);
  }

  IMABS_arr[0] = 0;

  for(let i = 0;i<data_lenght/2;i++){
    IMABS_arr_50[i] = IMABS_arr[i] 
  }

  for(i = 0; i < data_lenght/2 ; i++){
      plot_length[i] = i*10/data_lenght;
  }


  var length_ticks = (arr_no.length)/10;



  var max_lab = new Object();


  var myLineChart = new Chart(ctx1, {
  type: 'line',
  data: {
  labels: arr_no,
  datasets: [
  {
      label: '電圧(V)',
      data: array1,
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
          suggestedMax: 3,
          suggestedMin: 0,
          stepSize: 1,
          callback: function(value, index, values){
              return  value +  'V'
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
      labels: plot_length ,
      datasets: [
      {
          label: '解析結果',
          data: IMABS_arr_50,
          borderColor: "rgba(0,177,138,1)",
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
          suggestedMax: 1,
          suggestedMin: 0,
          stepSize: 0.5,
          callback: function(value, index, values){
              return  value +  ''
          }
          }
      }],
      xAxes:[{
          ticks:{
              minRotation: 0,   // ┐表示角度水平
              maxRotation: 0,   // ┘
              autoSkip: true,  //なくてもよい
              maxTicksLimit: 100
          }
      }]
      
      },
  }
  });

  myLineChart.update();

  

}

