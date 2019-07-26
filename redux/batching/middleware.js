import State from './state';
import _ from 'lodash';

const actionsPrefix = '@@reactReduxFirebase';

const debounceNotify = _.debounce(() => State.notify());

const shouldBatch = actionWrapper => {
  const type = _.get(actionWrapper, 'action.type', '');
  const skipBatch = _.get(actionWrapper, 'action.__skip_batch', false);
  // if (skipBatch) console.log('skipping batch for:', type, actionWrapper.action);
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