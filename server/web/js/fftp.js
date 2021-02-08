//-------------------------------------
// fft: FourierFFT
//-------------------------------------
var df1;
var pi = Math.PI;

var item1 = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192];

var shape = 0;                 // kind of shape(0-9)
var NPMAX = 50;                // max点数
var np = 0;                    // 点数（任意入力）
var nd1 = 50;                  //      fcurve描画時
var ft = new Array(NPMAX);     // fcurve passing poi.
    for(i=0; i<NPMAX; i++) ft[i] = new Array(2);
var q1b = new Array(NPMAX);    // control poi. 1
    for(i=0; i<NPMAX; i++) q1b[i] = new Array(2);
var q2b = new Array(NPMAX);    //              2
    for(i=0; i<NPMAX; i++) q2b[i] = new Array(2);
var tmax = 500;
var iab = 0;                   // F 表示start index

var t0 = 0;                    // 計算時間時刻(ms)
var NMAX = 8192;               // max次数
var N = 128;                   // 次数
var M = 32;                    // 逆変換次数
var f0 = new Array(NMAX);      // data original
var fi = new Array(NMAX);      //      imaginary (=0)
var f1 = new Array(NMAX);      // data inverse
var Fr = new Array(NMAX);      // Fourier変換 real
var Fi = new Array(NMAX);      //             imaginary
var Fa = new Array(NMAX);      //             amp.spectrum
var fmax = 100;
var Fmax = 100; 
var kmax = 0;

var runFlag = 0;               // 計算中flag
var stopFlag = 0;              // 計算中止flag
var timeS, timeE = 0;

var g, w0, h0, w2, h2, x0, y0, dx, dy, w, h;    // screen size
var cc = ["red", "blue", "green", "orange"];

//-------------------------------------

//..........................
function init() {
//..........................
  df1 = document.form1;
  setList();
  loadCanvas();
  setD(8);
  dispF(0);
  paint();
}

//..........................
function loadCanvas() {
//..........................
  var canvas = document.getElementById("canvas");
  if(!canvas.getContext) {
    alert("not supported");
    return;
  }

  g = canvas.getContext("2d");
  g.lineWidth = 1;
  g.font = "12px 'ＭＳ 明朝'";
  w0 = canvas.width;
  h0 = canvas.height;
  w1 = w0*2/7; h1 = h0;
  w2 = w0*5/7; h2 = h0/2;
  dx = w2/15; dy = h2/10;
  w = w2 - 2*dx; x0 = dx;
  h = (h2 - 2*dy)/2; y0 = h2/2;

  canvas.addEventListener("mousedown" , mousePressed);
}

//......................................................
function bitRev (N, M, bk, inr, ini, outr, outi) {
//......................................................
  var sho, ama;
  var wa = 0;

  for(var i=0; i<N; i++) {
    sho = i;
    for(var j=0; j<bk; j++) {
      ama = sho%2;
      sho = Math.floor(sho/2);

      if(j == 0) wa = ama;
      else       wa = wa*2 + ama;
    }

    if(i <= M/2 || i >= (N-M/2)) {
      outr[wa] = inr[i];
      outi[wa] = ini[i];
    }else {
      outr[wa] = 0;
      outi[wa] = 0;
    }
  }
}

//........................................
function calc(sw) { //
//........................................
  if(sw == 1) {
    stopFlag = 0; runFlag = 1;
    setDisable("disable");
    if(df1.radio2[1].checked) alert("通常のフーリエ変換を実行");
    timeS = new Date().getTime();
    calcT();
    timeE = new Date().getTime() - timeS;
    df1.tfT.value = fmtF(timeE/1000, 8, 3);
    if(df1.radio2[1].checked) alert("変換終了！");
    setDisable("");
    runFlag = 2;
    dispF(0);
  }else {
    stopFlag = 0;
  }

  paint();
}

