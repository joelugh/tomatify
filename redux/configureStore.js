import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

// batched subscribing
import batchedSubscribeMiddleware from './batching/middleware'
import batchedSubscribeEnhancer from './batching/enhancer'

// react-redux-firebase
import { firebaseReducer, getFirebase} from 'react-redux-firebase'

import clientReducer from './client';
import spotifyReducer from './spotify';

const rootReducer = combineReducers({
	firebase: firebaseReducer,
	client: clientReducer,
	spotify: spotifyReducer,
})

export const initialState = {
	firebase: {},
}

const composeEnhancers = composeWithDevTools({
  // Specify name here, actionsBlacklist, actionsCreators and other options if needed
  trace: true, traceLimit: 25,
});

export let store;

export function configureStore(state = initialState) {

	const middlewares = [
		applyMiddleware(thunk.withExtraArgument(getFirebase))
	];

	// batching for firebase-redux actions
	middlewares.push(...[
		batchedSubscribeEnhancer,
		applyMiddleware(batchedSubscribeMiddleware),
	])

	const enhancer = composeEnhancers(...middlewares)

	store = createStore(rootReducer, state, enhancer);

	return store;

}