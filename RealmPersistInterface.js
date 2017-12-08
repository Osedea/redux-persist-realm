// @flow
import Realm from 'realm';

/**
 * modified by Stanimir Marinov (https://github.com/sytolk)
 * following: https://github.com/leethree/redux-persist-fs-storage/blob/master/index.js
 */

// Wrap function to support both Promise and callback
async function withCallback<R>(
    callback?: ?(error: ?Error, result: R | void) => void,
    func: () => Promise<R>
): Promise<R | void> {
    try {
        const result = await func();
        if (callback) {
            callback(null, result);
        }
        return result;
    } catch (err) {
        if (callback) {
            callback(err);
        } else {
            throw err;
        }
    }
}

const RealmPersistInterface = (
    encryptionKey?: Int8Array,
    schemaName?: string = 'Item',
    keyColumn?: string = 'key',
    valueColumn?: string = 'value',
) => {
    const config: Object = {
        schema: [{
            name: schemaName,
            primaryKey: keyColumn,
            properties: {
                [keyColumn]: 'string',
                [valueColumn]: 'string',
            },
        }],
    };

    if (encryptionKey) {
        config.encryptionKey = encryptionKey;
    }

    const realm = new Realm(config);

    const items = realm.objects(schemaName);

    const getItem = (
        key: string,
        callback?: ?(error: ?Error, result: ?string) => void,
    ): Promise<?string> =>
        withCallback(callback, async () => {
            const item = realm.objectForPrimaryKey(schemaName, key);
            if (item) {
                return item[valueColumn];
            }
        });

    const setItem = (
        key: string,
        value: string,
        callback?: ?(error: ?Error) => void
    ): Promise<void> =>
        withCallback(callback, async () => {
            realm.write(() => {
                realm.create(schemaName, { key, value }, true);
            });
        });

    const removeItem = (
        key: string,
        callback?: ?(error: ?Error) => void,
    ): Promise<void> =>
        withCallback(callback, async () => {
            const item = realm.objectForPrimaryKey(schemaName, key);
            if (item) {
                realm.write(() => realm.delete(item));
            }
        });

    const getAllKeys = (callback?: ?(error: ?Error, keys: ?Array<string>) => void) =>
        withCallback(callback, async () => items.map((item) => item[keyColumn]));

    return {
        setItem,
        getItem,
        removeItem,
        getAllKeys,
    };
};

export default RealmPersistInterface;