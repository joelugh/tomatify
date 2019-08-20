import State from './state';
import _ from 'lodash';

const actionsPrefix = '@@reactReduxFirebase';

const debounceNotify = _.debounce(() => State.notify());

const shouldBatch = action => {
  const type = _.get(action, 'type', '');
  const skipBatch = _.get(action, '__skip_batch', false);
  return type.startsWith(actionsPrefix) && !skipBatch;
};

export default () => next => (action) => {
  const resolved = next(action)

  if (State.notify && !shouldBatch(action)) {
    State.notify()
  } else {
    debounceNotify()
  }

  return resolved
}