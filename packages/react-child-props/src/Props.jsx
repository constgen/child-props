import React from 'react'
import PropTypes from 'prop-types'

import { extendChildrenWithProps, OMEN } from './utils'

let Props = React.forwardRef(function (props, reference) {
	let { children, ...childProps } = props

	if (reference) {
		childProps.ref = reference
	}

	return extendChildrenWithProps(children, childProps)
})

Props.displayName = 'Props'
Props[OMEN]       = true
Props.propTypes   = {
	children: PropTypes.node.isRequired
}

export default Props