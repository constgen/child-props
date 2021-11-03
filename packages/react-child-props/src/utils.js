import React from 'react'

export const OMEN = Symbol('PROPS_OMEN')

export function isReactWrapper (child) {
	return typeof child.type === 'symbol'
}

export function isPropsWrapper (child) {
	return child.type && child.type[OMEN]
}

export function augment (funcTo, funcFrom) {
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
				.join(' ')
		}
		else if (typeof value === 'function') {
			props[prop] = augment(value, from[prop])
		}
		else if (prop === 'style') {
			props[prop] = Object.assign({}, value, from[prop])
		 }
		else {
			props[prop] = from[prop]
		}
	})

	return props
}


export function extendChildrenWithProps (children, props) {
	return React.Children.map(children, function (child) {
		let childIsJsxNode = React.isValidElement(child)

		if (childIsJsxNode) {
			let childShouldBeSkipped = isReactWrapper(child) || isPropsWrapper(child)

			if (childShouldBeSkipped) {
				return React.cloneElement(child, {
					children: extendChildrenWithProps(child.props.children, props)
				})
			}
			let extendedProps = mergeProps(child.props, props)

			return React.cloneElement(child, extendedProps)
		}

		return child
	})
}

export function extendChildrenWithExistingProps(children, props) {
	return React.Children.map(children, function (child) {
		let childIsJsxNode = React.isValidElement(child)

		if (childIsJsxNode) {
			let childShouldBeSkipped = isReactWrapper(child) || isPropsWrapper(child)

			if (childShouldBeSkipped) {
				return React.cloneElement(child, {
					children: extendChildrenWithExistingProps(child.props.children, props)
				})
			}
			let existingProps = Object.keys(child.props)
				.reduce(function (resultProps, prop) {
					if (prop in props) {
						resultProps[prop] = props[prop]
					}
					return resultProps
				}, {})
			let extendedProps = mergeProps(child.props, existingProps)

			return React.cloneElement(child, extendedProps)
		}

		return child
	})
}