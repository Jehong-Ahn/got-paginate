import got from 'got';
import Paginator from './Paginator';

function createGotPaginate(...optionsOrInstances) {
  const base = got.extend(...optionsOrInstances);

  const request = (url, options = {}) => {
    const extended = base.extend(options);

    return (extended.defaults.options.paging)
      ? new Paginator(extended, url)
      : extended(url);
  };

  // got/source/create.ts

  const client = (url, options) => request(url, { ...options, method: 'GET' });

  client.stream = (url, options) => request(url, { ...options, stream: true });

  const aliases = ['get', 'post', 'put', 'patch', 'head', 'delete'];
  aliases.forEach((method) => {
    client[method] = (url, options) => request(url, { ...options, method });
    client.stream[method] = (url, options) => request(url, { ...options, method });
  });

  return client;
}

export default createGotPaginate;


// paging 없으면 기존 got
// paging 있으면 next() 사용
