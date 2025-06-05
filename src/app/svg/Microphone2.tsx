import React, { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
    secondaryfill?: string;
    strokewidth?: number;
    title?: string;
}

function Microphone2({ color, ...props }: IconProps) {
    return (
        <svg height="48" width="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g fill={color}>
                <path d="M41,22c0-0.553-0.448-1-1-1s-1,0.447-1,1c0,8.271-6.729,15-15,15S9,30.271,9,22c0-0.553-0.448-1-1-1 s-1,0.447-1,1c0,9.036,7.092,16.427,16,16.949V45h-9c-0.552,0-1,0.447-1,1s0.448,1,1,1h20c0.552,0,1-0.447,1-1s-0.448-1-1-1h-9 v-6.051C33.908,38.427,41,31.036,41,22z" fill={color} />
                <path d="M29,21c0-0.553,0.448-1,1-1h5v-5h-5c-0.552,0-1-0.447-1-1s0.448-1,1-1h5v-1 c0-6.065-4.935-11-11-11S13,5.935,13,12v1h5c0.552,0,1,0.447,1,1s-0.448,1-1,1h-5v5h5c0.552,0,1,0.447,1,1s-0.448,1-1,1h-5 c0,6.065,4.935,11,11,11s11-4.935,11-11h-5C29.448,22,29,21.553,29,21z" fill={color} />
            </g>
        </svg>
    );
};

export default Microphone2;