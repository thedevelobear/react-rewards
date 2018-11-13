import React, { Component } from 'react'
import posed from 'react-pose'
import { confetti } from '../../confetti'
import { emoji } from '../../emoji'

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
    switch (this.props.type) {
      case 'confetti': {
        this.handleAnimation()
        confetti(this.container, this.props.config)
        break
      }
      case 'emoji': {
        this.handleAnimation()
        emoji(this.container, this.props.config)
        break
      }
      default: {
        break
      }
    }
  }

  handleAnimation = () => {
    setTimeout(() => {
      this.setState({ animate: true }, () => {
        setTimeout(() => {
          this.setState({ animate: false })
        }, 100)
      })
    }, 100)
  }

  render () {
    const { config, children } = this.props
    const { springAnimation } = config
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
