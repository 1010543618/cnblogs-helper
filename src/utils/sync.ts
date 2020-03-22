// TODO: get result
export function sync(gen, args: Array<any> = [], cb: Function = function() {}) {
  const g = gen(...args);

  function next(err, pre) {
    let temp;
    if (!err) {
      temp = g.next(pre);
    } else {
      temp = g.throw(err);
    }

    const value = temp.value;

    if (!temp.done) {
      if (typeof value.then == "function" && typeof value.catch == "function") {
        // Promise
        value.catch(error => next(error, undefined));
        value.then(
          success => {
            next(null, success);
          },
          e => {
            // do nothing
          }
        );
      } else if (value.isEffect) {
        // Effect
        value.type === "call" && runCallEffect(value, next);
      } else if (value.isError) {
        next(value.Error, null);
      } else {
        next(false, value);
      }
    } else {
      cb(false, value);
    }
  }

  next(false, undefined);
}

export function call(fn, ...args) {
  if (typeof fn === "function") {
    // function
    return {
      isEffect: true,
      type: "call",
      _this: null,
      fn,
      args
    };
  } else {
    return {
      // [obj, function name]
      isEffect: true,
      type: "call",
      _this: fn[0],
      fn: fn[0][fn[1]],
      args
    };
  }
}

export function error(err) {
  return {
    isError: true,
    Error: err
  };
}

export function sleep(ms) {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, ms);
  });
}

function runCallEffect({ _this, fn, args }, next) {
  const promise = fn.call(_this, ...args);
  promise.catch(error => {
    next(error);
  });
  promise.then(
    success => next(null, success),
    e => {
      // do nothing
    }
  );
}
