import { Component } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';

import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/switchMap';


import {store, IAddTimeAction, IToggleTimerAction} from './state';
import './debug/index';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    timer: number;
    timer$: Observable<number>;
    evenOrOdd$: Observable<'par'|'impar'>;
    enabledString$: Observable<'Activar'|'Pausar'>;

    ngOnInit () {
        // *************************
        // * STATE MAPPING RECIPIES*
        // *************************

        this.timer$ = store.select('time');

        this.evenOrOdd$ =
            this.timer$
                .map(timer => timer % 2 ? 'impar' : 'par')
        ;

        this.enabledString$ =
            store
                .select('enabled')
                .map(enabled => enabled ? 'Pausar' : 'Activar')
        ;

        // *******************
        // * ACTIONS RECIPIES*
        // *******************
        // ADD_TIME
        const addOneSecondAction$ =
            Observable
                .interval(1000)
                .mapTo({type: 'ADD_TIME', payload: {time: 1}} as IAddTimeAction)
        ;

        const toggleableTimerAction$ =
            store
                .select('enabled')
                .switchMap(enabled => {
                    if (enabled) {
                        return addOneSecondAction$;
                    } else {
                        return Observable.empty<IAddTimeAction>();
                    }
                });

        // TOGGLE_TIMER
        const toggleAction$ =
            Observable
                .fromEvent(document.getElementById('toggleButton'), 'click')
                .mapTo({type: 'TOGGLE_TIMER'} as IToggleTimerAction)
        ;

        const actions = Observable.merge(toggleableTimerAction$, toggleAction$);


        // ****************
        // * SIDE EFFECTS *
        // ****************

        actions
            .debug('dispatch', (action) => action.type)
            .subscribe(action => store.dispatch(action))
        ;

        // For debugging
        store.select()
            .debug('state')
            .subscribe()
        ;
    }
}
