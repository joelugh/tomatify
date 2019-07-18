import React from 'react';

import Typography from '@material-ui/core/Typography';

import Random from './Random';
import PomList from './PomList';

function Poms(props) {

    const { poms, popular = [], user = {}, filter } = props;

    const [isHot, setIsHot] = React.useState(true);

    const randomProps = {
        poms,
        onClick: props.onClick,
        favourites: (user && user.saved) || {},
        onToggleSaved: props.onToggleSaved,
    };

    const subheaderText = `${(filter === "recents") ? "Latest" : (filter === "saved") ? "Saved" : "Your"} Pomodoro Playlists`;

    const listProps = {
        favourites: (user && user.saved) || {},
        remainingSyncs: (user && user.syncs && user.syncs.count) || 0,
        poms,
        showDelete: !!(filter === "uploads" && user),
        showSaved: !!(filter !== "uploads" && user),
        subheaderText,
        onClick: props.onClick,
        onDelete: props.onDelete,
        onToggleSaved: props.onToggleSaved,
        onSync: props.onSync,
    };

    const popularListProps = {
        subheaderText: isHot ? "Hot Poms" : "Top Poms",
        poms: isHot ? popular["month"] : popular["all"],
        onToggleType: () => setIsHot(!!!isHot),
        onClick: props.onClick,
        showSaved: !!(filter !== "uploads" && user),
        favourites: (user && user.saved) || {},
        onToggleSaved: props.onToggleSaved,
    }

    return (
        <>
            <Typography component="div" variant="h4" style={{marginTop: 20, marginBottom: 20}}>Pomodoro Playlists</Typography>
            {filter === "recents" && poms && <PomList {...popularListProps} />}
            {poms && <Random {...randomProps} />}
            {poms && <PomList {...listProps} />}
        </>
    );
}

export default Poms;