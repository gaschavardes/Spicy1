import { Color, Fog, Mesh, PerspectiveCamera, Scene, TorusKnotBufferGeometry, BufferGeometry, BufferAttribute, PointsMaterial, Points, SrcAlphaFactor, OneMinusSrcAlphaFactor, AddEquation } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { BasicMaterial, StarsMaterial } from '../materials'

import store from '../store'
import { E } from '../utils'
import GlobalEvents from '../utils/GlobalEvents'
import gsap from 'gsap'
import { Gui } from '../utils/Gui'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'

export default class MainScene extends Scene {
	constructor() {
		super()

		this.load()
		this.count = 10000
		this.size = 0.05
		this.radius = 5
		this.spin = 1
		this.branches = 20
		this.randomVal = 10
		this.hole = 0
		this.randomArray = []
		this.dampedProgress = 0
		this.dampedProgressCamera = 0
		this.color1 = '#ff1400'
		this.color2 = '#0044ff'

		E.on('App:start', () => {	
			this.build()
			this.addEvents()
			store.Gui = new Gui()

			this.renderPass = new RenderPass(this, store.camera)
			// this.renderPass.clear = false
			// this.renderPass.clearDepth = false
			this.renderPass.enabled = true
			store.WebGL.composerPasses.add(this.renderPass, 1)

			const afterimagePass = new AfterimagePass()
			afterimagePass.uniforms['damp'].value = 0.9
			// afterimagePass.renderToScreen = false
			store.WebGL.composerPasses.add(afterimagePass, 2)

		})
	}

	build() {
		this.buildGalaxy()
		this.setTimeline()
	}

	setTimeline() {
			this.tl = gsap.timeline()
			this.tl.to(this, {hole: 1., randomVal: 1}, 0)
	}
	buildGalaxy() {
		const geometry = new BufferGeometry()
		const positions = new Float32Array(this.count * 3)
		this.colors = new Float32Array(this.count * 3)
		for (let i = 0; i < this.count; i++) {
			const i3 = i * 3

			this.randomArray.push(
				{
					random1: Math.random(),
					randomX: Math.random(),
					randomY: Math.random() 
				}
			)
			const radius = Math.random() * this.radius
			const randomise = (Math.random() - 0.5) * this.randomVal
			const spin = radius * this.spin
			const branchAngle = (i % this.branches) / this.branches * Math.PI * 2


			positions[i3] = Math.cos(branchAngle + spin) * (radius + this.hole) + (randomise * radius)
			positions[i3 + 1] = Math.sin(branchAngle + spin) * (radius + this.hole) + (randomise * radius)
			positions[i3 + 2] = (Math.log(radius + this.hole) - this.radius) * 1 + 3
		}

		geometry.setAttribute('position', new BufferAttribute(positions, 3))
		geometry.setAttribute('color', new BufferAttribute(this.colors, 3))


		this.points = new Points(geometry, new StarsMaterial())
		this.add(this.points)
	}

	addEvents() {
		E.on(GlobalEvents.RESIZE, this.onResize)
		store.RAFCollection.add(this.onRaf, 3)
	}

	clamp(num, min, max) {
		 return Math.min(Math.max(num, min), max)
	}

	onRaf = (time) => {
		const positions = this.points.geometry.attributes.position.array;
		// store.progress += 0.001
		this.dampedProgress += (store.progress - this.dampedProgress) * 0.1
		this.dampedProgressCamera += (store.progress - this.dampedProgress) * 0.001
		this.radius =  60 + this.dampedProgress * 1
		store.progress += 0.02
		this.tl.progress(store.progress / 5)
		
		for (let i = 0; i < this.count; i++) {

			const i3 = i * 3
			const radius = ((this.randomArray[i].random1 + 0.1) * this.radius) % 5
			let randomiseX = (this.randomArray[i].randomX - 0.5) * this.randomVal
			let randomiseY = (this.randomArray[i].randomY - 0.5) * this.randomVal
			randomiseX = (this.randomArray[i].randomX ) * (i % 2 - 0.5) * this.randomVal
			randomiseY = (this.randomArray[i].randomY ) * (i % 2 - 0.5) * this.randomVal
			const spin = radius * this.spin
			const branchAngle = (i % this.branches) / this.branches * Math.PI * 2
			const branchOdd = i % 2 - 0.5
			const mixedColor = new Color(store.Gui.options.stars.color1).clone()
			mixedColor.lerp(new Color(store.Gui.options.stars.color2), radius * 5 / 5)

			positions[i3] = Math.cos(branchAngle + spin) * (radius + this.hole) + (randomiseX * (radius + 0.3))
			positions[i3 + 1] = Math.sin(branchAngle + spin) * (radius + this.hole) + (randomiseY * (radius + 0.3))
			positions[i3 + 2] = ((Math.log(radius + this.hole) ) * 10) * this.clamp(this.dampedProgress, 0, 1)

			this.colors[i3] = mixedColor.r + (branchOdd * 1) * 0.5
			this.colors[i3 + 1] = mixedColor.g + (branchOdd * 1) * 0.5
			this.colors[i3 + 2] = mixedColor.b + (branchOdd * 1) * 0.5
		}

		this.points.geometry.attributes.position.needsUpdate = true
		this.points.geometry.attributes.color.needsUpdate = true
		
		store.camera.rotation.set(0, 0, this.dampedProgressCamera * 1.5)
	}

	onResize = () => {
		store.camera.aspect = store.window.w / store.window.h
		store.camera.updateProjectionMatrix()
	}

	load() {
		this.assets = {
			textures: {},
			models: {}
		}
	}
}