import { RawShaderMaterial } from 'three'

import vertexShader from './vert.glsl'
import fragmentShader from './frag.glsl'

export default class StarsMaterial extends RawShaderMaterial {
	constructor(size = 5000) {
		super({
			vertexShader,
			fragmentShader,
			depthWrite: false,
			depthTest: false,
			transparent: true,
			opacity: 0.1,
			uniforms: {
				uTime: store.WebGL.globalUniforms.uTime,
				uSize: {value: 10}
			}
		})
	}
}