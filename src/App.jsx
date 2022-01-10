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
    ButtonToolbar, Avatar, Divider, InputNumber, Input, Progress, Modal, Rate, List
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


const ResultModal = (props) => {
    const handleClose = () => props.close()
    const scoreText = ['Keep on practicing, you can do better!', 'Practice more!','You did OK. With more practice you can become better!', 'Well done!', 'You are awesome!']
    const score = () => props.wrong === 0 ? 5 :(props.right / (props.right + props.wrong)) * 5
    return (
        <Modal backdrop="static" role="alertdialog" open={props.open} onClose={handleClose} size="xs">
            <Modal.Body>
                <Panel header="Your Score" style={{fontWeight:'bold'}}>
                    <List size="sm">
                        <List.Item > <strong>{props.right}</strong> X <Icon as={SmileIcon} size="2em" style={{color: '#3A9307FF'}}/></List.Item>
                        <List.Item > <strong>{props.wrong}</strong> X <Icon as={FrownIcon} size="2em" style={{color: '#f18d7b'}}/></List.Item>
                        <List.Item > <Rate defaultValue={ score()  } allowHalf readOnly/></List.Item>
                        <List.Item > {scoreText[parseInt(score()) - 1]} </List.Item>
                    </List>
                </Panel>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose} appearance="primary">Ok</Button>
            </Modal.Footer>
        </Modal>
    );
};

const ConfigModal = props => {
    const state = {min: props.config.min, max: props.config.max, total: props.config.total}
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
                            <InputNumber defaultValue={state.min} onChange={v => state.min = parseInt(v)} style={{width:100}}/>
                            <Form.HelpText>Required</Form.HelpText>
                        </Form.Group>
                        <Form.Group controlId="max">
                            <Form.ControlLabel>Max Number</Form.ControlLabel>
                            <InputNumber defaultValue={state.max}  onChange={v => state.max = parseInt(v)} style={{width:100}}/>
                             <Form.HelpText>Required</Form.HelpText>
                        </Form.Group>
                        <Form.Group controlId="total">
                            <Form.ControlLabel>Total</Form.ControlLabel>
                            <InputNumber defaultValue={state.total}  onChange={v => state.total = parseInt(v)} style={{width:100}}/>
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
        if (state === undefined || state.run.results.slice(0, 10).filter(obj => obj.ok === true).every(obj => obj.result !== (no1 * no2))) {
            return [no1, no2]
        } else return nextNumbers(min, max);
    }

    const [no1, no2] = nextNumbers(props.config.min, props.config.max);
    const [state, setState] = useState({
        run:{results: [], ok: null, firstNumber: no1, secondNumber: no2, showResultModal:false},
        config:{min:props.config.min, max:props.config.max, total:props.config.total}
    });

    const configCallback = React.useCallback((newConfig) => {
        handleConfigChange(newConfig)
    }, []);
    React.useEffect(() => {
        props.callback.current = configCallback
    }, []);

    const handleConfigChange = (newConfig) => {
        const [no1, no2] = nextNumbers(newConfig.min, newConfig.max);
        resetRun({min:newConfig.min, max:newConfig.max, total:newConfig.total, firstNumber:no1, secondNumber:no2})
    }

    const resetRun = ({min = state.config.min,
                      max = state.config.max,
                      total = state.config.total,
                      firstNumber = state.run.firstNumber,
                      secondNumber = state.run.secondNumber} = {}) => {
        setState({
            config: {min: min, max: max, total: total},
            run:{results: [], ok: null, firstNumber: firstNumber, secondNumber: secondNumber, total:total, showResultModal:false}
        });
    }

    const percent = () => {
        let okResults = state.run.results.filter(obj => obj.ok).length
        return Math.floor(okResults / state.config.total * 100);
    }

    const verify = (event) => {
        if(event.target.value !== '') {
            let result = parseInt(event.target.value);
            if (result === (state.run.firstNumber * state.run.secondNumber)) {
                event.target.value = '';
                state.run.results.push({
                    first: state.run.firstNumber,
                    second: state.run.secondNumber,
                    result: result,
                    ok: true
                });
                const [no1, no2] = nextNumbers(state.config.min, state.config.max);
                state.run.ok = true
                state.run.firstNumber = no1
                state.run.secondNumber = no2
                setState({run: state.run, config: state.config});
            } else {
                event.target.select();
                state.run.results.push({
                    first: state.firstNumber,
                    second: state.secondNumber,
                    result: result,
                    ok: false
                });
                state.run.ok = false
                setState({run: state.run, config: state.config});
            }
            if (state.config.total >= 1 && state.run.results.filter(obj => obj.ok).length === state.config.total) {
                state.run.showResultModal = true
                setState({run: state.run, config: state.config});
            }
            console.log(state, percent())
        }
    }

    const changed = () => {
        state.run.ok = null
        setState({run: state.run, config: state.config});
    }

        return (
            <Panel header={<h3>Multiply</h3>} bordered style={{padding:10}}>
                <ResultModal open={state.run.showResultModal} close={() => {
                    state.run.showResultModal = false
                    setState({run:state.run, config: state.config});
                    resetRun()
                }} right={state.run.results.filter(obj => obj.ok).length} wrong={state.run.results.filter(obj => !obj.ok).length} />
                <div>
                    <FlexboxGrid justify="center" align="middle" >
                        <FlexboxGrid.Item colspan={4} align="middle" >
                            <Avatar style={{color: 'black'}} size="lg">{state.run.firstNumber}</Avatar>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <strong>X</strong>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={4} align="middle">
                            <Avatar style={{color: 'black'}} size="lg">{state.run.secondNumber}</Avatar>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <strong>=</strong>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={4} align="middle">
                            <Input size="lg" onChange={() => changed()}
                                   onPressEnter={(event) => verify(event)}/>
                        </FlexboxGrid.Item>
                        <FlexboxGrid.Item colspan={1} align="middle">
                            <ResultIcon ok={state.run.ok}/>
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
                        <Navbar.Brand><Icon as={CalculatorIcon} size="2em"></Icon> <strong>Math Tra1n3r</strong></Navbar.Brand>
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
                <Footer>4 Quinn</Footer>
            </Container>
        </div>);
}

export default TrainerApp;
