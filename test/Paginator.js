import assert from 'assert';
import got from 'got';
import nock from 'nock';
import Paginator from '../src/Paginator';

describe('Paginator', () => {
  it('should paginate with number.', async () => {
    const paginator = new Paginator(
      got.extend({
        paging: {
          number: 3,
          requestPath: 'searchParams.page',
        },
        responseType: 'json',
      }),
      'http://foo.bar/num'
    );

    nock('http://foo.bar')
      .get('/num')
      .query(true)
      .reply(200, uri => ({ uri }))
      .get('/num')
      .query(true)
      .reply(200, uri => ({ uri }));

    const res1 = await paginator.next();
    assert.strictEqual(res1.body.uri, '/num?page=3');
    const res2 = await paginator.next();
    assert.strictEqual(res2.body.uri, '/num?page=4');
  });

  it('should paginate with token.', async () => {
    const paginator = new Paginator(
      got.extend({
        paging: {
          token: 'a',
          requestPath: 'json.token',
          responsePath: 'body.next',
        },
        responseType: 'json',
        method: 'post',
      }),
      'http://foo.bar/token'
    );

    const tokens = { a: 'b', b: 'c' };
    nock('http://foo.bar')
      .post('/token')
      .reply(200, (uri, body) => ({ uri, cur: body.token, next: tokens[body.token] }))
      .post('/token')
      .reply(200, (uri, body) => ({ uri, cur: body.token, next: tokens[body.token] }));

    const res1 = await paginator.next();
    assert.deepStrictEqual(res1.body, { uri: '/token', cur: 'a', next: 'b' });
    const res2 = await paginator.next();
    assert.deepStrictEqual(res2.body, { uri: '/token', cur: 'b', next: 'c' });
  });

  it('should not count on retrying.', async () => {
    const paginator = new Paginator(
      got.extend({
        paging: {
          number: 3,
          requestPath: 'searchParams.page',
        },
        responseType: 'json',
        retry: {
          calculateDelay: () => 10
        },
      }),
      'http://foo.bar/num'
    );

    nock('http://foo.bar')
      .get('/num')
      .query(true)
      .reply(500)
      .get('/num')
      .query(true)
      .reply(200, uri => ({ uri }))
      .get('/num')
      .query(true)
      .reply(500)
      .get('/num')
      .query(true)
      .reply(500)
      .get('/num')
      .query(true)
      .reply(200, uri => ({ uri }))
      .get('/num')
      .query(true)
      .reply(200, uri => ({ uri }));

    const res1 = await paginator.next();
    assert.strictEqual(res1.body.uri, '/num?page=3');
    assert.strictEqual(res1.retryCount, 1);
    const res2 = await paginator.next();
    assert.strictEqual(res2.body.uri, '/num?page=4');
    assert.strictEqual(res2.retryCount, 2);
    const res3 = await paginator.next();
    assert.strictEqual(res3.body.uri, '/num?page=5');
  });
});