//................................................................
function calcCP(h, np, q1, q2) {  // Bezier control point
//................................................................
  var len = new Array(np-1);
  var vx, vy, vv;

  for(var i=0; i<np-1; i++) {
    vx = h[i+1][0] - h[i][0]; vy = h[i+1][1] - h[i][1];
    len[i] = Math.sqrt(vx*vx + vy*vy);
  }

  for(var i=0; i<np; i++) {
    if(i == 0) {
      vx = h[i+1][0] - h[i][0]; vy = h[i+1][1] - h[i][1];
      q1[i][0] = h[i][0] + vx/3;
      q1[i][1] = h[i][1] + vy/3;
    }else if(i < np-1) {
      vx = h[i+1][0] - h[i-1][0]; vy = h[i+1][1] - h[i-1][1];
      vv = Math.sqrt(vx*vx + vy*vy);
      vx /= vv; vy /= vv;
      q2[i-1][0] = h[i][0] - len[i-1]*vx/3;
      q2[i-1][1] = h[i][1] - len[i-1]*vy/3;
      q1[i  ][0] = h[i][0] + len[i]*vx/3;
      q1[i  ][1] = h[i][1] + len[i]*vy/3;
    }else {
      vx = h[i][0] - h[i-1][0]; vy = h[i][1] - h[i-1][1];
      q2[i-1][0] = h[i][0] - vx/3;
      q2[i-1][1] = h[i][1] - vy/3;
    }
  }
}

//.............................................
function calcT() { // Fourier変換 & 逆変換
//.............................................
  M = Math.min(M, N);  //if(M > N) M = N; NG! why?

  if(df1.radio2[1].checked) {
    dft(N, f0, Fr, Fi);
    if(M > 0) {
      idft(N, M, f1, Fr, Fi);
    }

  }else {
    var in1r = new Array(N);
    var in1i = new Array(N);
    var f1i  = new Array(N);
    var bk   = 0;
    for(var i=N; i!=1; i=Math.floor(i/2)) bk++;

    bitRev(N, N, bk, f0, fi, in1r, in1i);   // M = N
    fft(N, bk, in1r, in1i, Fr, Fi);

    if(M > 0) {
      bitRev(N, M, bk, Fr, Fi, in1r, in1i); // M... filtering
      ifft(N, bk, in1r, in1i, f1, f1i);
    }
  }

  Fmax = 0; kmax = 0;
  for(var i=0; i<N; i++) {
    Fa[i] = Math.sqrt(Fr[i]*Fr[i] + Fi[i]*Fi[i]);
    if(i < N/2 && Fa[i] > Fmax ) {
      Fmax = Fa[i]; kmax = i;
    }
  }

//  alert("fmax="+fmax+"  Fmax="+Fmax);
}


//........................................
function dispF(sw) { //
//........................................
  var x, y;
  var str = ["k", "｜F｜", "Fr", "Fi"];


  g.clearRect(w2, 0, w1, h1);
  g.fillStyle = "blue";
  g.strokeStyle = "green";
  g.beginPath();

  for(var i=0; i<4; i++) {
    x = w2 + w1*i/4;
    drawLine(x, 0, x, h1);
    drawTC(str[i], x, h1/21-2, w1/4);
  }
  for(var i=0; i<21; i++) {
    y = h1*i/21;
    drawLine(w2, y, w0, y);
  }
  g.stroke();

  if(runFlag == 0) return;

  var ix = iab + 20*sw;
  if(ix >= 0 && ix < N ) iab = ix;
  if(sw == -2          ) iab = 0;
  if(sw == +2          ) iab = Math.floor((N-1)/20)*20;

  for(var i=0; i<20; i++) {
    y = h1*(i+2)/21 - 2;
    drawTC(iab+i, w2, y, w1/4);
    if(iab+i < N) {
      drawTC(fmtF(Fa[iab+i], 8, 1), w2+w1*1/4, y, w1/4);
      drawTC(fmtF(Fr[iab+i], 8, 1), w2+w1*2/4, y, w1/4);
      drawTC(fmtF(Fi[iab+i], 8, 1), w2+w1*3/4, y, w1/4);
    }
  }
}

