import React from 'react';
import { useSelector } from 'react-redux';
import { useFirebaseConnect } from 'react-redux-firebase';

import Typography from '@material-ui/core/Typography';

import PomList from '../PomList';

import InfiniteScroll from 'react-infinite-scroller';

import Loading from '../Loading';
import Link from 'next/link';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;

function LikedView(props) {

    useFirebaseConnect([
        'recent',
    ]);

    const recent = useSelector(state => state.firebase.data.recent);
    const user = useSelector(state => state.firebase.profile);

    const [loaded, setLoaded] = React.useState(true);

    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const uploadsToggle = <div style={{display:'flex'}}>
        <div style={{marginLeft: 10, marginRight: 10, color: 'lightgrey', userSelect: 'none'}}>
            <Link href="/library">
                <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                    Yours
                </Typography>
            </Link>
        </div>
        <div style={{marginLeft: 10, marginRight: 10, color: 'black', userSelect: 'none'}}>
            <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>
                Liked
            </Typography>
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
        if (pomIds) pomIds = pomIds.filter(id => user.saved && user.saved[id]);
    }

    const subheaderText = "Your Liked";

    const showSaved = user && user.saved;

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        pomIds: pomIds.slice(0,numLoaded),
        total: pomIds.length,
        showSaved,
        subheaderText,
    };

    return (
        <>
            {headingComponent}
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

export default LikedView;