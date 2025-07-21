# 存储能力封装

实现 localStorage、sessionStorage、内存存储 和 IndexedDB 的统一调用。

## 安装

```bash
npm i @tencent/qn-storage
```

## localStorage、sessionStorage、内存存储的使用方式

`qn-storage` 内部会调用 *JSON.stringify* 和 *JSON.parse* 处理存储对象。

### 使用方式1

```js
// localStorage存储
// 可直接传入对象，无需手动调用 JSON.stringify/JSON.parse
Storage.local.setItem(key, value);
const value = Storage.local.getItem(key);

// sessionStorage存储
// 可直接传入对象，无需手动调用 JSON.stringify/JSON.parse
Storage.session.setItem(key, value);
const value = Storage.session.getItem(key);

// 内存存储
Storage.memory.setItem(key, value);
const value = Storage.memory.getItem(key);
```

### 使用方式2

```js
const type = StorageType.local;
getStorage(type).setItem(key, value);
getStorage(type).getItem(key);
```

## indexedDB的使用方式

```js
import { getIndexedDB } from '@tencent/qn-storage';

// 数据库配置
const config: IndexedDBConfig = {
  dbName: 'myDB',
  version: 1,
  tables: [
    {
      name: 'users',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        {
          name: 'name',
          keyPath: 'name',
          unique: false,
        },
      ],
    },
  ],
};

// 初始化数据库配置，并进行后续操作
const db = getIndexedDB(config);
await db.openDB();
await db.insert('users', { name: 'John' });
```

## Q&A

1、localStorage 和 sessionStorage

总的来说，localStorage 更适合存储较为稳定、长期的数据，而 sessionStorage 则更适合存储短期、临时性的数据，并且它们的作用域和时效性也对应不同的使用场景。
详细请查阅 MDN 文档。

2、何时使用 memoryStorage（内存存储） 而不是 localStorage/sessionStorage

内存存储更加轻量化，而且不涉及对象的序列化与反序列化，效率更高。如果数据不需要持久存储，可直接使用 memoryStorage。

3、什么情况下可以使用 IndexedDB

IndexedDB 是一种浏览器内置的数据库，它可以在客户端存储大量的结构化数据，并且支持离线访问。IndexedDB 可以在现代浏览器中使用，包括 Chrome、Firefox、Safari、Edge 等。
以下是一些适合使用 IndexedDB 的情况：

- 存储大量结构化数据：IndexedDB 可以存储大量的结构化数据，例如对象、数组、字符串等，而且可以使用索引来快速查询数据。
- 离线访问：IndexedDB 可以在客户端存储数据，即使用户离线也可以访问数据。这对于需要在离线状态下访问数据的应用程序非常有用。
- 高性能：IndexedDB 可以使用索引来快速查询数据，而且支持事务和批量操作，可以提高数据读写的性能。
- 安全性：IndexedDB 存储在客户端，可以避免将敏感数据发送到服务器，提高数据的安全性。
- 跨平台：IndexedDB 可以在多个浏览器和操作系统中使用，可以实现跨平台的数据存储。

需要注意的是，IndexedDB 需要使用异步 API 进行数据读写操作。此外，IndexedDB 的 API 也比较复杂，因此在选择使用 IndexedDB 时，需要根据具体的应用场景和需求进行评估。