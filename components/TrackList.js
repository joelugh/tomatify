    import React from 'react';
    import PropTypes from 'prop-types';
    import { withStyles } from '@material-ui/core/styles';
    import Typography from '@material-ui/core/Typography';
    import Table from '@material-ui/core/Table';
    import TableBody from '@material-ui/core/TableBody';
    import TableCell from '@material-ui/core/TableCell';
    import TableHead from '@material-ui/core/TableHead';
    import TableRow from '@material-ui/core/TableRow';
    import { Button, Link } from '@material-ui/core';

    const styles = theme => ({
        root: {
            position: 'relative',
            width: '100%',
            marginTop: theme.spacing(3),
            overflowX: 'auto',
        },
        table: {
            tableLayout: 'fixed',
        },
        row: {
            height: 30,
            maxWidth: 500,
        },
    });

    function TrackTable(props) {
        const { classes, tracks, activeTrack, onClick } = props;
        const widths = ['8%', '67%', '25%'];
        return (
            <Table className={classes.table}>
                <TableHead>
                <TableRow>
                    <TableCell style={{width: widths[0]}} padding="none"><Typography variant="caption" >#</Typography></TableCell>
                    <TableCell style={{width: widths[1]}} align="left" padding="none" ><Typography variant="caption" >Title</Typography></TableCell>
                    <TableCell style={{width: widths[2]}} align="right" padding="none"><Typography variant="caption" >To Go</Typography></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {tracks.map((track,idx) => {
                    const color = track.uri == activeTrack ? 'secondary' : 'inherit';
                    return <TableRow key={idx} className={classes.row} onClick={() => onClick(idx)}>
                        <TableCell style={{width: widths[0]}} component="th" scope="row" padding="none"><Typography variant="caption" color={color}>{idx + 1}</Typography></TableCell>
                        <TableCell style={{width: widths[1], userSelect: 'none'}} align="left" padding="none"><Typography noWrap><Link variant="caption" color={color}>{track.title}</Link></Typography></TableCell>
                        <TableCell style={{width: widths[2]}} align="right" padding="none" ><Typography variant="caption" color={color}>{track.remaining}</Typography></TableCell>
                    </TableRow>
                })}
                </TableBody>
            </Table>
        );
    }

    TrackTable.propTypes = {
        classes: PropTypes.object.isRequired,
    };

    export default withStyles(styles)(TrackTable);