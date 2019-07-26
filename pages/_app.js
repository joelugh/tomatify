import React from 'react';
import get from 'lodash/get';

import App, { Container } from 'next/app';
import Router from 'next/router';
import Head from 'next/head';

import { compose } from 'redux'
import { Provider, connect } from 'react-redux';
import { firebaseConnect } from 'react-redux-firebase';

import { getFirebase } from '../db/index';
import withReduxStore from '../utils/withReduxStore';

import theme from '../utils/theme'
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';


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
          )(({firebase:_, ...props}) => <Component {...props} />)

        return (
            <Container>
                <Head>
                    <title>Tomatify</title>
                </Head>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Provider store={reduxStore} >
                        <FirebaseComponent {...pageProps} />
                    </Provider>
                </ThemeProvider>
            </Container>
        )
    }
}


export default compose(
    withReduxStore,
)(_App);