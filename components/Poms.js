import React from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';

import TagNav from './TagNav';
import Random from './Random';
import PomList from './PomList';

import InfiniteScroll from 'react-infinite-scroller';
import { Emoji } from 'emoji-mart';
import { Chip, Button } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { setTag } from '../redux/client';

import Loading from './Loading';
import Link from 'next/link';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;
const LOAD_DELAY_MS = 1000;

function Poms(props) {

    const {
        recent = {},
        popular = {},
        user = {},
        filter,
        tag
    } = props;

    const [loaded, setLoaded] = React.useState(true);

    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const headingComponent = <>
        <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>Pomodoro Playlists</Typography>
    </>;

    if (!loaded) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }


    let pomIds = (recent && recent["all"]) || [];

    const subheaderText = "Latest";

    const chip = tag ? <Chip size="medium" label={<Emoji emoji={tag} native size={12}/>} onDelete={() => props.setTag(null)}/> : null;

    const showSaved = !!!(user && user.isEmpty);

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        pomIds: pomIds.slice(0,numLoaded),
        total: pomIds.length,
        showSaved,
        subheaderText,
        chip,
    };

    return (
        <>
            {headingComponent}
            {recent && <TagNav />}
            {recent && <Random pomIds={pomIds} />}
            {recent &&
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    setNumLoaded(numLoaded => numLoaded + INC_NUM_LOAD);
                }}
                hasMore={numLoaded < pomIds.length}
                loader={<div className="loader" style={{display:'flex', justifyContent: 'center', width: '100%', padding: '20px 20px 30px 20px'}} key={0}>Loading ...</div>}
            >
                <PomList {...listProps}/>
            </InfiniteScroll>}
        </>
    );
}

export default connect(state => ({ tag: state.client.tag }), dispatch => bindActionCreators({ setTag }, dispatch))(Poms);