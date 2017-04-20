import {Observable} from 'rxjs/Observable';
import {createDebugger, IMsgOrFnMsg} from './console.util';
import 'rxjs/add/operator/do';

export interface IMapFn<I, O> {
    (input: I): O;
}
const identity = x => x;

export function debugOperator<T> (this: Observable<T>, msgOrFnMsg: IMsgOrFnMsg<T>, mapFn: IMapFn<T, any> = identity) {
    const debug = createDebugger(msgOrFnMsg);
    // return this.lift(new TakeUntilScopeDestroyOperator(scope, thisArg));
    // TODO: Change the way this is done.
    return this.do(x => {
        if (typeof msgOrFnMsg === 'string') {
            debug(msgOrFnMsg, mapFn(x));
        } else {
            debug(msgOrFnMsg(mapFn(x)));
        }
    });
}

export function debugErrorOperator<T> (this: Observable<T>, msgOrFnMsg: IMsgOrFnMsg<T>, thisArg?: any) {
    const debug = createDebugger(msgOrFnMsg);
    // return this.lift(new TakeUntilScopeDestroyOperator(scope, thisArg));
    // TODO: Change the way this is done.
    return this.do(() => {}, x => {
        if (typeof msgOrFnMsg === 'string') {
            debug(msgOrFnMsg, x);
        } else {
            debug(msgOrFnMsg(x));
        }
    });
}
export function debugCompletedOperator<T> (this: Observable<T>, msg: string, thisArg?: any) {
    const debug = createDebugger(msg);
    // return this.lift(new TakeUntilScopeDestroyOperator(scope, thisArg));
    // TODO: Change the way this is done.
    return this.do(() => {}, () => {}, () => {
        debug(msg);
    });
}


Observable.prototype.debug = debugOperator;
Observable.prototype.debugError = debugErrorOperator;
Observable.prototype.debugCompleted = debugCompletedOperator;


declare module 'rxjs/Observable' {
  // tslint:disable-next-line: interface-name
  interface Observable<T> {
    debug: typeof debugOperator;
    debugError: typeof debugErrorOperator;
    debugCompleted: typeof debugCompletedOperator;
  }
}
