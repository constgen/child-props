<script>
import { Fragment } from 'vue-fragment'

const ALIEN = Symbol('alien')

function isElement (node) {
	return Boolean(node.tag)
}

function isNotAlien (value) {
	return !value[ALIEN]
}

function mergeClasses (to = '', from = '') {
	const SPACE      = ' '
	let toIsObject   = typeof to === 'object'
	let fromIsObject = typeof from === 'object'

	if (toIsObject && fromIsObject) {
		return Object.assign({}, to, from)
	}
	if (toIsObject) {
		return Object.assign({}, to, { [from]: true })
	}
	if (fromIsObject) {
		return Object.assign({}, { [to]: true }, from)
	}
	return to
		.split(SPACE)
		.concat(from.split(SPACE))
		.filter(Boolean)
		.join(SPACE)
}

function mergeEvents (to = {}, from = {}) {
	Object.keys(from).forEach(function (prop) {
		let handler   = to[prop]
		let listeners = [].concat(from[prop])

		listeners.forEach(listener => { listener[ALIEN] = true })
		if (!handler) {
			to[prop] = listeners
		}
		else if (handler.fns) {
			let handlerFns = [].concat(handler.fns)

			handler.fns = handlerFns.filter(isNotAlien).concat(listeners)
		}
		else {
			to[prop] = []
				.concat(handler)
				.filter(isNotAlien)
				.concat(listeners)
		}
	})
	return to
}
function mergeAttrs (to = {}, from = {}) {
	let props = {}

	Object.keys(from).forEach(function (prop) {
		const OPTIMIZED_LENGTH = 3
		let value              = to[prop]

		if (typeof value === 'function') {
			props[prop]
				= value.length <= OPTIMIZED_LENGTH ?
					function (arg1, arg2, arg3) {
						value(arg1, arg2, arg3)
						from[prop](arg1, arg2, arg3)
					} :
					function (...args) {
						value(...args)
						from[prop](...args)
					}
		}
		else {
			props[prop] = from[prop]
		}
	})

	return Object.assign({}, to, props)
}
function extendChildren (
	children = [],
	classNames = {},
	attrs,
	listeners,
	scopeId
) {
	return children.map(node => {
		let childIsElement = isElement(node)

		if (childIsElement) {
			node.data       = node.data || {}
			node.data.attrs = node.data.attrs || {}
			if (node.componentOptions) {
				node.componentOptions.propsData = mergeAttrs(
					node.componentOptions.propsData,
					attrs
				)
				node.componentOptions.listeners = mergeEvents(
					node.componentOptions.listeners,
					listeners
				)
			}
			else {
				node.data.attrs = mergeAttrs(node.data.attrs, attrs)
				node.data.on    = mergeEvents(node.data.on, listeners)
			}
			node.data.staticClass = mergeClasses(
				node.data.staticClass,
				classNames.staticClass
			)
			node.data.class       = mergeClasses(node.data.class, classNames.class)
			if (scopeId) {
				node.data.attrs[scopeId] = ''
			}
		}
		return node
	})
}

extendChildren()

export default {
	name      : 'Props',
	functional: true,
	render (createElement, context) {
		// console.log(context);
		let {
			children, data, props, listeners, parent
		} = context
		let containsSingleChildren = children.length === 1
		let scopeId                = parent.$options._scopeId

		children = extendChildren(
			children,
			{
				staticClass: data.staticClass,
				class      : data.class
			},
			props,
			listeners,
			scopeId
		)

		if (containsSingleChildren) {
			return children[0]
		}
		return createElement(Fragment, {}, children)
	}
}
</script>