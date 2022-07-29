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
    selectedWModel;
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
                this.selectedWModel = this.wmodels[0];
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
            },
            this
        )

    }

    // requestOutputTable() {
    //     console.log('POST request to: '+this.buildUrl());
    //     postjson(
    //         this.buildUrl(),
    //         JSON.stringify(this.inputTable),
    //         function(results){
    //             console.log('successful post');
    //             this.outputTable.resetContents(results.columns, results.data);
    //             this.view.updateOutputTable();
    //         },
    //         this
    //     )
    // }

    buildUrl() {
        return API_BASE_URL + this.slug + this.selectedWModel + '/' + this.selectedDataset + '/' + this.selectedVariant + '/?limit=' + this.limit ;
    }

    // addInputRow() {
    //     // push a new row with a unique qid
    //     this.inputTable.pushRow(this.getNewInputRow());
    //     console.log(this.inputTable.data);
    //     // update the input table view
    //     this.view.updateInputTable();
    //     // get recalculated output table
    //     this.requestOutputTable();
    // }
    
    // deleteInputRow(index) {
    //     this.inputTable.removeRow(index);
    //     console.log(this.inputTable.data);
    //     this.view.updateInputTable();
    //     // this.requestOutputTable();
    //     requestOutputTable(this);
    // }

    getNewInputRow() {
        return [this.getNextQID(), this.defaultNewQuery];
    }

    // update WModel
    updateTransformModel(newModel) {
        this.selectedWModel = newModel;
    }

    // updateVariants() {
    //     console.log('updateVariants');
    //     this.variants=this.indexes[this.selectedDataset];
    //     if (!this.variants.includes(this.selectedVariant)) {
    //         this.selectedVariant = this.variants[0];
    //     }
    //     this.view.updateVariants();
    // }
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
    selectedQEModel;
    qeParams;
    selectedQeParams;
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
                this.selectedQEModel =  this.qemodels[0];
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
        return API_BASE_URL + this.slug + this.selectedQEModel + '/' + this.selectedDataset + '/' + this.selectedVariant + '/';
    }

    // update QEModel
    updateTransformModel(newModel) {
        this.selectedQEModel = newModel;
        this.updateQeParams();

    }

    updateQeParams() {
        this.selectedQeParams = this.qeParams[this.selectedQEModel];
        console.log('qe model: ' + this.selectedQEModel + '; params: ' + this.selectedQeParams);
        // update view? or is that done from the event?
        if (this.loaded) this.view.updateQeParamsView();
    }

    getNewInputRow() {
        return [this.getNextQID(),0,'',0,0,''];
    }

    // OVERRIDE
    requestOutputTable(data=this.inputTable) {
        // strip rows with an empty query field (or pt will throw error)

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

        super.requestOutputTable(cleaneddata);
    }

}