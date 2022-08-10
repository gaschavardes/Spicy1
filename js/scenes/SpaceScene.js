import { Color, Fog, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, TorusKnotBufferGeometry } from 'three'
import { BasicMaterial } from '../materials'
import store from '../store'
import { E } from '../utils'
import GlobalEvents from '../utils/GlobalEvents'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'

export default class SpaceScene extends Scene {
	constructor() {
		super()

		this.load()
		const renderPass = new RenderPass(this, store.camera)
		renderPass.clear = false
		renderPass.clearDepth = true
		renderPass.enabled = true
		store.WebGL.composerPasses.add(renderPass, 3)

		const copyPass = new ShaderPass(CopyShader)
		store.WebGL.composerPasses.add(copyPass, 4)

		E.on('App:start', () => {
			this.build()
			this.addEvents()
		})

	
	}

	build() {
		this.torus = new Mesh(
			new TorusKnotBufferGeometry(1, 0.4, 132, 16),
			new MeshNormalMaterial()
		)

		this.add(this.torus)
	}

	addEvents() {
		E.on(GlobalEvents.RESIZE, this.onResize)
		store.RAFCollection.add(this.onRaf, 3)
	}

	onRaf = (time) => {
		this.torus.rotation.set(0, time * 2 , 0)
		// this.controls.update()
		// this.composer.render()
		// store.WebGL.starRenderer.render(this, store.camera)
	}

	onResize = () => {
		this.camera.aspect = store.window.w / store.window.h
		this.camera.updateProjectionMatrix()
	}

	load() {
		this.assets = {
			textures: {},
			models: {}
		}
	}
}