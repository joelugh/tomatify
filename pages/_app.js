import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { compose } from 'redux'
import { Provider, connect } from 'react-redux';
import { firebaseConnect, ReactReduxFirebaseProvider } from 'react-redux-firebase';

import withReduxStore from '../utils/withReduxStore';

import theme from '../utils/theme'
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import { getFirebase as getFirebaseApp } from '../db';


class _App extends App {

    static async getInitialProps({ Component, ctx }) {

        let pageProps = {};

        const {req, reduxStore: store, query} = ctx;

        if (Component.getInitialProps) {
          // NOTE: this is calling all page "getInitialProps" methods
          // i.e. everything before this line occurs before ALL page getInitialProps
          // (took me a while to figure that out, sigh)
          pageProps = await Component.getInitialProps(ctx) || {};
        }

        // inject query (constant term)
        pageProps.query = query;

        return { pageProps };

      }

    componentDidMount () {
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles && jssStyles.parentNode) {
            jssStyles.parentNode.removeChild(jssStyles);
        }
    }

    render () {
        const {
            Component,
            pageProps,
            reduxStore,
        } = this.props;

        // const FirebaseComponent = <Component {...pageProps} />
        const FirebaseComponent = compose(
            connect((state, props) => ({})),
            firebaseConnect((props) => []),
          // exclude firebase from pageProps
          )(({firebase, ...props}) => <Component {...props} />)

        const rrfConfig = {
            userProfile: 'users', // firebase root where user profiles are stored
            attachAuthIsReady: true, // attaches auth is ready promise to store
            firebaseStateName: 'firebase' // should match the reducer name ('firebase' is default)
        }

        const firebaseApp = getFirebaseApp()

        return (
            <>
                <Head>
                    <title>Tomatify</title>
                </Head>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Provider store={reduxStore} >
                        <ReactReduxFirebaseProvider
                            firebase={firebaseApp}
                            config={rrfConfig}
                            dispatch={reduxStore.dispatch}
                        >
                            <FirebaseComponent {...pageProps} />
                        </ReactReduxFirebaseProvider>
                    </Provider>
                </ThemeProvider>
            </>
        )
    }
}


export default compose(
    withReduxStore,
)(_App);