//...................................
function drawD6() {
//...................................
  var x, y, x1, y1;
  var s, s1, s2, v, v1, v2, v1b, v2b, t;

  g.strokeStyle = "green";
  g.beginPath();

  for(var i=0; i<np; i++) {
    if(i > 0) {
      for(var j=0; j<=nd1; j++) {
        s1 = ft[i-1][0]; s2 = ft[i][0];
        v1 = ft[i-1][1]; v2 = ft[i][1];
        v1b= q1b[i-1][1]; v2b = q2b[i-1][1];
        s  = j/nd1;
        v = v1*(1-s)*(1-s)*(1-s) + v1b*3*(1-s)*(1-s)*s +
                                   v2b*3*(1-s)*s*s + v2*s*s*s;
        t = s1 + (s2 - s1)*s;
        x = dx + t*w/tmax;
        y = y0 - v*h/fmax;
        if(j > 0) drawLine(x1, y1, x, y);
        x1 = x; y1 = y;
      }
    }
  }
  g.stroke();
}

//................................................................
function dft(N, a, afr, afi) { // only real data
//................................................................
  var ar, ai, c;
//  alert("+++ dft +++");

  for(var i=0; i<N; i++) {
    ar = 0;
    ai = 0;
    c = 2*pi*i/N;

    for(var j=0; j<N; j++) {
      ar +=  a[j]*Math.cos(c*j);
      ai += -a[j]*Math.sin(c*j);
    }

    afr[i] = ar;
    afi[i] = ai;
    if(stopFlag == 1) return;
  }
//  alert("--- dft ---");
}

//..............................................
function fft(N, bk, inr, ini, outr, outi) {
//..............................................
  var k, n, hf, rui, bit;
  var theta;
  var wr = new Array(N);
  var wi = new Array(N);
  var tmpr = new Array(N);
  var tmpi = new Array(N);
  var tmp2r, tmp2i;
//  alert("+++ fft +++");

  for(var i=0; i<N; i++) {
    outr[i] = 0;
    outi[i] = 0;
  }

  theta = 2*pi/N;
  hf  = N/2;
  rui = 1;

  for(var i=0; i<N; i++) {
    tmpr[i] = inr[i];
    tmpi[i] = ini[i];
  }

  for(var i=0; i<bk; i++) {
    for(var j=0; j<rui; j++) {
      wr[j] = Math.cos(theta*j*hf);
      wi[j] = Math.sin(theta*j*hf);
    }

    bit = 0;
    n = 0;

    while (n < N) {
      k = n % rui;
      if (bit < rui) {
        tmp2r = tmpr[n+rui]*wr[k] + tmpi[n+rui]*wi[k];
        tmp2i = tmpi[n+rui]*wr[k] - tmpr[n+rui]*wi[k];

        tmpr[n+rui] = tmpr[n] - tmp2r;
        tmpr[n]     = tmpr[n] + tmp2r;

        tmpi[n+rui] = tmpi[n] - tmp2i;
        tmpi[n]     = tmpi[n] + tmp2i;

        bit++;
        n++;

      } else {
        n += rui;
        bit = 0;
      }

      if(stopFlag == 1) return 1;
    }

    hf  /= 2;
    rui *= 2;
  }

  for(var i=0; i<N; i++) {
    outr[i] = tmpr[i];
    outi[i] = tmpi[i];
  }

//  alert("--- fft ---");
}

//................................................................
function idft(N, M, a, afr, afi) { // only real data
//................................................................
  var ar, ai, c;
//  alert("+++ idft +++ N="+N+"  M="+M);

  for(var i=0; i<N; i++) {
    ar = 0.;
    ai = 0.;
    c = 2*pi*i/N;

    for(var j=0; j<N; j++) {
      if(j > M/2 && j < (N-M/2)) continue;
      ar +=  afr[j]*Math.cos(c*j) - afi[j]*Math.sin(c*j);
//      ai +=  afr[j]*Math.sin(c*j) + afi[j]*Math.cos(c*j);
    }

    a[i] = ar/N;
    if(stopFlag == 1) return;
  }
//  alert("--- idft ---");
}

