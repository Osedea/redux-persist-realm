import Realm from 'realm';

const singleton = Symbol();
const singletonEnforcer = Symbol();

class RealmPersistInterface {
	constructor(enforcer) {
		if (enforcer !== singletonEnforcer) {
			throw new Error('Cannot construct singleton');
		}

		this.realm = Realm.open({
			path: 'redux.realm',
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

		this.check = this.check.bind(this);
		this.getItem = this.getItem.bind(this);
		this.setItem = this.setItem.bind(this);
		this.removeItem = this.removeItem.bind(this);
		this.getAllKeys = this.getAllKeys.bind(this);
	}

	static get instance() {
		if (!this[singleton]) {
			this[singleton] = new RealmPersistInterface(singletonEnforcer);
		}

		return this[singleton];
	}

	type = 'RealmPersistInterface';

	async check() {
		if (!this.items) {
			this.realm = await this.realm;
			this.items = this.realm.objects('Item');
		}
	}

	async getItem(key) {
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

	async setItem(key, value) {
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

	async removeItem(key) {
		await this.check();

		return new Promise((resolve, reject) => {
			try {
				this.realm.write(() => {
					const item = this.items.filtered(`name = "${key}"`);
					this.realm.delete(item);
					resolve();
				});
			} catch (error) {
				reject(error);
			}
		});
	};

	async getAllKeys() {
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

export default RealmPersistInterface.instance;
