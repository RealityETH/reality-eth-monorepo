import { flatten } from './flatten.mjs';
import { map } from './map.mjs';
import { iteratee } from '../util/iteratee.mjs';

function flatMapDepth(collection, iteratee$1, depth = 1) {
    if (collection == null) {
        return [];
    }
    const iterateeFn = iteratee(iteratee$1);
    const mapped = map(collection, iterateeFn);
    return flatten(mapped, depth);
}

export { flatMapDepth };