//................................................
function ifft (N, bk, inr, ini, outr, outi) {
//................................................
  var k, n, hf, rui, bit;
  var theta;
  var wr = new Array(N);
  var wi = new Array(N);
  var tmpr = new Array(N);
  var tmpi = new Array(N);
  var tmp2r, tmp2i;
//  alert("+++ ifft +++");

  for(var i=0; i<N; i++) {
    outr[i] = 0;
    outi[i] = 0;
  }

  theta = 2*pi/N;
  hf  = N/2;
  rui = 1;

  for(var i=0; i<N; i++) {
    tmpr[i] = inr[i];
    tmpi[i] = ini[i];
  }

  for(var i=0; i<bk; i++) {
    for(var j=0; j<rui; j++) {
      wr[j] =  Math.cos(theta*j*hf);
      wi[j] = -Math.sin(theta*j*hf);
    }

    bit = 0;
    n = 0;

    while (n < N) {
      k = n % rui;

      if(bit < rui) {
        tmp2r = tmpr[n+rui]*wr[k] + tmpi[n+rui]*wi[k];
        tmp2i = tmpi[n+rui]*wr[k] - tmpr[n+rui]*wi[k];

        tmpr[n+rui] = tmpr[n] - tmp2r;
        tmpr[n]     = tmpr[n] + tmp2r;

        tmpi[n+rui] = tmpi[n] - tmp2i;
        tmpi[n]     = tmpi[n] + tmp2i;

        bit++;
        n++;
      } else {
        n += rui;
        bit = 0;
      }

      if(stopFlag == 1) return 1;
    }

    hf  /= 2;
    rui *= 2;
  }

  for(var i=0; i<N; i++) {
    outr[i] = tmpr[i]/N;
    outi[i] = tmpi[i]/N;
  }

//  alert("--- ifft ---");
}

//............................
function mousePressed(ee) {
//............................
  var x, y, x1, y1, x2, y2, dw, dh;

  if(runFlag != 0) return;
  if((shape-6)*(shape-7) != 0) return;
  if(np >= NPMAX) {
    alert("データ点数オーバ！");
    return;
  }

  getPos(ee);
  x = xpos;
  y = ypos;

  if(x < dx || x > w2-dx || y > h2-dy || y < dy) {
    alert("範囲外"); return;
  }

  if(df1.chkG.checked) {
    dw = w/16; dh = h/10;
    x = dx + Math.round(Math.round((x-dx)/dw)*dw);
    y = dy + Math.round(Math.round((y-dy)/dh)*dh);
  }
  var t = (x - dx)/w*tmax;

  if(np > 0 && t <= ft[np-1][0]) {
    alert("データ順不正"); return;
  }

  var f = fmax*(y0 - y)/h;
  ft[np][0] = t;
  ft[np][1] = f;
  np++;

  if(shape ==7 && np > 1) calcCP(ft, np, q1b, q2b); 
  setD6(1);
  paint();
}

//............................
function paint() {
//............................
  g.clearRect(0, 0, w0, h0);
  paint1();
  paint2();
  dispF(0);
  y0 = h2/2;
}

//..............................
function paint1() { // source
//..............................
  var x, y, x1 = 0, y1 = 0;

  y0 = h2/2;
  paintAxis();
                                       // 元データ
  if((shape-6)*(shape-7) == 0 && np > 0) {
    g.beginPath();
    g.strokeStyle = "green";
    for(var i=0; i<np; i++) {
      drawOval(dx+ft[i][0]*w/tmax, y0-ft[i][1]*h/fmax, 3, 3);
    }
    drawLine(w2/2, dy/2, w2/2+20, dy/2);
    g.stroke();

    if(shape == 7 && np > 1) drawD6();
    g.fillStyle = "green";
    g.fillText("np = "+np, w2/4, dy-5);
  }

  g.beginPath();
  g.strokeStyle = "red";
  g.rect(w2/2, dy-7, 20, 1);
  g.fillStyle = "red";
  g.fillText("元データ", w2/2+25, dy-5);
  g.fillText("fmax = "+fmtF(fmax, 6, 1), 2*dx, h2-5);

  for(var i=0; i<N; i++) {
    x = x0 + w*i/N;
    y = y0 - (h*f0[i]/fmax);
    if(i > 0) drawLine(x1, y1, x, y);
    x1 = x; y1 = y;
  }
  g.stroke();
                                       // 逆変換データ
  g.fillStyle = "blue";
  g.strokeStyle = "blue";
  g.beginPath();
  g.rect(w2*3/4, dy-7, 20, 1);
  g.fillText("逆変換データ", w2*3/4+25, dy-5);
  g.stroke();
  if(runFlag != 2 || M == 0) return;

  g.beginPath();
  for(var i=0; i<N; i++) {
    x = x0 + w*i/N;
    y = y0 - (h*f1[i]/fmax);
    if(i > 0) drawLine(x1, y1, x, y);
    x1 = x; y1 = y;
  }
  g.stroke();
}

