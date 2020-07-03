import React from 'react';

import Typography from '@material-ui/core/Typography';

import TagNav from './TagNav';
import PomList from './PomList';

import InfiniteScroll from 'react-infinite-scroller';

import Loading from './Loading';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;

function Poms(props) {

    const {
        recent = {},
        popular = {},
        user = {},
        filter,
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

    const showSaved = !!!(user && user.isEmpty);

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
            {recent && <TagNav />}
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

export default Poms;