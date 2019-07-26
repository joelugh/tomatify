import React from 'react';

import Random from './Random';

class RandomCard extends React.Component {

    state = {
        random: null,
    }

    componentDidMount() {
        this.randomise();
    }

    componentDidUpdate(prevProps) {
        const {random} = this.state;
        const {pomIds=[]} = this.props;
        if (random === null && pomIds.length === 0) return;
        if (random === 0 && pomIds.length === 1) return;
        if (random === null || random >= pomIds.length) this.randomise();
    }

    randomise = () => {
        const {pomIds} = this.props;
        let random = this.state.random;
        if (pomIds.length === 0) {
            random = null;
        } else if (pomIds.length === 1) {
            random = 0;
        } else if (random === null) {
            random = Math.floor(Math.random() * pomIds.length);
        } else {
            while (random === this.state.random) {
                random = Math.floor(Math.random() * pomIds.length);
            }
        }
        this.setState({ random });
    }

    render() {

        const {
            random,
        } = this.state;

        const {
            favourites,
            onClick: _onClick,
            onToggleSaved: _onToggleSaved,
            pomIds,
        } = this.props;

        if (random === null || random >= pomIds.length) return null;

        const id = pomIds[random];

        const isFavourite = favourites[id];

        const onClick = () => _onClick(id);
        const onToggleSaved = () => _onToggleSaved(id);

        return <Random
            id={id}
            isFavourite={isFavourite}
            onClick={onClick}
            onToggleSaved={onToggleSaved}
            onRandomise={this.randomise}
        />;
    }
}

export default RandomCard;