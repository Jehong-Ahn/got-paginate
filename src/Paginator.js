import _set from 'lodash/set';
import _get from 'lodash/get';

export default function Paginator(client, url) {
  const { paging } = client.defaults.options;
  const hooks = { init: [], afterResponse: [] };
  const state = {};
  // 'afterResponse' has the un-parsed response body.
  // So use own hook.
  let afterParse;
  if ('number' in paging) {
    hooks.init.push((opts) => {
      if (!('token' in state)) { state.token = opts.paging.number; }
      if ('requestPath' in opts.paging) {
        _set(opts, opts.paging.requestPath, state.token);
      }
    });
    afterParse = (res) => {
      state.token += 1;
      return res;
    };
  } else if ('token' in paging) {
    hooks.init.push((opts) => {
      if (!('token' in state) && opts.paging.token !== null) {
        state.token = opts.paging.token;
      }
      if ('requestPath' in opts.paging) {
        _set(opts, opts.paging.requestPath, state.token);
      }
      if ('responsePath' in opts.paging) {
        afterParse = (res) => {
          state.token = _get(res, opts.paging.responsePath);
          return res;
        };
      }
    });
  }
  // Hooks only deep-merged on extend.
  const extended = client.extend({ hooks });
  this.next = () => extended(url)
    .then(afterParse)
    .then(paging.onSuccess, paging.onError);
  this.reset = () => delete state.token;
}
