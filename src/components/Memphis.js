import lottie from 'lottie-web'
import './memphis.css'

const memphis = (container) => {
  lottie.loadAnimation({
    container: container,
    renderer: 'svg',
    rendererSettings: {
      className: 'absolutePlayer'
    },
    loop: false,
    autoplay: true,
    animationData: [],
    onComplete: lottie.destroy()
  })
}
export default memphis
