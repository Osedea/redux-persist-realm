import Realm from 'realm';

// Wrap function to support both Promise and callback
// https://github.com/leethree/redux-persist-fs-storage/blob/master/index.js
async function withCallback<R>(callback?: ?(error: ?Error, result: R | void) => void,
                               func: () => Promise<R>,): Promise<R | void> {
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

class RealmPersistInterface {
    constructor() {
        this.realm = new Realm({
            schema: [{
                name: 'Item',
                primaryKey: 'name',
                properties: {
                    name: 'string',
                    content: 'string',
                },
            }],
        });

        this.items = this.realm.objects('Item');
    }

    getItem = (
        key: string,
        callback?: ?(error: ?Error, result: ?string) => void,
    ): Promise<?string> =>
        withCallback(callback, async () => {
            const matches = this.items.filtered(`name = "${key}"`);
            if (matches.length > 0 && matches[0]) {
                return matches[0].content;
            }
        });

    setItem = (key: string,
               value: string,
               callback?: ?(error: ?Error) => void): Promise<void> =>
        withCallback(callback, async () => {
            this.realm.write(() => {
                this.realm.create(
                    'Item',
                    {
                        name: key,
                        content: value,
                    },
                    true
                );
            });
        });

    removeItem = (
        key: string,
        callback?: ?(error: ?Error) => void,
    ): Promise<void> =>
        withCallback(callback, async () => {
            this.realm.write(() => {
                const item = this.items.filtered(`name = "${key}"`);
                this.realm.delete(item);
            });
        });

    getAllKeys = (
        callback?: ?(error: ?Error, keys: ?Array<string>) => void,
    ) =>
        withCallback(callback, async () => {
            const keys = this.items.map(
                (item) => item.name
            );
            return keys;
        });
}

const singleton = new RealmPersistInterface();

export default singleton;
