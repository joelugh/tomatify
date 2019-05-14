import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import UnfoldLessIcon from '@material-ui/icons/UnfoldLess';

import Pom from './Pom';

const styles = theme => ({
    root: {
        width: 'auto',
        maxWidth: '500px',
        minWidth: '360px',
        backgroundColor: theme.palette.background.paper,
    },
    subheader: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingRight: 0,
    },
    toggle: {
        height: 40,
        minWidth: 40,
    }
});

class PomList extends React.Component {

    state = {
        expanded: null,
        all: false,
    }

    componentDidUpdate(prevProps) {
        if (this.props.poms !== prevProps.poms) this.setState({expanded:null});
    }

    handleExpand = idx => this.setState(state => ({
        all: false,
        expanded: state.all ? null : state.expanded === idx ? null : idx,
    }));

    handleToggle = () => this.setState(state => ({
        all: !(state.all || state.expanded !== null),
        expanded: null,
    }));

    render() {

        const {
            expanded,
            all,
        } = this.state;

        const {
            classes,
            poms,
            showDelete,
            showSaved,
            subheaderText,
            favourites,
            remainingSyncs,
            onClick,
            onDelete,
            onToggleSaved,
            onSync,
        } = this.props;

        const unfoldLess = all || expanded !== null;

        return <List
            className={classes.root}
            subheader={
                <ListSubheader className={classes.subheader}>
                    <span>{subheaderText} ({poms.length})</span>
                    <Button className={classes.toggle} onClick={this.handleToggle}>
                        {unfoldLess ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                    </Button>
                </ListSubheader>
            }
        >
            {poms.map((_pom, idx) => {
                const { id, uri, ...pom } = _pom;
                const isFavourite = favourites[id];
                return <Pom
                    key={id}
                    {...pom}
                    expanded={all || expanded === idx}
                    handleExpand={() => this.handleExpand(idx)}
                    isFavourite={isFavourite}
                    onClick={() => onClick(id)}
                    onDelete={() => onDelete(uri)}
                    onToggleSaved={() => onToggleSaved(id)}
                    onSync={() => onSync(id)}
                    remainingSyncs={remainingSyncs}
                    showSync={showDelete}
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