import React, { Component } from 'react'
import Reward from './components/Reward'
import Button from 'antd/lib/button'
import Radio from 'antd/lib/radio'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import ConfigSlider from './Slider'
import logo from '../react-rewards.png'
import 'antd/dist/antd.css'

const defaults = {
  confetti: {
    type: 'confetti',
    fakingRequest: false,
    angle: 90,
    decay: 0.91,
    spread: 45,
    startVelocity: 35,
    elementCount: 40,
    elementSize: 8,
    lifetime: 200,
    zIndex: 10,
    springAnimation: true
  },
  emoji: {
    type: 'emoji',
    fakingRequest: false,
    angle: 90,
    decay: 0.91,
    spread: 100,
    startVelocity: 20,
    elementCount: 15,
    elementSize: 20,
    lifetime: 200,
    zIndex: 10,
    springAnimation: true
  },
  memphis: {
    type: 'memphis',
    fakingRequest: false,
    lifetime: 200,
    zIndex: 10,
    springAnimation: true
  }
}

export default class App extends Component {
  state = {
    ...defaults.confetti,
    rewardPunish: 'reward'
  }

  fakeRequest = () => {
    const { rewardPunish } = this.state
    this.setState({
      fakingRequest: true
    })
    setTimeout(() => {
      this.setState({ fakingRequest: false, success: true })
      rewardPunish === 'reward' ? this.reward.rewardMe() : this.reward.punishMe()
    }, 1500)
  }

  rewardTypeChange = (e) => { console.log(defaults[e.target.value]); this.setState({ type: e.target.value, ...defaults[e.target.value] }) }
  lifetimeChange = (value) => { this.setState({ lifetime: value }) }
  angleChange = (value) => { this.setState({ angle: value }) }
  decayChange = (value) => { if (!isNaN(value)) { this.setState({ decay: value }) } }
  spreadChange = (value) => { this.setState({ spread: value }) }
  startVelocityChange = (value) => { this.setState({ startVelocity: value }) }
  elementCountChange = (value) => { this.setState({ elementCount: value }) }
  elementSizeChange = (value) => { this.setState({ elementSize: value }) }
  rewardPunishChange = (e) => { this.setState({ rewardPunish: e.target.value }) }

  render () {
    const {
      type,
      fakingRequest,
      lifetime,
      angle,
      decay,
      spread,
      startVelocity,
      elementCount,
      elementSize,
      zIndex,
      springAnimation,
      rewardPunish
    } = this.state
    const disabled = rewardPunish === 'punish'
    return (
      <div style={containerStyle}>
        <img style={logoStyle} src={logo} />
        <Reward
          ref={(ref) => { this.reward = ref }}
          type={type}
          config={{
            lifetime,
            angle,
            decay,
            spread,
            startVelocity,
            elementCount,
            elementSize,
            zIndex,
            springAnimation
          }}
        >
          <Button
            type='primary'
            shape='circle'
            loading={fakingRequest}
            icon={type ? 'like' : 'trophy'}
            size='large'
            onClick={this.fakeRequest}
          />
        </Reward>
        <div style={cardStyle}>
          <Row style={rowStyle}>
            <Col style={colStyle} span={24}>
              <Radio.Group defaultValue='confetti' buttonStyle='solid' onChange={this.rewardTypeChange} disabled={disabled}>
                <Radio.Button value='confetti'>Confetti 🎉</Radio.Button>
                <Radio.Button value='emoji'>Emoji 👍</Radio.Button>
                <Radio.Button value='memphis'>Memphis 🔸</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <Row style={rowStyle}>
            <Col style={colStyle} span={24}>
              <Radio.Group defaultValue='reward' buttonStyle='solid' onChange={this.rewardPunishChange}>
                <Radio.Button value='reward'>Reward</Radio.Button>
                <Radio.Button value='punish'>Punish</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <ConfigSlider title='lifetime' inputValue={lifetime} min={0} max={360} onChange={this.lifetimeChange} disabled={disabled} />
          <ConfigSlider title='angle' inputValue={angle} min={0} max={360} onChange={this.angleChange} disabled={disabled} />
          <ConfigSlider title='decay' inputValue={decay} min={0} max={1} step={0.01} onChange={this.decayChange} disabled={disabled} />
          <ConfigSlider title='spread' inputValue={spread} min={0} max={360} onChange={this.spreadChange} disabled={disabled} />
          <ConfigSlider title='startVelocity' inputValue={startVelocity} min={1} max={100} onChange={this.startVelocityChange} disabled={disabled} />
          <ConfigSlider title='elementCount' inputValue={elementCount} min={1} max={256} onChange={this.elementCountChange} disabled={disabled} />
          <ConfigSlider title='elementSize' inputValue={elementSize} min={1} max={50} onChange={this.elementSizeChange} disabled={disabled} />
        </div>
      </div>
    )
  }
}

const containerStyle = {
  minHeight: '100vh',
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

const logoStyle = {
  width: '90%',
  maxWidth: 400,
  paddingBottom: 100
}

const cardStyle = {
  width: '90%',
  maxWidth: 600,
  marginTop: 160
}

const rowStyle = {
  marginBottom: 20
}

const colStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
