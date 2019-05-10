import React from 'react';

import Typography from '@material-ui/core/Typography';

import Random from './Random';
import PomList from './PomList';

class Poms extends React.Component {

    render() {

        const { poms, user = {}, filter } = this.props;

        const randomProps = {
            poms,
            onClick: this.props.onClick,
        };

        const subheaderText = `${(filter === "recents") ? "Latest" : (filter === "saved") ? "Saved" : "Your"} Pomodoro Playlists`;

        const listProps = {
            favourites: (user && user.saved) || {},
            poms,
            showDelete: !!(filter === "uploads" && user),
            showSaved: !!(filter !== "uploads" && user),
            subheaderText,
            onClick: this.props.onClick,
            onDelete: this.props.onDelete,
            onToggleSaved: this.props.onToggleSaved,
        };

        return (
            <React.Fragment>
                <Typography component="div" variant="h4" style={{marginTop: 40}}>Pomodoro Playlists</Typography>
                {poms && <Random {...randomProps} />}
                {poms && <PomList {...listProps} />}
            </React.Fragment>
        );
    }
}

export default Poms;