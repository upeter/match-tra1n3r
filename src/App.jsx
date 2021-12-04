import './App.css';
import {Icon} from '@rsuite/icons';
import {
    Navbar,
    Nav,
    Dropdown,
    Container,
    Header,
    Content,
    Footer,
    FlexboxGrid,
    Panel,
    Form,
    ButtonToolbar, Avatar, Divider, InputNumber, Input, Progress, Modal
} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import {
    FaSmile as SmileIcon,
    FaFrown as FrownIcon,
} from 'react-icons/fa';
import {
    AiFillCalculator as CalculatorIcon
} from 'react-icons/ai';
import {Button} from 'rsuite';
import React, {Component, useState} from "react";


const ConfigModal = props => {
    const state = {min: props.config.min, max: props.config.max, total: props.config.total}
    console.log(state)
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        props.onConfigChange(state)
        props.callback.current(state)
        setOpen(false)
    };

    const handleCloseOnly = () => {
        setOpen(false)
    };

    return (
        <div className="modal-container">
            <div onClick={handleOpen}>Configure</div>
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Configure Run</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form layout="horizontal">
                        <Form.Group controlId="min">
                            <Form.ControlLabel>Min Number</Form.ControlLabel>
                            <InputNumber defaultValue={state.min} onChange={v => state.min = v} style={{width:100}}/>
                            <Form.HelpText>Required</Form.HelpText>
                        </Form.Group>
                        <Form.Group controlId="max">
                            <Form.ControlLabel>Max Number</Form.ControlLabel>
                            <InputNumber defaultValue={state.max}  onChange={v => state.max = v} style={{width:100}}/>
                             <Form.HelpText>Required</Form.HelpText>
                        </Form.Group>
                        <Form.Group controlId="total">
                            <Form.ControlLabel>Total</Form.ControlLabel>
                            <InputNumber defaultValue={state.total}  onChange={v => state.total = v} style={{width:100}}/>
                            <Form.HelpText>Required</Form.HelpText>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} appearance="primary">
                        Ok
                    </Button>
                    <Button onClick={handleCloseOnly} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

};


const TrainerPanel = props => {

    const randomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
    }

    const nextNumbers = (min, max) => {
        let no1 = randomNumber( min,  max)
        let no2 = randomNumber( min,  max)
        if (state === undefined || state.results.slice(0, 10).filter(obj => obj.ok === true).every(obj => obj.result !== (no1 * no2))) {
            return [no1, no2]
        } else return nextNumbers(min, max);
    }

    const min = props.config.min;
    const max = props.config.max;
    const [no1, no2] = nextNumbers(min, max);
    const [state, setState] = useState({
        results: [],
        ok: null,
        firstNumber: no1,
        secondNumber: no2,
        total: props.config.total
    });

    const configCallback = React.useCallback((newConfig) => {
        handleConfigChange(newConfig)
    }, []);
    React.useEffect(() => {
        props.callback.current = configCallback
    }, []);

    const handleConfigChange = (newConfig) => {
        const [no1, no2] = nextNumbers(newConfig.min, newConfig.max);
        setState({results: [], ok: null, firstNumber: no1, secondNumber: no2, total:newConfig.total});
    }

    const percent = () => {
        let okResults = state.results.filter(obj => obj.ok).length
        return Math.floor(okResults / state.total * 100);
    }

    const verify = (event) => {
        let result = parseInt(event.target.value);
        if (result === (state.firstNumber * state.secondNumber)) {
            event.target.value = '';
            state.results.push({
                first: state.firstNumber,
                second: state.secondNumber,
                result: result,
                ok: true
            });
            const [no1, no2] = nextNumbers(min, max);
            setState({ok: true, firstNumber: no1, secondNumber: no2, results:  state.results,  total:state.total});
        } else {
            event.target.select();
            state.results.push({
                first: state.firstNumber,
                second: state.secondNumber,
                result: result,
                ok: false
            });
            setState({ok: false, firstNumber: no1, secondNumber: no2, results:  state.results, total:state.total});
        }
        console.log(state, percent())
    }

    const changed = () => {
        setState({ok: null, firstNumber: state.firstNumber, secondNumber: state.secondNumber, results: state.results, total:state.total});
    }

        return (
            <Panel header={<h3>Multiply</h3>} bordered>
                <div>
                    <FlexboxGrid justify="center" align="middle">
                        <FlexboxGrid.Item colspan={3} align="middle">
                            <Avatar style={{color: 'black'}} size="lg">{state.firstNumber}</Avatar>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <strong>X</strong>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={3} align="middle">
                            <Avatar style={{color: 'black'}} size="lg">{state.secondNumber}</Avatar>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <strong>=</strong>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={3} align="middle">
                            <Input size="lg" onChange={() => changed()}
                                   onPressEnter={(event) => verify(event)}/>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <ResultIcon ok={state.ok}/>
                        </FlexboxGrid.Item>

                    </FlexboxGrid>
                    <Divider></Divider>
                    <Panel>
                        <Progress.Line percent={percent()} status="success"/>
                    </Panel>
                </div>
            </Panel>
        );
}

const ResultIcon = props => {
    let {ok} = props;

    if (ok === true) {
        return <Icon as={SmileIcon} size="2em" style={{color: '#3A9307FF'}}/>;
    } else if (ok === false) {
        return <Icon as={FrownIcon} size="2em" style={{color: '#f18d7b'}}/>;
    }
    return <span/>
};

const TrainerApp = props => {
        const [state, setState] = useState({min: 1, max: 10, total: 20});
        const trainerPanelCallback = React.useRef(null);

    const handleConfigChange = newConfig => {
        console.log('new config', newConfig)
        setState(newConfig)
    }

        return (<div className="show-fake-browser navbar-page">
            <Container>
                <Header>
                    <Navbar appearance="inverse">
                        <Navbar.Brand><Icon as={CalculatorIcon} size="2em"></Icon> <strong>Math Trainer</strong></Navbar.Brand>
                        <Nav>
                            <Nav.Item><ConfigModal config={state}
                                                   onConfigChange={handleConfigChange}
                                                   callback={trainerPanelCallback}></ConfigModal></Nav.Item>
                        </Nav>
                    </Navbar>
                </Header>
                <Content>
                    <TrainerPanel callback={trainerPanelCallback} config={state}/>
                </Content>
                <Footer>Footer</Footer>
            </Container>
        </div>);
}

export default TrainerApp;
