import React from 'react';
import {connect} from 'react-redux';
import { compose, bindActionCreators } from 'redux';
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';

import Typography from '@material-ui/core/Typography';

import Random from '../Random';
import PomList from '../PomList';

import InfiniteScroll from 'react-infinite-scroller';
import { Emoji } from 'emoji-mart';
import { Chip, IconButton } from '@material-ui/core';

import Loading from '../Loading';
import ShareButton from '../ShareButton';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import Router from 'next/router';


const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;
const LOAD_DELAY_MS = 1000;

function UserView(props) {

    const {
        recent = {},
        poms: user,
        tag,
        name,
        profile
    } = props;

    const [loaded, setLoaded] = React.useState(true);
    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const headingComponent = <>
        <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>{name}</Typography>
    </>;

    if (!loaded || !isLoaded(user, name)) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }

    const subheaderText = `${name}'s`;

    const chip = tag ? <Chip size="medium" label={<Emoji emoji={tag} native size={12}/>} onDelete={() => props.setTag(null)}/> : null;

    const showSaved = !!!(profile && profile.isEmpty);

    let pomIds = (recent && recent["all"]) || [];
    if (user) {
        // TODO: Need to pass same refs to prevent rerenders of random component
        if (pomIds) pomIds = pomIds.filter(id => user[id]);
    }

    const listProps = {
        favourites: (profile && profile.saved) || {},
        remainingSyncs: (profile && profile.syncs && profile.syncs.count) || 0,
        pomIds: pomIds.slice(0, numLoaded),
        total: pomIds.length,
        showSaved,
        subheaderText,
        chip,
    };

    return <>
            <div style={{
                position: 'absolute',
                top: 75,
                left: 10,
            }}>
                <IconButton onClick={() => Router.back()}>
                    <KeyboardBackspaceIcon/>
                </IconButton>
            </div>
            <div style={{
                position: 'absolute',
                top: 75,
                right: 10,
            }}>
                <ShareButton name={name} />
            </div>
            {headingComponent}
            {recent && <Random pomIds={pomIds} />}
            {recent &&
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    setNumLoaded(numLoaded => numLoaded + INC_NUM_LOAD);
                }}
                hasMore={numLoaded < pomIds.length}
                loader={<div className="loader" style={{display:'flex', justifyContent: 'center', width: '100%', padding: '20px 20px 30px 20px'}} key={0}>Loading ...</div>}
                style={{width:'100%', display:'flex', flexDirection: 'column', alignItems:'center'}}
            >
                <PomList {...listProps}/>
            </InfiniteScroll>}
    </>;
}

export default compose(
    firebaseConnect(props => ([
        'recent',
        `users/${props.id}/poms`,
        `users/${props.id}/name`,
    ])),
    connect((state, _props) => ({
        recent: state.firebase.data.recent,
        auth: state.firebase.auth,
        profile: state.firebase.profile,
        poms: state.firebase.data.users && state.firebase.data.users && state.firebase.data.users[_props.id] && state.firebase.data.users[_props.id].poms,
        name: state.firebase.data.users && state.firebase.data.users && state.firebase.data.users[_props.id] && state.firebase.data.users[_props.id].name
    }),
    dispatch => bindActionCreators({}, dispatch)
    )
)(UserView);