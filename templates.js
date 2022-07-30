var templates ={

    notImplemented: 'template not implemented',

    ptRetrieval: `
    <h2 class="title"></h2>
    <h3>input table</h3>
    <table class="input_table"></table>
    <button class="add-input-row-button">add row</button>
    <div class="params">
        <h3>parameters</h3>
        <div class="wmodel-wrap">
            <h4>wmodel:</h4>
            <div class="transformmodel">
            </div>
        </div>
        <div class="dataset-wrap">
            <h4>dataset:</h4>
            <div class="dataset">
            </div>
        </div>
        <div class="variant-wrap">
            <h4>variant:</h4>
            <div class="variant">
            </div>
        </div>
        <div class="limit-wrap">
            <h4>limit:</h4>
            <div class="limit">
            </div>
        </div>
    </div>
    <!--<button class="submit-button">submit</button>-->
    <h3>output table</h3>
    <table class="output_table"></table>
    `,
    
    ptQueryExpansion: `
    <h2 class="title"></h2>
    <h3>input table</h3>
    <table class="input_table"></table>
    <button class="add-input-row-button">add row</button>
    <div class="params">
        <h3>parameters</h3>
        <div class="qemodel-wrap">
            <h4>qemodel:</h4>
            <div class="transformmodel">
            </div>
        </div>
        <div class="dataset-wrap">
            <h4>dataset:</h4>
            <div class="dataset">
            </div>
        </div>
        <div class="variant-wrap">
            <h4>variant:</h4>
            <div class="variant">
            </div>
        </div>
        <div class="qe-params-wrap">
            <h4>qe parameters:</h4>
            <div class="qe-params">
            </div>
        </div>
    </div>
    <h3>output table</h3>
    <table class="output_table"></table>
    `,

    ptSdm: `
    <h2 class="title"></h2>
    <h3>input table</h3>
    <table class="input_table"></table>
    <button class="add-input-row-button">add row</button>
    <h3>output table</h3>
    <table class="output_table"></table>
    `
} 

function tableToHTML(table, editableFields=[], intFields=[]) {
    var outstring = "";
    // convert editableFields/intFields (strings) into col numbers
    var editableColumns = [];
    var intColumns = []
    for (i = 0; i < table.columns.length; i++) {
        var colName = table.columns[i];
        if (editableFields.includes(colName)) editableColumns.push(i);
        if (intFields.includes(colName)) intColumns.push(i);
    }
    
    // console.log(editableColumns);
    outstring += buildTableHeader(table.columns);
    outstring += buildTableRows(table.data, editableColumns, intColumns);
    // outstring += buildTableRows(table.data, editableColumns);
    // for (var row of table.data) {
    //     outstring += buildrow(row);
    // }
    return outstring;
}

function buildTableHeader(in_array) {
    var outstring = "<tr>";
    for (var elem of in_array) {
        outstring += "<th>" + elem + "</th>";
    }
    outstring += "</tr>";
    return outstring;
}

// function buildrow(in_array) {
//     var outstring = "<tr>";
//     for (var elem of in_array) {
//         outstring += "<td contenteditable=\"true\" class=\"editable\">" + elem + "</td>";
//     }
//     outstring += "</tr>";
//     return outstring;
// }

function buildTableRows(in_rows, editableColumns, intColumns=[]) {
    var outstring = '';
    for (row = 0; row < in_rows.length; row++) {
        outstring += '<tr data-rownum=' + row + '>';
        for (col=0; col < in_rows[row].length; col++) {
            outstring += '<td data-colnum=' + col;
            if (editableColumns.includes(col)) {
                outstring += ' contenteditable="true" class="editable';
                if (intColumns.includes(col)) {
                    outstring += ' forceinteger';
                }
                outstring += '"';
            }
            outstring += '>' + in_rows[row][col] + '</td>';
        }
        if (editableColumns.length > 0) outstring += '<td><button class=\"del-input-row-button\">del</button></td>';
        // outstring += '<td><button class=\"del-input-row-button\">del</button></td>';
        outstring += '</tr>';
    }
    return outstring;
}

function buildRadioButtons(options, name, checked, displayname){
    if (!displayname) displayname = name;
    var outstring = '<form><fieldset>';
    outstring += '<legend>select a '+displayname+':</legend>'
    for (var i in options) {
        var opt = options[i];
        outstring += '<label>'+opt+'</label>';
        outstring += '<input type=\"radio\" name=\"'+name+'\" id=\"'+opt+'\"';
        if (checked == opt) outstring += ' checked=\"checked\"';
        outstring += '/>';
    }
    outstring += '</fieldset></form>'
    return outstring;
}

function buildSelect(options, name, displayname){
    if (!displayname) displayname = name;
    var outstring = '<fieldset>';
    outstring += '<legend>select a '+displayname+':</legend>';
    outstring += '<select name=\"'+name+'\" class=\"'+name+'\">'
    for (var i in options) {
        var opt = options[i];
        outstring += '<option value=\"'+opt+'\">'+opt+'</option>';
    }
    outstring += '</select></fieldset>';
    return outstring;
}

function buildNumberField(value, name, displaytext, min=0, max=null, step=1) {
    if (!displaytext) displaytext = name;
    var outstring = '<fieldset>';
    outstring += '<legend>'+displaytext+'</legend>';
    outstring += '<input type="number" id="'+name+'" name="'+name+'" value="'+value+'" min="'+min+'" max="'+max+'" step="'+step+'">'
    outstring += '</fieldset>'
    return outstring;
}