const SET_TAG = 'CLIENT/SET_TAG';
const SET_FILTER = 'CLIENT/SET_FILTER';

export const clientInitialState = {
  tag: null,
  filter: 'recents',
};

export const setTag = tagId => {
  return {
    type: SET_TAG,
    payload: tagId,
  }
};

export const setFilter = filter => {
  return {
    type: SET_FILTER,
    payload: filter,
  }
};

export default (state = clientInitialState, {type, payload}) => {
  switch (type) {
    case SET_TAG:
      return {...state, tag: payload};
    case SET_FILTER:
      return {...state, filter: payload};
    default:
      return state;
  }
};
