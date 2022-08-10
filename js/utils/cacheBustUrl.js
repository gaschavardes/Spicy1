/* eslint-disable */

import store from '../store'

export default function cacheBustUrl(path) {
	return `${store.assetsUrl}${path}?v=${Date.now()}`
}