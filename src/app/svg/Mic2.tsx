import React, { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string;
	strokewidth?: number;
	title?: string;
}

function Mic2({ color, ...props }: IconProps) {
	return (
		<svg height="48" width="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}>
			<g fill={color}>
				<path d="M40,27H8c-0.553,0-1,0.448-1,1s0.447,1,1,1h3v1c0,6.831,5.299,12.435,12,12.949V46c0,0.552,0.447,1,1,1 s1-0.448,1-1v-3.051C31.701,42.435,37,36.831,37,30v-1h3c0.553,0,1-0.448,1-1S40.553,27,40,27z" fill={color} />
				<path d="M24,1c-7.168,0-13,5.832-13,13v10c0,0.552,0.447,1,1,1h24c0.553,0,1-0.448,1-1V14 C37,6.832,31.168,1,24,1z" fill={color} />
			</g>
		</svg>
	);
};

export default Mic2;