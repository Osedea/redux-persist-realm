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

    getItem = (key) => {
        return new Promise((resolve, reject) => {
          try {
              const matches = this.items.filtered(`name = "${key}"`);

              if (matches.length > 0 && matches[0]) {
                  resolve(null, matches[0].content);
              } else {
                  reject(new Erro(`Could not get item with key: '${key}'`));
              }
          } catch (error) {
              reject(error);
          }
        })
    };

    setItem = (key, value) => {
        return new Promise((resolve, reject) => {
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

                      resolve();
                  });
              });
          } catch (error) {
              reject(error);
          }
        })
    };

    removeItem = (key) => {
        return new Promise((resolve, reject) => {
          try {
              this.realm.write(() => {
                  const item = this.items.filtered(`name = "${key}"`);

                  this.realm.delete(item);
              });
              resolve();
          } catch (error) {
              reject(error);
          }
        })
    };

    getAllKeys = () => {
        return new Promise((resolve, reject) => {
          try {
              const keys = this.items.map(
                  (item) => item.name
              );

              resolve(null, keys);
          } catch (error) {
              reject(error);
          }
        })
    };
}

const singleton = new RealmPersistInterface();

export default singleton;
