import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RefreshIcon from '@material-ui/icons/Refresh';
import Typography from '@material-ui/core/Typography';

class SyncButtonWithDialog extends React.Component {
  state = {
    open: false,
  };

  handleClickOpen = (e) => {
    if (e) e.stopPropagation();
    this.setState({ open: true });
  };

  handleClose = (e) => {
    if (e) e.stopPropagation();
    this.setState({ open: false });
  };

  render() {

    const {
        onSync = () => {},
        title = '',
        remainingSyncs = 0,
    } = this.props;

    const outOfSyncs = remainingSyncs === 0;

    return (
      <div>
        <IconButton aria-label="Sync" onClick={this.handleClickOpen}>
            <RefreshIcon />
        </IconButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{`Sync ${title}?`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
                The will fetch the latest metadata for {title} from Spotify, including any changes in title, description and length.
                To respect Spotify's limits, each user is limited to 10 syncs per day.
            </DialogContentText>
            <div style={{paddingTop: 20}}>
                <Typography color={outOfSyncs ? 'error' : 'default'}>You have {remainingSyncs} syncs left today</Typography>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button
                disabled={outOfSyncs}
                onClick={(e) => {
                    onSync();
                    this.handleClose(e);
                }}
                color="primary"
                autoFocus
            >
              Sync
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default SyncButtonWithDialog;