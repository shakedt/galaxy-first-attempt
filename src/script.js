import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({width: 360})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 *  Galaxy
 */

const galaxyParameters = {
    count: 10000,
    size: 0.02,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.1,
    randomnessPower: 3,
    insideColor: "#ff6030",
    outsideColor: '#1b3984',
};


let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () =>
{
    // Destroy old galaxy
    if(points !== null)
    {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(galaxyParameters.count * 3)
    const colors = new Float32Array(galaxyParameters.count * 3)

    const colorInside = new THREE.Color(galaxyParameters.insideColor)
    const colorOutside = new THREE.Color(galaxyParameters.outsideColor)

    for(let i = 0; i < galaxyParameters.count; i++)
    {
        // Position
        const i3 = i * 3

        const radius = Math.random() * galaxyParameters.radius

        const spinAngle = radius * galaxyParameters.spin
        const branchAngle = (i % galaxyParameters.branches) / galaxyParameters.branches * Math.PI * 2
        
        const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * galaxyParameters.randomness * radius
        const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * galaxyParameters.randomness * radius
        const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * galaxyParameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / galaxyParameters.radius)
              
        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    } 
   
    geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )

    geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    )

     material = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    points = new THREE.Points(geometry, material);
    scene.add(points)
}

generateGalaxy()

gui.add(galaxyParameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'radius').min(0.1).max(20).step(0.1).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.addColor(galaxyParameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(galaxyParameters, 'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()