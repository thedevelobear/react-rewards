const defaultEmoji = [
  '👍',
  '😊',
  '🎉'
]

function createElements (root, elementCount, emoji) {
  return Array
    .from({ length: elementCount })
    .map((_, index) => {
      const element = document.createElement('span')
      const emojiIcon = emoji[index % emoji.length]
      element.innerHTML = emojiIcon
      element.style.width = '15px'
      element.style.height = '15px'
      element.style.position = 'absolute'
      root.appendChild(element)
      return element
    })
}

function randomPhysics (angle, spread, startVelocity, random) {
  const radAngle = angle * (Math.PI / 180)
  const radSpread = spread * (Math.PI / 180)
  return {
    x: 0,
    y: 0,
    wobble: random() * 10,
    velocity: (startVelocity * 0.5) + (random() * startVelocity),
    angle2D: -radAngle + ((0.5 * radSpread) - (random() * radSpread)),
    angle3D: -(Math.PI / 4) + (random() * (Math.PI / 2)),
    tiltAngle: random() * Math.PI
  }
}

function updateFetti (fetti, progress, decay) {
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

function animate (root, mojis, decay, lifetime) {
  const totalTicks = lifetime
  let tick = 0

  function update () {
    mojis.forEach((fetti) => updateFetti(fetti, tick / totalTicks, decay))

    tick += 1
    if (tick < totalTicks) {
      requestAnimationFrame(update)
    } else {
      mojis.forEach((fetti) => {
        if (fetti.element.parentNode === root) {
          return root.removeChild(fetti.element)
        }
      })
    }
  }

  requestAnimationFrame(update)
}

export function emoji (root, {
  angle = 90,
  decay = 0.9,
  spread = 45,
  startVelocity = 35,
  elementCount = 50,
  lifetime = 200,
  emoji = defaultEmoji,
  random = Math.random
} = {}) {
  const elements = createElements(root, elementCount, emoji)
  const mojis = elements.map((element) => ({
    element,
    physics: randomPhysics(angle, spread, startVelocity, random)
  }))

  animate(root, mojis, decay, lifetime)
}
