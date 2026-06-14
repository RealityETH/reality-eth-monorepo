import { findKey as findKey$1 } from '../../object/findKey.mjs';
import { isObject } from '../predicate/isObject.mjs';
import { iteratee } from '../util/iteratee.mjs';

function findKey(obj, predicate) {
    if (!isObject(obj)) {
        return undefined;
    }
    const iteratee$1 = iteratee(predicate);
    return findKey$1(obj, iteratee$1);
}

export { findKey };