//................................
function paint2() { // 変換結果
//................................
  var x, y, x1 = 0, y1 = 0;

  y0 = h2 + h2/2;
  paintAxis();

  g.fillStyle = "red";
  g.strokeStyle = "red";
  g.beginPath();
  g.rect(w2*3/6, h2+dy-7, 15, 1);
  g.fillText("振幅ｽﾍﾟｸﾄﾙ", w2*3/6+20, h2+dy-5);
  g.stroke();

  g.fillStyle = "blue";
  g.strokeStyle = "blue";
  g.beginPath();
  g.rect(w2*4/6, h2+dy-7, 15, 1);
  g.fillText("実数部", w2*4/6+20, h2+dy-5);
  g.stroke();

  g.fillStyle = "green";
  g.strokeStyle = "green";
  g.beginPath();
  g.rect(w2*5/6, h2+dy-7, 15, 1);
  g.fillText("虚数部", w2*5/6+20, h2+dy-5);
  g.stroke();
  if(runFlag != 2) return;
                                       // 逆変換対象部
  g.fillStyle = "#6600ff";
  g.fillRect(x0, h0-dy, w*M/2/N, 4);
  g.fillRect(w2-dx-w*M/2/N, h0-dy, w*M/2/N, 4);
                                       // 実数部
  g.strokeStyle = "blue";
  g.beginPath();

  for(var i=0; i<N; i++) {
    x = x0 + w*i/N;
    y = y0 - (h*Fr[i]/Fmax);
    if(i > 0) drawLine(x1, y1, x, y);
    x1 = x; y1 = y;
  }
  g.stroke();
                                       // 虚数部
  g.strokeStyle = "green";
  g.beginPath();

  for(var i=0; i<N; i++) {
    x = x0 + w*i/N;
    y = y0 - (h*Fi[i]/Fmax);
    if(i > 0) drawLine(x1, y1, x, y);
    x1 = x; y1 = y;
  }
  g.stroke();
                                       // 振幅spectrum
  g.fillStyle = "red";
  g.strokeStyle = "red";
  g.beginPath();
  g.fillText("Fmax = "+fmtF(Fmax, 10, 1)+"  at  k = "+kmax, 2*dx, h0-5);

  for(var i=0; i<N; i++) {
    x = x0 + w*i/N;
    y = y0 - (h*Fa[i]/Fmax);
    if(i > 0) drawLine(x1, y1, x, y);
    x1 = x; y1 = y;
  }
  g.stroke();
}

//..............................
function paintAxis() {
//..............................
  var x, y;
  var n = 16;

  g.fillStyle = "black";
                                       // 座標系
  for(var i=0; i<=n; i++) {
    x = x0 + w*i/n;
    g.beginPath();
    g.strokeStyle = "#cccccc";
    drawLine(x, y0-h, x, y0+h);
    g.stroke();
    if(i%(n/2) == 0) {
      g.beginPath();
      g.strokeStyle = "black";
      drawLine(x, y0, x, y0+3);
      g.stroke();
      g.fillText( ""+(N*i/n), x, y0+15);
    }
  }

  for(var i=-10; i<=10; i++) {
    y = y0 - h*i/10;
    g.beginPath();
    g.strokeStyle = "#cccccc";
    drawLine(x0, y, x0+w, y);
    g.stroke();
    if(i%5 == 0) {
      g.beginPath();
      g.strokeStyle = "black";
      drawLine(x0, y, x0-3, y);
      g.stroke();
      g.fillText(fmtI(fmax*i/10, 4), 5, y+3);
    }
  }

  g.beginPath();
  g.strokeStyle = "black";
  g.rect(x0, y0-h, w, 2*h);
  drawLine(x0, y0, w2-dx, y0);
  g.stroke();
}

