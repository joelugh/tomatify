const SET_TAG = 'CLIENT/SET_TAG';

export const clientInitialState = {
  tag: null,
};

export const setTag = tagId => {
  return {
    type: SET_TAG,
    payload: tagId,
  }
};

export default (state = clientInitialState, {type, payload}) => {
  switch (type) {
    case SET_TAG:
      return {...state, tag: payload};
    default:
      return state;
  }
};
