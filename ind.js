// for each in_d div, create and instert the demo corresponding to the data field 'endpoint'
$('div.in_d').each(function(){
    switch ($(this).data('endpoint')) {
        case 'pt_retrieval': 
            new PtRetrieval(this);
            break;
    }
    
});