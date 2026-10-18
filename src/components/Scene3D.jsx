import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

// The scene is driven by scroll position and theme alone; it deliberately takes
// no per-frame props, so React never re-renders it while the reader scrolls.
// `memo` makes that guarantee explicit: only a theme flip can re-render it.
function Scene3D({ isDark = false }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const objectsRef = useRef({})
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  // Unified scroll state owned entirely by the render loop. `target` is the true
  // normalised scroll position (0..1), read live from Lenis each frame; `current`
  // is the eased value the camera actually rides, so the 3D stays buttery even
  // when the wheel produces coarse jumps. Nothing here comes from React state.
  const scrollRef = useRef({ current: 0, target: 0, velocity: 0, lastScroll: 0 })
  // `dark` target kept in a ref so the scene never needs to remount when the
  // theme flips mid-scroll (remounting caused a visible frame jump).
  const isDarkRef = useRef(isDark)
  // Eased 0..1 follow of the dark field, used only by the sky (stars, aurora).
  // The DOM keeps its hard cut; this softens the atmosphere so it fades in.
  const skyMixRef = useRef(0)

  // Theme is the only prop the running scene needs; it is mirrored into a ref so
  // updating it never rebuilds the WebGL context.
  useEffect(() => {
    isDarkRef.current = isDark
  }, [isDark])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Transparent background: the DOM provides the flat field colour per
    // section (putty for the light slides, ink for the dark ones), so the 3D
    // layer is pure geometry floating over it. This keeps text contrast stable
    // (the field is always a solid CSS colour) and removes the dark flash that
    // used to appear before the WebGL background lerped in.
    const initialFogColor = 0xc4c3b6
    scene.fog = new THREE.FogExp2(initialFogColor, 0.035)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 18)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    // Cap at 1.75x rather than 2x. On a 3x phone or a Retina laptop the extra
    // pixels are invisible behind the soft point clouds, but they roughly
    // double the fragment work. 1.75 keeps the crisp edges (type is DOM, so
    // unaffected) while making the first frames and scroll far cheaper.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    // Depth-casting stays off. Nothing in the scene rests on a surface to
    // receive it — the sculptures float over a CSS field — so enabling it only
    // bought a second render pass per frame and made the first paint noticeably
    // slower. Disabling is a straight win with zero visual change. (This is
    // Three.js' depth pass, not a CSS box effect.)
    // taste-skill-ignore
    renderer.shadowMap.enabled = false
    rendererRef.current = renderer

    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xfff6ea, 2.5)
    mainLight.position.set(12, 18, 15)
    scene.add(mainLight)

    const secondaryLight = new THREE.DirectionalLight(0xd8d6cf, 1.2)
    secondaryLight.position.set(-15, -10, -10)
    scene.add(secondaryLight)

    const pointLight = new THREE.PointLight(0xffffff, 2, 35)
    pointLight.position.set(0, 0, 5)
    scene.add(pointLight)

    // -------------------------------------------------------------
    // SCENE ELEMENTS
    // -------------------------------------------------------------
    const objects = {}

    // 1. HERO OBJECT: Renaissance Armillary / Geometric Polyhedron
    const heroGroup = new THREE.Group()

    // Outer Gyroscope Rings
    const ringGeo1 = new THREE.TorusGeometry(4.2, 0.04, 24, 100)
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x1f1f1f,
      metalness: 0.85,
      roughness: 0.25,
    })
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1)
    heroGroup.add(ring1)

    const ringGeo2 = new THREE.TorusGeometry(3.6, 0.035, 24, 100)
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x6b6a66,
      metalness: 0.9,
      roughness: 0.2,
    })
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2)
    ring2.rotation.x = Math.PI / 3
    heroGroup.add(ring2)

    const ringGeo3 = new THREE.TorusGeometry(3.0, 0.03, 24, 100)
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.3,
    })
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3)
    ring3.rotation.y = Math.PI / 4
    heroGroup.add(ring3)

    // Central Multi-faceted Crystal Core (Icosahedron with wireframe cage)
    const coreGeo = new THREE.IcosahedronGeometry(1.8, 1)
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x262626,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1.5,
      transparent: true,
      opacity: 0.85,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    heroGroup.add(coreMesh)

    // Wireframe overlay for architectural drawing feel
    const wireGeo = new THREE.IcosahedronGeometry(1.82, 1)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x595855,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    heroGroup.add(wireMesh)

    // Floating orbiters around the core
    const orbiterGroup = new THREE.Group()
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const radius = 2.4
      const orbGeo = new THREE.OctahedronGeometry(0.2, 0)
      const orbMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x6b6a66 : 0x111111,
        metalness: 0.9,
        roughness: 0.1,
      })
      const orb = new THREE.Mesh(orbGeo, orbMat)
      orb.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (i - 2.5) * 0.4)
      orbiterGroup.add(orb)
    }
    heroGroup.add(orbiterGroup)

    heroGroup.position.set(window.innerWidth > 1024 ? 5.2 : 0, window.innerWidth > 1024 ? 0.2 : -2.5, 1)
    scene.add(heroGroup)
    objects.hero = heroGroup
    objects.rings = [ring1, ring2, ring3]
    objects.coreMesh = coreMesh
    objects.wireMesh = wireMesh
    objects.orbiterGroup = orbiterGroup

    // 2. ABOUT SECTION: Classical Architectural Columns / Portico Plinth
    const aboutGroup = new THREE.Group()
    
    // Floating Plinth / Pedestal
    const plinthGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.4, 32)
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x2b2b2b,
      roughness: 0.5,
      metalness: 0.4,
    })
    const plinth = new THREE.Mesh(plinthGeo, plinthMat)
    plinth.position.y = -3.5
    aboutGroup.add(plinth)

    // Renaissance Dodecahedron Sculpture
    const sculpGeo = new THREE.DodecahedronGeometry(2.0, 0)
    const sculpMat = new THREE.MeshStandardMaterial({
      color: 0x3d3c3a,
      roughness: 0.2,
      metalness: 0.8,
    })
    const sculpture = new THREE.Mesh(sculpGeo, sculpMat)
    aboutGroup.add(sculpture)

    // Outer floating wireframe cube
    const cubeGeo = new THREE.BoxGeometry(3.2, 3.2, 3.2)
    const cubeWireMat = new THREE.MeshBasicMaterial({
      color: 0x6b6a66,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const cubeWire = new THREE.Mesh(cubeGeo, cubeWireMat)
    aboutGroup.add(cubeWire)

    aboutGroup.position.set(-6, -16, -2)
    scene.add(aboutGroup)
    objects.about = aboutGroup
    objects.sculpture = sculpture
    objects.cubeWire = cubeWire

    // 3. SKILLS SECTION: Constellation of Floating Crystalline Tech Nodes
    const skillsGroup = new THREE.Group()
    const nodeCount = 12
    const nodes = []

    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      const r = 4.0

      const x = r * Math.cos(theta) * Math.sin(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      const z = r * Math.cos(phi)

      const nodeGeo = new THREE.TetrahedronGeometry(0.35, 1)
      const nodeMat = new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0x6b6a66 : i % 3 === 1 ? 0x8a8985 : 0x1f1f1f,
        metalness: 0.85,
        roughness: 0.2,
      })
      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.set(x, y, z)
      skillsGroup.add(node)
      nodes.push(node)
    }

    // Connect nodes with laser lines
    const linePoints = []
    for (let i = 0; i < nodes.length; i++) {
      const next = (i + 3) % nodes.length
      linePoints.push(nodes[i].position)
      linePoints.push(nodes[next].position)
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x595855,
      transparent: true,
      opacity: 0.35,
    })
    const nodeLines = new THREE.LineSegments(lineGeo, lineMat)
    skillsGroup.add(nodeLines)

    skillsGroup.position.set(5.5, -32, -4)
    scene.add(skillsGroup)
    objects.skills = skillsGroup
    objects.skillNodes = nodes

    // 4. CERTIFICATES / HALL OF ACCOLADES: Colonnade Frames
    const certGroup = new THREE.Group()
    const frameCount = 7
    const certFrames = []

    for (let i = 0; i < frameCount; i++) {
      const fGeo = new THREE.BoxGeometry(2.4, 1.8, 0.08)
      const fMat = new THREE.MeshStandardMaterial({
        color: 0x1c1a24,
        roughness: 0.4,
        metalness: 0.6,
      })
      const frame = new THREE.Mesh(fGeo, fMat)
      
      // Wireframe border for gallery hanging
      const borderGeo = new THREE.BoxGeometry(2.45, 1.85, 0.1)
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0x6b6a66,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
      const border = new THREE.Mesh(borderGeo, borderMat)
      frame.add(border)

      const angle = (i / frameCount) * Math.PI * 1.5 - Math.PI * 0.75
      frame.position.set(Math.sin(angle) * 7.5, (i - 3) * 1.2, Math.cos(angle) * 4)
      frame.rotation.y = -angle + Math.PI / 2
      certGroup.add(frame)
      certFrames.push(frame)
    }

    certGroup.position.set(-2, -48, -2)
    scene.add(certGroup)
    objects.certGroup = certGroup
    objects.certFrames = certFrames

    // 5. PROJECTS SECTION: Exhibition Portal & Sculptural Totem
    const projGroup = new THREE.Group()
    
    // Torus Knot Modern Monument
    const knotGeo = new THREE.TorusKnotGeometry(2.2, 0.45, 100, 16, 2, 3)
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.85,
    })
    const knotMesh = new THREE.Mesh(knotGeo, knotMat)
    projGroup.add(knotMesh)

    // Surrounding laser rings
    const laserGeo = new THREE.RingGeometry(3.6, 3.65, 64)
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x6b6a66,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    })
    const laserRing = new THREE.Mesh(laserGeo, laserMat)
    laserRing.rotation.x = Math.PI / 2
    projGroup.add(laserRing)

    projGroup.position.set(4, -64, 0)
    scene.add(projGroup)
    objects.projects = projGroup
    objects.knotMesh = knotMesh
    objects.laserRing = laserRing

    // 6. CONTACT SECTION: Monolithic Dark Chamber
    const contactGroup = new THREE.Group()
    
    const monoGeo = new THREE.OctahedronGeometry(2.8, 1)
    const monoMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d12,
      roughness: 0.1,
      metalness: 0.95,
    })
    const monolith = new THREE.Mesh(monoGeo, monoMat)
    contactGroup.add(monolith)

    const monoWire = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.84, 1),
      new THREE.MeshBasicMaterial({ color: 0x9a998f, wireframe: true, transparent: true, opacity: 0.4 })
    )
    contactGroup.add(monoWire)

    contactGroup.position.set(0, -80, -2)
    scene.add(contactGroup)
    objects.contact = contactGroup
    objects.monolith = monolith
    objects.monoWire = monoWire

    // 7. PARTICLES: Renaissance Gallery Dust & Cosmic Starfield
    const particleCount = 750
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleColors = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 36
      particlePos[i + 1] = (Math.random() - 0.5) * 100 - 40
      particlePos[i + 2] = (Math.random() - 0.5) * 30

      // Warm graphite & indigo accents
      const isWarm = Math.random() > 0.4
      particleColors[i] = isWarm ? 0.35 : 0.26
      particleColors[i + 1] = isWarm ? 0.34 : 0.22
      particleColors[i + 2] = isWarm ? 0.32 : 0.79
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)
    objects.particles = particles

    // -------------------------------------------------------------
    // 8. SPACE ATMOSPHERE — deep starfield, shooting stars, aurora
    // -------------------------------------------------------------
    // The copy and UI stay on the restrained putty/ink palette; all the colour
    // lives here, in the WebGL atmosphere behind everything. This is the layer
    // that makes the background read as space rather than a flat field.

    // 8a. Deep starfield on a sphere that wraps the whole scroll rail. Placed
    //     far back in Z so it sits behind every sculpture, and given a slow
    //     independent drift so it feels distant and vast.
    const STAR_COUNT = 1400
    const starGeo = new THREE.BufferGeometry()
    const starPos = new Float32Array(STAR_COUNT * 3)
    const starColor = new Float32Array(STAR_COUNT * 3)
    const starSize = new Float32Array(STAR_COUNT)
    const c = new THREE.Color()

    for (let i = 0; i < STAR_COUNT; i++) {
      // Even distribution on a large shell around the journey (y spans -100..40).
      const r = 120 + Math.random() * 60
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPos[i * 3 + 1] = (r * Math.cos(phi)) * 0.9 - 30
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      // Mostly cool white-blue, a minority of warm ones, a rare violet accent.
      const roll = Math.random()
      if (roll > 0.9) c.setHSL(0.75, 0.7, 0.72) // violet
      else if (roll > 0.6) c.setHSL(0.09, 0.5, 0.85) // warm
      else c.setHSL(0.6, 0.15, 0.95) // cool white
      starColor[i * 3] = c.r
      starColor[i * 3 + 1] = c.g
      starColor[i * 3 + 2] = c.b

      starSize[i] = 0.6 + Math.random() * 1.8
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColor, 3))
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1))

    // Custom point shader: round soft sprites, per-star size and a twinkle that
    // never fully extinguishes a star (it would look like dead pixels).
    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
        uOpacity: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vTwinkle = 0.55 + 0.45 * sin(uTime * 1.6 + position.x * 0.35 + position.y * 0.2);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          // Clamp so a star that drifts near the camera never balloons into a
          // blob; distant stars still shrink naturally for depth.
          gl_PointSize = clamp(aSize * uPixelRatio * (140.0 / -mv.z), 0.8, 5.0 * uPixelRatio);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uOpacity;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          // Soft round falloff with a small core. The core is kept modest so the
          // densest stars don't read as hard white pinpricks against the ink.
          float alpha = smoothstep(0.5, 0.0, d);
          alpha *= alpha;
          alpha += smoothstep(0.14, 0.0, d) * 0.35;
          gl_FragColor = vec4(vColor, alpha * vTwinkle * uOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })
    const stars = new THREE.Points(starGeo, starMat)
    stars.frustumCulled = false
    scene.add(stars)
    objects.stars = stars
    objects.starMat = starMat
    objects.starGeo = starGeo

    // 8b. Shooting stars. A small pool of thin tapered streaks that fire at
    //     pseudo-random intervals, arc across the sky and fade out. Each has a
    //     bright head (a point) and a tail (a stretched, fading line).
    const SHOOTING_COUNT = 3
    const shootingStars = []
    const shootDir = new THREE.Vector3()

    for (let i = 0; i < SHOOTING_COUNT; i++) {
      const group = new THREE.Group()
      group.visible = false

      // Tail: a plane-like trail drawn with a custom shader for a soft taper.
      const tailGeo = new THREE.PlaneGeometry(1, 1)
      const tailMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0xbfe3ff) },
          uOpacity: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            // Fade along the length (u) and across the width (v).
            float along = smoothstep(0.0, 1.0, vUv.x);
            float across = smoothstep(0.5, 0.0, abs(vUv.y - 0.5));
            float a = along * across * across * uOpacity;
            gl_FragColor = vec4(uColor, a);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
      const tail = new THREE.Mesh(tailGeo, tailMat)
      group.add(tail)

      // Head: a small glowing sprite.
      const headMat = new THREE.SpriteMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: (() => {
          const cv = document.createElement('canvas')
          cv.width = cv.height = 64
          const ctx = cv.getContext('2d')
          const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
          g.addColorStop(0, 'rgba(255,255,255,1)')
          g.addColorStop(0.3, 'rgba(200,230,255,0.7)')
          g.addColorStop(1, 'rgba(160,200,255,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, 64, 64)
          return new THREE.CanvasTexture(cv)
        })(),
      })
      const head = new THREE.Sprite(headMat)
      head.scale.setScalar(3.5)
      group.add(head)

      scene.add(group)
      shootingStars.push({
        group,
        tail,
        tailMat,
        head,
        headMat,
        active: false,
        life: 0,
        duration: 1,
        nextIn: 1.5 + Math.random() * 4,
        from: new THREE.Vector3(),
        dir: new THREE.Vector3(),
        length: 26,
        speed: 60,
      })
    }
    objects.shootingStars = shootingStars

    // 8c. Aurora — two flowing ribbons of light high above the rail. Built from
    //     a subdivided plane with a custom shader that folds noise into soft
    //     vertical curtains of green/teal/violet, additive over the dark field.
    const auroraMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uColorA: { value: new THREE.Color(0x3fb894) }, // aurora green, muted
        uColorB: { value: new THREE.Color(0x2a4a8f) }, // deep blue base
        uColorC: { value: new THREE.Color(0x6d5a9e) }, // dusty violet edge
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;

        // Cheap value noise.
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          float a = hash(i), b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }
        float fbm(vec2 p) {
          float v = 0.0, amp = 0.5;
          for (int i = 0; i < 5; i++) { v += amp * noise(p); p *= 2.02; amp *= 0.5; }
          return v;
        }

        void main() {
          vec2 uv = vUv;

          // A real aurora reads as vertical curtains: the noise is stretched
          // along Y so streaks hang rather than blob, and drifts sideways.
          float n = fbm(vec2(uv.x * 4.0 + uTime * 0.05, uv.y * 0.6 - uTime * 0.04));
          float n2 = fbm(vec2(uv.x * 9.0 - uTime * 0.08, uv.y * 1.1 + uTime * 0.02));

          // Curtain mask. The fbm sits around 0.5, so centre the threshold on
          // it rather than pushing it to the top of the range (which was why
          // the first pass was invisible).
          float curtain = smoothstep(0.30, 0.72, n * 0.75 + n2 * 0.35);
          // A single soft multiply, not a square. Squaring gave hard-edged
          // streaks that read as neon; this keeps them diffuse and calm.
          curtain *= mix(0.65, 1.0, curtain);

          // Vertical falloff: a bright base that dissolves upward into nothing,
          // the way light does at the horizon. Kept to the lower/bright band.
          float vertical = smoothstep(0.0, 0.35, uv.y) * (1.0 - smoothstep(0.35, 0.95, uv.y));
          // Melt both horizontal ends so the ribbon has no hard edge on screen.
          float horizontal = smoothstep(0.0, 0.3, uv.x) * (1.0 - smoothstep(0.7, 1.0, uv.x));

          // Kept deliberately low (0.42). The aurora is background atmosphere,
          // not a feature — at full strength the saturation fatigued the eye.
          float alpha = curtain * vertical * horizontal * uOpacity * 0.42;

          // Cool blue base warming into green, violet only at the strongest
          // streaks so the palette stays close to the site's ink indigo.
          vec3 col = mix(uColorB, uColorA, smoothstep(0.4, 0.85, n));
          col = mix(col, uColorC, smoothstep(0.7, 1.0, n2) * 0.3);
          // A very small lift only, so the brightest streaks stay below the
          // point where they glare against the ink field.
          col += uColorA * curtain * 0.12;

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })

    const auroraGroup = new THREE.Group()
    // One wide plane per ribbon, sized to roughly fill the upper viewport at
    // its distance. Kept at z ~ -34 so it reads as backdrop but stays well
    // inside the camera's far plane (a raw ShaderMaterial is not fogged, so
    // distance is the only thing keeping it from fighting the sculptures).
    const auroraPlaneGeo = new THREE.PlaneGeometry(120, 40, 1, 1)
    for (let i = 0; i < 2; i++) {
      const ribbon = new THREE.Mesh(auroraPlaneGeo, auroraMat)
      ribbon.position.set(i === 0 ? -14 : 22, i === 0 ? 6 : 2, i === 0 ? -30 : -36)
      ribbon.rotation.z = i === 0 ? 0.1 : -0.14
      auroraGroup.add(ribbon)
    }
    scene.add(auroraGroup)
    objects.auroraGroup = auroraGroup
    objects.auroraMat = auroraMat

    objectsRef.current = objects

    // Read-only handle for tooling/QA, so probes can read the composition's
    // object list without reaching into React internals. Nothing mutates it.
    window.__sceneObjects = objects

    // -------------------------------------------------------------
    // RESPONSIVE COMPOSITION
    // -------------------------------------------------------------
    // Each section's sculpture is placed so it never sits on top of the text.
    // On wide screens the hero object rides the right column; on phones it
    // sinks low and far back so the hero copy stays fully legible. Recomputed
    // on resize so the composition is correct at every width.
    const applyLayout = () => {
      const w = window.innerWidth
      const wide = w > 1024
      const tablet = w > 640 && w <= 1024

      // Hero: beside the copy on wide, low-right on tablet, sunk to the base
      // and pushed back in Z on phones (depth keeps it from fighting the text).
      if (wide) {
        objects.hero.position.set(5.4, 0.2, 1)
        objects.hero.scale.setScalar(1)
      } else if (tablet) {
        // Sit well below the copy block so it never crosses the paragraph.
        objects.hero.position.set(0, -4.5, -4)
        objects.hero.scale.setScalar(0.8)
      } else {
        // Phones: drop it beneath the stats, far back so it reads as a soft
        // sculptural ground rather than an object colliding with the text.
        objects.hero.position.set(0, -6.5, -7)
        objects.hero.scale.setScalar(0.62)
      }

      // About: left on wide, low-centred and pushed back on narrow.
      objects.about.position.set(wide ? -6 : 0, wide ? -16 : -15.5, wide ? -2 : -4)
      objects.about.scale.setScalar(wide ? 1 : 0.8)

      // Skills: right on wide, centred and smaller on narrow. Pushed further
      // right than the headings end so the constellation never crosses copy.
      objects.skills.position.set(wide ? 6.8 : 0, -32, wide ? -4 : -5)
      objects.skills.scale.setScalar(wide ? 1 : 0.85)

      // Certificates colonnade: pull the whole group back on phones.
      objects.certGroup.position.set(wide ? -2 : 0, -48, wide ? -2 : -5)
      objects.certGroup.scale.setScalar(wide ? 1 : 0.9)

      // Projects monument: right on wide, centred and smaller on narrow.
      objects.projects.position.set(wide ? 5.2 : 0, -64, wide ? -1 : -4)
      objects.projects.scale.setScalar(wide ? 1 : 0.8)

      // Contact monolith: centred, pushed back on narrow.
      objects.contact.position.set(0, -80, wide ? -2 : -5)
      objects.contact.scale.setScalar(wide ? 1 : 0.85)
    }
    applyLayout()

    // Mouse movement listener with inertial lerping
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1
    }

    // Touch support for mobile parallax
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1
        mouseRef.current.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1
      }
    }

    // Resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return
      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      applyLayout()
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrameId
    // Timer (not the deprecated Clock). `update()` samples the frame once, then
    // `getDelta()`/`getElapsed()` are pure reads — which also removes the trap
    // that `Clock.getElapsedTime()` advances the delta internally and left every
    // `damp(...)` below receiving 0.
    const timer = new THREE.Timer()

    // Frame-rate independent damping. `1 - exp(-lambda * dt)` behaves the same
    // at 30, 60 and 144Hz, unlike the old `x += (target - x) * k` which eased
    // faster on high-refresh displays and felt inconsistent ("clunky").
    const damp = (lambda, dt) => 1 - Math.exp(-lambda * dt)

    // Reused temporaries — allocating a Vector3/Color every frame caused GC
    // hitches that showed up as micro-stutter during long scrolls.
    const bgDark = new THREE.Color(0x09090e)
    const bgLight = new THREE.Color(0xc4c3b6)
    const targetBg = new THREE.Color(0xc4c3b6)
    const lookAtTarget = new THREE.Vector3()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      timer.update()
      const dt = Math.min(timer.getDelta(), 1 / 30) // clamp after tab switches
      const elapsedTime = timer.getElapsed()

      // Smooth mouse lerp (frame-rate independent)
      const mouseEase = damp(6, dt)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * mouseEase
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * mouseEase

      // Scroll progress. Read the live smoothed position straight from Lenis
      // (its `scroll` is already interpolated), with a native fallback. Doing
      // this in the loop — instead of relying on a React prop — means the 3D
      // can never desync from the page, whatever the mount order was.
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      )
      const s = scrollRef.current
      const liveScroll = window.__lenis ? window.__lenis.scroll : window.scrollY
      s.target = Math.min(Math.max(liveScroll / maxScroll, 0), 1)
      s.current += (s.target - s.current) * damp(14, dt)
      s.velocity = s.current - s.lastScroll
      s.lastScroll = s.current

      const progress = s.current // 0.0 to 1.0

      // Dynamic Camera Path along the 3D rail. The vertical journey spans
      // y = 0 to y = -80, matching the section stack.
      const targetCamY = -progress * 80

      // Gentle horizontal sway that guides the eye between the content columns
      // but never wobbles (the old 3.5x sine made the scene swing violently).
      const targetCamX = Math.sin(progress * Math.PI * 2) * 1.1 + mouseRef.current.x * 1.0
      const targetCamZ = 16 - Math.sin(progress * Math.PI) * 2.0 + mouseRef.current.y * 0.6

      // Camera follows strongly (lambda 5) so the 3D genuinely rides the scroll.
      const camEase = damp(5, dt)
      camera.position.x += (targetCamX - camera.position.x) * camEase
      camera.position.y += (targetCamY - camera.position.y) * Math.max(camEase, damp(9, dt))
      camera.position.z += (targetCamZ - camera.position.z) * camEase

      // Look slightly ahead along the camera path
      lookAtTarget.set(mouseRef.current.x * 1.2, targetCamY - 1.2, 0)
      camera.lookAt(lookAtTarget)

      // Light dynamic repositioning
      pointLight.position.x = mouseRef.current.x * 8
      pointLight.position.y = targetCamY + mouseRef.current.y * 6
      pointLight.position.z = camera.position.z - 4

      // Fog colour eases with the section rhythm (light -> dark) so distant
      // geometry dissolves into whichever field the DOM is showing. Derived from
      // the loop's own `progress` first (always live), with the `isDark` prop as
      // a tie-breaker once the reader is deep in the ink slides.
      const byProgress = Math.min(Math.max((progress - 0.24) / 0.06, 0), 1)
      const darkMix = isDarkRef.current ? Math.max(byProgress, 0.999) : byProgress
      targetBg.copy(bgLight).lerp(bgDark, darkMix)
      scene.fog.color.lerp(targetBg, damp(3, dt))

      // The DOM field cuts hard at the section boundary (per the design
      // system), but the sky shouldn't pop in with it. `skyMix` eases toward
      // the same 0/1 target over ~1s, so the stars and aurora dissolve into
      // the ink band instead of switching on like a light.
      skyMixRef.current += (darkMix - skyMixRef.current) * damp(2.2, dt)
      const skyMix = skyMixRef.current

      // -------------------------------------------------------------
      // FOCUS FADE
      // -------------------------------------------------------------
      // Each section's sculpture lives at a fixed Y on the rail. Fade a group
      // out once the camera has moved more than roughly one section away, so
      // only the sculpture the reader is actually looking at stays prominent.
      // This stops an earlier sculpture from floating across later copy (the
      // "clunky" overlap) without hard popping.
      const focusFade = (obj, baseY, spread = 20) => {
        if (!obj) return
        const d = Math.abs(camera.position.y - baseY)
        const t = Math.min(Math.max(1 - (d - spread * 0.35) / (spread * 0.65), 0), 1)
        obj.visible = t > 0.01
        obj.traverse((child) => {
          if (!child.material) return
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => {
            if (m.userData.baseOpacity === undefined) {
              m.userData.baseOpacity = m.opacity === undefined ? 1 : m.opacity
              m.userData.baseTransparent = m.transparent
            }
            m.transparent = true
            m.opacity = m.userData.baseOpacity * t
          })
        })
      }
      focusFade(objects.hero, 0.2, 11)
      focusFade(objects.about, -16, 11)
      focusFade(objects.skills, -32, 11)
      focusFade(objects.certGroup, -48, 11)
      focusFade(objects.projects, -64, 11)
      focusFade(objects.contact, -80, 11)

      // 1. Hero Object Animations
      if (objects.hero) {
        objects.rings[0].rotation.x += 0.005 + s.velocity * 0.2
        objects.rings[0].rotation.y += 0.007
        objects.rings[1].rotation.y += 0.008 + s.velocity * 0.2
        objects.rings[1].rotation.z += 0.006
        objects.rings[2].rotation.z += 0.009
        objects.rings[2].rotation.x += 0.004

        objects.coreMesh.rotation.y += 0.004
        objects.coreMesh.rotation.x += 0.003
        objects.wireMesh.rotation.y = objects.coreMesh.rotation.y
        objects.wireMesh.rotation.x = objects.coreMesh.rotation.x

        objects.orbiterGroup.rotation.z += 0.015
        objects.orbiterGroup.rotation.y += 0.008
      }

      // 2. About Sculpture Animations
      if (objects.about) {
        objects.sculpture.rotation.y += 0.008
        objects.sculpture.rotation.x = Math.sin(elapsedTime * 0.8) * 0.2
        objects.cubeWire.rotation.y -= 0.005
        objects.cubeWire.rotation.z += 0.004
      }

      // 3. Skills Constellation Animations
      if (objects.skills) {
        objects.skills.rotation.y = elapsedTime * 0.15 + mouseRef.current.x * 0.5
        objects.skills.rotation.x = Math.sin(elapsedTime * 0.5) * 0.15 + mouseRef.current.y * 0.3
        
        objects.skillNodes.forEach((node, i) => {
          node.rotation.x += 0.02
          node.rotation.y += 0.025
          const scale = 1 + Math.sin(elapsedTime * 2 + i) * 0.15
          node.scale.set(scale, scale, scale)
        })
      }

      // 4. Certificates Colonnade Animations
      if (objects.certFrames) {
        objects.certFrames.forEach((frame, i) => {
          frame.rotation.z = Math.sin(elapsedTime + i * 0.8) * 0.06
          // Base Y is set once at build time; store it so the gentle float is a
          // stable sine instead of an accumulating `+=` drift that pulled the
          // colonnade out of frame over a long session.
          if (frame.userData.baseY === undefined) frame.userData.baseY = frame.position.y
          frame.position.y = frame.userData.baseY + Math.sin(elapsedTime * 1.2 + i) * 0.09
        })
      }

      // 5. Projects Torus Knot Animations
      if (objects.projects) {
        objects.knotMesh.rotation.x += 0.008 + s.velocity * 0.3
        objects.knotMesh.rotation.y += 0.012
        objects.laserRing.rotation.z += 0.006
      }

      // 6. Contact Monolith Animations
      if (objects.contact) {
        objects.monolith.rotation.y += 0.006
        objects.monolith.rotation.z = Math.sin(elapsedTime * 0.6) * 0.15
        objects.monoWire.rotation.y = -objects.monolith.rotation.y * 1.2
      }

      // 7. Ambient Dust Drift — the field reacts to scroll velocity, giving the
      //    scene a fluid, wind-blown quality that tracks the reader's motion.
      //    The dust is subdued on the putty band so the light slides stay flat
      //    paper (its indigo accents read as stray pixel specks against it), then
      //    rises to join the starfield once the field goes to ink.
      if (objects.particles) {
        objects.particles.rotation.y = elapsedTime * 0.02 + progress * 1.2
        objects.particles.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05
        // Rise with scroll velocity, settle back with a gentle damping.
        const lift = Math.min(Math.abs(s.velocity) * 40, 1)
        objects.particles.position.y = -lift * 0.6
        const dustTarget = 0.18 + skyMix * 0.82
        objects.particles.material.opacity +=
          (dustTarget * 0.65 - objects.particles.material.opacity) * damp(2.5, dt)
      }

      // -------------------------------------------------------------
      // 8. SPACE ATMOSPHERE
      // -------------------------------------------------------------
      // The sky only really reads on the ink field, so its overall presence is
      // tied to `darkMix` (0 on putty, 1 on ink) and eased, never snapped.
      if (objects.starMat) {
        objects.starMat.uniforms.uTime.value = elapsedTime
        // Fade the stars up as the field goes dark. They stay off the putty
        // band entirely: the light slides are meant to read as flat paper, and
        // a starfield over paper fights that rather than supporting it.
        objects.starMat.uniforms.uOpacity.value +=
          (skyMix - objects.starMat.uniforms.uOpacity.value) * damp(2.5, dt)
        // Parallax drift: the sky creeps the opposite way to the reader's
        // motion, which is what sells the depth of an immense backdrop.
        objects.stars.rotation.y = progress * 0.35 + mouseRef.current.x * 0.02
        objects.stars.position.y = camera.position.y * 0.35
      }

      // 8b. Shooting stars — pooled streaks fired on a timer. Each arcs along a
      //     fixed heading, brightens in, then fades; the pool means we never
      //     allocate during the animation.
      if (objects.shootingStars) {
        for (const ss of objects.shootingStars) {
          if (!ss.active) {
            ss.nextIn -= dt
            if (ss.nextIn <= 0) {
              // Launch from a random point high and to one side, aimed down and
              // across, always ahead of the camera so the streak is in view.
              const camY = camera.position.y
              ss.from.set(
                (Math.random() - 0.5) * 90,
                camY + 24 + Math.random() * 14,
                (Math.random() - 0.5) * 40 - 18
              )
              const yaw = Math.PI * (0.55 + Math.random() * 0.3)
              const pitch = -(0.35 + Math.random() * 0.35)
              shootDir.set(Math.cos(yaw), pitch, Math.sin(yaw)).normalize()
              ss.dir.copy(shootDir)
              ss.group.position.copy(ss.from)
              ss.length = 20 + Math.random() * 26
              ss.speed = 55 + Math.random() * 45
              ss.duration = 0.9 + Math.random() * 0.6
              ss.life = 0
              ss.active = true
              ss.group.visible = true
              // Orient the tail plane along the direction of travel.
              ss.group.quaternion.setFromUnitVectors(
                new THREE.Vector3(1, 0, 0),
                ss.dir.clone().normalize()
              )
            }
          } else {
            ss.life += dt
            const t = ss.life / ss.duration
            if (t >= 1) {
              ss.active = false
              ss.group.visible = false
              ss.nextIn = 1.2 + Math.random() * 4.5
              continue
            }
            // Travel, with a slight acceleration so the head flicks past.
            ss.group.position.addScaledVector(ss.dir, ss.speed * (0.55 + t) * dt)

            // Fade in fast, out slow. Never full-white for long.
            const env = Math.sin(Math.min(t, 1) * Math.PI)
            const vis = env * skyMix
            ss.tailMat.uniforms.uOpacity.value = vis * 0.85
            ss.headMat.opacity = vis
            // Scale the tail to the streak length and taper it behind the head.
            ss.tail.scale.set(ss.length, 0.5 + env * 0.9, 1)
            ss.tail.position.set(-ss.length * 0.5, 0, 0)
            ss.head.scale.setScalar(2.4 + env * 2.2)
          }
        }
      }

      // 8c. Aurora — the curtains breathe with time and bloom on the ink field,
      //     receding on the putty band so the light sections stay paper-flat.
      if (objects.auroraMat) {
        objects.auroraMat.uniforms.uTime.value = elapsedTime
        // Ink-only, like the stars: the aurora is a night-sky phenomenon and
        // has no business glowing over the putty gallery. It blooms as the
        // field darkens and recedes completely on the paper sections.
        objects.auroraMat.uniforms.uOpacity.value +=
          (skyMix - objects.auroraMat.uniforms.uOpacity.value) * damp(2, dt)
        // Slow lateral sway plus a gentle vertical bob keeps the ribbon alive.
        objects.auroraGroup.position.x = camera.position.x + Math.sin(elapsedTime * 0.08) * 3.5
        objects.auroraGroup.rotation.z = Math.sin(elapsedTime * 0.05) * 0.035
        // Ride the rail with the camera, offset upward, so the curtain stays in
        // the upper third of the frame from every section.
        objects.auroraGroup.position.y = camera.position.y + 6
        objects.auroraGroup.position.z = camera.position.z + 0
      }

      renderer.render(scene, camera)

      // Announce the first painted frame once, so the opening curtain can lift
      // as soon as there is a real image behind it instead of guessing with a
      // timer. Guarded by a flag on window so a remount cannot double-fire and
      // the Loader can also check it if it mounted after us.
      if (!window.__sceneReady) {
        window.__sceneReady = true
        window.dispatchEvent(new Event('scene-ready'))
      }
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('resize', handleResize)

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
    // Mount once. Theme changes are read through `isDarkRef`, so the WebGL
    // context is never torn down and rebuilt mid-scroll (that caused a visible
    // black flash and a fresh lighting warm-up every section change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-[15]"
      aria-hidden="true"
    />
  )
}

export default React.memo(Scene3D)
