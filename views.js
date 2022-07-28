class BaseView {

    containerDiv;
    model;
    viewInitialised;

    constructor(containerDiv, model) {
        this.containerDiv = containerDiv;
        this.model = model;
        this.drawTemplate();
        this.updateView();
    }

    // /////////////////////////////
    // methods below are an interface that must be implemented in all children
    // /////////////////////////////
    // updateView(){}
    // /////////////////////////////
    // end of interface methods
    // /////////////////////////////

    drawTemplate() {
        $(this.containerDiv).append(this.model.template);
    }

    updateTitle() {
        $(this.containerDiv)
            .find('.title')
                .html(this.model.title);
    }

    updateInputTable() {
        $(this.containerDiv)
            .find('.input_table')
                .html(tableToHTML(this.model.inputTable, ['query']));
        
        updateInputTableEventListeners(this.containerDiv);
    }

    updateOutputTable() {
        $(this.containerDiv)
            .find('.output_table')
                .html(tableToHTML(this.model.outputTable));
    }
    
    focusLastRow() {
        $(this.containerDiv)
            .find('.input_table')
                .find('td.editable').last().focus();
    }

    updateDatasets(){
        $(this.containerDiv)
            .find('.dataset')
                .append(buildRadioButtons(this.model.datasets, 'dataset', this.model.selectedDataset));        

    }

    updateVariants(){
        $(this.containerDiv)
            .find('.variant')
                .html(buildRadioButtons(this.model.variants, 'variant', this.model.selectedVariant));

        updateVariantSelectEventListeners(this.containerDiv);
    }
}

class PtRetrievalView extends BaseView {

    // template = templates.ptRetrieval;

    constructor(containerDiv, model) {
        super(containerDiv, model);
    }

    updateView() {
        
        this.updateTitle();
        this.updateInputTable();
        this.updateDatasets();
        this.updateVariants();
        
        $(this.containerDiv)
        .find('.transformmodel')
        .append(buildSelect(this.model.wmodels,'transformmodel', 'weighting model'));        
        
        $(this.containerDiv)
        .find('.limit')
        .append(buildNumberField(this.model.limit, 'limit', 'Limit number of results per query (0 indicates no limit):', 0))
            
        requestOutputTable(this.model);        
            // this.model.requestOutputTable();        
    }
    
    // below methods moved to BaseView
    // $(this.containerDiv)
    // .find('.dataset')
    // .append(buildRadioButtons(this.model.datasets, 'dataset', this.model.selectedDataset));        

    // $(this.containerDiv)
    //     .find('.title')
    //         .html(this.model.title);
    
    // updateOutputTable() {
        //     $(this.containerDiv)
    //         .find('.output_table')
    //             .html(tableToHTML(this.model.outputTable));
    // }
    
    // updateInputTable() {
    //     $(this.containerDiv)
    //         .find('.input_table')
    //             .html(tableToHTML(this.model.inputTable, ['query']));
        
    //     updateInputTableEventListeners(this.containerDiv);
    // }
    
    // focusLastRow() {
    //     $(this.containerDiv)
    //         .find('.input_table')
    //             .find('td.editable').last().focus();
    // }

    // updateVariants(){
    //     $(this.containerDiv)
    //         .find('.variant')
    //             .html(buildRadioButtons(this.model.variants, 'variant', this.model.selectedVariant));

    //     updateVariantSelectEventListeners(this.containerDiv);
    // }
   
}

class PtQueryExpansionView extends BaseView {

    constructor(containerDiv, model) {
        super(containerDiv, model);
    }

    updateView() {
        // qemodel (select)

        this.updateTitle();
        this.updateInputTable();
        this.updateDatasets();
        this.updateVariants();

        $(this.containerDiv)
        .find('.transformmodel')
        .append(buildSelect(this.model.qemodels,'transformmodel', 'QE model')); 

        requestOutputTable(this.model);
    }
}


//builders below moved to templates.js

// function tableToHTML(table, editableFields) {
//     var outstring = "";
//     var editableColumns = [];
//     if (editableFields) {
//         for (i = 0; i < table.columns.length; i++) {
//             var colName = table.columns[i];
//             if (editableFields.includes(colName)) editableColumns.push(i);
//         }
//     }
//     // console.log(editableColumns);
//     outstring += buildTableHeader(table.columns);
//     outstring += buildTableRows(table.data, editableColumns);
//     // for (var row of table.data) {
//     //     outstring += buildrow(row);
//     // }
//     return outstring;
// }

// function buildTableHeader(in_array) {
//     var outstring = "<tr>";
//     for (var elem of in_array) {
//         outstring += "<th>" + elem + "</th>";
//     }
//     outstring += "</tr>";
//     return outstring;
// }

// function buildrow(in_array) {
//     var outstring = "<tr>";
//     for (var elem of in_array) {
//         outstring += "<td contenteditable=\"true\" class=\"editable\">" + elem + "</td>";
//     }
//     outstring += "</tr>";
//     return outstring;
// }

// function buildTableRows(in_rows, editableColumns) {
//     var outstring = '';
//     for (row = 0; row < in_rows.length; row++) {
//         outstring += '<tr data-rownum=' + row + '>';
//         for (col=0; col < in_rows[row].length; col++) {
//             outstring += '<td data-colnum=' + col;
//             if (editableColumns.includes(col)) {
//                 outstring += ' contenteditable=\"true\" class=\"editable\"';
//             }
//             outstring += '>' + in_rows[row][col] + '</td>';
//         }
//         if (editableColumns.length > 0) outstring += '<td><button class=\"del-input-row-button\">del</button></td>';
//         // outstring += '<td><button class=\"del-input-row-button\">del</button></td>';
//         outstring += '</tr>';
//     }
//     return outstring;
// }

// function buildRadioButtons(options, name, checked, displayname){
//     if (!displayname) displayname = name;
//     var outstring = '<form><fieldset>';
//     outstring += '<legend>select a '+displayname+':</legend>'
//     for (var i in options) {
//         var opt = options[i];
//         outstring += '<label>'+opt+'</label>';
//         outstring += '<input type=\"radio\" name=\"'+name+'\" id=\"'+opt+'\"';
//         if (checked == opt) outstring += ' checked=\"checked\"';
//         outstring += '/>';
//     }
//     outstring += '</fieldset></form>'
//     return outstring;
// }

// function buildSelect(options, name, displayname){
//     if (!displayname) displayname = name;
//     var outstring = '<fieldset>';
//     outstring += '<legend>select a '+displayname+':</legend>';
//     outstring += '<select name=\"'+name+'\" class=\"'+name+'\">'
//     for (var i in options) {
//         var opt = options[i];
//         outstring += '<option value=\"'+opt+'\">'+opt+'</option>';
//     }
//     outstring += '</select></fieldset>';
//     return outstring;
// }

// function buildNumberField(value, name, displaytext, min=0) {
//     if (!displaytext) displaytext = name;
//     var outstring = '<fieldset>';
//     outstring += '<legend>'+displaytext+'</legend>';
//     outstring += '<input type="number" id=\"'+name+'\" name=\"'+name+'\" min=\"'+min+'\" value=\"'+value+'\">'
//     outstring += '</fieldset>'
//     return outstring;
// }
