import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import AddBoxIcon from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/Delete';
import React, {useState} from 'react';
import {AbstractState, Component, Event, StateMachineState, Port} from 'sorrir-framework';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            margin: theme.spacing(2),
            minWidth: 275,
        },
        bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
        },
        title: {
            fontSize: 14,
        },
        pos: {
            marginBottom: 12,
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
    })
);

const StateMachineStateComp: React.FC<{ s: StateMachineState<any, any, any, any> }> = (props) => {

    return (
        <div>
            <p>Discrete State: {JSON.stringify(props.s.state.fsm)}</p>
            <p>Complex State: {JSON.stringify(props.s.state.my)}</p>
        </div>
    )
}

function isStateMachineState(state: AbstractState<any, any, any> | StateMachineState<any, any, any, any> | undefined): state is StateMachineState<any, any, any, any> {
    return (state as StateMachineState<any, any, any, any>).state.fsm !== undefined;
}

interface EventCompProps {
    events: Event<any, any>[] | undefined,
    dequeue: (event: Event<any, any>) => void,
}

const EventComp: React.FC<EventCompProps> = (props) => {
    return (
        <div className="Component-EventBox">
            <div>
                Events:
            </div>
            <div className="Component-EventList">
                {props.events && props.events.map(e => {
                    return (
                        <div>
                            {e.port}.{e.type}
                            <Button size="small" onClick={() => props.dequeue(e)}>
                                <DeleteIcon/>
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export interface ComponentCompProps {
    c: Component<any, any>,
    c_state: AbstractState<any, any, any> | undefined,
    eventTypes: { [key: string]: any },
    enqueue: (component: Component<any, any>, event: Event<any, any>) => void,
    dequeue: (event: Event<any, any>) => void
}

export const ComponentComp: React.FC<ComponentCompProps> = (props) => {

    const [portToSendEvent, setPortToSendEvent] = useState("");
    const [eventToSend, setEventToSend] = useState("");

    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardContent>
                Component: {props.c.name}
                {
                    (isStateMachineState(props.c_state)) ? (<StateMachineStateComp
                        s={props.c_state}></StateMachineStateComp>) : JSON.stringify(props.c_state)
                }
                <EventComp events={props.c_state?.events} dequeue={props.dequeue}/>
                <div className="Component-EventEnqueue">
                    <FormControl className={classes.formControl}>
                        <InputLabel id="port-select-label">Port:</InputLabel>
                        <Select
                            labelId="port-select-label"
                            id="port-select"
                            value={portToSendEvent}
                            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                setPortToSendEvent(event.target.value as string)
                            }}
                        >
                            <MenuItem value={undefined}>
                                <em>Internal</em>
                            </MenuItem>
                            {props.c.ports.map((p: Port<any, any>) => {
                                return (
                                    <MenuItem value={p.name}>{p.name}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="event-select-label">Event:</InputLabel>
                        <Select
                            labelId="event-select-label"
                            id="event-select"
                            value={eventToSend}
                            onChange={(event: React.ChangeEvent<{ value: unknown }>) => setEventToSend(event.target.value as string)}
                        >
                            {
                                Object.keys(props.eventTypes).map(e => {
                                    return (
                                        <MenuItem value={e.toString()}>{e.toString()}</MenuItem>
                                    )
                                })}
                        </Select>
                    </FormControl>
                    <Button size="small" onClick={() =>
                        props.enqueue(props.c, {
                            type: props.eventTypes[eventToSend],
                            port: portToSendEvent
                        } as Event<any, any>)
                    }><AddBoxIcon/></Button>
                </div>
            </CardContent>
        </Card>
    )
}