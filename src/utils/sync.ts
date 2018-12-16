export function sync(gen) {
    const g = gen();

    function next(err, pre) {
        let temp;
        !err && (temp = g.next(pre));
        err && (temp = g.throw(pre));

        if (!temp.done) {
            const value = temp.value;
            if (typeof value.then == "function" && typeof value.catch == "function") { // Promise
                value.then(success => next(null, success))
                    .catch(error => next(error, undefined))
            } else if (value.isEffect) { // Effect
                value.type === "call" && runCallEffect(value, next);
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

function runCallEffect({ _this, fn, args }, next) {
    fn.call(_this, ...args)
        .then(success => next(null, success))
        .catch(error => next(error))
}