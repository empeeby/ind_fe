class BaseView {

    containerDiv;
    model;

    constructor(containerDiv, model) {
        this.containerDiv = containerDiv;
        this.model = model;
        this.drawTemplate();
        this.updateView();
    }

    // methods below are an interface that must be implemented in all children
    // drawTemplate(){}
    // updateView(){}
}

class PtRetrievalView extends BaseView {


    constructor(containerDiv, model) {
        super(containerDiv, model);
    }

    drawTemplate() {
        $(this.containerDiv).append(templates.ptRetrieval);
    }

    updateView() {
        $(this.containerDiv)
            .find('.title')
                .html(this.model.title);
        
        this.updateInputTable();
        // $(this.containerDiv)
        //     .find('.input_table')
        //         .html(tableToHTML(this.model.inputTable));        
        
        $(this.containerDiv)
            .find('.wmodel')
                .html(this.model.wmodel);        
        
        $(this.containerDiv)
            .find('.dataset')
                .html(this.model.dataset);        
        
        $(this.containerDiv)
            .find('.variant')
                .html(this.model.variant);        
        
        this.model.requestOutputTable();        
    }

    updateOutputTable() {
        var outTab =  $(this.containerDiv)
            .find('.output_table')
                .html(tableToHTML(this.model.outputTable));
    }

    updateInputTable() {
        var inTab =  $(this.containerDiv).find('.input_table');
        inTab.html(tableToHTML(this.model.inputTable, ['query']));

        // $(inTab).find('td').each(function(){
        //     $(this).bind('input', function(e){
        //         console.log(e.target)
        //         var rowNum = $(e.target.parentElement).data('rownum');
        //         var colNum = $(e.target).data('colnum');
        //         var content = e.target.firstChild.textContent;
        //         var parentIndDiv = demos[$(this).parents('div.in_d').data('uid')];
        //         parentIndDiv.inputTable.updateCell(rowNum, colNum, content);
        //     });
        // })
    }
   
    // drawView() {
    //     $(this.containerDiv).html(tableToHTML(this.model.inputTable));
    // }
}

function tableToHTML(table, editableFields) {
    var outstring = "";
    var editableColumns = [];
    if (editableFields) {
        for (i = 0; i < table.columns.length; i++) {
            var colName = table.columns[i];
            if (editableFields.includes(colName)) editableColumns.push(i);
        }
    }
    // console.log(editableColumns);
    outstring += buildheader(table.columns);
    outstring += buildrows(table.data, editableColumns);
    // for (var row of table.data) {
    //     outstring += buildrow(row);
    // }
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
        outstring += "<td contenteditable=\"true\" class=\"editable\">" + elem + "</td>";
    }
    outstring += "</tr>";
    return outstring;
}

function buildrows(in_rows, editableColumns) {
    var outstring = '';
    for (row = 0; row < in_rows.length; row++) {
        outstring += '<tr data-rownum=' + row + '>';
        for (col=0; col < in_rows[row].length; col++) {
            outstring += '<td data-colnum=' + col;
            if (editableColumns.includes(col)) {
                outstring += ' contenteditable=\"true\"';
            }
            outstring += '>' + in_rows[row][col] + '</td>';
        }
        outstring += '</tr>';
    }
    return outstring;
}