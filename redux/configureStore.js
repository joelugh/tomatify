import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

// batched subscribing
import batchedSubscribeMiddleware from './batching/middleware'
import batchedSubscribeEnhancer from './batching/enhancer'

// react-redux-firebase
import { reactReduxFirebase, firebaseReducer, getFirebase} from 'react-redux-firebase'
import { getFirebase as getFirebaseApp } from '../db';

import clientReducer from './client';

const rootReducer = combineReducers({
	firebase: firebaseReducer,
	client: clientReducer,
})

export const initialState = {
	firebase: {},
}

const composeEnhancers = composeWithDevTools({
  // Specify name here, actionsBlacklist, actionsCreators and other options if needed
  trace: true, traceLimit: 25,
});

export function configureStore(state = initialState) {

	const middlewares = [
		applyMiddleware(thunk.withExtraArgument(getFirebase))
	];

	const firebaseApp = getFirebaseApp()

	// react-redux-firebase options
	const rrfConfig = {
		userProfile: 'users', // firebase root where user profiles are stored
		attachAuthIsReady: true, // attaches auth is ready promise to store
		firebaseStateName: 'firebase' // should match the reducer name ('firebase' is default)
	}
	middlewares.push(reactReduxFirebase(firebaseApp, rrfConfig))

	// batching for firebase-redux actions
	middlewares.push(...[
		batchedSubscribeEnhancer,
        applyMiddleware(batchedSubscribeMiddleware),
	])

	const enhancer = composeEnhancers(...middlewares)

	const store = createStore(rootReducer, state, enhancer);
	store.firebaseAuthIsReady.then(() => {
		// console.log('Auth has loaded') // eslint-disable-line no-console
	})
	return store;

}