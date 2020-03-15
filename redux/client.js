const SET_INITIALISED = 'CLIENT/SET_INITIALISED';
const SET_FILTER = 'CLIENT/SET_FILTER';
const SET_SHOW_LANDING = 'CLIENT/SET_SHOW_LANDING';

export const clientInitialState = {
  initialised: false,
  filter: 'home',
  showLanding: true,
};

export const setInitialised = bool => {
  return {
    type: SET_INITIALISED,
    payload: bool,
  }
};

export const setFilter = filter => {
  return {
    type: SET_FILTER,
    payload: filter,
  }
};

export const setShowLanding = bool => {
  return {
    type: SET_SHOW_LANDING,
    payload: bool,
  }
}

export default (state = clientInitialState, {type, payload}) => {
  switch (type) {
    case SET_INITIALISED:
      return {...state, initialised: payload};
    case SET_FILTER:
      return {...state, filter: payload};
    case SET_SHOW_LANDING:
      return {...state, showLanding: payload};
    default:
      return state;
  }
};
