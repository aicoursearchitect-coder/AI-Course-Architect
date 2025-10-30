import React from 'react';

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 10v12" />
    <path d="M18 10V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4.56" />
    <path d="M18 10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.44" />
  </svg>
);
