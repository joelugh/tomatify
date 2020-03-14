import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

// batched subscribing
import batchedSubscribeMiddleware from './batching/middleware'
import batchedSubscribeEnhancer from './batching/enhancer'

// react-redux-firebase
import { firebaseReducer, getFirebase} from 'react-redux-firebase'

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

	const enhancer = composeEnhancers(...middlewares)

	const store = createStore(rootReducer, state, enhancer);

	return store;

}