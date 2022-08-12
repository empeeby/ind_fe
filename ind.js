// for storing each demo-div and its associated demo-object as key/value pairs
var demos = {};

function initDemo(parentDiv, newdemo) {
    // add demo uid to parent div element
    $(parentDiv).attr('data-uid',newdemo.uid);
    // add new demo to the dict of demos for lookup
    demos[newdemo.uid] = newdemo;
}

// for each in_d div, create and instert the demo corresponding to the data field 'endpoint'
$(document).ready(function() {
    $('div.in_d').each(function(){
        switch ($(this).data('endpoint')) {
            case 'pt_retrieval':
                initDemo(this, new PtRetrieval(this));
                break;

            case 'pt_query_expansion':
                initDemo(this, new PtQueryExpansion(this));
                break;

            case 'pt_sdm':
                initDemo(this, new PtSdm(this));
                break;

            case 'pt_transformer_operators':
                initDemo(this, new PtTransformerOperators(this));
                break;
        }
        
    });

    // callEventListeners();
    // IN_D_INITIALISED = true;
});

function getParentDemoModel(elem) {
    // console.log(elem);
    return demos[$(elem).parents('div.in_d').data('uid')];
}

function getParentView(elem) {
    console.log('getParentView for:')
    console.log(elem)
    return demos[$(elem).parents('div.in_d').data('uid')].view;
}
// used by events to access the parent demo object for a given DOM element

// for (var listener in eventListeners) {
//     listener.call();
// }
