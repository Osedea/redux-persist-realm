import Realm from 'realm';

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

    getItem = (key, callback) => {
        try {
            const matches = this.items.filtered(`name = "${key}"`);

            if (matches.length > 0 && matches[0]) {
                if (callback) {
                    callback(null, matches[0].content);
                }
                return Promise.resolve(matches[0].content);
            } else {
                throw new Error(`Could not get item with key: '${key}'`);
            }
        } catch (error) {
            if (callback) {
                callback(error);
            }
            return Promise.reject(error);
        }
    };

    setItem = (key, value, callback) => {
        try {
            this.getItem(key, (error) => {
                this.realm.write(() => {
                    if (error) {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            }
                        );
                    } else {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            },
                            true
                        );
                    }
                    if (callback) {
                        callback();
                    }
                    return Promise.resolve(null);
                });
            });
        } catch (error) {
            if (callback) {
                callback(error);
            }
            return Promise.reject(error);
        }
    };

    removeItem = (key, callback) => {
        try {
            this.realm.write(() => {
                const item = this.items.filtered(`name = "${key}"`);

                this.realm.delete(item);
            });
            if (callback) {
                callback(null);
            }
            return Promise.resolve(null);
        } catch (error) {
            if (callback) {
                callback(error);
            }
            return Promise.reject(error);
        }
    };

    getAllKeys = (callback) => {
        try {
            const keys = this.items.map(
                (item) => item.name
            );

            if (callback) {
                callback(null, keys);
            }
            return Promise.resolve(keys);
        } catch (error) {
            if (callback) {
                callback(error);
            }
            return Promise.reject(error);
        }
    };
}

const singleton = new RealmPersistInterface();

export default singleton;
