import Realm from 'realm';

class RealmPersistInterface {
	constructor() {
		this.realm = Realm.open({
			schema: [
				{
					name: 'Item',
					primaryKey: 'name',
					properties: {
						name: 'string',
						content: 'string'
					}
				}
			]
		});
	}

	check = async () => {
		if (!this.items) {
			this.realm = await this.realm;
			this.items = this.realm.objects('Item');
		}
	};

	getItem = async key => {
		await this.check();

		return new Promise((resolve, reject) => {
			try {
				const matches = this.items.filtered(`name = "${key}"`);

				if (matches.length > 0 && matches[0]) {
					resolve(matches[0].content);
				} else {
					reject(new Error(`Could not get item with key: '${key}'`));
				}
			} catch (error) {
				reject(error);
			}
		});
	};

	setItem = async (key, value) => {
		await this.check();

		return new Promise((resolve, reject) => {
			try {
				this.realm.write(() => {
					this.realm.create('Item', { name: key, content: value }, true);
					resolve();
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	removeItem = async key => {
		await this.check();

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
		});
	};

	getAllKeys = async () => {
		await this.check();

		return new Promise((resolve, reject) => {
			try {
				const keys = this.items.map(item => item.name);
				resolve(keys);
			} catch (error) {
				reject(error);
			}
		});
	};
}

const singleton = new RealmPersistInterface();

export default singleton;
