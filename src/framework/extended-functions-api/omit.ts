const omit = <T extends object>(obj: T, key: keyof T): Omit<T, keyof T> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { [key]: _, ...rest } = obj;

    return rest;
};

export { omit };