//............................
function setD(sw) {
//............................
  fmax = 100;

  switch(sw) {
  case 0:
    for(var i=0; i<N/2; i++) f0[i] = fmax;
    for(var i=N/2; i<N; i++) f0[i] = -fmax;
    break;
  case 1:
    for(var i=0; i<N; i++) f0[i] = fmax - 2*fmax*Math.abs(i-N/2)/(N/2);
    break;
  case 2:
    for(var i=0; i<N/2; i++) f0[i] = fmax*i/(N/2);
    for(var i=N/2; i<N; i++) f0[i] = -fmax + fmax*(i-N/2)/(N/2);
    break;
  case 3:
    for(var i=0; i<N/4; i++) f0[i] = -fmax + 2*fmax*i/(N/4);
    for(var i=N/4; i<N*3/4; i++) f0[i] = fmax;
    for(var i=N*3/4; i<N; i++) f0[i] = -fmax + 2*fmax*(N-i)/(N/4);
    break;
  case 4:
    for(var i=0; i<N; i++) f0[i] = -fmax + 2*fmax*Math.sqrt(1-(N/2-i)*(N/2-i)/(N/2)/(N/2));
    break;
  case 5:
    for(var i=0; i<N; i++) f0[i] = fmax*Math.sin(2*pi*i/N);
    break;
  case 6:
  case 7:
    setD6(0);
    break;
  case 8:
  case 9:
//    if(sw == shape) break;
    var n = 5, c = 1;
    if(sw == 9) {n = 10; c = 0.5;}

    for(var i=0; i<N; i++) {
      var dmp = 1 - i/N*c;
      f0[i] = fmax*Math.sin(2*pi*i*n/N)*Math.random()*dmp;
    }
    break;
  case 10:
    setD10();
    sw = shape;
  }

  runFlag = 0;
  shape = sw;
  for(var i=0; i<N; i++) fi[i] = 0;
  paint();
}

//.............................
function setD6(sw) { //6,7
//.............................
  var j, j0 = 0, n, t;
  var s, v1, v2, v1b, v2b;

  if(sw == 0) {
    for(var i=0; i<N; i++) f0[i] = 0;
    for(var i=0; i<NPMAX; i++) ft[i][0] = ft[i][1] = 0;
    np = 0;
    return;
  }
  if(np < 2) return;

  if(ft[0][0] == 0) f0[0] = ft[0][1];

  for(n=1; n<N; n++) {
    t = n/N*tmax;
    if(t < ft[0][0] || t > ft[np-1][0]) {
      f0[n] = 0;
    }else {
      for(j=j0; j<np; j++) {
        if(t <= ft[j][0]) break;
      }
                       // (j-1, j)
      s = (t - ft[j-1][0])/(ft[j][0] - ft[j-1][0]);
      if(shape == 6) {
        f0[n] = ft[j-1][1] + (ft[j][1] - ft[j-1][1])*s;
      }else {
          v1 = ft[j-1][1];  v2 = ft[j][1];
          v1b= q1b[j-1][1]; v2b= q2b[j-1][1];
          f0[n] = v1*(1-s)*(1-s)*(1-s) + v1b*3*(1-s)*(1-s)*s +
                  v2b*3*(1-s)*s*s + v2*s*s*s;
      }

      j0 = j;
    }
  }
}

//.............................
function setD10() {
//.............................
  var i0, i1, k, n = 0, dmax = 0;
  var dat = df1.taD.value + "\n";

  i1 = dat.indexOf("\n"); i0 = i1;
  shape = parseInt(dat.substring(0, i1)); // 0,6,7

  while(true) {
    i1 = dat.indexOf("\n", i0+1);
    if(i1 < 0 || i1 == i0+1) break;

    if(shape == 0) {
      f0[n] = parseFloat(dat.substring(i0, i1));
    }else {
      k = dat.indexOf(",", i0+1);
      ft[n][0] = parseFloat(dat.substring(i0, k));
      ft[n][1] = parseFloat(dat.substring(k+1, i1));
      if(n > 0 && ft[n][0] <= ft[n-1][0]) {
        alert("データ順不正"); return;
      }
//      dmax = Math.max(ft[n][1], dmax);
    }

    n++;
    i0 = i1;
  }

  if(shape == 0) {
    if(n < N) {
      for(var j=n; j<N; j++) f0[j] = 0; 
    }

  }else {
    np = n;
    if(np < 2) {alert("データ点数不足！"); return;}

    var t0 = ft[0][0], t1 = ft[n-1][0];
    for(var i=0; i<n; i++) {
      ft[i][0] = tmax*(ft[i][0] - t0)/(t1 - t0);
//      ft[i][1] = fmax*ft[i][1]/dmax;
    }
    calcCP(ft, np, q1b, q2b);
    setD6(1);
  }
}

