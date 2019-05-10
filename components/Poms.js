import React from 'react';

import Typography from '@material-ui/core/Typography';

import Random from './Random';
import PomList from './PomList';

class Poms extends React.Component {

    state = {
        random: {
            uploads: null,
            saved: null,
            recents: null,
        },
    }

    componentDidMount() {
        this.randomise();
    }

    componentDidUpdate(prevProps) {
        // FIXME: need to handle unsave too
        if (this.props.poms !== prevProps.poms &&
            (this.props.poms && Object.keys(this.props.poms).length) !== (prevProps.poms && Object.keys(prevProps.poms).length)
        ) this.randomise();
        if (this.props.filter !== prevProps.filter) {
            if (this.state.random[this.props.filter] === null) this.randomise();
        }
    }

    randomise = () => {
        const {poms, filter} = this.props;
        let random = this.state.random[filter];
        if (poms.length === 0) {
            random = null;
        } else if (poms.length === 1) {
            random = 0;
        } else if (random === null) {
            random = Math.floor(Math.random() * poms.length);
        } else {
            while (random === this.state.random[filter]) {
                random = Math.floor(Math.random() * poms.length);
            }
        }
        this.setState(state => ({
            ...state,
            random: {
                ...state.random,
                [filter]: random,
            }
        }));
    }

    getRandomIdx = () => this.state.random[this.props.filter];

    render() {

        const { poms, user = {}, filter } = this.props;

        const randomIdx = this.getRandomIdx();
        const randomProps = randomIdx !== null ? {
            ...poms[randomIdx],
            onClick: () => this.props.onClick(poms[randomIdx].id),
            onRefresh: this.randomise,
        } : {};

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
                {randomIdx !== null && <Random {...randomProps} />}
                {poms && <PomList {...listProps} />}
            </React.Fragment>
        );
    }
}

export default Poms;