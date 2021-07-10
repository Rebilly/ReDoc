function throttle(func, wait) {
  let context;
  let args;
  let result;
  let timeout: any = null;
  let previous = 0;
  const later = () => {
    previous = new Date().getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      context = args = null;
    }
  };
  return function () {
    const now = new Date().getTime();
    const remaining = wait - (now - previous);
    context = this;
    // eslint-disable-next-line prefer-rest-params
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

export function Throttle(delay: number) {
  return (_, _2, desc: PropertyDescriptor) => {
    desc.value = throttle(desc.value, delay);
  };
}
