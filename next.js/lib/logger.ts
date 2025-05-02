function formatLog(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

export const logger = {
  info: (message: string) => {
    console.log(formatLog('INFO', message));
  },
  error: (message: string, error?: Error) => {
    const errorMessage = error ? `${error.message}\n${error.stack}` : message;
    console.error(formatLog('ERROR', errorMessage));
  },
  warn: (message: string) => {
    console.warn(formatLog('WARN', message));
  },
  debug: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('DEBUG', message));
    }
  }
}; 