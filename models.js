// used as an abstract class for all demos
class BaseModel {

    static idCounter = 0; // for giving each model-view pair in a given page a unique id
    uid;

    constructor(containerDiv) {
        this.uid = 'in_d_' + BaseModel.idCounter++;
    }

}

class PtRetrieval extends BaseModel {

    title = 'default title';
    slug = 'pyterrier/retrieval/';
    inputTable = new Table();
    outputTable = new Table();
    wmodel = 'BM25';
    dataset = 'vaswani';
    variant = 'terrier_stemmed';
    view;

    defaultColumns = ['qid','query'];
    defaultData = [['4','chemical'],['1','cats']];
    defaultNewQuery = '';

    constructor(containerDiv) {
        super();
        this.inputTable.resetContents(this.defaultColumns, this.defaultData);
        this.outputTable.resetContents();
        if ($(containerDiv).data('title')) {
            this.title = $(containerDiv).data('title');
        }
        // keep this last for now
        this.view = new PtRetrievalView(containerDiv, this);
    }

    requestOutputTable() {
        postjson(
            this.buildUrl(),
            JSON.stringify(this.inputTable),
            function(results){
                // console.log('successful post');
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