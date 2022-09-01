// data models for all demo types defined in here

// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each demo in a given page a unique id
    uid;
    view;
    title = 'in_d demo'
    loaded = false;
    inputTable;
    outputTable = new Table();
    presets;
    presetNames;
    selectedPresetName;
    transformModels;
    selectedTransformModel;
    datasets;
    selectedDataset;
    datasetNumOfDocs;
    selectedDatasetNumOfDocs;
    variants;
    selectedVariant;
    indexes;
    defaultNewRow;
    timeout;
    codeExample;

    constructor() {
        this.uid = 'in_d_' + BaseModel.idCounter++;
        this.timeout = -1;
    }
    
    getTargetTable(targetClass) {
        switch (targetClass) {
            case ('.input_table'):
                return this.inputTable;
            case ('.input_table_b'):
                return this.arg_2_table;
        }
    }

    addInputRow(targetClass='.input_table') {
        var targetTable = this.getTargetTable(targetClass);
        // push a new row with a unique qid
        targetTable.pushRow(this.getNewInputRow());
        console.log(targetTable.data);
        // update the input table view
        this.view.updateInputTable(targetClass, targetTable);
        this.view.focusLastRow(targetClass);
        // get recalculated output table
        this.requestOutputTable();
    }

    deleteInputRow(index, targetClass='.input_row') {
        var targetTable = this.getTargetTable(targetClass);
        targetTable.removeRow(index);
        console.log(targetTable.data);
        this.view.updateInputTable(targetClass, targetTable);
        // get recalculated output table
        this.requestOutputTable();
    }

    set(attribute, newval) {
        // special cases in switch
        switch (attribute) {
            case 'inputTable':
                this.inputTable = new Table(newval.columns, newval.data);
                if (newval.editable !== 'undefined') {
                    this.userEditableColumns = newval.editable;
                }
                if (newval.new_row !== 'undefined') {
                    this.defaultNewRow = newval.new_row;
                }
                return true;
            case 'model':
                this.updateTransformModel(newval);
                return true;
            case 'dataset':
                this.selectedDataset = newval;
                this.selectedDatasetNumOfDocs = this.datasetNumOfDocs[this.selectedDataset];
                this.variants=this.indexes[this.selectedDataset];
                // this.updateVariants();
            case 'variant':
                this.selectedVariant = newval;
        }

        // checks if an attribute already exists, then sets it if so
        if (typeof this[attribute] !== 'undefined') {
            this[attribute] = newval;
            return true;
        }
        return false;
    }

    updateVariants() {
        // also update number of docs in this dataset
        this.selectedDatasetNumOfDocs = this.datasetNumOfDocs[this.selectedDataset];

        console.log('updateVariants');
        this.variants=this.indexes[this.selectedDataset];
        if (!this.variants.includes(this.selectedVariant)) {
            this.selectedVariant = this.variants[0];
        }
        this.view.updateVariants();
    }

    loadIndexes(indexes) {
        this.indexes = indexes;
        this.datasets=Object.keys(this.indexes);
        this.selectedDataset=this.datasets[0];
        this.variants=this.indexes[this.selectedDataset];
        this.selectedVariant=this.variants[0];
    }

    loadNumDocs(numDocs) {
        this.datasetNumOfDocs = numDocs;
        this.selectedDatasetNumOfDocs = this.datasetNumOfDocs[this.selectedDataset];
    }

    requestOutputTable(data=this.inputTable) {
        // debouncing wrapper to limit calls to the server to once every DEBOUNCE_TIMEOUT milliseconds
        clearTimeout(this.timeout); // clear any pending request
        this.timeout = setTimeout(this.debouncedRequestOutputTable.bind(this), DEBOUNCE_TIMEOUT, data); // create a new request to fire after DEBOUNCE_TIMEOUT ms.
        
        // display a helpful warning to user in common cases that pt throws an error
        if (data.columns != undefined && data.data != undefined) {
            this.updateInputTableWarning(data);
        } else if (data.input_table_a != undefined && data.input_table_b != undefined) {
            this.updateInputTableWarning(data.input_table_a);
            this.updateInputTableWarning(data.input_table_b, '.input_warning_b');
        }

    }

    debouncedRequestOutputTable(data=this.inputTable) {
        console.log('POST request to: '+this.buildUrl());
        postjson(
            this.buildUrl(),
            JSON.stringify(data),
            function(results){
                console.log('successful post');
                this.outputTable.resetContents(results.columns, results.data);
                this.codeExample = results.example_code;
                this.view.updateOutputTable();
            },
            this // pass context to success function
        )
    }

    getNewInputRow(){
        var newRow = [];

        console.log('defNewRow = ')
        console.log(this.defaultNewRow)

        for (var j=0; j<this.defaultNewRow.length; j++) {
            var newValue = this.defaultNewRow[j];
            console.log('value ' + j + newValue);
            if (newValue == '#nextQID') {
                newRow[j] = this.getNextQID();
                continue;
            } 
            newRow[j] = newValue;
        }
        console.log('newRow = ')
        console.log(newRow)

        return newRow;
    }
    
    getNextQID(){
        // get all existing QIDs
        var existingQIDs = [];
        var qidColumn = this.inputTable.columns.indexOf('qid');
        for (i=0; i<this.inputTable.data.length; i++) {
            existingQIDs.push(parseInt(this.inputTable.data[i][qidColumn]))
        }
        // start at 0 and keep incrementing until the number is not taken
        var candidate = 0;
        while (existingQIDs.includes(candidate)) candidate++;
        return candidate.toString();;
    }

    // update WModel or QEModel
    updateTransformModel(newModel) {
        this.selectedTransformModel = newModel;
    }

    cleanEmptyQueries(data) {
        // clone the table (we don't want to alter the data model, just the request)
        var cleaneddata = new Table();
        $.extend(true, cleaneddata, data)
        
        // get column index of 'query'
        var queryindex = cleaneddata.columns.indexOf('query');

        for (i=0; i<cleaneddata.data.length; i++) {
            var thisquery = cleaneddata.data[i][queryindex];
            console.log(thisquery);
            // if this row's query is empty or just whitespace, remove the row
            if (thisquery.trim().length == 0) {
                cleaneddata.removeRow(i);
                // decrement i to account for lost index
                i--;
            }
        }

        return cleaneddata;
    }

    updateInputTableWarning(intable, target='.input_warning') {
        // if there is not a view loaded yet, skip this
        if (this.loaded == false) return;

        // we are displaying warnings for:
        //  - empty query fields
        //  - docids out of range

        var queryindex = intable.columns.indexOf('query');
        var emptyQueryFound = false;
        var docidindex = intable.columns.indexOf('docid');
        var badDocIdFound = false;

        for (i=0; i<intable.data.length; i++) {
            // if this table has a query column
            if (queryindex >= 0) {
                var thisquery = intable.data[i][queryindex];
                // if this row's query is empty or just whitespace, tell view to display a warning
                if (thisquery.trim().length == 0) {
                    console.log('EMPTY QUERY FOUND');
                    var warnString = 'CAUTION: one or more queries are empty.<br/>This can cause PyTerrier to return an error.';
                    this.view.setWarning(warnString, target);
                    emptyQueryFound = true;
                }
            }
            // if this table has a docid column
            if (docidindex >= 0) {
                var thisdocid = intable.data[i][docidindex];
                // if this row's query is empty or just whitespace, tell view to display a warning
                if (thisdocid >= this.selectedDatasetNumOfDocs) {
                    console.log('BAD DOCID FOUND');
                    var warnString = `CAUTION: one or more docid values out of range.<br/>
                    This can cause PyTerrier to return an error.<br/>
                    Selected dataset '${this.selectedDataset}' has ${this.selectedDatasetNumOfDocs} documents.<br/>
                    Valid docids in the range 0 - ${this.selectedDatasetNumOfDocs-1}` ;
                    this.view.setWarning(warnString, target);
                    badDocIdFound = true;
                }
            }
        }

        // if there are no errors
        if (!emptyQueryFound && !badDocIdFound) {
            this.view.setWarning('', target);
        }
    }

    initPreset(presetData, index=0) {
        this.presets = presetData;
        this.presetNames = Object.keys(this.presets);
        if (index >= this.presetNames.length) {
            if (index == 0) {
                // if there are no presets
                console.log('ERROR: no presets found!');
                return;
            }
            console.log('CAUTION: preset index out of range, loading preset index 0 instead');
            index = 0;
        }
        this.loadPreset(this.presetNames[index]);
    }

    loadPreset(presetName) {
        console.log('load preset')
        // if preset doesn't exist, warn and stop (this should never happen in normal use as the select menu only has valid names by design)
        if (!this.presets.hasOwnProperty(presetName)) {
            console.log(`WARNING: Preset ${presetName} does not exist.`);
            return;
        }

        this.selectedPreset = this.presets[presetName];

        console.log('this selpre: ')
        console.log(this.selectedPreset)

        // load each value in this preset
        for (const item in this.selectedPreset) {
            this.set(item, this.selectedPreset[item]); // CAUTION: make sure set attribute names that don't correlate directly to class attributes are loaded correctly in overloaded child method
        }

    }

}


