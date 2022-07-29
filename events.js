var eventListeners = []
var inputTableEventListeners = []
var variantSelectEventListeners = []


// individual listener functions:
//      each is added to one of the above arrays (groups)
//      a group of related listeners can then be called with a single function

// just for testing - actual demos will update automatically
function submitListener(containerDiv) {
    $(containerDiv).find('.submit-button').click(function(){
        getParentDemoModel(this).requestOutputTable();
        // requestOutputTable(getParentDemoModel(this));
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
            console.log(e)
            // type forcing here, all content is originally in string form
            if ($(this).hasClass("forceinteger")) {
                content = parseInt(content);
                if (isNaN(content)) content = 0;
                // if the content has been 'changed' in the int conversion, update the visible element
                if (e.target.firstChild.textContent != String(content)) {
                    e.target.firstChild.textContent = content;

                    // by default, on change the cursor moves to the beginning of the input field
                    // this moves it to the end
                    range = document.createRange(); //Create a range
                    range.selectNodeContents(this); // Select the entire contents of the element with the range
                    range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
                    selection = window.getSelection(); // get the selection object (allows you to change selection)
                    selection.removeAllRanges(); // remove any selections already made
                    selection.addRange(range); // make the range you have just created the visible selection
                }
                
            }

            var parentDemo = getParentDemoModel(this)
            parentDemo.inputTable.updateCell(rowNum, colNum, content);
            parentDemo.requestOutputTable();
            // requestOutputTable(parentDemo);
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
        parentModel = getParentDemoModel(this);
        // console.log('radio change');
        // console.log(e.target.id)
        parentModel.selectedDataset = e.target.id;
        parentModel.updateVariants();
        parentModel.requestOutputTable();
        // requestOutputTable(parentModel);
    });
}
eventListeners.push(initDatasetSelect);

function initVariantSelect(containerDiv) {
    $(containerDiv).find("[name='variant']").on('change', function(e){
        console.log('radio change');
        console.log(e.target.id)
        getParentDemoModel(this).selectedVariant = e.target.id;
        getParentDemoModel(this).requestOutputTable();
        // requestOutputTable(getParentDemoModel(this));
    });
}
variantSelectEventListeners.push(initVariantSelect);

// change to a more generic modelselect
// would probs need an updateModel method to be implemented for each relevant demo
// function initWModelSelect(containerDiv) {
//     $(containerDiv).find('select.wmodel').on('change', function(e){
//         console.log('select change');
//         console.log(e.target.value);
//         getParentDemoModel(this).selectedWModel = e.target.value;
//         // getParentDemoModel(this).requestOutputTable();
//         requestOutputTable(getParentDemoModel(this));
//     })
// }
// eventListeners.push(initWModelSelect);
function initTransformModelSelect(containerDiv) {
    $(containerDiv).find('select.transformmodel').on('change', function(e){
        console.log('select change');
        console.log(e.target.value);
        getParentDemoModel(this).updateTransformModel(e.target.value);
        getParentDemoModel(this).requestOutputTable();
        // requestOutputTable(getParentDemoModel(this));
    })
}
// eventListeners.push(initWModelSelect);
eventListeners.push(initTransformModelSelect);

function initNumberInput(containerDiv) {
    $(containerDiv).find(':input[type="number"]').on('change', function(e){
        
        var paramName = $(this).attr('name');
        var min = $(this).attr('min');
        var max = $(this).attr('max');
        var step = $(this).attr('step');
        var parentModel = getParentDemoModel(this);
        
        var newval = e.target.value;
        if (typeof newval != "number") {
            newval = Number(newval);
        }
        if (isNaN(newval)) {
            newval = min;
        }
        if (newval < min) {
            newval = min;
        }
        if (newval > max) {
            newval = max;
        }
        if(step == Math.floor(step)) newval = Math.floor(newval); // if step is int, constrain newval to int
        
        console.log('number change: ' + parentModel.uid + ' ' + paramName + ' = ' + newval);
        parentModel[paramName] = newval;
        $(this).val(newval);
        parentModel.requestOutputTable();
    })
}
eventListeners.push(initNumberInput);

// function initLimitNumberInput(containerDiv) {
//     $(containerDiv).find("[name='limit']").on('change', function(e){
//         console.log('limit change');
//         console.log(e.target.value);

//         var newval = e.target.value;
//         if (typeof newval != "number") {
//             newval = Number(newval);
//         }
//         if (isNaN(newval)) {
//             newval = 0;
//         }
//         if (newval < 0) {
//             newval = 0;
//         }
//         newval = Math.floor(newval);
//         getParentDemoModel(this).limit = newval;
//         $(this).val(newval);
//         getParentDemoModel(this).requestOutputTable();
//         // requestOutputTable(getParentDemoModel(this));
//     })
// }
// eventListeners.push(initLimitNumberInput)

// *******************************************************************************
// user callable functions below, each calls a related group

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

function updateVariantSelectEventListeners(containerDiv) {
    for (i=0; i<variantSelectEventListeners.length; i++) {
        variantSelectEventListeners[i](containerDiv);
    }
}