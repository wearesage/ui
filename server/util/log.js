export function log(...args) {
  const originalStackTrace = Error.prepareStackTrace;

  Error.prepareStackTrace = (_, stack) => stack;
  const err = new Error();
  const callerFile = err.stack[1].getFileName();
  const callerLine = err.stack[1].getLineNumber();
  Error.prepareStackTrace = originalStackTrace;

  console.log(`[${callerFile}:${callerLine}]`, ...args);
}