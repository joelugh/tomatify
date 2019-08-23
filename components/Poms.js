import React from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';

import Random from './Random';
import PomList from './PomList';

import InfiniteScroll from 'react-infinite-scroller';
import { Emoji } from 'emoji-mart';
import { Chip } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { setTag } from '../redux/client';

import TagView from './TagView';
import Loading from './Loading';

const INIT_NUM_LOAD = 5;
const INC_NUM_LOAD = 10;
const LOAD_DELAY_MS = 1000;

function Poms(props) {

    const { recent = {}, popular = {}, user = {}, filter, tag } = props;

    const [loaded, setLoaded] = React.useState(false);

    const [numLoaded, setNumLoaded] = React.useState(INIT_NUM_LOAD);

    const [popularFilter, setPopularFilter] = React.useState("week");

    const [uploadsFilter, setUploadsFilter] = React.useState("uploads");

    React.useEffect(() => {
        setLoaded(false);
        setTimeout(() => setLoaded(true), LOAD_DELAY_MS);
        setNumLoaded(INIT_NUM_LOAD);
    }, [filter, uploadsFilter]);

    const uploadsToggle = <div style={{display:'flex'}}>
        <div style={{marginLeft: 10, marginRight: 10, color: uploadsFilter === "uploads" ? 'black' : 'lightgrey', userSelect: 'none'}} onClick={() => setUploadsFilter("uploads")}><Typography variant="h5">
            Yours
        </Typography></div>
        <div style={{marginLeft: 10, marginRight: 10, color: uploadsFilter === "saved" ? 'black' : 'lightgrey', userSelect: 'none'}} onClick={() => setUploadsFilter("saved")}><Typography variant="h5">
            Liked
        </Typography></div>
    </div>

    const headingComponent = <>
        <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>Pomodoro Playlists</Typography>
        {filter === "uploads" && uploadsToggle}
    </>;

    if (!loaded) {
        return <>
            {headingComponent}
            <Loading />
        </>
    }

    const iteratePopularFilter = () => setPopularFilter(popularFilter => {
        if (popularFilter === "week") return "month";
        if (popularFilter === "month") return "all";
        if (popularFilter === "all") return "week";
        return "week";
    })
    const subheaderTextLookup = {
        week: "Top (Week)",
        month: "Top (Month)",
        all: "Top (All-time)",
    };
    const sliceLookup = {
        week: 5,
        month: 5,
        all: 5,
    }

    let pomIds = (recent && recent["all"]) || [];
    if (user) {
        if (pomIds && filter === "uploads" && uploadsFilter === "uploads") pomIds = pomIds.filter(id => user.poms && user.poms[id]);
        if (pomIds && filter === "uploads" && uploadsFilter === "saved") pomIds = pomIds.filter(id => user.saved && user.saved[id]);
    }

    const popularIds = !popular || !popular[popularFilter] ? [] : popular[popularFilter].map(o => o.id).slice(0,sliceLookup[popularFilter]);

    const randomProps = {
        pomIds,
        onClick: props.onClick,
        favourites: (user && user.saved) || {},
        onToggleSaved: props.onToggleSaved,
    };

    const subheaderText = (filter === "recents")
    ?
        "Latest"
    :
        (uploadsFilter === "uploads") ? "Your" : "Saved";

    const chip = tag ? <Chip size="medium" label={<Emoji emoji={tag} native size={12}/>} onDelete={() => props.setTag(null)}/> : null;

    const showSaved = !!!((filter === "uploads" && uploadsFilter === "uploads") || (user && user.isEmpty));

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        pomIds: pomIds.slice(0,numLoaded),
        total: pomIds.length,
        canEdit: !!(filter === "uploads"  && uploadsFilter === "uploads" && user && !user.isEmpty),
        showDelete: !!(filter === "uploads"  && uploadsFilter === "uploads" && user && !user.isEmpty),
        showSaved,
        subheaderText,
        chip,
        onClick: props.onClick,
        onDelete: props.onDelete,
        onToggleSaved: props.onToggleSaved,
        onSync: props.onSync,
    };

    const popularListProps = {
        subheaderText: subheaderTextLookup[popularFilter],
        pomIds: popularIds,
        total: popularIds.length,
        onToggleType: () => iteratePopularFilter(),
        onClick: props.onClick,
        showSaved,
        favourites: (user && user.saved) || {},
        onToggleSaved: props.onToggleSaved,
    }


    return (
        <>
            {headingComponent}
            {!tag && filter === "recents" && popular && <PomList {...popularListProps} />}
            {filter === "tags" && <TagView />}
            {filter !== "tags" && recent && <Random {...randomProps} />}
            {filter !== "tags" && recent &&
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