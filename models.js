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
    defaultData = [['1','chemical'],['2','cats']];

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
                console.log('success');
                this.outputTable.resetContents(results.columns, results.data);
                this.view.updateOutputTable();
            },
            this
        )
    }

    buildUrl() {
        return API_BASE_URL + this.slug + this.wmodel + '/' + this.dataset + '/' + this.variant + '/';
    }
}