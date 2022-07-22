
$('.submit-button').click(function(){
    var parentIndDiv = demos[$(this).parents('div.in_d').data('uid')];
    console.log('submit click: ' + parentIndDiv.uid);
    parentIndDiv.requestOutputTable();
});

$('.input_table').find('td').each(function(){
    $(this).bind('input', function(e){
        console.log(e.target)
        var rowNum = $(e.target.parentElement).data('rownum');
        var colNum = $(e.target).data('colnum');
        var content = e.target.firstChild.textContent;
        var parentIndDiv = demos[$(this).parents('div.in_d').data('uid')];
        parentIndDiv.inputTable.updateCell(rowNum, colNum, content);
        parentIndDiv.requestOutputTable();
    });
})