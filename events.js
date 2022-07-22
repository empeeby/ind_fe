var eventListeners = []
var inputTableEventListeners = []

// just for testing - actual demos will update automatically
function submitListener() {
    $('.submit-button').click(function(){
        // var parentInDDiv = demos[$(this).parents('div.in_d').data('uid')];
        // var parentInDDiv = getParentInDDiv(this);
        // console.log('submit click: ' + parentInDDiv.uid);
        getParentDemoModel(this).requestOutputTable();
    });
}

eventListeners.push(submitListener);

// input table updates
function inputTableListener() {
    $('.input_table').find('td.editable').each(function(){
        $(this).bind('input', function(e){
            // console.log(e.target)
            var rowNum = $(e.target.parentElement).data('rownum');
            var colNum = $(e.target).data('colnum');
            var content = e.target.firstChild.textContent;
            var parentDemo = getParentDemoModel(this)
            parentDemo.inputTable.updateCell(rowNum, colNum, content);
            parentDemo.requestOutputTable();
        });
    })
}

eventListeners.push(inputTableListener);
inputTableEventListeners.push(inputTableListener);

// add row to input table
function addInputRowListener() {
    $('.add-input-row-button').click(function(){
        getParentDemoModel(this).addInputRow();
        getParentView(this).focusLastRow();
    })
}

eventListeners.push(addInputRowListener);

function deleteInputRowListener() {
    $('.del-input-row-button').click(function(){
        var rowNum = $(this).closest('tr').data('rownum');
        // var rowNum = $(e.target.parentElement).data('rownum');
        getParentDemoModel(this).deleteInputRow(rowNum);
    })
}
eventListeners.push(deleteInputRowListener);
inputTableEventListeners.push(deleteInputRowListener);

function tableEditListener() {
    $('.editable').on('keypress', function(e) {

        if (e.which == 13) {
            this.blur();
            return false;
        }
    })
}
eventListeners.push(tableEditListener);
inputTableEventListeners.push(tableEditListener);



function callEventListeners() {
    for (i=0; i<eventListeners.length; i++) {
        eventListeners[i]();
    }
}

function updateInputTableEventListeners() {
    for (i=0; i<inputTableEventListeners.length; i++) {
        inputTableEventListeners[i]();
    }
}
