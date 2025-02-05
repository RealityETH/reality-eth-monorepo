'use strict';
import { addBskyComments } from './bsky-comments.js';
import { TID } from '@atproto/common-web';

const storeCustomContract = function (ctr, custom_contract_str, chain_id) {
    console.log('Trying to store custom deployment', ctr, custom_contract_str);
    const curr = importedCustomContracts(chain_id);
    if (curr[ctr.toLowerCase()]) {
        // already there
        console.log('contract ', ctr, 'already stored');
        return true;
    }
    let current = window.localStorage.getItem('ctr-'+chain_id);
    if (!current) {
        current = '';
    } else if (current && current != '') {
        current = current + ','; 
    }
    window.localStorage.setItem('ctr-'+chain_id, current + custom_contract_str);
}

const importedCustomContracts = function (chain_id) {
    const current = window.localStorage.getItem('ctr-'+chain_id);
    let ret = {};
    if (current) {
        const items = current.split(',');
        for(let i=0; i<items.length; i++) {
            const bits = items[i].split('|');
            const ctr = bits[0].toLowerCase();

            // was persisted with:
            // [q.realityETH, q.factory, q.createdBlock, q.token_address, q.token_symbol, q.token_decimals].join('|'~
            const cfg = {
                'factory': bits[1],
                'createdBlock': bits[2],
                'token_address': bits[3],
                'token_symbol': bits[4],
                'token_decimals': bits[5]
            }
            ret[ctr] = cfg;
        }
    }
    return ret;
}

function renderCurrentSearchFilters(search_filters, jqbody) {
    let is_filtered = false;
    if (search_filters.creator) {
        jqbody.addClass('has-filter-creator');
        jqbody.find('.filter-creator-text').text(search_filters.creator);
        jqbody.find('input.filter-input-creator').val(search_filters.creator);
        is_filtered = true;
    }
    if (search_filters.arbitrator) {
        jqbody.addClass('has-filter-arbitrator');
        jqbody.find('.filter-arbitrator-text').text(search_filters.arbitrator);
        jqbody.find('input.filter-input-arbitrator').val(search_filters.arbitrator);
        is_filtered = true;
    }
    if (search_filters.template_id !== null) {
        jqbody.addClass('has-filter-template-id');
        jqbody.find('.filter-template-id-text').text(search_filters.template_id);
        jqbody.find('input.filter-input-template-id').val(search_filters.template_id);
        is_filtered = true;
    }
    if (search_filters.contract !== null) {
        jqbody.addClass('has-filter-contract');
        jqbody.find('.filter-contract-text').text(search_filters.contract);
        // jqbody.find('input.filter-input-contract').val(search_filters.contract); // done elsewhere 
        is_filtered = true;
    }

    if (is_filtered) {
        jqbody.addClass('has-search-filters');
    }
    jqbody.find('a.filter-edit-toggle').click(function(evt) {
        evt.preventDefault();
        evt.stopPropagation(); 
        if (jqbody.hasClass('filter-edit-on')) {
            jqbody.removeClass('filter-edit-on');
        } else {
            jqbody.addClass('filter-edit-on');
        }
    });
    jqbody.find('input.filter-apply-button').click(function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        let params = {
            'arbitrator': null,
            'creator': null,
            'template': null,
            'contract': null,
        };
        const tidval = jqbody.find('.filter-input-template-id').val();
        const arbval = jqbody.find('.filter-input-arbitrator').val();
        const creval = jqbody.find('.filter-input-creator').val();
        const conval = jqbody.find('.filter-input-contract').val();
        if (/\d/.test(tidval)) {
            params['template'] = parseInt(tidval);
        }
        if (arbval != '') {
            params['arbitrator'] = arbval;
        }
        if (creval != '') {
            params['creator'] = creval;
        }
        if (conval != '') {
            params['contract'] = conval;
        }
        set_hash_param(params);
        location.reload();
    });
}

function parseHash() {
    // Alternate args should be names and values
    if (location.hash.substring(0, 3) != '#!/') {
        return {};
    }
    const arg_arr = location.hash.substring(3).split('/');
    const args = {};
    for (let i = 0; i < arg_arr.length + 1; i = i + 2) {
        const n = arg_arr[i];
        const v = arg_arr[i + 1];
        if (n && v) {
            args[n] = v;
        }
    }
    return args;
}

function set_hash_param(args) {
    let current_args = parseHash();
    let h = '!';
    for (const a in args) {
        if (args.hasOwnProperty(a)) {
            current_args[a] = args[a];
        }
    }
    for (const ca in current_args) {
        if (current_args.hasOwnProperty(ca)) {
            if (current_args[ca] != null) {
                h = h + '/' + ca + '/' + current_args[ca];
            }
        }
    }
    document.location.hash = h;
}

function updateHashQuestionID(jqbody) {
    // Find the front-most question window and set the query param to that.
    // If there are none, unset the URL parameter
    let topz = null;
    let topcqid = null;
    jqbody.find('div.rcbrowser--qa-detail').each(function() {
        const z = parseInt($(this).css("z-index"));
        const cqid = $(this).attr('data-contract-question-id');
        if (z == 0) {
            return;
        } 
        if (!cqid) {
            return;
        }
        if (topz === null || z > topz) {
            topz = z;
            topcqid = cqid;
        }
    }); 
    set_hash_param({'question': topcqid});
}