class PtRetrieval extends BaseModel {

    slug = 'pyterrier/retrieval/';
    title = 'pyterrier retrieval demo';
    intColumns = []; 
    template = templates.ptRetrieval;
    limit=0;

    constructor(containerDiv) {
        super(containerDiv);

        // API GET request to get available datasets/settings
        // setup function is done once this is returned
        getdata(
            API_BASE_URL+'pyterrier/retrieval/get-params/',
            function(data){
                    
                // initialise data model from GET request results
                // e.g. get preset data, available models + indexes
                this.transformModels = data.wmodels;
                this.loadIndexes(data.indexes);
                this.loadNumDocs(data.dataset_number_of_docs);
                this.initPreset(data.presets);
                
                console.log('the presets')
                console.log(this.presetNames.length)

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }
                
                // model is set up, create and link a view
                this.view = new PtRetrievalView(containerDiv, this);

                this.loaded = true;
            },
            this
        )

    }

    buildUrl() {
        return API_BASE_URL + this.slug + this.selectedTransformModel + '/' + this.selectedDataset + '/' + this.selectedVariant + '/?limit=' + this.limit ;
    }

}

class PtQueryExpansion extends BaseModel {
    slug = 'pyterrier/query-expansion/';
    title = 'pyterrier query expansion demo';
    template = templates.ptQueryExpansion;
    userEditableColumns = ['query','qid','docno', 'docid', 'rank','score'];
    qeParams;
    selectedQeParams;
    selectedParamProps;

