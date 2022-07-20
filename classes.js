class demo {
    static idCounter = 0;
    uid;
    constructor() {
        this.uid = 'in_d_demo_' + demo.idCounter++;
    }

    getUid(){
        return this.uid;
    }
}

test1 = new demo();
test2 = new demo();
test3 = new demo();
console.log('test1 id: ' + test1.getUid() + '; test2 id: ' + test2.getUid() + '; test3 id: ' + test3.getUid() + ';')

class pt_retrieval {
    constructor(div) {
        this.homeDiv = div;
        this.inputTable = new Table()
    }
}