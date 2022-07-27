var eventListeners = []
var inputTableEventListeners = []

// just for testing - actual demos will update automatically
function submitListener(containerDiv) {
    $(containerDiv).find('.submit-button').click(function(){
        getParentDemoModel(this).requestOutputTable();
    });
}

eventListeners.push(submitListener);

// input table updates
function inputTableListener(containerDiv) {
    // console.log('inputTableListener');
    $(containerDiv).find('.input_table').find('td.editable').each(function(){
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

// eventListeners.push(inputTableListener);
inputTableEventListeners.push(inputTableListener);

// add row to input table
function addInputRowListener(containerDiv) {
    // console.log('addInputRowListener');
    $(containerDiv).find('.add-input-row-button').click(function(){
        getParentDemoModel(this).addInputRow();
        getParentView(this).focusLastRow();
    })
}

eventListeners.push(addInputRowListener);

function deleteInputRowListener(containerDiv) {
    // console.log('deleteInputRowListener')
    $(containerDiv).find('.del-input-row-button').click(function(){
        var rowNum = $(this).closest('tr').data('rownum');
        // var rowNum = $(e.target.parentElement).data('rownum');
        getParentDemoModel(this).deleteInputRow(rowNum);
    })
}
// eventListeners.push(deleteInputRowListener);
inputTableEventListeners.push(deleteInputRowListener);

function tableEditListener(containerDiv) {
    // console.log('tableEditListener');
    $(containerDiv).find('.editable').on('keypress', function(e) {
        // if user presses enter when editing
        if (e.which == 13) {
            // clear any text selection/highlight
            var sel = window.getSelection ? window.getSelection() : document.selection;
            if (sel) {
                if (sel.removeAllRanges) {
                    sel.removeAllRanges();
                } else if (sel.empty) {
                    sel.empty();
                }
            }
            this.blur(); // remove focus
            return false; // do not input new line
        }
    })
}
// eventListeners.push(tableEditListener);
inputTableEventListeners.push(tableEditListener);


function initDatasetSelect(containerDiv) {
    $(containerDiv).find( "[name='dataset']").on('change', function(e){
        // console.log('radio change');
        // console.log(e.target.id)
        getParentDemoModel(this).dataset = e.target.id;
        getParentDemoModel(this).requestOutputTable();
    });
}
eventListeners.push(initDatasetSelect);

function initVariantSelect(containerDiv) {
    $(containerDiv).find("[name='variant']").on('change', function(e){
        console.log('radio change');
        console.log(e.target.id)
        getParentDemoModel(this).variant = e.target.id;
        getParentDemoModel(this).requestOutputTable();
    });
}
eventListeners.push(initVariantSelect);

function initWModelSelect(containerDiv) {
    $(containerDiv).find('select.wmodel').on('change', function(e){
        console.log('select change');
        console.log(e.target.value);
        getParentDemoModel(this).wmodel = e.target.value;
        getParentDemoModel(this).requestOutputTable();
    })
}
eventListeners.push(initWModelSelect);

function callEventListeners(containerDiv) {
    for (i=0; i<eventListeners.length; i++) {
        eventListeners[i](containerDiv);
    }
}

function updateInputTableEventListeners(containerDiv) {
    // console.log('updateInputTableEventListeners');
    for (i=0; i<inputTableEventListeners.length; i++) {
        inputTableEventListeners[i](containerDiv);
    }
}