import React, { PureComponent } from 'react'
import Slider from 'antd/lib/slider'
import InputNumber from 'antd/lib/input-number'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'

class ConfigSlider extends PureComponent {
  render () {
    const { min, max, step, inputValue, disabled } = this.props
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </Col>
      </Row>
    )
  }
}
const inputStyle = { marginLeft: 16 }
export default ConfigSlider
