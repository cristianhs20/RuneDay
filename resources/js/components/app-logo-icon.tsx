import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <path
                d="M9 4v24M9 7h8.5c4 0 6.5 2.2 6.5 5.5S21.5 18 17.5 18H9m8-1 8 11M6 4h6M6 28h6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M20.5 5.5 24 2l3.5 3.5L24 9l-3.5-3.5Z"
                fill="currentColor"
                opacity=".65"
            />
        </svg>
    );
}
