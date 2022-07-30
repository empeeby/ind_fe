var API_BASE_URL = 'http://127.0.0.1:8888/';

var defaultQeParams = {
    'fb_docs': {
        'value': 3,
        'min': 0,
        'max': null,
        'step': 1
    },
    'fb_terms': {
        'value': 10,
        'min': 0,
        'max': null,
        'step': 1
    },
    'fb_lambda': {
        'value': 0.6,
        'min': 0,
        'max': 1,
        'step': 0.01
    }
}

// get requests for 'static' server variables in here?
// longer initial load vs more responsive?
// would also need to ensure request received before processing...