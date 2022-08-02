// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each model-view pair in a given page a unique id
    uid;
    view;
    title = 'in_d demo'
    loaded = false;

    constructor() {
        this.uid = 'in_d_' + BaseModel.idCounter++;
    }

    addInputRow() {
        // push a new row with a unique qid
        this.inputTable.pushRow(this.getNewInputRow());
        console.log(this.inputTable.data);
        // update the input table view
        this.view.updateInputTable();
        // get recalculated output table
        this.requestOutputTable();
    }

    deleteInputRow(index) {
        this.inputTable.removeRow(index);
        console.log(this.inputTable.data);
        this.view.updateInputTable();
        // this.view.updateInputTable(this.userEditableColumns);
        // this.requestOutputTable();
        // requestOutputTable(this);
        this.requestOutputTable();
    }

    set(attribute, newval) {
        // checks if an attribute already exists, then sets it if so
        if (typeof this[attribute] !== 'undefined') {
            this[attribute] = newval;
            // console.log(attribute.toUpperCase() +  this[attribute])
            return true;
        }
        return false;
    }

    updateVariants() {
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

    requestOutputTable(data=this.inputTable) {
        console.log('POST request to: '+this.buildUrl());
        postjson(
            this.buildUrl(),
            JSON.stringify(data),
            function(results){
                console.log('successful post');
                this.outputTable.resetContents(results.columns, results.data);
                this.view.updateOutputTable();
            },
            this // pass context to success function
        )
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

}


class PtRetrieval extends BaseModel {

    slug = 'pyterrier/retrieval/';
    title = 'pyterrier retrieval demo';
    userEditableColumns = ['query']; // maybe set this from the server?
    intColumns = []; // also probs set from server
    template = templates.ptRetrieval;
    inputTable;
    outputTable;
    wmodels;
    selectedTransformModel;
    datasets;
    selectedDataset;
    variants;
    selectedVariant;
    indexes;
    limit;

    defaultNewQuery = '';

    constructor(containerDiv) {
        super(containerDiv);

        // API GET request to get available datasets/settings
        // setup function is done once this is returned
        getdata(
            API_BASE_URL+'pyterrier/retrieval/get-params/',
            function(data){
                // initialise data model from GET request results
                this.wmodels = data.wmodels;
                this.selectedTransformModel = this.wmodels[0];
                // loadIndexes(this, data.indexes);
                this.loadIndexes(data.indexes);
                this.limit=3;
                
                this.inputTable = new Table(data.default_input_table.columns, data.default_input_table.data);
                this.outputTable = new Table();

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }
                
                // model is set up, create and link a view
                this.view = new PtRetrievalView(containerDiv, this);

                // view is set up, initialise event listeners
                callEventListeners(containerDiv);
                // this.loaded = true;
            },
            this
        )

    }

    buildUrl() {
        return API_BASE_URL + this.slug + this.selectedTransformModel + '/' + this.selectedDataset + '/' + this.selectedVariant + '/?limit=' + this.limit ;
    }

    getNewInputRow() {
        return [this.getNextQID(), this.defaultNewQuery];
    }

    // update WModel
    updateTransformModel(newModel) {
        this.selectedTransformModel = newModel;
    }

}

class PtQueryExpansion extends BaseModel {
    slug = 'pyterrier/query-expansion/';
    title = 'pyterrier query expansion demo';
    template = templates.ptQueryExpansion;
    userEditableColumns = ['query','qid','docno', 'docid', 'rank','score'];
    intColumns = ['docid']; // also probs set from server
    inputTable;
    outputTable;
    qemodels;
    selectedTransformModel;
    qeParams;
    selectedQeParams;
    selectedParamProps;
    datasets;
    selectedDataset;
    variants;
    selectedVariant;
    indexes;

    constructor(containerDiv) {
        super();

        getdata(
            API_BASE_URL+'pyterrier/query-expansion/get-params/',
            function(data) {
                // qemodel dict might need unpacking
                this.qeParams = data.qemodels;
                this.qemodels = Object.keys(data.qemodels);
                console.log(this.qemodels);
                this.selectedTransformModel =  this.qemodels[0];
                this.updateQeParams();
                // loadIndexes(this, data.indexes);
                this.loadIndexes(data.indexes);

                this.inputTable = new Table(data.default_input_table.columns, data.default_input_table.data);
                this.outputTable = new Table();

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }

                this.view = new PtQueryExpansionView(containerDiv, this);
                callEventListeners(containerDiv);
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
        // this.selectedParamProps = 
        console.log('qe model: ' + this.selectedTransformModel + '; params: ' + this.selectedQeParams);
        // update view? or is that done from the event?
        if (this.loaded) this.view.updateQeParamsView();
    }
    
    getNewInputRow() {
        return [this.getNextQID(),0,'',0,0,''];
    }
    
    // OVERRIDE
    updateTransformModel(newModel) {
        super.updateTransformModel(newModel);
        this.updateQeParams();
    }
    
    // OVERRIDE
    requestOutputTable(data=this.inputTable) {
        var cleaneddata = this.cleanEmptyQueries(data);
        super.requestOutputTable(cleaneddata);
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
    inputTable;
    outputTable;

    defaultNewQuery = '';

    constructor(containerDiv) {
        super()

        getdata(
            API_BASE_URL+'pyterrier/sdm/get-params/',
            function(data) {
                this.inputTable = new Table(data.default_input_table.columns, data.default_input_table.data);
                this.outputTable = new Table();

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }

                this.view = new PtSdmView(containerDiv, this);
                callEventListeners(containerDiv);
            },
            this
        )

    }

    buildUrl() {
        return `${API_BASE_URL}${this.slug}`;
    }

    getNewInputRow() {
        return [this.getNextQID(),this.defaultNewQuery];
    }

    // OVERRIDE 
    requestOutputTable(data=this.inputTable) {
        var cleaneddata = this.cleanEmptyQueries(data);
        super.requestOutputTable(cleaneddata);
    }
}

// interface 
// buildUrl() //return post request url as string
// getNewInputRow // return new row data as array