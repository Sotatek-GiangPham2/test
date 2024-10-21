export const sleep = async (timeout) =>
  new Promise((res, _rej) =>
    setTimeout(() => {
      res(1);
    }, timeout),
  );
