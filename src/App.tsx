import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as _ from 'lodash';
import React, {useState, useEffect} from 'react';
import {
    barrier,
    BarrierEventTypes,
    BarrierPorts,
    barrier_state,
    Component,
    Configuration,
    configurationStep,
    createConnection,
    DSB,
    DSBEventTypes,
    DSB_Ports,
    DSB_state,
    Event,
    sensor,
    SensorEventTypes,
    SensorPorts,
    sensor_startstate,
    stateSpace,
    allConfigurationSteps,
    depGraphToDot,
    user,
    user_startstate,
    UserPorts,
    UserEventTypes
} from "sorrir-framework";
import './App.css';
import {ComponentComp} from "./components/Component";
import TextField from '@material-ui/core/TextField';
import {Grid, CssBaseline, Container} from "@material-ui/core";


declare var Viz: any;


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto'
        },
        grow: {
            flexGrow: 1,
        },
        inputColor: {
            color: '#E2E2E2'
        }
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

    const configuration: Configuration = {
        components: [barrier, DSB, sensor, user],
        connections: [
            createConnection(sensor, SensorPorts.TO_DSB, DSB, DSB_Ports.FROM_SENSOR),
            createConnection(DSB, DSB_Ports.TO_BARRIER, barrier, BarrierPorts.FROM_DSB),
            createConnection(DSB, DSB_Ports.TO_USER, user, UserPorts.FROM_DSB),
            createConnection(user, UserPorts.TO_DSB, DSB, DSB_Ports.FROM_USER),
        ]
    }

    let startState = {
        componentState: new Map([
            [barrier, barrier_state] as [any, any],
            [sensor, sensor_startstate] as [any, any],
            [DSB, DSB_state] as [any, any],
            [user, user_startstate] as [any, any],
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

    function enqueueEvent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports> | Component<UserEventTypes, UserPorts>, event: Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports> & Event<UserEventTypes, UserPorts>) {
        let newConfigurationState = {...configurationState};

        const comp_state = newConfigurationState.componentState.get(component);
        if (comp_state !== undefined) {
            comp_state.events.push(event);
        }

        setConfigurationState(newConfigurationState);
    };

    function deleteEvent_internalcomponent(component: Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports> | Component<UserEventTypes, UserPorts>, event: Event<UserEventTypes, UserPorts> & Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports> & Event<UserEventTypes, UserPorts>) {
        let newConfigurationState = {...configurationState};

        const comp_state = newConfigurationState.componentState.get(component);
        if (comp_state !== undefined) {
            _.pull(comp_state.events, event);
        }

        setConfigurationState(newConfigurationState);
    }

    const deleteEvent = (component: Component<UserEventTypes, UserPorts> | Component<BarrierEventTypes, BarrierPorts> | Component<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports>) => (event: Event<UserEventTypes, UserPorts> & Event<BarrierEventTypes, BarrierPorts> & Event<BarrierEventTypes | SensorEventTypes | DSBEventTypes | UserEventTypes, DSB_Ports>) => deleteEvent_internalcomponent(component, event);

    const compToEventTypeMap = new Map<Component<any, any>, object>();
    compToEventTypeMap.set(barrier, BarrierEventTypes);
    compToEventTypeMap.set(DSB, DSBEventTypes);
    compToEventTypeMap.set(sensor, SensorEventTypes);
    compToEventTypeMap.set(user, UserEventTypes);

    const classes = useStyles();

    return (
        <div>
            <CssBaseline/>

            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        SORRIR Demo
                    </Typography>

                    <div className={classes.grow}/>

                    <Button color="inherit" onClick={() => {
                        setConfigurationState(configurationStep(configuration, configurationState));
                    }
                    }>
                        Step
                    </Button>
                    <Button color="inherit" onClick={reset}>Reset</Button>

                    <div className={classes.grow}/>

                    <form noValidate autoComplete="off">
                        <TextField InputProps={{className: classes.inputColor}} InputLabelProps={{className: classes.inputColor}} id="outlined-basic" label="Size" type="number" variant="outlined" size="small"
                                   defaultValue={spaceSize} onChange={(e) => setSpaceSize(+e.target.value)}/>
                    </form>
                    <Button color="inherit" onClick={createStateSpace}>
                        StateSpace
                    </Button>
                </Toolbar>
            </AppBar>
            <Toolbar/>

            <main className={classes.content}>
                <Grid container justify="center" spacing={3}>
                    {configuration.components.map(c => {
                        return (
                            <Grid item>
                                <ComponentComp c={c} c_state={configurationState.componentState.get(c)}
                                               eventTypes={compToEventTypeMap.get(c) || {}} enqueue={enqueueEvent}
                                               dequeue={deleteEvent(c)}>

                                </ComponentComp>
                            </Grid>
                        )
                    })}
                </Grid>

                <Container>
                    <div id="statespace" dangerouslySetInnerHTML={{__html: svg}}>
                    </div>
                </Container>
            </main>
        </div>
    );
}

export default App;
