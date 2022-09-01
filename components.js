class Table {
    constructor(columns=[], data=[]) {
        this.columns = columns;
        this.data = data;
    }

    updateCell(rowIndex, colIndex, value) {
        this.data[rowIndex][colIndex] = value;
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
        // alert can be enabled during development to return server errors
        // alert( "Request failed: " + JSON.stringify(msg) );
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
        // alert can be enabled during development to return server errors
        // alert( "Request failed: " + JSON.stringify(msg) );
    })
}

function softNumberConvert(value) {
    if (typeof value === "number") return value;

    var parsedValue = parseFloat(value);

    // trim a copy the string so that it will match the output of parsedValue.toString() (if it is readable as a number)
    // in order, we are stripping:
    // - the first character if == '-'
    // - all trailing zeros at the beginning or end
    // - the last character if '.'
    
    var trimmedValue = value.replace(/^-/, '').replace(/^0+/, '').replace(/0+$/, '').replace(/\.$/, '');
    if (parsedValue > -1 && parsedValue < 1) {
        // if the value is less than 1 and more than -1, replace 1 zero at the start
        trimmedValue = '0' + trimmedValue;
    }
    if (parsedValue < 0) {
        // if the value is negative, replace the negative sign
        trimmedValue = '-' + trimmedValue;
    }

    if (trimmedValue == parsedValue.toString()) {
        // if the parsed (as string) and trimmed versions matched, the input value was 'a number disguised as a string'
        // so return the number version
        return parsedValue;
    } else {
        // if not, pass on the string that the user input
        return value;
    }
}
