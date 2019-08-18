const PI = Math.PI
const defaultEmoji = [
  '👍',
  '😊',
  '🎉'
]

const createElements = (root, elementCount, elementSize, zIndex, emoji) => (
  Array
    .from({ length: elementCount })
    .map((_, index) => {
      const element = document.createElement('span')
      const emojiIcon = emoji[index % emoji.length]
      element.innerHTML = emojiIcon
      element.style.fontSize = `${elementSize}px`
      element.style.position = 'absolute'
      element.style.zIndex = zIndex
      root.appendChild(element)
      return element
    })
)

const radiansFrom = degrees => degrees * (PI / 180)

const generatePhysics = (angle, spread, startVelocity, random) => {
  const radAngle = radiansFrom(angle)
  const radSpread = radiansFrom(spread)
  return {
    x: 0,
    y: 0,
    wobble: random() * 10,
    velocity: (startVelocity * 0.5) + (random() * startVelocity),
    angle2D: -radAngle + ((0.5 * radSpread) - (random() * radSpread)),
    angle3D: -(PI / 4) + (random() * (PI / 2)),
    tiltAngle: random() * PI
  }
}

const updateMojis = (fetti, progress, decay) => {
  fetti.physics.x += Math.cos(fetti.physics.angle2D) * fetti.physics.velocity
  fetti.physics.y += Math.sin(fetti.physics.angle2D) * fetti.physics.velocity
  fetti.physics.wobble += 0
  fetti.physics.velocity *= decay
  fetti.physics.y += 5
  fetti.physics.tiltAngle += 0.1

  const { x, y, tiltAngle } = fetti.physics
  const wobbleX = x + 0
  const wobbleY = y + 0
  const transform = `translate3d(${wobbleX}px, ${wobbleY}px, 0) rotate(${tiltAngle}rad)`

  fetti.element.style.transform = transform
  fetti.element.style.opacity = 1 - progress
}

const animate = (root, mojis, decay, lifetime) => {
  const totalTicks = lifetime
  let tick = 0

  const update = () => {
    mojis.forEach((fetti) => updateMojis(fetti, tick / totalTicks, decay))

    tick += 1
    if (tick < totalTicks) {
      window.requestAnimationFrame(update)
    } else {
      mojis.forEach((fetti) => {
        if (fetti.element.parentNode === root) {
          return root.removeChild(fetti.element)
        }
      })
    }
  }

  window.requestAnimationFrame(update)
}

const emoji = (root, {
  angle = 90,
  decay = 0.9,
  spread = 45,
  startVelocity = 35,
  elementCount = 50,
  elementSize = 25,
  lifetime = 200,
  zIndex = 0,
  emoji = defaultEmoji,
  random = Math.random
} = {}) => {
  const elements = createElements(root, elementCount, elementSize, zIndex, emoji)
  const mojis = elements.map((element) => ({
    element,
    physics: generatePhysics(angle, spread, startVelocity, random)
  }))

  animate(root, mojis, decay, lifetime)
}

export default emoji