    constructor(containerDiv) {
        super();

        getdata(
            API_BASE_URL+'pyterrier/query-expansion/get-params/',
            function(data) {
                
                // initialise data model from GET request results
                // e.g. get preset data, available models (+ their additional params) + indexes
                this.qeParams = data.qemodels;
                this.transformModels = Object.keys(data.qemodels);
                // this.selectedTransformModel =  this.transformModels[0];
                // this.updateQeParams();
                this.loadIndexes(data.indexes);
                this.loadNumDocs(data.dataset_number_of_docs);
                this.initPreset(data.presets);

                // this.inputTable = new Table(data.default_input_table.columns, data.default_input_table.data);
                // this.outputTable = new Table();

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }

                this.view = new PtQueryExpansionView(containerDiv, this);
                // callEventListeners(containerDiv);
                this.loaded=true;
            },
            this
        )
    }

    buildUrl() {
        var outstring = `${API_BASE_URL}${this.slug}${this.selectedTransformModel}/${this.selectedDataset}/${this.selectedVariant}/?`;
        for (i in this.selectedQeParams) {
            var thisParam = this.selectedQeParams[i];
            var thisParamProps = this.qeParams[this.selectedTransformModel][thisParam];
            outstring += `${thisParam}=${thisParamProps['value']}&`
        }
        return outstring;
    }
    
    updateQeParams() {
        this.selectedQeParams = Object.keys(this.qeParams[this.selectedTransformModel]);
        console.log('qe model: ' + this.selectedTransformModel + '; params: ' + this.selectedQeParams);
        if (this.loaded) this.view.updateQeParamsView();
    }
    
    // OVERRIDE
    updateTransformModel(newModel) {
        super.updateTransformModel(newModel);
        this.updateQeParams();
    }

    //OVERRIDE
    // catches the qe parameters that are buried within the qeParams Object
    set(attribute, value) {
        // if this returns false then the attribute doesn't exist at top level within this model
        if (!super.set(attribute, value)) {
            // so check if it is a qe param for the currently selected qe model
            if (this.selectedQeParams.includes(attribute)) {
                // if so, update this in the main qeParams object
                this.qeParams[this.selectedTransformModel][attribute]['value'] = value;
                return true;
            }
        }
    }

}

