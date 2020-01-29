import React, { useState} from 'react';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Event, Component } from "sorrir-framework";
import { createConnection, configurationStep } from "sorrir-framework";
import { barrier, BarrierPorts } from "sorrir-framework";
import { DSB, DSB_Ports } from "sorrir-framework";
import { BarrierEventTypes, DSBEventTypes, SensorEventTypes } from "sorrir-framework";

import './App.css';

import {ComponentComp} from "./components/Component";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    control: {
      padding: theme.spacing(2),
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  }),
);

const App: React.FC = () => {

  const [configuration, setConfiguration] = useState(
    {
    components: [barrier, DSB],
    connections: [
            createConnection(DSB, DSB_Ports.TO_BARRIER, barrier, BarrierPorts.FROM_DSB),
    ]
  });

  function enqueueEvent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>, event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) {
    for (var comp of configuration.components) {
      if (comp === component) {
        comp.state.events.push(event);
        console.log(event);
      }
    }
    setConfiguration(configuration);
  };

  const compToEventTypeMap = new Map<Component<any, any>, object>();

  compToEventTypeMap.set(barrier, BarrierEventTypes);
  compToEventTypeMap.set(DSB, DSBEventTypes);


  const classes = useStyles();

  return (
    <div className="App">
      <header className="App-header">
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="Menu">
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Sorrir - MVP
            </Typography>
            <Button variant="contained" color="secondary" onClick={() => {
                configurationStep(configuration);
                setConfiguration(configuration);
              }
              }>Step</Button>
            <Button variant="contained">Reset</Button>
          </Toolbar>
        </AppBar>
        <div>
         {configuration.components.map(c => {
            return (
              <div>
                <ComponentComp c={c} eventTypes={compToEventTypeMap.get(c) || {}} enqueue={enqueueEvent}></ComponentComp>
              </div>
            )
         })}
        </div>
      </header>
    </div>
  );
}

export default App;
