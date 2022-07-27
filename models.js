// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each model-view pair in a given page a unique id
    uid;

    constructor() {
        this.uid = 'in_d_' + BaseModel.idCounter++;
        this.demoInitialised = false;
    }

}

class PtRetrieval extends BaseModel {

    title = 'default title';
    slug = 'pyterrier/retrieval/';
    inputTable = new Table();
    outputTable = new Table();
    wmodels = ['BM25','DLH','Tf','TF_IDF']
    wmodel = 'BM25';
    datasets = ["vaswani", "msmarco_document", "trec-covid"];
    dataset = 'vaswani';
    variants = ['terrier_stemmed', 'terrier_unstemmed'];
    variant = 'terrier_stemmed';
    indexes
    view;

    defaultColumns = ['qid','query'];
    defaultData = [['0','chemical'],['1','cats']];
    defaultNewQuery = '';

    constructor(containerDiv) {
        super();


        getdata(
            API_BASE_URL+'valid_values/indexes/',
            function(data){
                this.indexes = data
                console.log(this.indexes)
                this.datasets=Object.keys(this.indexes)
                this.dataset=this.datasets[0]
                this.variants=this.indexes[this.dataset]
                console.log(this.variants)
        
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
        return API_BASE_URL + this.slug + this.wmodel + '/' + this.dataset + '/' + this.variant + '/';
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
}