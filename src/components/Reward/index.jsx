import React, { Component } from 'react'
import { confetti } from '../../confetti'
import { emoji } from '../../emoji'

export default class Reward extends Component {
  constructor (props) {
    super(props)
    this.setRef = this.setRef.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.active
  }

  componentWillUpdate () {
    switch (this.props.type) {
      case 'confetti': {
        confetti(this.container, this.props.config)
        break
      }
      case 'emoji': {
        emoji(this.container, this.props.config)
        break
      }
      default: {
        break
      }
    }
  }

  setRef (ref) {
    this.container = ref
  }

  render () {
    return <div ref={this.setRef} />
  }
}