//.............................
function setDisable(d) {
//.............................
  df1.cb1.disabled = d;
  df1.cb2.disabled = d;
  for(var i=0; i<11; i++) df1.radio1[i].disabled = d;
  for(var i=0; i< 2; i++) df1.radio2[i].disabled = d;
}

//...................................
function setList() { 
//...................................
  for(var i=2; i<item1.length; i++) {
    df1.cb1.options[i-2] = new Option(item1[i], item1[i]);
    df1.cb2.options[i+1] = new Option(item1[i], item1[i]);
  }
  df1.cb2.options[0] = new Option("逆変換なし", "逆変換なし");
  for(var i=1; i<=2; i++) df1.cb2.options[i] = new Option(item1[i-1], item1[i-1]);

  df1.cb1.value = 128;
  df1.cb2.value =  32;
}

//...................................
function setParam(sw) { 
//...................................
  if(sw == 0) {
    N = df1.cb1.value;
    setD(shape);
    return;

  }else if(sw == 1) {
    if(df1.cb2.selectedIndex == 0) M = 0;
    else M = df1.cb2.value;

  }else { // sw==2

  }

  runFlag = 0; paint();
}


//-------------------------------------

//...................................
function drawLine(x0, y0, x1, y1) {
//...................................
  g.moveTo(x0, y0); g.lineTo(x1, y1);    
}

//...................................
function drawOval(x0, y0, w, h) {
//...................................
  g.moveTo(x0+w, y0+h/2);
  g.arc(x0+w/2, y0+h/2, w/2, 0, 2*pi, false);
}

//..............................
function drawTC(s, x, y, w) {
//..............................
  var b = g.measureText(s).width;
  g.fillText(s, x+(w-b)/2, y);
}

//..................................
function fmtF(v, n, m) { // xx.xxx
//..................................
  var s1 = ""; for(var i=0; i<n; i++) s1 += " ";
  var s2 = ""; for(var i=0; i<m; i++) s2 += "0";

  var p = Math.pow(10, m);
  var s = "" + (Math.round(v*p)/p);
  var d = s.indexOf(".");
  if(d < 0) s = s1 + s + "." + s2;
  else      s = s1 + s + s2;

  var L = s.length;
      d = s.indexOf(".");
  return s.substring(d-(n-m-1), d+1) + s.substring(d+1, d+m+1);
}

//..................................
function fmtI(v, n) { // xxxxx
//..................................
  var s = "" + v;
  var L = s.length;
  if(L < n) for(var i=0; i<n-L; i++) s = " " + s;
  return s;
}

//..........................
function getPos(e) {
//..........................
  rect = e.target.getBoundingClientRect();
  xpos = e.clientX - rect.left;
  ypos = e.clientY - rect.top;
}

//.................................................
function vepd(v1, v2) { // outer product v1 x v2
//.................................................
  var v = new Array(3);
  v[0] = v1[1]*v2[2] - v1[2]*v2[1];
  v[1] = v1[2]*v2[0] - v1[0]*v2[2];
  v[2] = v1[0]*v2[1] - v1[1]*v2[0];
  return v;

}

//................................................
function vipd(v1, v2) { // inner product v1・v2
//................................................
  return v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2];
}

//................................................
function vlen(v) { // vector: length
//................................................
  return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}

//................................................
function vlen2(p1, p2) { // vector: length
//................................................
  return Math.sqrt((p1[0]-p2[0])*(p1[0]-p2[0]) +
                   (p1[1]-p2[1])*(p1[1]-p2[1]) +
                   (p1[2]-p2[2])*(p1[2]-p2[2]) );
}

//................................................
function vnrm(v) { // vector: normalize
//................................................
  var d =Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  if(d > 0) {
    for(var i=0; i<3; i++) v[i] /= d;
  }

  return d;
}
