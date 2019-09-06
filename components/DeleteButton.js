import React from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';

class DeleteButtonWithDialog extends React.Component {
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
        onDelete = () => {},
        title = '',
    } = this.props;

    return (
      <div>
        <IconButton size="small" aria-label="Delete" onClick={this.handleClickOpen}>
            <DeleteIcon />
        </IconButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{`Delete ${title}?`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete {title}? This will remove it from Tomatify but not Spotify.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button
                onClick={(e) => {
                    onDelete();
                    this.handleClose(e);
                }}
                color="primary"
                autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default DeleteButtonWithDialog;