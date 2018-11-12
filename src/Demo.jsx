import React, { Component } from 'react'
import Reward from './components/Reward'
import 'antd/dist/antd.css'
import Button from 'antd/lib/button'
import posed from 'react-pose'
import ConfigSlider from './Slider'

const ButtonSpringAnim = posed.div({
  clicked: {
    y: 5,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 2
    }
  },
  resting: {
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 2
    }
  }
})

export default class App extends Component {
  state = {
    active: false,
    fakingRequest: false,
    angle: 90,
    decay: 0.91,
    spread: 360,
    startVelocity: 15,
    elementCount: 27,
    lifetime: 200
  }

  fakeRequest = () => {
    this.setState({
      fakingRequest: true
    })
    setTimeout(() => {
      this.setState({ active: true }, () => {
        setTimeout(() => {
          this.setState({ fakingRequest: false, active: false })
        }, 100)
      })
    }, 1500)
  }

  // TODO: Debounce below methods
  lifetimeChange = (value) => { this.setState({ lifetime: value }) }
  angleChange = (value) => { this.setState({ angle: value }) }
  decayChange = (value) => { this.setState({ decay: value }) }
  spreadChange = (value) => { this.setState({ spread: value }) }
  startVelocityChange = (value) => { this.setState({ startVelocity: value }) }
  elementCountChange = (value) => { this.setState({ elementCount: value }) }

  render () {
    const { fakingRequest, active, lifetime, angle, decay, spread, startVelocity, elementCount } = this.state
    return (
      <div style={containerStyle}>
        <ButtonSpringAnim pose={active ? 'clicked' : 'resting'} >
          <Button
            type='primary'
            shape='circle'
            loading={fakingRequest}
            icon='smile'
            size='large'
            onClick={this.fakeRequest}
          >
            <Reward
              active={active}
              type='confetti'
              config={{
                lifetime,
                angle,
                decay,
                spread,
                startVelocity,
                elementCount
              }}
            />
          </Button>
        </ButtonSpringAnim>
        <div style={cardStyle}>
          <ConfigSlider title='lifetime' inputValue={lifetime} min={0} max={360} onChange={this.lifetimeChange} />
          <ConfigSlider title='angle' inputValue={angle} min={0} max={360} onChange={this.angleChange} />
          <ConfigSlider title='decay' inputValue={decay} min={0} max={1} step={0.01} onChange={this.decayChange} />
          <ConfigSlider title='spread' inputValue={spread} min={0} max={360} onChange={this.spreadChange} />
          <ConfigSlider title='startVelocity' inputValue={startVelocity} min={1} max={100} onChange={this.startVelocityChange} />
          <ConfigSlider title='elementCount' inputValue={elementCount} min={1} max={256} onChange={this.elementCountChange} />
        </div>
      </div>
    )
  }
}

const containerStyle = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 30,
  borderTop: '15px solid #e96443',
  borderBottom: '15px solid #904e95',
  backgroundImage: 'linear-gradient(#e96443, #904e95), linear-gradient(#e96443, #904e95)',
  backgroundSize: '15px 100%',
  backgroundPosition: '0 0, 100% 0',
  backgroundRepeat: 'no-repeat',
  overflowY: 'hidden'
}

const cardStyle = {
  width: '90%',
  maxWidth: 600,
  marginTop: 160
}
