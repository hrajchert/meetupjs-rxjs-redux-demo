// import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';



export interface IReducer<S, A extends IAction> {
    (state: S, action?: A): S;
}

export interface IAction {
    type: string;
    payload?: any;
}

export class Store<S, A extends IAction> {
    // private _dispacher = new Subject();
    private _state: Observable<S>;
    private _dispacher: BehaviorSubject<S>;

    constructor (private reducer: IReducer<S, A>) {
        // this._state = this._dispacher
        //     // Starts with an initial action that shouldn't be mapped
        //     .startWith({type: 'INITIAL_ACTION'})
        //     .scan(reducer, undefined) // Pass undefined as accu/state so it can use the default
        //     .publishReplay(1).refCount();
        // this._state = Observable.of({type: 'INITIAL_ACTION'})
            // Starts with an initial action that shouldn't be mapped
            // .scan(reducer, undefined) // Pass undefined as accu/state so it can use the default
            // .publish(1).refCount();
        const action = {type: '___INITIAL_ACTION___'} as A;
        this._dispacher = new BehaviorSubject(reducer(undefined, action));
        this._state = this._dispacher
            .delay(0) // I need to add this to avoid "circular dependencies" in the suscription chain
                      // Basically it forces the action to be fired in a different context than the current
            ;

    }

    dispatch (action: A) {
        this._dispacher.next(this.reducer(this._dispacher.value, action));
    }

    select (): Observable<S>;
    select<K1 extends keyof S> (arg1: K1): Observable<S[K1]>;
    select<K1 extends keyof S, K2 extends keyof S[K1]> (arg1: K1, arg2: K2): Observable<S[K1][K2]>;
    select<K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]> (arg1: K1, arg2: K2, arg3: K3): Observable<S[K1][K2][K3]>;
    select<K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3]> (arg1: K1, arg2: K2, arg3: K3, arg4: K4): Observable<S[K1][K2][K3][K4]>;
    select<K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3], K5 extends keyof S[K1][K2][K3][K4]> (arg1: K1, arg2: K2, arg3: K3, arg4: K4, arg5: K5): Observable<S[K1][K2][K3][K4][K5]>;
    select<K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2], K4 extends keyof S[K1][K2][K3], K5 extends keyof S[K1][K2][K3][K4], K6 extends keyof S[K1][K2][K3][K4][K5]> (arg1: K1, arg2: K2, arg3: K3, arg4: K4, arg5: K5, arg6: K6): Observable<S[K1][K2][K3][K4][K5][K6]>;
    select (...args) {
        return this._state.map(state => {
            return args.reduce((subState, key) => {
                if (typeof subState === 'object') {
                    return subState[key];
                } else {
                    return subState;
                }
            }, state);
        }).distinctUntilChanged();
    }
}

export type IReducerMap<ST, A extends IAction> = {
    [K in keyof ST]: IReducer<ST[K], A>;
};

export function combineReducers<ST, A extends IAction> (reducers: IReducerMap<ST, A>): IReducer<ST, A> {
    return (state = {} as ST, action: A) => {
        return Object.keys(reducers).reduce(
            (nextState, key) => {
                nextState[key] = reducers[key](state[key], action);
                return nextState;
            },
            {} as ST
        );
    };
}

export interface IPayloadAction<A, P> {
    type: A;
    payload: P;
}

export interface ISimpleAction<A> {
    type: A;
}

