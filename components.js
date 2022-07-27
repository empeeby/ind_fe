class Table {
    constructor(columns, data) {
        this.columns = columns;
        this.data = data;
    }

    updateCell(rowIndex, colIndex, value) {
        // maybe check input is within bounds...
        this.data[rowIndex][colIndex] = value;
        console.log(this);
    }

    pushRow(newRow) {
        this.data.push(newRow);
    }

    removeRow(rowIndex) {
        this.data.splice(rowIndex, 1);
    }

    resetContents(columns, data) {
        this.columns = columns;
        this.data = data;
    }
}

// class EditableTableView {
//     constructor(table, )
// }

function postjson(url, data, success, context) {
    var request = $.ajax({
        type: "POST",
        url: url,
        data: data,
        context: context,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        Accept: 'application/json',
        crossDomain: true,
    });

    request.done(success);

    request.fail(function(msg) {
        alert( "Request failed: " + JSON.stringify(msg) );
      });

}

function getdata(url,success,context) {
    var request = $.ajax({
        type:"GET",
        url:url,
        context:context,
        dataType:'json'
    })

    request.done(success);

    request.fail(function(msg) {
        alert( "Request failed: " + JSON.stringify(msg) );
    })
}
