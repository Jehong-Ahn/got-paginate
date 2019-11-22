import assert from 'assert';
import nock from 'nock';
import createGotPaginate from '../src/index';

describe('createGotPaginate', () => {
  it('should return a normal got without paginate option.', async () => {
    const client = createGotPaginate({});

    nock('http://foo.bar')
      .get('/baz')
      .reply(200, uri => uri);

    const res = await client('http://foo.bar/baz');
    assert.equal(res.body, '/baz');
  });

  it('should return a paginated got with a paginate option.', async () => {
    const client = createGotPaginate({});

    nock('http://foo.bar')
      .get('/baz')
      .query(true)
      .reply(200, uri => uri);

    const res = await client('http://foo.bar/baz', {
      paging: {
        number: 1,
        requestPath: 'searchParams.page',
      },
    }).next();
    assert.equal(res.body, '/baz?page=1');
  });
});
