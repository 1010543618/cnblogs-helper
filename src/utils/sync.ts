export function sync(gen, ...args) {
    const g = gen(...args);

    function next(err, pre) {
        let temp;
        !err && (temp = g.next(pre));
        err && (temp = g.throw(err));

        if (!temp.done) {
            const value = temp.value;
            if (typeof value.then == "function" && typeof value.catch == "function") { // Promise
                value.catch(error => next(error, undefined))
                    .then(success => next(null, success))
                    .catch(error => { console.error(error) });
            } else if (value.isEffect) { // Effect
                value.type === "call" && runCallEffect(value, next);
            } else if (value.isError) {
                next(value.Error, null);
            } else {
                next(false, value);
            }
        }
    }

    next(false, undefined);
}

export function call(fn, ...args) {
    if (typeof fn === "function") { // function
        return {
            isEffect: true,
            type: 'call',
            _this: null,
            fn,
            args
        }
    } else {
        return { // [obj, function name]
            isEffect: true,
            type: 'call',
            _this: fn[0],
            fn: fn[0][fn[1]],
            args
        }
    }

}

export function error(err) {
    return {
        isError: true,
        Error: err,
    }
}

export function sleep(ms) {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, ms);
    })
}

function runCallEffect({ _this, fn, args }, next) {
    fn.call(_this, ...args)
        .catch(error => next(error))
        .then(success => next(null, success))
        .catch(error => { console.error(error) });
}