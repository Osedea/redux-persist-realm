# Redux-persist-realm

A Realmjs interface for redux-persist

## Dependencies

- Realm : [Docs](https://realm.io/docs/javascript/latest/), [npm](https://www.npmjs.com/package/realm)
- Redux-persist : [Docs](https://github.com/rt2zz/redux-persist), [npm](https://www.npmjs.com/package/redux-persist)

## Installation

### If you already have realm and redux-persist

```
npm i --save redux-persist-realm
# or
yarn add redux-persist-realm
```

### Else

```
npm i --save redux-persist realm redux-persist-realm
# or
yarn add redux-persist realm redux-persist-realm
react-native link realm
```

## Usage

```diff
import {compose, applyMiddleware, createStore} from 'redux'
import {persistStore, autoRehydrate} from 'redux-persist'
+ import RealmPersistInterface from 'redux-persist-realm'
+ const storage = RealmPersistInterface.instance;

// add `autoRehydrate` as an enhancer to your store (note: `autoRehydrate` is not a middleware)
const store = createStore(
  reducer,
  undefined,
  compose(
    applyMiddleware(...),
    autoRehydrate()
  )
)

+ const config = {
+   storage
+ }

// begin periodically persisting the store
- persistStore(store)
+ persistStore(store, config)
```

Don't hesitate to publish [Issues](https://github.com/Osedea/redux-persist-realm/issues) if you see something missing!
