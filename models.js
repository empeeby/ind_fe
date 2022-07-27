// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each model-view pair in a given page a unique id
    uid;
    view;

    constructor() {
        this.uid = 'in_d_' + BaseModel.idCounter++;
        this.demoInitialised = false;
    }

}

class PtRetrieval extends BaseModel {

    title = 'default title';
    slug = 'pyterrier/retrieval/';
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

    defaultColumns = ['qid','query'];
    defaultData = [['0','chemical'],['1','cats']];
    defaultNewQuery = '';

    constructor(containerDiv) {
        super();


        getdata(
            API_BASE_URL+'pyterrier/retrieval/get-params/',
            function(data){
                this.inputTable = new Table();
                this.outputTable = new Table();
                this.wmodels = data.wmodels;
                this.selectedWModel = this.wmodels[0];
                this.indexes = data.indexes;
                this.datasets=Object.keys(this.indexes);
                this.selectedDataset=this.datasets[0];
                this.variants=this.indexes[this.selectedDataset];
                this.selectedVariant=this.variants[0];
                this.limit=2;
        
                this.inputTable.resetContents(this.defaultColumns, this.defaultData);
                this.outputTable.resetContents();
                if ($(containerDiv).data('title')) {
                    this.title = $(containerDiv).data('title');
                }
                // keep this last for now
                this.view = new PtRetrievalView(containerDiv, this);

                callEventListeners(containerDiv);
            },
            this
        )
            
            
            // this.inputTable.resetContents(this.defaultColumns, this.defaultData);
            // this.outputTable.resetContents();
            // if ($(containerDiv).data('title')) {
            //     this.title = $(containerDiv).data('title');
            // }
            // // keep this last for now
            // this.view = new PtRetrievalView(containerDiv, this);

            // callEventListeners(containerDiv);
            // this.demoInitialised = true;

    }

    requestOutputTable() {
        console.log('POST request to: '+this.buildUrl());
        postjson(
            this.buildUrl(),
            JSON.stringify(this.inputTable),
            function(results){
                console.log('successful post');
                this.outputTable.resetContents(results.columns, results.data);
                this.view.updateOutputTable();
            },
            this
        )
    }

    buildUrl() {
        return API_BASE_URL + this.slug + this.selectedWModel + '/' + this.selectedDataset + '/' + this.selectedVariant + '/?limit=' + this.limit ;
    }

    addInputRow() {
        this.inputTable.pushRow([this.getNextQID(),this.defaultNewQuery])
        console.log(this.inputTable.data);
        this.view.updateInputTable();
        this.requestOutputTable();
    }

    deleteInputRow(index) {
        this.inputTable.removeRow(index);
        console.log(this.inputTable.data);
        this.view.updateInputTable();
        this.requestOutputTable();
    }

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

    updateVariants() {
        console.log('updateVariants');
        this.variants=this.indexes[this.selectedDataset];
        if (!this.variants.includes(this.selectedVariant)) {
            this.selectedVariant = this.variants[0];
        }
        this.view.updateVariants();
    }
}