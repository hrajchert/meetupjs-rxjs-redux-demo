import {Maybe, nothing} from '../algebras/maybe';
// TODO: Add console.trace either as an operator or as a feature of the enhanced console
interface ILoggerLSData {
    enabled: boolean;
    name: string;
}

interface ILoggerDict {
    [loggerName: string]: ILoggerLSData;
}

interface ILocalStorageData {
    loggerData: ILoggerDict;
}
function getOrCreateLocalStorageDict () {
    return Maybe
        .fromNullable(localStorage.getItem('rxdbg'))
        .map(json => JSON.parse(json) as ILocalStorageData)
        .orElse(() => Maybe.of({
            loggerData: {}
        }));
}

function getStoredState<T> (msgOrFnMsg: IMsgOrFnMsg<T>) {
    return getOrCreateLocalStorageDict()
        .chain(ls => Maybe.fromNullable(ls.loggerData[msgOrFnMsg.toString()]))
        .orElse(() => Maybe.of({
            enabled: true,
            name: msgOrFnMsg.toString()
        }));
}
// const disabledMsgs = [];
function storeEnabled<T> (msgOrFnMsg: IMsgOrFnMsg<T>, enabled: boolean) {
    // TODO: Refactor using lenses
    const ls = getOrCreateLocalStorageDict().get();
    const loggerData = getStoredState(msgOrFnMsg)
                            .map(data => ({...data, enabled}));
    ls.loggerData[msgOrFnMsg.toString()] = loggerData.get();
    localStorage.setItem('rxdbg', JSON.stringify(ls));
}


function storeName<T> (msgOrFnMsg: IMsgOrFnMsg<T>, name: string) {
    // TODO: Refactor using lenses
    const ls = getOrCreateLocalStorageDict().get();
    const loggerData = getStoredState(msgOrFnMsg)
                            .map(data => ({...data, name}));
    ls.loggerData[msgOrFnMsg.toString()] = loggerData.get();
    localStorage.setItem('rxdbg', JSON.stringify(ls));
}
// function getEnabled<T> (msgOrFnMsg: IMsgOrFnMsg<T>): boolean {
//     return getStoredState(msgOrFnMsg)
//         .map(logger => logger.enabled)
//         .getOrElse(true);
// }
class Logger<T> {

    constructor (private msgOrFnMsg: IMsgOrFnMsg<T>, private logFn: (...args) => void) {

    }

    set enabled (val: boolean) {
        storeEnabled(this.msgOrFnMsg, val);
    };

    get enabled () {
        return getStoredState(this.msgOrFnMsg)
            .map(state => state.enabled)
            .get();
    }

    set name (name: string) {
        storeName(this.msgOrFnMsg, name);
    }

    get name () {
        return getStoredState(this.msgOrFnMsg)
            .map(state => state.name)
            .get();
    }

    log (...args) {
        if (this.enabled) {
            this.logFn(...args);
        }
    }

    toString () {
        return this.name;
    }
}

const loggers: Logger<any>[] = [];

function listLoggers () {
    // const enabledToStr = (logger: Logger<any>) => logger.enabled ? 'enabled' : 'disabled';
    const enabledToColor = (logger: Logger<any>) => logger.enabled ? '#000' : '#AAA';
    const enabledToCssColor = (logger: Logger<any>) => `color: ${enabledToColor(logger)}`;

    loggers
        .forEach((logger, index) => {
            const msg = `%c [${index}] - ${logger.toString()}`;
            console.info(msg, enabledToCssColor(logger));
        });
}

function getLogger (n: number | string) {
    if (typeof n === 'string') {
        for (let i = 0; i < loggers.length; i++) {
            if (loggers[i].name === n) {
                return Maybe.of(loggers[i]);
            }
        }
        return nothing<Logger<any>>();
    } else {
        return Maybe.fromNullable(loggers[n]);
    }

}
function enableLogger (log: number|string) {
    getLogger(log)
        .map(logger => logger.enabled = true);
}

function disableLogger (log: number|string) {
    getLogger(log)
        .map(logger => logger.enabled = false);
}


function enableLoggers (...logs: (number|string)[]) {
    logs
        .forEach(n => enableLogger(n));
}

function disableLoggers (...logs: (number|string)[]) {
    logs
        .forEach(n => disableLogger(n));

}

function nameLogger (n: (number|string), name: string) {
    getLogger(n)
        .map(logger => logger.name = name);
}

window['rxdbg'] = {
    // disable: (msg) => ({status: 'Debug disabled', fn: debug}),
    disable: disableLoggers,
    enable: enableLoggers,
    list: listLoggers,
    name: nameLogger,
    reset: () => localStorage.removeItem('rxdbg'),
    disableAll: () => loggers.forEach(logger => logger.enabled = false),
    enableAll: () => loggers.forEach(logger => logger.enabled = true)
};
// TODO: Add a remote debugger

// const loggersLastMsg = [];

export interface IFnMsg<T> {
    (x: T): string;
}

export type IMsgOrFnMsg<T> = string | IFnMsg<T>;

export function createDebugger<T> (msgOrFnMsg: IMsgOrFnMsg<T>) {
    const logger = new Logger(msgOrFnMsg, console.debug);
    loggers.push(logger);
    return (...args) => logger.log(...args);
}

export function createInfo<T> (msgOrFnMsg: IMsgOrFnMsg<T>) {
    const logger = new Logger(msgOrFnMsg, console.info);
    loggers.push(logger);
    return (...args) => logger.log(...args);
}

export function debug (msg: string, ...args) {
    console.debug(msg, ...args);
}

