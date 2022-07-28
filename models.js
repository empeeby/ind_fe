// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each model-view pair in a given page a unique id
    uid;
    view;
    title = 'in_d demo'

    constructor() {
        this.uid = 'in_d_' + BaseModel.idCounter++;
    }

        
    deleteInputRow(index) {
        this.inputTable.removeRow(index);
        console.log(this.inputTable.data);
        this.view.updateInputTable();
        // this.requestOutputTable();
        requestOutputTable(this);
    }

    updateVariants() {
        console.log('updateVariants');
        this.variants=this.indexes[this.selectedDataset];
        if (!this.variants.includes(this.selectedVariant)) {
            this.selectedVariant = this.variants[0];
        }
        this.view.updateVariants();
    }

}

// 'abstract' functions used by multiple model classes

function loadIndexes(context, indexes) {
    context.indexes = indexes;
    context.datasets=Object.keys(context.indexes);
    context.selectedDataset=context.datasets[0];
    context.variants=context.indexes[context.selectedDataset];
    context.selectedVariant=context.variants[0];
}

function requestOutputTable(context, data=context.inputTable) {
    console.log('POST request to: '+context.buildUrl());
    postjson(
        context.buildUrl(),
        JSON.stringify(data),
        function(results){
            console.log('successful post');
            this.outputTable.resetContents(results.columns, results.data);
            this.view.updateOutputTable();
        },
        context
    )
}

class PtRetrieval extends BaseModel {

    slug = 'pyterrier/retrieval/';
    title = 'pyterrier retrieval demo';
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
                loadIndexes(this, data.indexes);
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

    addInputRow() {
        // push a new row with a unique qid
        this.inputTable.pushRow([this.getNextQID(),this.defaultNewQuery])
        console.log(this.inputTable.data);
        // update the input table view
        this.view.updateInputTable();
        // this.requestOutputTable();
        // get recalculate output table
        requestOutputTable(this);
    }
    
    // deleteInputRow(index) {
    //     this.inputTable.removeRow(index);
    //     console.log(this.inputTable.data);
    //     this.view.updateInputTable();
    //     // this.requestOutputTable();
    //     requestOutputTable(this);
    // }

    getNextQID(){
        // get all existing QIDs
        var existingQIDs = [];
        for (i=0; i<this.inputTable.data.length; i++) {
            existingQIDs.push(parseInt(this.inputTable.data[i][0]))
        }
        // start at 0 and keep incrementing until the number is not taken
        var candidate = 0;
        while (existingQIDs.includes(candidate)) candidate++;
        return candidate.toString();;
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
                loadIndexes(this, data.indexes);

                this.inputTable = new Table(data.default_input_table.columns, data.default_input_table.data);
                this.outputTable = new Table();

                // check for params set by code user in the html data attributes
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }

                this.view = new PtQueryExpansionView(containerDiv, this);
                callEventListeners(containerDiv);
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
        // update view? or is that done from the event?
    }

}