class PtSdm extends BaseModel {
    slug = 'pyterrier/sdm/';
    title = 'pyterrier SDM demo';
    template = templates.ptSdm;
    userEditableColumns = ['query'];
    intColumns = [];

    defaultNewQuery = '';

    constructor(containerDiv) {
        super()

        getdata(
            API_BASE_URL+'pyterrier/sdm/get-params/',
            function(data) {
                this.initPreset(data.presets);

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }

                this.view = new PtSdmView(containerDiv, this);
                this.loaded = true;
            },
            this
        )

    }

    buildUrl() {
        return `${API_BASE_URL}${this.slug}`;
    }

}

class PtTransformerOperators extends BaseModel {
    slug = 'pyterrier/transformer-operators/';

    title = 'pyterrier transformer operators demo';
    template = templates.ptTransformerOperators;
    userEditableColumns = ['query','qid','docno', 'docid', 'rank','score'];
    intColumns = [];
    operators;
    selectedOperator;
    operatorInfo;
    arg_2_type;
    arg_2_table = new Table();
    arg_2_number = 123;

    constructor(containerDiv) {
        super();

        getdata(
            API_BASE_URL+'pyterrier/transformer-operators/get-params/',
            function(data) {
                this.operatorInfo = data.operators;
                this.operators = Object.keys(data.operators);

                this.initPreset(data.presets);

                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }
                this.view = new PtTransformerOperatorsView(containerDiv, this);
                this.loaded=true;
            },
            this
        )
    }

    buildUrl(){
        var url_op
        if (this.selectedOperator == '%') {
            url_op = '%25';
        } else {
            url_op = this.selectedOperator;
        }
        var outstring = `${API_BASE_URL}${this.slug}${url_op}/`
        
        if (this.arg_2_type == 'float' || this.arg_2_type == 'int') {
            outstring += `?numerical_arg=${this.arg_2_number}`;
        }

        return outstring;
    }

    // OVERRIDE - handle operator/arg2 switching
    set(attribute, newval) {
        switch (attribute) {
            case 'operator':
                if (this.operators.includes(newval)) {
                    this.selectedOperator = newval;
                    this.arg_2_type = this.operatorInfo[this.selectedOperator];
                    return true;
                } else {
                    return false;
                }
            case 'arg_2_table':
                this.arg_2_table = new Table(newval.columns, newval.data);
                if (newval.editable !== 'undefined') {
                    this.userEditableColumns = newval.editable;
                }
                if (newval.new_row !== 'undefined') {
                    this.defaultNewRow = newval.new_row;
                }
                return true;
        }

        super.set(attribute, newval);

    }

    // OVERRIDE
    requestOutputTable(){
        var data = {}
        data['input_table_a'] = this.inputTable;
        data['input_table_b'] = this.arg_2_table;
        console.log(data);
        super.requestOutputTable(data);
    }

}

// interface for new models
// buildUrl() //return post request url as string