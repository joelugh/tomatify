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

function Poms(props) {

    const { recent = {}, popular = {}, user = {}, filter, tag } = props;

    const [popularFilter, setPopularFilter] = React.useState("week");
    const iteratePopularFilter = () => setPopularFilter(popularFilter => {
        if (popularFilter === "week") return "month";
        if (popularFilter === "month") return "all";
        if (popularFilter === "all") return "week";
        return "week";
    })
    const subheaderTextLookup = {
        week: "New",
        month: "Hot",
        all: "Top",
    };
    const sliceLookup = {
        week: 5,
        month: 8,
        all: 10,
    }

    const [numLoaded, setNumLoaded] = React.useState(15);

    React.useEffect(() => {
        setNumLoaded(15);
    }, [filter])

    let pomIds = (recent && recent["all"]) || [];
    if (user) {
        if (pomIds && filter === "uploads") pomIds = pomIds.filter(id => user.poms && user.poms[id]);
        if (pomIds && filter === "saved") pomIds = pomIds.filter(id => user.saved && user.saved[id]);
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
        (filter === "saved") ? "Saved" : "Your";

    const chip = tag ? <Chip size="medium" label={<Emoji emoji={tag} native size={12}/>} onDelete={() => props.setTag(null)}/> : null;

    const showSaved = !!(filter !== "uploads" && user && !user.isEmpty);

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        pomIds: pomIds.slice(0,numLoaded),
        total: pomIds.length,
        showDelete: !!(filter === "uploads" && user && !user.isEmpty),
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
            <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>Pomodoro Playlists</Typography>
            {!tag && filter === "recents" && popular && <PomList {...popularListProps} />}
            {filter === "tags" && <TagView />}
            {filter !== "tags" && recent && <Random {...randomProps} />}
            {filter !== "tags" && recent &&
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    setNumLoaded(numLoaded + 10);
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