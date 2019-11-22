
## Basic Usage

```js
import createGotPaginate from 'got-paginate';

const client = createGotPaginate({
  prefixUrl: 'http://foo.bar',
  responseType: 'json',
});

// paging with numbers

const listItems = client('items', {
  paging: {
    number: 1,
    requestPath: 'searchParams.page',
  },
});

const items1 = await listItems.next();
// http://foo.bar/items?page=1

const items2 = await listItems.next();
// http://foo.bar/items?page=2
```

```js
// paging with tokens

const listUsers = client('users', {
  paging: {
    token: null,
    requestPath: 'searchParams.token',
    responsePath: 'body.nextToken',
  },
});

const users1 = await listUsers.next();
// http://foo.bar/items
// { "body": { "nextToken": "f41f4328", users: [...] } }

const users2 = await listUsers.next();
// http://foo.bar/items?token=f41f4328
// { "body": { "nextToken": "987dsas1", users: [...] } }
```

```js
// without paging

const userProfile = await client('user/10');
// { "body": { "id": 10, "name": ... } }
```
