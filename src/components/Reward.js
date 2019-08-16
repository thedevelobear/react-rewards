import React, { Component } from 'react'
import posed from 'react-pose'
import confetti from './Confetti'
import emoji from './Emoji'
import memphis from './Memphis'

const transition = {
  type: 'spring',
  stiffness: 200,
  damping: 2
}

const SpringAnim = posed.div({
  confetti: {
    y: 5,
    transition,
  },
  emoji: {
    y: 5,
    transition,
  },
  memphis: {
    scale: 1.1,
    transition,
  },
  punished: {
    x: 5,
    transition,
  },
  resting: {
    y: 0,
    x: 0,
    scale: 1,
    transition,
  }
})

export default class Reward extends Component {
  state = {
    state: 'resting'
  }

  rewardMe = () => {
    const { type, config } = this.props
    const props = [this.container, config]
    switch (type) {
      case 'confetti': {
        this.handleAnimation(type)
        confetti(...props)
        break
      }
      case 'emoji': {
        this.handleAnimation(type)
        emoji(...props)
        break
      }
      case 'memphis': {
        this.handleAnimation(type)
        memphis(...props)
        break
      }
      default: {
        break
      }
    }
  }

  punishMe = () => {
    this.handlePunishAnimation()
  }

  rest = () => {
    setTimeout(() => {
      this.setState({ state: 'resting' })
    }, 100)
  }

  handleAnimation = (type) => {
    this.setState({ state: type }, () => {
      this.rest()
    })
  }

  handlePunishAnimation = () => {
    this.setState({ state: 'punished' }, () => {
      this.rest()
    })
  }

  render () {
    const { config = {}, children } = this.props
    const { springAnimation = true } = config
    const { state } = this.state
    return (
      <React.Fragment>
        <div ref={(ref) => { this.container = ref }} />
        <SpringAnim pose={springAnimation && state}>
          {children}
        </SpringAnim>
      </React.Fragment>
    )
  }
}
