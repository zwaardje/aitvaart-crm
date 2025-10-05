export function Logo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      role="img"
      className="h-8 w-8"
      aria-labelledby="title desc"
    >
      <title id="title">aitvaart A emblem</title>
      <desc id="desc">
        Minimal monochrome stylized letter A formed by two arcs meeting at an AI
        node.
      </desc>

      <style>
        {`
          .a-path {
            fill: none;
            stroke: currentColor;
            stroke-width: 10;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .node {
            fill: currentColor;
          }
        `}
      </style>

      <g transform="translate(100,100)">
        {/* two arcs forming the A */}
        <path className="a-path" d="M-40,40 C-20,-40 20,-40 40,40" />
        {/* horizontal crossbar */}
        <line className="a-path" x1="-20" y1="10" x2="20" y2="10" />
        {/* AI node */}
        <circle className="node" cx="0" cy="10" r="6" />
      </g>
    </svg>
  );
}
