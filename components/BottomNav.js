import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import RestoreIcon from '@material-ui/icons/Restore';
import FavoriteIcon from '@material-ui/icons/Favorite';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import TagFacesIcon from '@material-ui/icons/TagFaces';

const styles = {
    container: {
        boxShadow: '0px 1px 2px grey',
        backgroundColor: '#ffffff',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        display:'flex',
        justifyContent: 'center',
        zIndex: 1,
    },
    root: {
        width: 360,
    },
};

class LabelBottomNavigation extends React.Component {

    handleChange = (event, value) => {
        this.props.onChange(value);
    };

    render() {
        const { classes, value } = this.props;
        return (
                <div className={classes.container}>
            <BottomNavigation value={value} onChange={this.handleChange} className={classes.root}>
                <BottomNavigationAction label="Recents" value="recents" icon={<RestoreIcon />} />
                <BottomNavigationAction label="Tags" value="tags" icon={<TagFacesIcon />} />
                <BottomNavigationAction label="Saved" value="saved" icon={<FavoriteIcon />} />
                <BottomNavigationAction label="Uploads" value="uploads" icon={<AccountCircleIcon />} />
            </BottomNavigation>
                </div>
        );
    }
}

LabelBottomNavigation.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LabelBottomNavigation);