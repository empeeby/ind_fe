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
        
        $(this.containerDiv)
            .find('.input_table')
                .html(tableToHTML(this.model.inputTable));        
        
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
        $(this.containerDiv)
            .find('.output_table')
                .html(tableToHTML(this.model.outputTable));
    }
    // drawView() {
    //     $(this.containerDiv).html(tableToHTML(this.model.inputTable));
    // }
}

function tableToHTML(table) {
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