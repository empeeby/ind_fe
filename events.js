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
    });
}

eventListeners.push(submitListener);

// input table updates
function inputTableListener(containerDiv, targetClass) {
    // listen for edits to input table data
    $(containerDiv).find(targetClass).find('td.editable').each(function(){
        $(this).bind('input', function(e){
            
            var rowNum = $(e.target.parentElement).data('rownum');
            var colNum = $(e.target).data('colnum');
            var content = e.target.firstChild.textContent;

            // soft type convert to float or int
            // if the value is a string, but contains only numerical chars
            // parse it to a number (int if it appears so, float otherwise)
            if($(this).hasClass('softnumberconvert')) {
                content = softNumberConvert(content);
            }
            
            // type forcing here, all content is originally in string form
            if ($(this).hasClass("forceinteger")) {
                content = parseInt(content);
                if (isNaN(content)) content = 0;

                if (String(content) == '') {
                    content = 0;
                }
                
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

            var parentDemo = getParentDemoModel(this);
            var parentTable;

            switch (targetClass) {
                case '.input_table':
                    parentTable = parentDemo.inputTable;
                    break;
                case '.input_table_b':
                    parentTable = parentDemo.arg_2_table;
                    break;
            }
            
            // update the table data model & request ui update
            parentTable.updateCell(rowNum, colNum, content);
            parentDemo.requestOutputTable();
        });
    })
}

inputTableEventListeners.push(inputTableListener);

// add row to input table
function addInputRowListener(containerDiv, targetClass) {
    $(containerDiv).find(targetClass).find('.add-input-row-button').click(function(){
        var parentModel = getParentDemoModel(this);
        parentModel.addInputRow(targetClass);
    })
}

inputTableEventListeners.push(addInputRowListener);

function deleteInputRowListener(containerDiv, targetClass) {
    $(containerDiv).find(targetClass).find('.del-input-row-button').click(function(){
        var rowNum = $(this).closest('tr').data('rownum');
        getParentDemoModel(this).deleteInputRow(rowNum, targetClass);
    })
}
inputTableEventListeners.push(deleteInputRowListener);

function tableEditListener(containerDiv, targetClass) {
    $(containerDiv).find(targetClass).find('.editable').on('keypress', function(e) {
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
inputTableEventListeners.push(tableEditListener);


function initDatasetSelect(containerDiv) {
    $(containerDiv).find( "[name='dataset']").on('change', function(e){
        parentModel = getParentDemoModel(this);
        parentModel.selectedDataset = e.target.id;
        parentModel.updateVariants();
        parentModel.requestOutputTable();
    });
}
eventListeners.push(initDatasetSelect);

function initVariantSelect(containerDiv) {
    $(containerDiv).find("[name='variant']").on('change', function(e){
        console.log('radio change');
        console.log(e.target.id)
        getParentDemoModel(this).selectedVariant = e.target.id;
        getParentDemoModel(this).requestOutputTable();
    });
}
variantSelectEventListeners.push(initVariantSelect);

function initTransformModelSelect(containerDiv) {
    $(containerDiv).find('select.transformmodel').on('change', function(e){
        console.log('select change');
        console.log(e.target.value);
        getParentDemoModel(this).updateTransformModel(e.target.value);
        getParentDemoModel(this).requestOutputTable();
    })
}
eventListeners.push(initTransformModelSelect);

function initNumberInput(containerDiv) {
    $(containerDiv).find(':input[type="number"]').on('change', function(e){
        
        // get the relevant settings for this number input
        var paramName = $(this).attr('name');
        var min = $(this).attr('min');
        var max = $(this).attr('max');
        var step = $(this).attr('step');
        var parentModel = getParentDemoModel(this);
        
        // check the new input is a number within bounds for this number input
        var altered = false;
        var newval = e.target.value;

        if (typeof newval != "number") {
            newval = Number(newval);
            altered = true;
        }
        if (isNaN(newval)) {
            newval = min;
            altered = true;
        }
        if (newval < min) {
            newval = min;
            altered = true;
        }
        if (newval > max) {
            newval = max;
            altered = true;
        }
        if(step == Math.floor(step)) {
            // if step is int, constrain newval to int
            newval = Math.floor(newval); 
            altered = true;
        }

        console.log('number change: ' + parentModel.uid + ' ' + paramName + ' = ' + newval);
        parentModel.set(paramName, newval); // update data model
        if (altered) $(this).val(newval); // update front end display if the val was altered
        parentModel.requestOutputTable();
    })
}
eventListeners.push(initNumberInput);

function initPresetSelect(containerDiv) {
    $(containerDiv).find('select.preset').on('change', function(e){
        console.log('preset change');
        console.log(e.target.value);

        getParentDemoModel(this).loadPreset(e.target.value);
        getParentView(this).updateView();
        callEventListeners(containerDiv);
    })
}

// *******************************************************************************
// user callable functions below, each calls a related group

function callEventListeners(containerDiv) {
    for (i=0; i<eventListeners.length; i++) {
        eventListeners[i](containerDiv);
    }
}

function updateInputTableEventListeners(containerDiv, targetClass='.input_table') {
    // console.log('updateInputTableEventListeners');
    for (i=0; i<inputTableEventListeners.length; i++) {
        inputTableEventListeners[i](containerDiv, targetClass);
    }
}

function updateVariantSelectEventListeners(containerDiv) {
    for (i=0; i<variantSelectEventListeners.length; i++) {
        variantSelectEventListeners[i](containerDiv);
    }
}

function copyText(e) {
    var parentModel = getParentDemoModel(e.target);
    navigator.clipboard.writeText(parentModel.codeExample);
    e.target.textContent = 'code copied';
    function resetTextContent(elem, text) {
        elem.textContent = text;
    }
    setTimeout(resetTextContent, 1500, e.target, 'copy code')
}