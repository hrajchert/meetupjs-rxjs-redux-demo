import {ICurry1, ICurry2} from './curry';

export interface IMapFn<E, S> {
    (entrada: E): S;
}

export interface IMaybeChainFn<E, S> {
    (entrada: E): Maybe<S>;
}

export interface IReduceFn<V, A> {
    (accu: A, value: V): A;
}

export interface IElseFn<T> {
    (): Maybe<T>;
}


export abstract class Maybe<T> {
    static of<T> (val: T): Maybe<T> {
        return just(val);
    }

    static nothing<T> (): Maybe<T> {
        return nothing<T>();
    }

    of<T> (val: T) {
        return Maybe.of(val);
    }

    static fromNullable<T> (val: T): Maybe<T> {
        if (val === null || val === void 0) {
            return new Nothing<T>();
        } else {
            return just(val);
        }
    }

    // Applicative
    abstract ap<O, T> (other: Maybe<O>): Maybe<T>;

    // Functor
    abstract map<S> (c: IMapFn<T, S>): Maybe<S>;

    // Monad
    abstract chain<S> (c: IMaybeChainFn<T, S>): Maybe<S>;


    // Foldable
    abstract reduce<A> (fn: IReduceFn<T, A>, accu: A);

    // Maybe specific
    abstract isJust (): boolean;
    abstract isNothing (): boolean;

    // Extract and recover
    abstract get (): T;
    abstract getOrElse (val: T): T;
    abstract orElse (fn: IElseFn<T>): Maybe<T>;


    // Helpers
    static liftA2<M1, M2, S> (fn: ICurry2<M1, M2, S>) {
        return (m1: Maybe<M1>) => (m2: Maybe<M2>) => {
            return Maybe.of(fn)
                        .ap<M1, ICurry1<M2, S>>(m1)
                        .ap<M2, S>(m2);
        };
    }
}

export class Nothing<T> extends Maybe<T> {
    // private x = null;


    toString () {
        return 'None';
    }

    // Applicative
    ap<O, T> (other: Maybe<O>): Maybe<T> {
        return new Nothing<T>();
    }

    // Functor
    map<S> (c: IMapFn<T, S>): Maybe<S> {
        return new Nothing<S>();
    }

    // Monad
    chain<S> (c: IMaybeChainFn<T, S>): Maybe<S> {
        return new Nothing<S>();
    }

    // Foldable
    reduce<A> (fn: IReduceFn<T, A>, accu: A) {
        return accu;
    }

    // Maybe specific
    isJust () {
        return false;
    }

    isNothing () {
        return true;
    }

    // Extract and recover
    get (): T {
        throw new TypeError('Canno\'t get value out of Nothing');
    }

    getOrElse (val: T) {
        return val;
    }

    orElse (fn: IElseFn<T>): Maybe<T> {
        return fn();
    }
}

export const none = new Nothing<any>();

export function nothing<V> () {
    return new Nothing<V>();
}

export class Just<T> extends Maybe<T> {
    constructor (private x: T) {
        super();
    }
    toString () {
        return `Just(${this.x})`;
    }

    // Applicative
    ap<O, T> (other: Maybe<O>) {
        const fn = this.x as any as IMapFn<O, T>;
        return other.map(fn);
    }

    map<S> (c: IMapFn<T, S>): Maybe<S> {
        return just(c(this.x));
    }

    // Monad
    chain<S> (c: IMaybeChainFn<T, S>): Maybe<S> {
        return c(this.x);
    }

    // Foldable
    reduce<A> (fn: IReduceFn<T, A>, accu: A) {
        return fn(accu, this.x);
    }

    // Maybe specific
    isJust () {
        return true;
    }

    isNothing () {
        return false;
    }

    // Extract and recover
    get () {
        return this.x;
    }

    getOrElse (val: T) {
        return this.x;
    }

    orElse (fn: IElseFn<T>): Maybe<T> {
        return this;
    }
}

export function just<T> (x: T) {
    return new Just(x);
}

// export type Maybe<T> =  Nothing<T> | Just<T>;

export function maybe<E, S> (c: IMapFn<E, S>) {
    return function (m: Maybe<E>) {
        if (m === null || m === void 0) {
            return none;
        } else {
            return m.map(c);
        }
    };
}
