/**
 * Initial Settings
 */
// GSAP Settings
gsap.registerPlugin(ScrollTrigger)

// Clear Scroll Memory
window.history.scrollRestoration = "manual"

// Lenis Smooth Scrolling
const lenis = new Lenis({
  duration: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
  direction: "vertical", // vertical, horizontal
  gestureDirection: "vertical", // vertical, horizontal, both
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

const raf = (time) => {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

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

  let cameraMaxY = -20

  // Responsive Variable Changes
  if (sizes.width > sizes.height) {
    cameraMaxY = -20
  } else {
    cameraMaxY = -50
  }

  let prevHeight = sizes.height

  // Resize
  window.addEventListener("resize", () => {
    if (window.innerHeight >= prevHeight) {
      // Update sizes
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight
      prevHeight = sizes.height

      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.position.z = (7 * (1920 / 1080)) / (sizes.width / sizes.height)
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
  })

  // Texture Loader
  const textureLoader = new THREE.TextureLoader()
  const cubeTextureLoader = new THREE.CubeTextureLoader()

  // GLTF Loader
  const gltfLoader = new THREE.GLTFLoader()
  //   gltfLoader.load("./glb/Logo.glb", (obj) => {
  //     rLogo3D.add(obj.scene)
  //     obj.scene.scale.set(logoScale, logoScale, logoScale)

  //     obj.scene.children[0].material = new THREE.MeshStandardMaterial({
  //       color: new THREE.Color(0xffffff),
  //       emissive: new THREE.Color(0xeb5f28),
  //       emissiveIntensity: 0.1,
  //       envMap: envMapTexture,
  //       roughness: 0.1,
  //       metalness: 0.1,
  //     })
  //   })

  /**
   * 3D Objects
   */
  // ----------------------------------------------------------------

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
  camera.position.set(0, 0, (10 * (1920 / 1080)) / (sizes.width / sizes.height))
  scene.add(camera)
  camera.add(ambientLight)
  camera.add(directionalLight)
  directionalLight.position.set(10, 10, 10)

  // Controls
  // const controls = new THREE.OrbitControls(camera, canvas)

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

  let prevX = 0
  let prevY = 0
  let deltaXY = 0

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
  }

  tick()

  /**
   * ScrollTriggers
   */
  // ----------------------------------------------------------------
  const scrollTriggerJS = () => {
    // // Camera
    // gsap.fromTo(
    //   camera.position,
    //   { y: 0 },
    //   {
    //     scrollTrigger: {
    //       trigger: ".heroSection",
    //       start: () =>
    //         document.querySelector(".heroSection").clientHeight * 0 + " top",
    //       end: () => sizes.height * 5 + " top",
    //       // toggleActions: "play none none reverse",
    //       // snap: 1,
    //       scrub: true,
    //       // pin: true,
    //       // markers: true
    //     },
    //     y: cameraMaxY,
    //   }
    // )
  }

  scrollTriggerJS()
}

/**
 * Load
 */
window.addEventListener("load", () => {
  gsap.to(".loadingPage", { duration: 1, delay: 1, opacity: 0 })
  main()
})
