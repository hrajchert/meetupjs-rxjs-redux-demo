import {Just, Nothing} from './maybe';
import {Observable} from 'rxjs/Observable';
// TODO: Ideally we would use this, but our system.js conf sucks ass
import {of} from 'rxjs/observable/of';
// import {_throw} from 'rxjs/observable/throw';

declare module './maybe' {
    // tslint:disable-next-line: interface-name
    interface Maybe<T> {
        toObservable (): Observable<T>;
    }
}

Just.prototype.toObservable = function () {
    // return Observable.of(this.x);
    return of(this.x);
};

Nothing.prototype.toObservable = function<T> () {
    return Observable.throw(null) as Observable<T>;
    // return _throw(null) as Observable<T>;
};
