import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';

import Pom from './Pom';

const styles = theme => ({
    root: {
        width: 'auto',
        maxWidth: '500px',
        minWidth: '360px',
        backgroundColor: theme.palette.background.paper,
    },
});

class PomList extends React.Component {

    state = {
        expanded: null,
    }

    componentDidUpdate(prevProps) {
        if (this.props.poms !== prevProps.poms) this.setState({expanded:null});
    }

    handleExpand = idx => this.setState(state => ({
        expanded: state.expanded === idx ? null : idx,
    }));

    render() {

        const {
            expanded,
        } = this.state;

        const {
            classes,
            poms,
            showDelete,
            showSaved,
            subheaderText,
            favourites,
            onClick,
            onDelete,
            onToggleSaved,
        } = this.props;

        return <List className={classes.root} subheader={<ListSubheader>{subheaderText} ({poms.length})</ListSubheader>} >
            {poms.map((_pom, idx) => {
                const { id, uri, ...pom } = _pom;
                const isFavourite = favourites[id];
                return <Pom
                    key={id}
                    {...pom}
                    expanded={expanded === idx}
                    handleExpand={() => this.handleExpand(idx)}
                    isFavourite={isFavourite}
                    onClick={() => onClick(id)}
                    onDelete={() => onDelete(uri)}
                    onToggleSaved={() => onToggleSaved(id)}
                    showDelete={showDelete}
                    showSaved={showSaved}
                    divider={idx !== poms.length-1}
                />
            })}
        </List>
    }
}

PomList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PomList);