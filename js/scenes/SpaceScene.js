import { Color, Fog, Mesh, MeshNormalMaterial, PerspectiveCamera, Scene, MeshBasicMaterial, TorusKnotBufferGeometry, TextureLoader } from 'three'
import { BasicMaterial } from '../materials'
import store from '../store'
import { E } from '../utils'
import GlobalEvents from '../utils/GlobalEvents'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import cacheBustUrl from '../utils/cacheBustUrl'

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
			setTimeout(() => {
				this.build()
			}, 1000)
			this.addEvents()
		})

	
	}

	build() {
		// this.torus = new Mesh(
		// 	new TorusKnotBufferGeometry(1, 0.4, 132, 16),
		// 	new MeshNormalMaterial()
		// )

		// this.add(this.torus)
		this.buildSystem()
	}

	buildSystem () {
		console.log(this.assets.models)

		for (const [key, el] of Object.entries(this.assets.models)) {
			el.material = new MeshBasicMaterial({
				map: this.assets.textures[key]
			})
			// this.applyObjectTransforms(this.homeRoom, 'room-1')
			el.matrixAutoUpdate = false
			el.updateMatrix()
			console.log(el, key)
			this.add(el)
		}
	}

	addEvents() {
		E.on(GlobalEvents.RESIZE, this.onResize)
		store.RAFCollection.add(this.onRaf, 3)
	}

	onRaf = (time) => {
		console.log(store.camera.position)
		// this.torus.rotation.set(0, time * 2 , 0)
		// this.controls.update()
		// this.composer.render()
		// store.WebGL.starRenderer.render(this, store.camera)
	}

	onResize = () => {
		// this.camera.aspect = store.window.w / store.window.h
		// this.camera.updateProjectionMatrix()
	}

	load() {
		this.assets = {
			models: {},
			textures: {}
		}

		store.AssetLoader.loadJson('models/objectdata.unseen').then(data => { 
			this.objectData = data 
			console.log(data)
		}).catch(err => {
			console.log(err)
		})
		const glbs = {
			planet1: '1-planet.glb',
			planet2: '2-planet.glb',
			planet3: '3-planet.glb',
			planet4: '4-planet.glb',
			planet5: '5-planet.glb',
		}
		const textures = {
			planet1: '1',
			planet2: '2',
			planet3: '3',
			planet4: '4',
			planet5: '5',
		}


		for (const key in glbs) {
			store.AssetLoader.loadGltf((`models/${glbs[key]}`)).then(gltf => {
				this.assets.models[key] = gltf.scene.children[0]
				console.log(gltf.scene.children[0])
			})
		}

		for (const key in textures) {
				this.assets.textures[key] = new TextureLoader().load(`textures/${textures[key]}.jpeg`)
		}

		// const ktxTextures = {
		// 	homeRoom: 'room-1',
		// 	contactRoom: 'room-2',
		// 	chair: 'chair',
		// 	pillows: 'pillows',
		// 	rock: 'rocks',
		// 	table: 'table',
		// 	pearlMatcap: 'pearl-matcap',
		// 	particle: 'particles',
		// 	skymap: 'skymap-tile',
		// 	aoMap: 'ao'
		// }

		// for (const key in glbs) {
		// 	store.AssetLoader.loadGltf(cacheBustUrl(`models/home/${glbs[key]}`)).then(gltf => {
		// 		this.assets.models[key] = gltf.scene.children[0]
		// 	})
		// }

		// for (const key in ktxTextures) {
		// 	store.AssetLoader.loadKtxTexture(cacheBustUrl(`images/home/${ktxTextures[key]}.ktx2`)).then(texture => {
		// 		this.assets.textures[key] = texture
		// 	})
		// }

		// store.AssetLoader.loadTexture(cacheBustUrl('images/home/blade.jpg')).then(texture => {
		// 	this.assets.textures.blade = texture
		// })

		// store.AssetLoader.loadGltf(cacheBustUrl(`models/home/objectsData.glb`)).then(gltf => {
		// 	this.assets.objectsData = gltf.scene
		// })
	}
}