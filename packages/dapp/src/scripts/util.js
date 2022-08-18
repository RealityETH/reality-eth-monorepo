'use strict';

function isAddressInList(alist, addr, extra_address_level) {
    let l = alist;
    if (extra_address_level) {
        l = alist[extra_address_level.toLowerCase()];
    }
    for (const a in l) {
        if (a.toLowerCase() == addr.toLowerCase()) {
            return true;
        }
    }
    return false;
}

export {
   isAddressInList
};

