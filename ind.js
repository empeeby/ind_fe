// for storing each demo-div and its associated demo-object as key/value pairs
var demos = {};

// for each in_d div, create and instert the demo corresponding to the data field 'endpoint'
$('div.in_d').each(function(){
    switch ($(this).data('endpoint')) {
        case 'pt_retrieval':
            var demo = new PtRetrieval(this);
            // $(this).data('uid', demo.uid);
            $(this).attr('data-uid', demo.uid);
            demos[demo.uid] = demo;
            // console.log(demos.keys());
            // console.log(demos);
            break;
    }
    
});

// used by events to access the parent demo object for a given DOM element
function getParentDemoModel(elem) {
    console.log(elem);
    return demos[$(elem).parents('div.in_d').data('uid')];
}

function getParentView(elem) {
    return demos[$(elem).parents('div.in_d').data('uid')].view;
}

// for (var listener in eventListeners) {
//     listener.call();
// }

callEventListeners();

var pageInitialised = true;