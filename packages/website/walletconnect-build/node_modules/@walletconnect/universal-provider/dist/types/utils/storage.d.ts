import { IKeyValueStorage } from "@walletconnect/keyvaluestorage";
export declare class Storage {
    private storage;
    constructor(storage: IKeyValueStorage);
    getItem<T>(key: string): Promise<T | undefined>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
    static getStorage(kvStorage: IKeyValueStorage): Storage;
}
//# sourceMappingURL=storage.d.ts.map