function loadSearchFilters(args) {
        const search_filters = {
            'creator': null,
            'arbitrator': null,
            'template_id': null,
            'contract': null
        };
        if ('creator' in args) {
            search_filters['creator'] = args['creator'].toLowerCase();
        }
        if ('arbitrator' in args) {
            search_filters['arbitrator'] = args['arbitrator'].toLowerCase();
        }
        if ('template' in args) {
            search_filters['template_id'] = parseInt(args['template']);
        }
        if ('contract' in args) {
            search_filters['contract'] = args['contract'];
        }
        return search_filters;
}

function displayWrongChain(specified, detected, rcc, jq) {
    console.log('displayWrongChain', specified, detected);
    let specified_network_txt = $('.network-status.network-id-'+specified).text();
    let detected_network_txt = $('.network-status.network-id-'+detected).text();
    if (specified_network_txt == '') {
        specified_network_txt = '[unknown network]';
    }
    if (detected_network_txt == '') {
        detected_network_txt = 'another network';
    }
    console.log(specified_network_txt, detected_network_txt);

    const wallet_info = rcc.walletAddParameters(specified);
    if (wallet_info) {
        const lnk = $('<a>');
        lnk.text($('.add-network-button').text());
        lnk.bind('click', function(evt) {
            console.log('add net');
            evt.stopPropagation();
            console.log('getting', specified);

            ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: wallet_info.chainId}]
            }).then((result) => {
                console.log('result was', result);
                location.reload();	
            }).catch((error) => {
                console.log('switching networks failed, will try adding the chain');
                ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [wallet_info]
                }).then((result) => {
                    console.log('result was', result);
                    location.reload();	
                }).catch((error) => {
                    console.log('error trying to switch/add network', error)
                    $('body').addClass('network-switch-error');
                });
            });
            return false;
        });
        $('.add-network-button').empty().append(lnk);
    }

    $('.network-specified-text').text(specified_network_txt);
    $('.network-detected-text').text(detected_network_txt);
    $('body').addClass('error-not-specified-network').addClass('error');

    return;
}

function isProbablyATestnet(chain_name) {
    const markers = ['sepolia', 'goerli', 'rinkeby', 'ropsten', 'holesky', 'kovan', 'kintsugi', 'sokol', 'mumbai', 'test'];
    for (let i=0; i<markers.length; i++) {
        if (chain_name.toLowerCase().indexOf(markers[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function alphabeticalInsert(jli, entry) {
    let done = false;
    jli.find('li').each(function() {
        if (done) {
            return;
        }
        if ($(this).text().localeCompare($(entry).text()) > 0) {
            // console.log('insert', entry, 'before', $(this));
            entry.insertBefore($(this));
            done = true;
        }
    });
    if (!done) {
        // console.log('append', entry, 'to container', jli);
        jli.append(entry);
    }
}

function setupChainList(supported_chains) {
    // console.log('supported_chains', supported_chains);
    // Generate the network status list and chain switch menu based on supported chains
    // If they are already hard-coded in the HTML, leave them alone, we do this if we need customization
    const status_container = $('div.network-status-container');
    const testnet_container = $('.other-chain-list-testnet');
    const mainnet_container = $('.other-chain-list-production');
    for(const cid in supported_chains) {
        const cls = 'network-id-'+cid;
        let txt = supported_chains[cid];
        if (status_container.find('.'+cls).length == 0) {
            //console.log('no class '+cls+', adding');
            const entry = $('<span class="network-status"></span>');
            entry.addClass('network-status');
            entry.addClass(cls);
            entry.text(txt);
            // console.log('append entry', entry);
            status_container.append(entry);
        }
        if (testnet_container.find('[data-chain-id="'+cid+'"]').length == 0 && mainnet_container.find('[data-chain-id="'+cid+'"]').length == 0) {
            const lnk = $('<li class="chain-item"><a href="#"></a></li>');
            lnk.attr('data-chain-id', cid);
            lnk.find('a').attr('href', '#!/network/'+cid).text(txt);
            if (isProbablyATestnet(txt)) {
                alphabeticalInsert(testnet_container, lnk);
            } else {
                alphabeticalInsert(mainnet_container, lnk);
            }
        }
    }
    $('.chain-item a').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        const cid = $(this).closest('.chain-item').attr('data-chain-id')
        window.location.hash = '!/network/'+cid;
        window.location.reload(true);
    })

}

function displayBlueskyComments(question_div) {
    const rkey_clock_identifier = $('body').attr('data-10-bit-chain-id');
    const atproto_did = $('body').attr('data-atproto-did');
    if (!atproto_did) {
        console.log('no did set for bsky comments');
        return;
    }
    if (!rkey_clock_identifier) {
        console.log('no 10bit id for bsky comments');
        return;
    }
    const log_index = parseInt(question_div.attr('data-log-index'));
    const creation_ts = parseInt(question_div.attr('data-creation-ts'));
    if (!log_index || !creation_ts) {
        console.log('no time data for bsky comments');
        return;
    }
    const rkey_ts = creation_ts * 1000000 + log_index;
    console.log("make rkey with ", rkey_ts, rkey_clock_identifier);
    const rkey = TID.fromTime(rkey_ts, rkey_clock_identifier)['str'];
    const at_url = "at://" + atproto_did + "/app.bsky.feed.post/" + rkey;
    console.log('showing comments with at_url', at_url)
    addBskyComments(question_div.find('.bsky-comments-container'), at_url, [atproto_did]);
}

export { 
    storeCustomContract, 
    importedCustomContracts, 
    renderCurrentSearchFilters,
    set_hash_param,
    parseHash,
    updateHashQuestionID,
    loadSearchFilters,
    displayWrongChain,
    setupChainList,
    displayBlueskyComments
}
