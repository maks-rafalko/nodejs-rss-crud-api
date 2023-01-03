const debug = (message: string): void => {
    if (process.env['NODE_ENV'] !== 'production') {
        // eslint-disable-next-line no-console
        console.log(message);
    }
};

export { debug };
