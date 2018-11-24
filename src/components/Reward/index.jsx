import React, { Component } from 'react'
import posed from 'react-pose'
import confetti from '../Confetti'
import emoji from '../Emoji'

const Animation = posed.div({
  rewarded: {
    y: 5,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 2
    }
  },
  punished: {
    x: 5,
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
    animationState: 'resting'
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
        this.handleAnimation()
        confetti(...props)
        break
      }
    }
  }

  punishMe = () => {
    this.handlePunishAnimation()
  }

  handleAnimation = () => {
    this.setState({ animationState: 'rewarded' })
    rest()
  }

  handlePunishAnimation = () => {
    this.setState({ animationState: 'punished' })
    rest()
  }
  
  rest(){
    setTimeout(() => {
      this.setState({ animationState: 'resting' })
    }, 100)
  }

  render () {
    const { config = {}, children } = this.props
    const { springAnimation = true } = config
    const { animationState } = this.state
    return (
      <span>
        <div ref={(ref) => { this.container = ref }} />
        <Animation pose={animationState)}>
            {children}
        </Animation>
      </span>
    )
  }
}
