import difference = require('lodash/difference');
import omit = require('lodash/omit');
import { arrayOf, number, oneOfType, string } from 'prop-types';
import * as React from 'react';
import { compose, getDisplayName } from 'recompose';
import styled, { withTheme } from 'styled-components';
import { color, fontSize, space, width } from 'styled-system';
import { StyledSystemProps } from './common-types';
import { Tooltips } from './tooltips';

const tooltip = new Tooltips();

const prop = oneOfType([number, string, arrayOf(oneOfType([number, string]))]);

const propTypes = {
	width: prop,
	fontSize: prop,
	color: prop,
	bg: prop,
	backgroundColor: prop,
	m: prop,
	mt: prop,
	mr: prop,
	mb: prop,
	ml: prop,
	mx: prop,
	my: prop,
	p: prop,
	pt: prop,
	pr: prop,
	pb: prop,
	pl: prop,
	px: prop,
	py: prop,
};

const styledSystemProps = Object.keys(propTypes);

const filterStyledSystemProps = (passthroughProps: string[]) => (
	Base: React.ComponentType,
) => {
	return React.forwardRef((props: any, ref: any) => {
		const nextProps = omit(
			props,
			difference(styledSystemProps, passthroughProps),
		);
		return <Base {...nextProps} ref={ref} />;
	});
};

export const withStyledSystem = (child: React.ComponentType) => {
	const Base = styled(child)<StyledSystemProps>`
		${space}
		${width}
		${fontSize}
		${color}
	`;

	Base.displayName = getDisplayName(child);

	// The styled component messes up with the propTypes typings. We don't really need typesafety here anyway, so it is safe to just ignore it.
	// @ts-ignore
	Base.propTypes = propTypes;

	return React.forwardRef((props: any, ref: any) => {
		return <Base {...props} ref={ref} />;
	});
};

export const withTooltip = (Base: React.ComponentType) => {
	return React.forwardRef(({ ...props }: any, ref: any) => {
		if (props.tooltip) {
			props = tooltip.bindProps(props);
		}
		delete props.tooltip;
		return <Base {...props} ref={ref} />;
	});
};

export default function asRendition<T>(
	component: React.ComponentType,
	additionalEnhancers: Array<
		(Base: React.ComponentType) => React.ComponentType
	> = [],
	passthroughProps: string[] = [],
) {
	return (compose(
		withTheme,
		...(additionalEnhancers || []),
		withTooltip,
		withStyledSystem,
		filterStyledSystemProps(passthroughProps),
	)(component) as unknown) as T;
}
