import lottie from 'lottie-web'
import animationData from './memphisAnimationData.js'

import './index.css'

const memphis = (container) => {
  lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    rendererSettings: {
      className: 'absolute-player'
    },
    loop: false,
    autoplay: true,
    animationData: animationData,
    onComplete: lottie.destroy()
  })
}
export default memphis
