// const jquery360 = require("./jquery-3.6.0");

$(".pt_retrieval").html("\
    <h2>input table</h2>\
    <table id=\"retrieval_input_table\"></table>\
    <h2>parameters</h2>\
    <h3>wmodel:</h3><p id=\"wmodel\"></p>\
    <h3>dataset:</h3><p id=\"dataset\"></p>\
    <h3>variant:</h3><p id=\"variant\"></p>\
    <h2>output table</h2>\
    <table id=\"retrieval_output_table\"></table>\
");

// var url = "http://127.0.0.1:8000/pyterrier/retrieval/BM25/vaswani/terrier_stemmed/%5B%5B%22q0%22%2C%22special%22%5D%2C%5B%22q1%22%2C%22cats%22%5D%5D?cols=%5B%22qid%22%2C%22query%22%5D&limit=10";

class Table {
    constructor(columns, data) {
        this.columns = columns;
        this.data = data;
    }
}

var inputTable = new Table(['qid','query'],[['1','chemical'],['2','cats']]);
$('#retrieval_input_table').html(buildtable(inputTable));

console.log('input table: ');
console.log(inputTable);

var wmodel = "BM25";
$('#wmodel').html(wmodel);
var dataset = "vaswani";
$('#dataset').html(dataset);
var variant = "terrier_stemmed";
$('#variant').html(variant);

// console.log(JSON.stringify(inputTable));
// retrieval_get(buildurl());
retrieval_post(buildurl(), inputTable);

// $.get(url+urlizetable("#retrieval_input_table"), function(outputTable){
//     console.log('api request uri: ' + url + urlizetable("#retrieval_input_table"))
//     console.log( 'output table: '); console.log(outputTable );
//     $("#retrieval_output_table").html(buildtable(outputTable));
// });


function buildurl() {
    var outurl = "http://127.0.0.1:8888/pyterrier/retrieval/"
    // var outurl = "http://82.69.60.142:8000/pyterrier/retrieval/"
    outurl += wmodel + '/' + dataset + '/' + variant + '/';
    // add input table data to url
    // outurl += urlizetable("#retrieval_input_table");
    return outurl;
}

function urlizetable(tableid) {
    var tableurl = '[';
    $('tr:gt(0)', tableid).each(function(){
        tableurl += '[';
        $('td', this).each(function(){
            tableurl += '\"' + $(this).text() + '\",';
        });
        tableurl = tableurl.slice(0,-1) + '],';
    });
    tableurl = tableurl.slice(0,-1) + ']';
    // console.log(tableurl);
    return tableurl;
}

function buildtable(table) {
    var outstring = "";
    outstring += buildheader(table.columns);
    for (var row of table.data) {
        outstring += buildrow(row);
    }
    return outstring;
}

function buildheader(in_array) {
    var outstring = "<tr>";
    for (var elem of in_array) {
        outstring += "<th>" + elem + "</th>";
    }
    outstring += "</tr>";
    return outstring;
}

function buildrow(in_array) {
    var outstring = "<tr>";
    for (var elem of in_array) {
        outstring += "<td>" + elem + "</td>";
    }
    outstring += "</tr>";
    return outstring;
}

function retrieval_get(url) {
    $.get(url+urlizetable("#retrieval_input_table"), function(outputTable){
        console.log('api request uri: ' + url + urlizetable("#retrieval_input_table"))
        console.log( 'output table: '); console.log(outputTable );
        $("#retrieval_output_table").html(buildtable(outputTable));
    });
}

function retrieval_post(url, table) {
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(table),
        success: function(outputTable){
            console.log('api request uri: ' +url);
            console.log('output table: '); console.log(outputTable);
            $("#retrieval_output_table").html(buildtable(outputTable));
        },
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        Accept: 'application/json',
        crossDomain: true,
      });
}