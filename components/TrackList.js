    import React from 'react';
    import PropTypes from 'prop-types';
    import { withStyles } from '@material-ui/core/styles';
    import Typography from '@material-ui/core/Typography';
    import Table from '@material-ui/core/Table';
    import TableBody from '@material-ui/core/TableBody';
    import TableCell from '@material-ui/core/TableCell';
    import TableHead from '@material-ui/core/TableHead';
    import TableRow from '@material-ui/core/TableRow';

    const styles = theme => ({
        root: {
            position: 'relative',
            width: '100%',
            marginTop: theme.spacing.unit * 3,
            overflowX: 'auto',
        },
        table: {
            tableLayout: 'fixed',
        },
        row: {
            height: 0,
            maxWidth: 500,
        },
    });

    function TrackTable(props) {
        const { classes, tracks } = props;
        const widths = ['5%', '70%', '25%'];
        return (
            <Table className={classes.table}>
                <TableHead>
                <TableRow>
                    <TableCell style={{width: widths[0]}} padding="none"><Typography variant="caption" >#</Typography></TableCell>
                    <TableCell style={{width: widths[1]}} align="left" padding="none" ><Typography variant="caption" >Title</Typography></TableCell>
                    <TableCell style={{width: widths[2]}} align="right" padding="none"><Typography variant="caption" >Duration</Typography></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {tracks.map((track,idx) => (
                    <TableRow key={idx} className={classes.row}>
                    <TableCell style={{width: widths[0]}} component="th" scope="row" padding="none"><Typography variant="caption" >{idx + 1}</Typography></TableCell>
                    <TableCell style={{width: widths[1]}} align="left" padding="none"><Typography variant="caption" component="div" noWrap>{track.title}</Typography></TableCell>
                    <TableCell style={{width: widths[2]}} align="right" padding="none" ><Typography variant="caption" >{track.duration}</Typography></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        );
    }

    TrackTable.propTypes = {
        classes: PropTypes.object.isRequired,
    };

    export default withStyles(styles)(TrackTable);