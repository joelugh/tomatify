import React from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';

import Typography from '@material-ui/core/Typography';

import Random from '../Random';
import PomList from '../PomList';

import InfiniteScroll from 'react-infinite-scroller';
import { Emoji } from 'emoji-mart';
import { Chip } from '@material-ui/core';

import Loading from '../Loading';
import Link from 'next/link';
import AddButton from '../Add';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;

function LibraryView(props) {

    useFirebaseConnect([
        'recent',
    ])

    const recent = useSelector(state => state.firebase.data.recent);
    const user = useSelector(state => state.firebase.profile);

    const [loaded, setLoaded] = React.useState(true);

    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const uploadsToggle = <div style={{display:'flex'}}>
        <div style={{marginLeft: 10, marginRight: 10, color: 'black', userSelect: 'none'}}>
            <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                Yours
            </Typography>
        </div>
        <div style={{marginLeft: 10, marginRight: 10, color: 'lightgrey', userSelect: 'none'}}>
            <Link href="/library/liked">
                <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                    Liked
                </Typography>
            </Link>
        </div>
    </div>

    const headingComponent = <>
        {uploadsToggle}
    </>;

    if (!loaded) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }

    if (!user || (user && user.isEmpty)) {
        return <>
            {headingComponent}
            <div style={{padding:20}}>
                <Typography>
                    "Please sign in to upload your own poms"
                </Typography>
            </div>
        </>
    }

    let pomIds = (recent && recent["all"]) || [];
    if (user) {
        // TODO: Need to pass same refs to prevent rerenders of random component
        if (pomIds) pomIds = pomIds.filter(id => user.poms && user.poms[id]);
    }

    const subheaderText = "Your";

    const showSaved = false;

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        pomIds: pomIds.slice(0,numLoaded),
        total: pomIds.length,
        canEdit: !!(user && !user.isEmpty),
        showDelete: !!(user && !user.isEmpty),
        showSaved,
        subheaderText,
    };

    return (
        <>
            {headingComponent}
            <AddButton />
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
        </>
    );
}

export default LibraryView;