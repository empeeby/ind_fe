var templates ={

    notImplemented: 'template not implemented',

    ptRetrieval: `
    <h2 class="title"></h2>
    <div class="preset"></div>
    <div class="demo-content">
        <div class="table-wrap">
            <h3 class="subtitle">input table</h3>
            <table class="input_table"></table>
            <p class="input_warning"></p>
        </div>
        <div class="params-wrap">
            <h3 class="subtitle">parameters</h3>
            <div class="params">
                
                <div class="index-wrap">
                <h4 class="subtitle">index selection:</h4>
                    <div class="dataset-wrap">
                        <div class="dataset">
                        </div>
                    </div>
                    <div class="variant-wrap">
                        <div class="variant">
                        </div>
                    </div>
                </div>
                <div class="param-col">
                    <div class="wmodel-wrap">
                        <h4 class="subtitle">wmodel:</h4>
                        <div class="transformmodel">
                        </div>
                    </div>
                    <div class="limit-wrap">
                        <h4 class="subtitle">limit:</h4>
                        <div class="limit">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-wrap">
            <h3 class="subtitle">output table</h3>
            <table class="output_table"></table>
        </div>
        <div class="example-code-wrap">
            <h3>example code</h3>
            <pre><code class="example-code language-python">...</code></pre>
        </div>
    </div>
    `,
    
    ptQueryExpansion: `
    <h2 class="title"></h2>
    <div class="preset"></div>
    
    <div class="demo-content">
        <div class="table-wrap">
            <h3 class="subtitle">input table</h3>
            <table class="input_table"></table>
            <p class="input_warning"></p>
        </div>

        <div class="params-wrap">
            <h3 class="subtitle">parameters</h3>
            <div class="params">
                <div class="index-wrap">
                <h4 class="subtitle">index selection:</h4>
                    <div class="dataset-wrap">
                        <div class="dataset">
                        </div>
                    </div>
                    <div class="variant-wrap">
                        <div class="variant">
                        </div>
                    </div>
                </div>
                <div class="param-col">
                    <div class="qemodel-wrap">
                        <h4 class="subtitle">qemodel:</h4>
                        <div class="transformmodel">
                        </div>
                    </div>
                    <div class="qe-params-wrap">
                        <h4 class="subtitle">qe parameters:</h4>
                        <div class="qe-params">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="table-wrap">
            <h3 class="subtitle">output table</h3>
            <table class="output_table"></table>
        </div>
        <div class="example-code-wrap">
            <h3>example code</h3>
            <pre><code class="example-code language-python">...</code></pre>
        </div>
    </div>
    `,

    ptSdm: `
    <h2 class="title"></h2>
    <div class="preset"></div>
    <div class="demo-content">
        <div class="table-wrap">
            <h3 class="subtitle">input table</h3>
            <table class="input_table"></table>
            <p class="input_warning"></p>
        </div>
        <div class="table-wrap">
            <h3 class="subtitle">output table</h3>
            <table class="output_table"></table>
        </div>
        <div class="example-code-wrap">
            <h3>example code</h3>
            <pre><code class="example-code language-python">...</code></pre>
        </div>
    </div>
    `,

    ptTransformerOperators: `
    <h2 class="title"></h2>
    <div class="preset"></div>
    <div class="operator_display_wrap">
            <h3 class="subtitle">operator</h3>
            <code class="operator_display"></code>
    </div>
    <div class="demo-content">
        <div class="table-wrap">
            <h3 class="subtitle">input table</h3>
            <table class="input_table"></table>
            <p class="input_warning"></p>
        </div>
        
        <div class="op-arg-2-wrap">
            <div class="table_b_wrap">
                <h3 class="subtitle">input table b</h3>
                <table class="input_table_b"></table>
                <p class="input_warning_b"></p>
            </div>
            <div class="arg_2_number_wrap">
                <h3 class="subtitle">numerical argument</h3>
                <div class="arg_2_number">
                </div>
            </div>
        </div>
        <div class="table-wrap">
            <h3 class="subtitle">output table</h3>
            <table class="output_table"></table>
        </div>
        <div class="example-code-wrap">
            <h3>example code</h3>
            <button onclick="copyText(event)">copy code</button>
            <pre><code class="example-code language-python">...</code></pre>
        </div>
    </div>
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
        if (intFields.includes(colName) || FORCE_INT_INPUT.includes(colName)) intColumns.push(i);
    }
    
    // console.log(editableColumns);
    outstring += buildTableHeader(table.columns);
    outstring += buildTableRows(table.data, editableColumns, intColumns);
    if (editableFields.length > 0) {
        console.log('ADDING BUTTON')
        outstring += `<tr><td><button class="add-input-row-button">add row</button></td></tr>`
        outstring += '<!-- GHOSTLY COMMENT -->'
    }
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
    outstring += `<div class="radio">`
    for (var i in options) {
        var opt = options[i];
        outstring += '<label>'+opt+'</label>';
        outstring += '<input type=\"radio\" name=\"'+name+'\" id=\"'+opt+'\"';
        if (checked == opt) outstring += ' checked=\"checked\"';
        outstring += '/>';
    }
    outstring += '</div></fieldset></form>'
    return outstring;
}

function buildSelect(options, name, value, displayname=name){
    // if (!displayname) displayname = name;
    var outstring = '<fieldset>';
    outstring += '<legend>select a '+displayname+':</legend>';
    outstring += '<select name=\"'+name+'\" class=\"'+name+'\">'
    for (var i in options) {
        var opt = options[i];
        outstring += `<option value="${opt}"`
        if (opt == value) outstring += ` selected="selected"`
        outstring += `>${opt}</option>`;
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