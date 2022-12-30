interface IDataStorage<T> {
    get(key: keyof T, value: any): Promise<any>;
    add(item: T): Promise<void>;
    remove(key: keyof T, value: any): Promise<void>;
    clear(): Promise<void>;
    getAll(): Promise<T[]>;
}

export { IDataStorage };
