import React, { useState} from 'react';

import * as _ from 'lodash';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import { Event, Component, Configuration, ConfigurationState, AbstractState, barrier_state, DSB_state } from "sorrir-framework";
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

  const configuration = {
    components: [barrier, DSB],
    connections: [
            createConnection(DSB, DSB_Ports.TO_BARRIER, barrier, BarrierPorts.FROM_DSB),
    ]
  };

  const startState:ConfigurationState = {
    componentState: new Map([
      [barrier, barrier_state] as [Component<any, any>, AbstractState<any, any, any>],
      [DSB, DSB_state] as [Component<any, any>, AbstractState<any, any, any>],
    ])
  }

  const [configurationState, setConfigurationState] = useState(startState);

  function enqueueEvent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>, event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) {
    let newConfigurationState = {...configurationState};

    const comp_state = newConfigurationState.componentState.get(component);
    if (comp_state !== undefined) {
      comp_state.events.push(event);
      console.log(event);
    }

    setConfigurationState(newConfigurationState);
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
                setConfigurationState(configurationStep(configuration, configurationState));
              }
              }>Step</Button>
            {/* <Button variant="contained" onClick={() => setConfiguration(_.cloneDeep(startConfiguration))}>Reset</Button> */}
          </Toolbar>
        </AppBar>
        <div>
         {configuration.components.map(c => {
            return (
              <div>
                <ComponentComp c={c} c_state={configurationState.componentState.get(c)} eventTypes={compToEventTypeMap.get(c) || {}} enqueue={enqueueEvent}></ComponentComp>
              </div>
            )
         })}
        </div>
      </header>
    </div>
  );
}

export default App;
