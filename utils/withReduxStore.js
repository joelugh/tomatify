import React from 'react'
import {configureStore, initialState} from '../redux/configureStore'
import { setConfigVars } from '../config';
import _ from 'lodash'

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

function getOrCreateStore(state) {
  // Always make a new store if server, otherwise state is shared between requests

  if (isServer) {
    return configureStore(state)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = configureStore(state)
  }
  return window[__NEXT_REDUX_STORE__]
}

export default (App) => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps (appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState

      const state = {
        ...initialState,
      }

      const reduxStore = getOrCreateStore(state)

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore

      let appProps = {}
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps.call(App, appContext)
      }

      return {
        ...appProps,
        query: appContext.ctx.query,
        initialReduxState: reduxStore.getState()
      }
    }

    constructor(props) {
      super(props)
      const config = _.get(props, 'query.config')
      if (config) setConfigVars(config) // only set config if it exists
      this.reduxStore = getOrCreateStore(props.initialReduxState)
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />
    }
  }
}