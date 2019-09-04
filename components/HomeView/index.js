import React from 'react';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase'

import Poms from '../Poms';

class Home extends React.Component {

    render() {

        let {recent = {}, popular = {}, user, filter, auth} = this.props;

        const isUser = user != null && isLoaded(auth) && !isEmpty(auth);

        return <Poms
            recent={recent}
            popular={popular}
            user={isUser && user}
            filter={filter}
        />

    }
}

export default compose(
    firebaseConnect(props => ([
        'popular',
        'recent',
        'tags',
    ])),
    connect((state, _props) => ({
        popular: state.firebase.data.popular,
        recent: state.firebase.data.recent,
        auth: state.firebase.auth,
        user: state.firebase.profile,
        tags: state.firebase.data.tags,
        tag: state.client.tag,
        filter: state.client.filter,
    }))
)(Home);