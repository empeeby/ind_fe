class BaseView {

    containerDiv;
    model;
    viewInitialised = false;

    constructor(containerDiv, model) {
        this.containerDiv = containerDiv;
        this.model = model;
        this.drawTemplate();
        this.updateView();
        this.updatePresets();
        this.viewInitialised = true;
        callEventListeners(containerDiv);
    }

    // /////////////////////////////
    // methods here are an interface that must be implemented in all children
    // /////////////////////////////
    // updateView(){}
    // /////////////////////////////
    // end of interface methods
    // /////////////////////////////

    drawTemplate() {
        $(this.containerDiv).html(this.model.template);
        // $(this.containerDiv).append(this.model.template);
    }

    updateTitle() {
        $(this.containerDiv)
            .find('.title')
                .html(this.model.title);
    }

    updateInputTable(targetClass='.input_table', targetTable=this.model.inputTable) {
        $(this.containerDiv)
            .find(targetClass)
                .html(tableToHTML(targetTable, this.model.userEditableColumns, this.model.intColumns));

        updateInputTableEventListeners(this.containerDiv, targetClass);
    }

    updateOutputTable() {
        $(this.containerDiv)
            .find('.output_table')
                .html(tableToHTML(this.model.outputTable));

        var exampleCodeBlock = $(this.containerDiv).find('.example-code');
        exampleCodeBlock.html(this.model.codeExample);

        // var containerDivElement = this.containerDiv[0];
        // hljs.highlightElement(document.querySelector('pre code'))
        // hljs.highlightElement(containerDivElement.querySelector('pre code'))
        // hljs.highlightElement(exampleCodeBlock[0])
    }
    
    focusLastRow(targetClass='.input_table') {
        $(this.containerDiv)
            .find(targetClass)
                .find('td.editable').last().focus();
    }

    updateDatasets(){
        $(this.containerDiv)
            .find('.dataset')
                .html(buildRadioButtons(this.model.datasets, 'dataset', this.model.selectedDataset));        
                // .append(buildRadioButtons(this.model.datasets, 'dataset', this.model.selectedDataset));        

    }

    updateVariants(){
        $(this.containerDiv)
            .find('.variant')
                .html(buildRadioButtons(this.model.variants, 'variant', this.model.selectedVariant));

        updateVariantSelectEventListeners(this.containerDiv);
    }

    updatePresets(){
        var presetDiv = $(this.containerDiv).find('.preset')
        if (this.model.presetNames.length > 1) {
            presetDiv.html(buildSelect(this.model.presetNames, 'preset', this.model.selectedPresetName))
        } else {
            presetDiv.html('')
        }
    }

    setWarning(warnString, target='.input_warning'){
        $(this.containerDiv)
            .find(target)
                .html(warnString);
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
        // if (!this.viewInitialised) this.updatePresets();
        
        $(this.containerDiv)
        .find('.transformmodel')
        .html(buildSelect(this.model.transformModels,'transformmodel', this.model.selectedTransformModel, 'weighting model'));        
        // .append(buildSelect(this.model.transformModels,'transformmodel', this.model.selectedTransformModel, 'weighting model'));        
        
        $(this.containerDiv)
        .find('.limit')
        .html(buildNumberField(this.model.limit, 'limit', 'Limit number of results per query (0 indicates no limit):'))
        // .append(buildNumberField(this.model.limit, 'limit', 'Limit number of results per query (0 indicates no limit):'))
            
        // requestOutputTable(this.model);        
        this.model.requestOutputTable();        
    }
   
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
        this.updateQeParamsView();

        $(this.containerDiv)
        .find('.transformmodel')
        .html(buildSelect(this.model.transformModels,'transformmodel', this.model.selectedTransformModel, 'QE model')); 
        // .append(buildSelect(this.model.transformModels,'transformmodel', this.model.selectedTransformModel, 'QE model')); 

        // requestOutputTable(this.model);
        this.model.requestOutputTable(); 
    }

    updateQeParamsView() {
        $(this.containerDiv)
        .find('.qe-params')
        .html(this.getAllQeParams());

        // on load these are initialised along with the group, but after every update they must be called again here
        if (this.viewInitialised) initNumberInput(this.containerDiv);
    }

    getAllQeParams() {
        var outstring = '';
        // console.log('selected qe params ' + this.model.uid)
        for (i in this.model.selectedQeParams) {
            var thisParam = this.model.selectedQeParams[i];
            // console.log(thisParam);
            var thisParamProps = this.model.qeParams[this.model.selectedTransformModel][thisParam];
            // console.log(thisParamProps)
            var value = thisParamProps['value']
            var min = thisParamProps['min']
            var max = thisParamProps['max']
            var step = thisParamProps['step']
            outstring += buildNumberField(value, thisParam, thisParam, min, max, step)
        }
        return outstring;
    }

}

class PtSdmView extends BaseView {
    constructor(containerDiv, model) {
        super(containerDiv, model);
    }

    updateView(){
        this.updateTitle();
        this.updateInputTable();
        this.updateOperator();
        this.model.requestOutputTable(); 
    }
}

class PtTransformerOperatorsView extends BaseView {
    constructor(containerDiv, model) {
        super(containerDiv, model);
    }

    updateView() {
        this.updateTitle();
        this.updateInputTable();
        this.updateOperator();
        this.updateArg2();

        this.model.requestOutputTable();
    }

    updateOperator(){
        $(this.containerDiv)
            .find('.operator_display')
                .html(this.model.selectedOperator)
    }

    updateArg2(){
        // update the table and (or?) number input
        
        

        // toggle visibility so that only the right one is shown
        if (this.model.arg_2_type == 'table') {
            console.log('arg2:table')
            this.updateInputTable('.input_table_b', this.model.arg_2_table);

            $(this.containerDiv).find('.table_b_wrap').show();
            $(this.containerDiv).find('.arg_2_number_wrap').hide();

        } else if (this.model.arg_2_type == 'int' || this.model.arg_2_type == 'float') {
            console.log('arg2:number')
            if (this.model.arg_2_type == 'int') {
                var displaytext = 'integer';
                var min = 0;
                var max = null;
                var step = 1;
            } else if (this.model.arg_2_type == 'float') {
                var displaytext = 'float';
                var min = null;
                var max = null;
                var step = 0.01;
            }
            $(this.containerDiv)
                .find('.arg_2_number')
                    .html(buildNumberField(this.model.arg_2_number,'arg_2_number',displaytext,min,max,step))
            if (this.viewInitialised) initNumberInput(this.containerDiv);

            $(this.containerDiv).find('.table_b_wrap').hide();
            $(this.containerDiv).find('.arg_2_number_wrap').show();
        }
    }
}
