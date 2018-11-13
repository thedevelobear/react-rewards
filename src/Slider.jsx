import React, { PureComponent } from 'react'
import { Slider, InputNumber, Row, Col } from 'antd'

class ConfigSlider extends PureComponent {
  render () {
    const { min, max, step, inputValue } = this.props
    return (
      <Row>
        <Col span={5}>
          {this.props.title}
        </Col>
        <Col span={15}>
          <Slider
            min={min}
            max={max}
            step={step || 1}
            onChange={this.props.onChange}
            value={typeof inputValue === 'number' ? inputValue : 0}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={min}
            max={max}
            step={step || 1}
            style={inputStyle}
            value={inputValue}
            onChange={this.props.onChange}
          />
        </Col>
      </Row>
    )
  }
}
const inputStyle = { marginLeft: 16 }
export default ConfigSlider
