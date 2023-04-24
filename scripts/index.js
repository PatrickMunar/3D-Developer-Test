/**
 * Shaders
 */
const vertexShader = `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMatrix;
    uniform mat4 rotationMatrix;

    attribute vec3 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;

        vUv = uv;
    }
`

const fragmentShader = `
    precision mediump float;

    uniform sampler2D uTexture;
    uniform vec3 uColor;

    varying vec2 vUv;

    void main() {
        vec4 textureColor = texture2D(uTexture, vUv);
        gl_FragColor = vec4(uColor.r, uColor.g, uColor.b, textureColor.a);
    }
`

const colors = [
  new THREE.Color(0x5f22d9),
  new THREE.Color(0xffc1cc),
  new THREE.Color(0x87ceeb),
  new THREE.Color(0xbab86c),
  new THREE.Color(0xfa5f55),
  new THREE.Color(0xf0f0f0),
  new THREE.Color(0x303030),
]

const domColors = [
  "#5f22d9",
  "#ffc1cc",
  "#87ceeb",
  "#bab86c",
  "#fa5f55",
  "#f0f0f0",
  "#303030",
]

/**
 * Main JS
 */
const main = () => {
  /**
   * 3D Setup
   */
  // ----------------------------------------------------------------
  // Canvas
  const canvas = document.querySelector(".webgl")

  // Scene
  const scene = new THREE.Scene()

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4)

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  // Resize
  window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  // Texture Loader
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load("./images/Logo.png")

  // GLTF Loader
  const bottle = new THREE.Group()
  const base = new THREE.Group()
  const cap = new THREE.Group()
  const hinge = new THREE.Group()
  const sleeve = new THREE.Group()
  const modelScale = 0.05
  const gltfLoader = new THREE.GLTFLoader()

  // Base
  gltfLoader.load("./glb/Base.glb", (obj) => {
    base.add(obj.scene)
    obj.scene.scale.set(modelScale, modelScale, modelScale)

    obj.scene.children[0].material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf0f0f0),
      roughness: 0,
    })
  })
  bottle.add(base)

  // Cap
  gltfLoader.load("./glb/Cap.glb", (obj) => {
    cap.add(obj.scene)
    obj.scene.scale.set(modelScale, modelScale, modelScale)

    obj.scene.children[0].material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x5f22d9),
      roughness: 1,
      transparent: true,
    })
  })
  bottle.add(cap)

  // Hinge
  gltfLoader.load("./glb/Hinge.glb", (obj) => {
    hinge.add(obj.scene)
    obj.scene.scale.set(modelScale, modelScale, modelScale)

    obj.scene.children[0].material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf0f0f0),
      roughness: 0,
      transparent: true,
    })
  })
  cap.add(hinge)

  // Sleeve
  gltfLoader.load("./glb/Sleeve.glb", (obj) => {
    sleeve.add(obj.scene)
    obj.scene.scale.set(modelScale, modelScale, modelScale)

    obj.scene.children[0].material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xfa5f55),
      roughness: 1,
    })
  })
  bottle.add(sleeve)

  bottle.position.y = -2
  bottle.rotation.y = Math.PI / 2

  const bottleGroup = new THREE.Group()
  bottleGroup.add(bottle)
  scene.add(bottleGroup)

  bottleGroup.rotation.x = Math.PI / 2

  /**
   * 3D Objects
   */
  // ----------------------------------------------------------------
  const logoImage = document.querySelector(".logoImage")
  const logoPlaneGeometry = new THREE.PlaneGeometry(
    0.006 * logoImage.naturalWidth,
    0.006 * logoImage.naturalHeight,
    10,
    10
  )

  const logoPlaneMaterial = new THREE.RawShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTexture: { value: texture },
      uColor: { value: colors[3] },
    },
    transparent: true,
  })

  const logoPlane = new THREE.Mesh(logoPlaneGeometry, logoPlaneMaterial)
  bottleGroup.add(logoPlane)
  logoPlane.position.z = 0.705

  for (let i = 0; i < 121; i++) {
    const x = i * 3
    const xVal = logoPlane.geometry.attributes.position.array[x]
    const z = i * 3 + 2
    const d = 0.705 - (0.705 ** 2 - xVal ** 2) ** 0.5
    logoPlane.geometry.attributes.position.array[z] = -d
  }

  //
  /**
   * Renderer Setup
   */
  // ----------------------------------------------------------------

  // Base camera
  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  )
  camera.position.set(0, 0, 7)
  scene.add(camera)
  camera.add(ambientLight)
  camera.add(directionalLight)
  directionalLight.position.set(10, 10, 10)

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = false
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // Controls
  const controls = new THREE.OrbitControls(camera, canvas)
  controls.enabled = false
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.update()

  /**
   * Events
   */
  // ----------------------------------------------------------------

  // Mouse Setup
  const pointer = new THREE.Vector3()
  const point = new THREE.Vector3()

  const mouse = {
    x: 0,
    y: 0,
  }

  // Mouse Event Listeners Function
  const pointerMoveEvents = () => {
    // Not Mobile
    if (window.innerWidth > 900) {
      // Pointer Events
      document.addEventListener("pointermove", (e) => {
        mouse.x = e.clientX / window.innerWidth - 0.5
        mouse.y = -(e.clientY / sizes.height - 0.5)

        // 3D --------------
        // Update Pointer Coordinates
        pointer.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / sizes.height) * 2 + 1,
          0.575
        )

        // Match Mouse and 3D Pointer Coordinates
        pointer.unproject(camera)
        pointer.sub(camera.position).normalize()
        let distance = -camera.position.z / pointer.z
        point.copy(camera.position).add(pointer.multiplyScalar(distance))
      })
    }

    // Mobile Changes
    else {
      // Pointer Events - Mobile
      document.addEventListener("touchmove", (e) => {
        mouse.x = e.touches[0].clientX / window.innerWidth - 0.5
        mouse.y = -(e.touches[0].clientY / sizes.height - 0.5)

        // 3D --------------
        // Update Pointer Coordinates
        pointer.set(
          (e.touches[0].clientX / window.innerWidth) * 2 - 1,
          -(e.touches[0].clientY / sizes.height) * 2 + 1,
          0.575
        )

        // Match Mouse and 3D Pointer Coordinates
        pointer.unproject(camera)
        pointer.sub(camera.position).normalize()
        let distance = -camera.position.z / pointer.z
        point.copy(camera.position).add(pointer.multiplyScalar(distance))
      })
    }
  }

  pointerMoveEvents()

  // Startup Animation
  gsap.to(bottleGroup.rotation, {
    duration: 1,
    delay: 3.5,
    x: 0,
    ease: "elastic",
  })
  setTimeout(() => {
    controls.enabled = true
  }, 4500)

  // Color Choice Events
  const changeColor = (index, color) => {
    if (index == 0) {
      cap.children[1].children[0].material.color = colors[color]
      gsap.to(colorTexts[1], {
        duration: 0.1,
        color: domColors[choiceIndex[0]],
      })
    }
    if (index == 1) {
      cap.children[0].children[0].children[0].material.color = colors[color]
      base.children[0].children[0].material.color = colors[color]
      gsap.to(colorTexts[0], {
        duration: 0.1,
        backgroundColor: domColors[choiceIndex[1]],
      })
    }
    if (index == 2) {
      sleeve.children[0].children[0].material.color = colors[color]
      gsap.to(colorTexts[3], {
        duration: 0.1,
        color: domColors[choiceIndex[2]],
      })
    }
    if (index == 3) {
      logoPlane.material.uniforms.uColor.value = colors[color]
      gsap.to(colorTexts[2], {
        duration: 0.1,
        color: domColors[choiceIndex[3]],
      })
    }
  }

  const choiceIndex = [0, 5, 4, 3]

  const colorChoiceCaps = document.querySelectorAll(".colorChoiceCap")
  const colorChoiceBases = document.querySelectorAll(".colorChoiceBase")
  const colorChoiceSleeves = document.querySelectorAll(".colorChoiceSleeve")
  const colorChoiceLogos = document.querySelectorAll(".colorChoiceLogo")
  const colorTexts = document.querySelectorAll(".colorText")

  // Cap
  for (let i = 0; i < colorChoiceCaps.length; i++) {
    if (i == choiceIndex[0]) {
      gsap.to(colorChoiceCaps[i], { duration: 0, scale: 1.3 })
    }

    colorChoiceCaps[i].addEventListener("click", () => {
      if (i != choiceIndex[0]) {
        gsap.to(colorChoiceCaps[i], { duration: 0.2, y: "0vw" })

        gsap.to(colorChoiceCaps[choiceIndex[0]], {
          duration: 0.2,
          scale: 1,
          ease: "back",
        })
        gsap.to(colorChoiceCaps[i], { duration: 0.2, scale: 1.3, ease: "back" })
        choiceIndex[0] = i

        changeColor(0, choiceIndex[0])
      }
    })

    colorChoiceCaps[i].addEventListener("pointerover", () => {
      if (i != choiceIndex[0]) {
        gsap.to(colorChoiceCaps[i], { duration: 0.2, y: "-0.25vw" })
      }
    })

    colorChoiceCaps[i].addEventListener("pointerout", () => {
      if (i != choiceIndex[0]) {
        gsap.to(colorChoiceCaps[i], { duration: 0.2, y: "0vw" })
      }
    })
  }

  // Base
  for (let i = 0; i < colorChoiceBases.length; i++) {
    if (i == choiceIndex[1]) {
      gsap.to(colorChoiceBases[i], { duration: 0, scale: 1.3 })
    }

    colorChoiceBases[i].addEventListener("click", () => {
      if (i != choiceIndex[1]) {
        gsap.to(colorChoiceBases[i], { duration: 0.2, y: "0vw" })

        gsap.to(colorChoiceBases[choiceIndex[1]], {
          duration: 0.2,
          scale: 1,
          ease: "back",
        })
        gsap.to(colorChoiceBases[i], {
          duration: 0.2,
          scale: 1.3,
          ease: "back",
        })
        choiceIndex[1] = i

        changeColor(1, choiceIndex[1])
      }
    })

    colorChoiceBases[i].addEventListener("pointerover", () => {
      if (i != choiceIndex[1]) {
        gsap.to(colorChoiceBases[i], { duration: 0.2, y: "-0.25vw" })
      }
    })

    colorChoiceBases[i].addEventListener("pointerout", () => {
      if (i != choiceIndex[1]) {
        gsap.to(colorChoiceBases[i], { duration: 0.2, y: "0vw" })
      }
    })
  }

  // Sleeve
  for (let i = 0; i < colorChoiceSleeves.length; i++) {
    if (i == choiceIndex[2]) {
      gsap.to(colorChoiceSleeves[i], { duration: 0, scale: 1.3 })
    }

    colorChoiceSleeves[i].addEventListener("click", () => {
      if (i != choiceIndex[2]) {
        gsap.to(colorChoiceSleeves[i], { duration: 0.2, y: "0vw" })

        gsap.to(colorChoiceSleeves[choiceIndex[2]], {
          duration: 0.2,
          scale: 1,
          ease: "back",
        })
        gsap.to(colorChoiceSleeves[i], {
          duration: 0.2,
          scale: 1.3,
          ease: "back",
        })
        choiceIndex[2] = i

        changeColor(2, choiceIndex[2])
      }
    })

    colorChoiceSleeves[i].addEventListener("pointerover", () => {
      if (i != choiceIndex[2]) {
        gsap.to(colorChoiceSleeves[i], { duration: 0.2, y: "-0.25vw" })
      }
    })

    colorChoiceSleeves[i].addEventListener("pointerout", () => {
      if (i != choiceIndex[2]) {
        gsap.to(colorChoiceSleeves[i], { duration: 0.2, y: "0vw" })
      }
    })
  }

  // Logo
  for (let i = 0; i < colorChoiceLogos.length; i++) {
    if (i == choiceIndex[3]) {
      gsap.to(colorChoiceLogos[i], { duration: 0, scale: 1.3 })
    }

    colorChoiceLogos[i].addEventListener("click", () => {
      if (i != choiceIndex[3]) {
        gsap.to(colorChoiceLogos[i], { duration: 0.2, y: "0vw" })

        gsap.to(colorChoiceLogos[choiceIndex[3]], {
          duration: 0.2,
          scale: 1,
          ease: "back",
        })
        gsap.to(colorChoiceLogos[i], {
          duration: 0.2,
          scale: 1.3,
          ease: "back",
        })
        choiceIndex[3] = i

        changeColor(3, choiceIndex[3])
      }
    })

    colorChoiceLogos[i].addEventListener("pointerover", () => {
      if (i != choiceIndex[3]) {
        gsap.to(colorChoiceLogos[i], { duration: 0.2, y: "-0.25vw" })
      }
    })

    colorChoiceLogos[i].addEventListener("pointerout", () => {
      if (i != choiceIndex[3]) {
        gsap.to(colorChoiceLogos[i], { duration: 0.2, y: "0vw" })
      }
    })
  }

  // Color Text
  for (let i = 0; i < colorTexts.length; i++) {
    if (i == 0) {
      gsap.to(colorTexts[i], {
        duration: 0,
        backgroundColor: domColors[choiceIndex[1]],
      })
    } else if (i == 1) {
      gsap.to(colorTexts[i], {
        duration: 0,
        color: domColors[choiceIndex[0]],
      })
    } else if (i == 2) {
      gsap.to(colorTexts[i], {
        duration: 0,
        color: domColors[choiceIndex[3]],
      })
    } else if (i == 3) {
      gsap.to(colorTexts[i], {
        duration: 0,
        color: domColors[choiceIndex[2]],
      })
    }
  }

  // Menu Button Events
  let isMenuOn = false
  const menuImages = document.querySelectorAll(".menuImage")
  gsap.to(menuImages[1], { duration: 0, scale: 0 })

  document.querySelector(".menuButton").addEventListener("click", () => {
    if (isMenuOn == false) {
      isMenuOn = true
      gsap.to(menuImages[1], { duration: 0.1, scale: 1 })
      gsap.to(menuImages[0], { duration: 0.1, scale: 0 })
      gsap.to(".configuratorUI", {
        duration: 0.1,
        y: "5vw",
        opacity: 0,
      })
      gsap.to(".webgl", { duration: 0, zIndex: 1000 })
    } else {
      isMenuOn = false
      gsap.to(menuImages[0], { duration: 0.1, scale: 1 })
      gsap.to(menuImages[1], { duration: 0.1, scale: 0 })
      gsap.to(".configuratorUI", {
        duration: 0.1,
        y: "0vw",
        opacity: 1,
      })
      gsap.to(".webgl", { duration: 0, zIndex: 10 })
    }
  })

  // Visibility Toggle Events
  let isVisible = true

  document
    .querySelector(".visibiltyToggleDiv")
    .addEventListener("click", () => {
      if (isVisible == true) {
        isVisible = false
        gsap.to(cap.position, { duration: 0.5, y: 2 })
        gsap.to(cap.rotation, { duration: 0.5, y: Math.PI * 2 })
        gsap.to(cap.children[0].children[0].children[0].material, {
          duration: 0.5,
          opacity: 0,
        })
        gsap.to(cap.children[1].children[0].material, {
          duration: 0.5,
          opacity: 0,
        })
        gsap.to(".visibilityToggleImage", {
          duration: 0.1,
          opacity: 0.5,
          scale: 0.6,
        })
      } else {
        isVisible = true
        gsap.to(cap.position, { duration: 0.5, y: 0 })
        gsap.to(cap.rotation, { duration: 0.5, y: 0 })
        gsap.to(cap.children[0].children[0].children[0].material, {
          duration: 0.5,
          opacity: 1,
        })
        gsap.to(cap.children[1].children[0].material, {
          duration: 0.5,
          opacity: 1,
        })
        gsap.to(".visibilityToggleImage", {
          duration: 0.1,
          opacity: 1,
          scale: 0.8,
        })
      }
    })

  /**
   * Animate
   */
  // ----------------------------------------------------------------
  let elapsedTime
  const clock = new THREE.Clock()

  const tick = () => {
    elapsedTime = clock.getElapsedTime()

    // Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)

    controls.update()
  }

  tick()
}

/**
 * Load
 */
window.addEventListener("load", () => {
  gsap.to(".loadingImage", {
    duration: 3,
    delay: 0,
    rotationZ: "720deg",
    ease: "back",
  })
  gsap.to(".loadingPage", { duration: 0.5, delay: 3, opacity: 0 })

  main()
})
