import React from 'react'

function isReactWrapper (child) {
	return typeof child.type === 'symbol'
}

function augment (funcTo, funcFrom) {
	const OPTIMIZED_LENGTH = 3

	if (!funcFrom) return funcTo

	return funcTo.length <= OPTIMIZED_LENGTH ?
		function (arg1, arg2, arg3) {
			funcTo(arg1, arg2, arg3)
			funcFrom(arg1, arg2, arg3)
		} :
		function (...args) {
			funcTo(...args)
			funcFrom(...args)
		}
}

function mergeProps (to, from) {
	let props = {}

	Object.keys(from).forEach(function (prop) {
		let value = to[prop]

		if (prop === 'className') {
			const SPACE        = /\s+/g
			let toClassNames   = (value || '').split(SPACE)
			let fromClassNames = (from[prop] || '').split(SPACE)

			props[prop] = toClassNames
				.concat(fromClassNames)
				.filter(Boolean)
				.join(SPACE)
		}
		else if (typeof value === 'function') {
			props[prop] = augment(value, from[prop])
		}
		else {
			props[prop] = from[prop]
		}
	})

	return props
}

function extendChildrenWithProps (children, props) {
	return React.Children.map(children, function (child) {
		let childIsNode = React.isValidElement(child)

		if (childIsNode) {
			let childShouldBeSkipped = isReactWrapper(child)
			let extendedProps        = mergeProps(child.props, props)

			if (childShouldBeSkipped) {
				return React.cloneElement(child, {
					children: extendChildrenWithProps(child.props.children, extendedProps)
				})
			}
			return React.cloneElement(child, extendedProps)
		}

		return child
	})
}

export default function Props (props) {
	let { children, ...otherProps } = props

	return extendChildrenWithProps(children, otherProps)
}