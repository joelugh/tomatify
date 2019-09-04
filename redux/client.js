const SET_TAG = 'CLIENT/SET_TAG';
const SET_FILTER = 'CLIENT/SET_FILTER';
const SET_POM_ID = 'CLIENT/SET_POM_ID';

export const clientInitialState = {
  tag: null,
  pomId: null,
  filter: 'home',
};

export const setPomId = pomId => {
  return {
    type: SET_POM_ID,
    payload: pomId,
  }
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
    case SET_POM_ID:
      return {...state, pomId: payload};
    default:
      return state;
  }
};
