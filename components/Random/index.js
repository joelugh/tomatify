import React from 'react';

import Random from './Random';

function shuffle(_array = []) {
    const array = [..._array];
    var currentIndex = array.length, temporaryValue, indexIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      indexIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[indexIndex];
      array[indexIndex] = temporaryValue;
    }
    return array;
  }

class RandomCard extends React.Component {

    state = {
        index: null,
        shuffledIds: [],
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps) {
        const {pomIds} = this.props;
        if (pomIds === prevProps.pomIds) return;

        // naive check
        if (JSON.stringify(pomIds) !== JSON.stringify(prevProps.pomIds)) this.update();
    }

    update = () => this.setState(() => {
        const {pomIds=[]} = this.props;
        const index = (pomIds.length === 0) ? null : 0;
        return {index, shuffledIds: shuffle(pomIds)}
    });

    next = () => this.setState(({index, shuffledIds}) => {
        if (shuffledIds.length === 0) {
            index = null;
        } else if (shuffledIds.length === 1) {
            index = 0;
        } else if (index === null) {
            index = 0;
        } else {
            index = (index + 1) % shuffledIds.length;
        }
        return { index };
    })

    render() {

        const {
            index,
            shuffledIds,
        } = this.state;

        const {
            favourites = {},
            onClick: _onClick,
            onToggleSaved: _onToggleSaved,
            pomIds,
        } = this.props;

        if (index === null || index >= shuffledIds.length) return null;

        const id = shuffledIds[index];

        if (pomIds.indexOf(id) === -1) return null;

        const isFavourite = favourites[id];

        const onClick = () => _onClick(id);
        const onToggleSaved = () => _onToggleSaved(id);

        return <Random
            id={id}
            isFavourite={isFavourite}
            onClick={onClick}
            onToggleSaved={onToggleSaved}
            onRandomise={this.next}
        />;
    }
}

export default RandomCard;