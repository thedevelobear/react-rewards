import lottie from 'lottie-web'
import memphisAnimation from './memphis.json'
import './index.css'

const memphis = (container, props) => {
  lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    rendererSettings: {
      className: 'absolutePlayer'
    },
    loop: false,
    autoplay: true,
    animationData: memphisAnimation,
    onComplete: lottie.destroy()
  })
}
export default memphis
