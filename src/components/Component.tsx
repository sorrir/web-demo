import React, { useState } from 'react';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { AbstractState, StateMachineState, Component, Event } from "sorrir-framework";

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    card: {
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

const StateMachineStateComp: React.FC<{s: StateMachineState<any, any, any, any>}> = (props) => {

    return (
      <div>
        <p>Discrete State: {JSON.stringify(props.s.state.fsm)}</p>
        <p>Complex State: {JSON.stringify(props.s.state.my)}</p>
      </div>
    )
  }
  
  function isStateMachineState(state: AbstractState<any, any, any> | StateMachineState<any, any, any, any>) : state is StateMachineState<any, any, any, any> {
    return (state as StateMachineState<any, any, any, any>).state.fsm !== undefined;
  }

  export const EventComp: React.FC<{events: Event<any,any>[]}> = (props) => {
      return (
        <div>
            Events: [
            {props.events.map(e => {
                return (
                    <div>
                    {e.type}/{e.port}
                    </div>
                )
            })}
            ]
        </div>
      )
  }

  export interface ComponentCompProps {
    c: Component<any,any>,
    events:object,
    enqueue: (component: Component<any, any>, event: Event<any, any>) => void,
  }
  
  export const ComponentComp: React.FC<ComponentCompProps> = (props) => {
  
    const [state, setState] = useState(props.c.state);
    const [portToSendEvent, setPortToSendEvent] = useState("");
    const [eventToSend, setEventToSend] = useState("");

    const classes = useStyles();
  
    return (
        <Card className={classes.card} variant="outlined">
            <CardContent>
                <Typography variant="h5" component="h2">
                    Component
                </Typography>
                Ports: [
                    {props.c.ports.map(p => p.name + ",")}
                ]
                {
                    (isStateMachineState(state)) ? (<StateMachineStateComp s={state}></StateMachineStateComp>) : JSON.stringify(state)
                }
                <EventComp events={state.events}/>
                <FormControl className={classes.formControl}>
                  <InputLabel id="port-select-label">Port:</InputLabel>
                  <Select
                    labelId="port-select-label"
                    id="port-select"
                    value={portToSendEvent}
                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {setPortToSendEvent(event.target.value as string)}} 
                  >
                      <MenuItem value="">
                          <em>Internal</em>
                      </MenuItem>
                      {props.c.ports.map(p => {
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
                        Object.keys(props.events).map(e => {
                          return (
                              <MenuItem value={e.toString()}>{e.toString()}</MenuItem>
                          )
                      })}
                  </Select>
                </FormControl>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={ () => 
                props.enqueue(props.c, {type: eventToSend, port: portToSendEvent} as Event<any,any>)
              }>Enqueue</Button>
            </CardActions>
      </Card>
    )
  }