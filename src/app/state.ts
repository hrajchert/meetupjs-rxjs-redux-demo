import {Store, combineReducers, IPayloadAction, ISimpleAction} from './store/store.util';

// interface IState {
//     time: number;
//     enabled: boolean;
// }

export type IAddTimeAction = IPayloadAction<'ADD_TIME', {time: number}>;
export type IToggleTimerAction = ISimpleAction<'TOGGLE_TIMER'>;
export type IActions = IAddTimeAction | IToggleTimerAction;

function time (currentTime = 0, action: IActions) {
    switch (action.type) {
        case 'ADD_TIME':
            return currentTime + action.payload.time;
        // case 'INVALID_ACTION':
        //     return currentTime - 1;
        default:
            return currentTime;
    }
}

function enabled (state = true, action: IActions) {
    switch (action.type) {
        case 'TOGGLE_TIMER':
            return !state;
        default:
            return state;
    }
}

const reducer = combineReducers({time, enabled});

export const store = new Store<IState, IActions>(reducer);


interface IState {
    time: number;
    enabled: boolean;
    a?: {
        b: {
            c: number;
        }
    };
}

const state$ = store.select();
const a$ = store.select('a');
const ab$ = store.select('a', 'b');
const abc$ = store.select('a', 'b', 'c');
// const d$ = store.select('d', 'b', 'c');
// d$;






a$;
ab$;
abc$;
state$;
