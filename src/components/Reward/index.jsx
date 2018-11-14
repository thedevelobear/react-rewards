import React, { Component } from 'react'
import posed from 'react-pose'
import confetti from '../Confetti'
import emoji from '../Emoji'

const SpringAnim = posed.div({
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

export default class Reward extends Component {
  state = {
    animate: false
  }

  rewardMe = () => {
    const props = [this.container, this.props.config]
    switch (this.props.type) {
      case 'confetti': {
        this.handleAnimation()
        confetti(...props)
        break
      }
      case 'emoji': {
        this.handleAnimation()
        emoji(...props)
        break
      }
      default: {
        break
      }
    }
  }

  handleAnimation = () => {
    this.setState({ animate: true }, () => {
      setTimeout(() => {
        this.setState({ animate: false })
      }, 100)
    })
  }

  render () {
    const { config = {}, children } = this.props
    const { springAnimation = true } = config
    const { animate } = this.state
    return (
      <span>
        <div ref={(ref) => { this.container = ref }} />
        <SpringAnim pose={springAnimation && (animate ? 'clicked' : 'resting')}>
          {children}
        </SpringAnim>
      </span>
    )
  }
}
