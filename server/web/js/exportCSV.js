//jsonをcsv文字列に編集する
function jsonToCsv(json, delimiter) {
    var header = Object.keys(json[0]).join(delimiter) + "\n";
    var body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(delimiter);
    }).join("\n");
    return header + body;
}

//csv変換
function exportCSV(items, delimiter, filename) {

    //文字列に変換する
    var csv = jsonToCsv(items, delimiter);

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

var filename = 'サンプル';

function output(){
    exportCSV(jsondata,',', filename);
    console.log("処理完了")
}