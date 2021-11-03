import React from 'react'
import PropTypes from 'prop-types'

import { extendChildrenWithExistingProps, OMEN } from './utils'


let ExistingProps = React.forwardRef(function (props, reference) {
	let { children, ...childProps } = props

	if (reference) {
		childProps.ref = reference
	}

	return extendChildrenWithExistingProps(children, childProps)
})

ExistingProps.displayName = 'ExistingProps'
ExistingProps[OMEN]       = true
ExistingProps.propTypes   = {
	children: PropTypes.node.isRequired
}

export default ExistingProps