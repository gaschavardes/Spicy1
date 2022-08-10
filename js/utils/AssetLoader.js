import store from '../store'
import { E } from './'
import { TextureLoader } from 'three/src/Three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
/**
*   Add any promises that need to be resolved before showing
*   the page by using the add( promise ) method.
*/

export default class AssetLoader {
	constructor({
		name = 'AssetLoader',
		progressEventName = 'AssetsProgress'
	} = {}) {
		this.promisesToLoad = []
		this.fontsLoaded = false
		this.loaded = false
		this.name = name
		this.progressEventName = progressEventName

		this.jsons = {}
		this.gltfs = {}
		this.textures = {}
		this.ktxTextures = {}

		this.textureLoader = new TextureLoader()
		this.ktxLoader = new KTX2Loader()
		this.ktxLoader.setTranscoderPath(`${store.assetsUrl}basis/`)
		this.gltfLoader = new GLTFLoader()
		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath(`${store.assetsUrl}draco/`)
		this.gltfLoader.setDRACOLoader(this.dracoLoader)
	}

	load = ({ element = document.body, progress = true } = {}) => {
		if (element) {
			this.element = element
			this.addFonts()
			this.addMedia()
		}

		let loadedCount = 0

		if (progress) {
			for (let i = 0; i < this.promisesToLoad.length; i++) {
				this.promisesToLoad[i].then(() => {
					loadedCount++
					this.progressCallback((loadedCount * 100) / this.promisesToLoad.length)
				})
			}
		}

		this.loaded = new Promise(resolve => {
			Promise.all(this.promisesToLoad).then(() => {
				this.reset()
				E.emit(`${this.name}:beforeResolve`)
				resolve()
				E.emit(`${this.name}:afterResolve`)
			})
		})

		return this.loaded
	}

	progressCallback = (percentLoaded) => {
		E.emit(this.progressEventName, { percent: Math.ceil(percentLoaded) })
	}

	add = (promise) => {
		this.promisesToLoad.push(promise)
		return promise
	}

	addMedia = () => {
		const images = this.element.querySelectorAll('img:not([lazy="full"])')
		for (let i = 0; i < images.length; i++) {
			this.addImage(images[i])
		}

		const videos = this.element.querySelectorAll('video')
		for (let i = 0; i < videos.length; i++) {
			this.add(new Promise(resolve => {
				const muted = videos[i].muted
				videos[i].muted = true
				videos[i].crossOrigin = ''
				videos[i].addEventListener('loadeddata', () => {
					videos[i].addEventListener('timeupdate', () => {
						videos[i].pause()
						resolve()
						videos[i].currentTime = 0
						videos[i].muted = muted
					}, { once: true })
				}, { once: true })
				videos[i].addEventListener('error', resolve)
				// low-power mode on iOS won't allow autoplaying videos so just resolve the promise
				store.isIOS && videos[i].addEventListener('suspend', resolve)
				if (videos[i].src === '' && videos[i].dataset.src) {
					videos[i].src = videos[i].dataset.src
				}
				videos[i].load()
				videos[i].play()
			}))
		}
	}

	addImage(el) {
		return this.add(new Promise(resolve => {
			if (el.complete && el.naturalWidth !== 0) {
				// image already loaded so resolve
				resolve(el)
			} else {
				// image not loaded yet so listen for it
				el.addEventListener('load', () => { resolve(el) })
				el.addEventListener('error', () => { resolve(el) })
			}
		}))
	}

	addFonts = () => {
		if (document.fonts) {
			this.add(document.fonts.ready)
		}

		if (!this.fontsLoaded && window.Typekit) {
			this.add(new Promise(resolve => {
				window.Typekit.load({
					active: () => {
						this.fontsLoaded = true
						resolve()
					}
				})
			}))
		}
	}

	loadJson = (url) => {
		if (!this.jsons[url]) {
			this.jsons[url] = this.add(new Promise((resolve, reject) => {
				fetch(url, {
					headers: {
						'Content-Type': 'application/json'
					}
				})
					.then(response => {
						if (!response.ok) {
							throw new Error('Network response was not ok for request: ', url)
						}
						resolve(response.json())
					}, reject)
			}))
		}

		return this.jsons[url]
	}

	loadGltf = (url) => {
		if (!this.gltfs[url]) {
			this.gltfs[url] = this.add(new Promise((resolve, reject) => {
				this.gltfLoader.load(url, gltf => {
					resolve(gltf)
				}, undefined, reject)
			}))
		}

		return this.gltfs[url]
	}

	loadTexture = (url, options) => {
		if (!this.textures[url]) {
			this.textures[url] = this.add(new Promise((resolve, reject) => {
				this.textureLoader.load(url, texture => {
					resolve(store.Gl.generateTexture(texture, options))
				}, undefined, resolve)
			}))
		}

		return this.textures[url]
	}

	loadKtxTexture(url, options) {
		if (!this.ktxTextures[url]) {
			this.ktxTextures[url] = this.add(new Promise((resolve, reject) => {
				this.ktxLoader.load(url, texture => {
					resolve(store.Gl.generateTexture(texture, options, true))
				}, undefined, resolve)
			}))
		}

		return this.ktxTextures[url]
	}

	reset = () => {
		this.promisesToLoad = []
	}
}