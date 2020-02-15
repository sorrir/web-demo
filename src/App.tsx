import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import GridList from '@material-ui/core/GridList';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { barrier, BarrierEventTypes, BarrierPorts, barrier_state, Component, Configuration, configurationStep, createConnection, DSB, DSBEventTypes, DSB_Ports, DSB_state, Event, sensor, SensorEventTypes, SensorPorts, sensor_startstate, stateSpace, allConfigurationSteps, depGraphToDot } from "sorrir-framework";
import './App.css';
import { ComponentComp } from "./components/Component";
import TextField from '@material-ui/core/TextField';



declare var Viz:any;


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

  useEffect(() => {
    const script = document.createElement('script');
  
    script.src = "http://webgraphviz.com//viz.js";
    script.async = true;
  
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    }
  }, []);
  

  const configuration:Configuration  = {
    components: [sensor, DSB, barrier],
    connections: [
      createConnection(sensor, SensorPorts.TO_DSB, DSB, DSB_Ports.FROM_SENSOR),
      createConnection(DSB, DSB_Ports.TO_BARRIER, barrier, BarrierPorts.FROM_DSB),
    ]
  }
  
  let startState = {
    componentState: new Map([
      [barrier, barrier_state] as [any, any],
      [sensor, sensor_startstate] as [any, any],
      [DSB, DSB_state] as [any, any],
    ]),
  }
  

  const [configurationState, setConfigurationState] = useState(_.cloneDeep(startState));
  const [svg, setSVG] = useState("");
  const [spaceSize, setSpaceSize] = useState(10);

  function createStateSpace() {
    var data = depGraphToDot(stateSpace(configuration, configurationState, allConfigurationSteps, spaceSize));
    // Generate the Visualization of the Graph into "svg".
    var svg = Viz(data, "svg");
    setSVG(svg);
  }

  function reset() {
    setConfigurationState(_.cloneDeep(startState));
    setSVG("");
  }

  function enqueueEvent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>, event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) {
    let newConfigurationState = {...configurationState};

    const comp_state = newConfigurationState.componentState.get(component);
    if (comp_state !== undefined) {
      comp_state.events.push(event);
    }

    setConfigurationState(newConfigurationState);
  };

  function deleteEvent_internalcomponent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>, event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) {
    let newConfigurationState = {...configurationState};

    const comp_state = newConfigurationState.componentState.get(component);
    if (comp_state !== undefined) {
      _.pull(comp_state.events, event);
    }

    setConfigurationState(newConfigurationState);
  }

  const deleteEvent = (component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) => (event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes, DSB_Ports>) => deleteEvent_internalcomponent(component, event);
  
  const compToEventTypeMap = new Map<Component<any, any>, object>();
  compToEventTypeMap.set(barrier, BarrierEventTypes);
  compToEventTypeMap.set(DSB, DSBEventTypes);
  compToEventTypeMap.set(sensor, SensorEventTypes);
  
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
            <Button variant="contained" onClick={() => {
                setConfigurationState(configurationStep(configuration, configurationState));
              }
              }>Step</Button>
            <form className={classes.root} noValidate autoComplete="off">
              <TextField id="outlined-basic" label="Size" type="number" variant="outlined" size="small" defaultValue={spaceSize} onChange={(e) => setSpaceSize(+e.target.value)}/>
            </form>
            <Button variant="contained" onClick={createStateSpace}>
              StateSpace</Button>
            <Button variant="contained" onClick={reset}>Reset</Button>
          </Toolbar>
        </AppBar>
        <div className="App-Canvas">
          <GridList>
           {configuration.components.map(c => {
              return (
                  <ComponentComp c={c} c_state={configurationState.componentState.get(c)} eventTypes={compToEventTypeMap.get(c) || {}} enqueue={enqueueEvent} dequeue={deleteEvent(c)}></ComponentComp>
              )
           })}
          </GridList>
          <hr/>
          <div id="statespace" dangerouslySetInnerHTML={{__html:svg}}>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
