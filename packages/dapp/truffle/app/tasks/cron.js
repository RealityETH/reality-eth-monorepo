var RealityCheck = artifacts.require("./RealityCheck.sol");
var Arbitrator = artifacts.require("./Arbitrator.sol");

module.exports = function(callback) {
    console.log('in script')
    console.log('loading questions');

    var max_entries = 10;

    var top_entries = {
        'latest_created': {'ids': [], 'vals': []},
        'latest_completed': {'ids': [], 'vals': []},
        'latest_active': {'ids': [], 'vals': []},
        'highest_bounty': {'ids': [], 'vals': []}
    }

    function insert_if_higher(arr_name, id, val) {
        var arr = top_entries[arr_name]['vals']

        // If the list is full and we're lower, give up
        if (arr.length > max_entries) {
            var last_entry = arr[arr.length-1];
            if (last_entry > val) {
                return false;
            }
        }

        // go through from the top until we find something we're higher than
        var i = 0;
        for (i = 0; i <= arr.length; i++) {
            if ( (val >= arr[i]) || (i == arr.length) ) {
                // found a spot
                top_entries[arr_name]['ids'].splice(i, 0, id);
                top_entries[arr_name]['vals'].splice(i, 0, val);
                if (arr.length > max_entries) {
                    top_entries[arr_name]['ids'].pop();
                    top_entries[arr_name]['vals'].pop();
                }
                return true;
            }
            if (i > max_entries) {
                return false;
            }
            i++;
        }
    }

    RealityCheck.deployed().then(function(instance) {
        rc = instance;
        return rc.LogNewQuestion({}, {fromBlock:0x00, toBlock:'latest'});
    }).then(function(question_posted) {
        question_posted.watch(function(error, result) {
            if (error === null) {
                var question_id = result.args.question_id;
                console.log('question_id', question_id);
                rc.questions.call(question_id).then( function(res) {
                    //console.log('here is result', res)
                    var created = res[0].toString()
                    var bounty = res[5].toString()
                    var is_finalized = res[8];
                    if (insert_if_higher('latest_created', question_id, created)) {
                        console.log(top_entries);
                    }
                    console.log('bounty', bounty, 'is_finalized', is_finalized);
                });
            } else {
                console.log(e);
            }
        });
    }).catch(function (e) {
      console.log(e);
    });
}
    
