export const UndoSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      id="SVGRepo_iconCarrier"
      stroke="#1C274C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4 7h11c1.87 0 2.804 0 3.5.402A3 3 0 0 1 19.598 8.5C20 9.196 20 10.13 20 12s0 2.804-.402 3.5a3 3 0 0 1-1.098 1.098C17.804 17 16.87 17 15 17H8M4 7l3-3M4 7l3 3"
    ></path>
  </svg>
);

export const RedoSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <g
      id="SVGRepo_iconCarrier"
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path
        strokeMiterlimit="10"
        d="M16.87 18.31h-8c-2.76 0-5-2.24-5-5s2.24-5 5-5h11"
      ></path>
      <path d="m17.57 10.81 2.56-2.56-2.56-2.56"></path>
    </g>
  </svg>
);
export const DeleteSVG = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <g
      id="SVGRepo_iconCarrier"
      stroke={color || "#000"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M10 11v6M14 11v6M4 7h16M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3zM9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2H9z"></path>
    </g>
  </svg>
);
export const AddSVG = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <g
      id="SVGRepo_iconCarrier"
      stroke={color || "#1C274C"}
      strokeLinecap="round"
      strokeWidth="1.5"
    >
      <path d="M15 12h-3m0 0H9m3 0V9m0 3v3M7 3.338A9.95 9.95 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-1.821.487-3.53 1.338-5"></path>
    </g>
  </svg>
);
export const VideoSVG = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      id="SVGRepo_iconCarrier"
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m16 10 2.577-1.546c.793-.476 1.19-.714 1.516-.683a1 1 0 0 1 .713.403c.194.264.194.727.194 1.652v4.348c0 .925 0 1.388-.194 1.652a1 1 0 0 1-.713.404c-.326.03-.723-.208-1.516-.684L16 14m-9.8 4h6.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C16 16.48 16 15.92 16 14.8V9.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 6 13.92 6 12.8 6H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 7.52 3 8.08 3 9.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 18 5.08 18 6.2 18"
    ></path>
  </svg>
);
export const ClipboardSVG = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="Layer_1"
    width="24"
    height="24"
    fill="#080808"
    stroke="#080808"
    version="1.1"
    viewBox="0 0 23 32"
  >
    <g id="SVGRepo_iconCarrier" fill="#808184">
      <path d="M19 14h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1zM19 19h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1zM19 24h-8a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1z"></path>
      <path d="M21.5 4H19v-.5c0-.827-.673-1.5-1.5-1.5H15V.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0-.5.5V2H5.5C4.673 2 4 2.673 4 3.5V4H1.5C.673 4 0 4.673 0 5.5v25c0 .827.673 1.5 1.5 1.5h20c.827 0 1.5-.673 1.5-1.5v-25c0-.827-.673-1.5-1.5-1.5zM5 3.5c0-.275.225-.5.5-.5h3a.5.5 0 0 0 .5-.5V1h5v1.5a.5.5 0 0 0 .5.5h3c.275 0 .5.225.5.5v2c0 .275-.225.5-.5.5h-12a.5.5 0 0 1-.5-.5zm17 27c0 .275-.225.5-.5.5h-20a.5.5 0 0 1-.5-.5v-25c0-.275.225-.5.5-.5H4v.5C4 6.327 4.673 7 5.5 7h12c.827 0 1.5-.673 1.5-1.5V5h2.5c.275 0 .5.225.5.5z"></path>
      <path d="M8.166 13.605 6.73 15.041l-.613-.614a.5.5 0 0 0-.707.707l.967.968a.5.5 0 0 0 .708 0l1.789-1.789a.5.5 0 0 0-.708-.708zM8.166 17.885 6.73 19.32l-.613-.614a.5.5 0 0 0-.707.707l.967.968a.5.5 0 0 0 .708 0l1.789-1.789a.5.5 0 0 0-.708-.707zM8.166 23.164 6.73 24.6l-.613-.614a.5.5 0 0 0-.707.707l.967.968a.5.5 0 0 0 .708 0l1.789-1.789a.5.5 0 0 0-.708-.708z"></path>
    </g>
  </svg>
);
export const QuizSVG = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 32 32"
  >
    <g id="SVGRepo_iconCarrier">
      <path
        fill="#CFD8DC"
        d="M23 2.01H9a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-22a3 3 0 0 0-3-3"
      ></path>
      <path
        fill="#E53935"
        d="M21 26a1 1 0 0 1-.71-.29l-3-3a1 1 0 1 1 1.42-1.41l3 3a1 1 0 0 1 0 1.42A1 1 0 0 1 21 26"
      ></path>
      <path
        fill="#E53935"
        d="M18 26a.998.998 0 0 1-.71-1.71l3-3a1.002 1.002 0 0 1 1.71.705 1 1 0 0 1-.29.705l-3 3a1 1 0 0 1-.71.3"
      ></path>
      <path
        fill="#689F38"
        d="M12 26h-.06a1 1 0 0 1-.84-.56l-1-2a1 1 0 0 1 1.79-.89l.23.46 1.05-1.57a1 1 0 0 1 1.66 1.11l-2 3A1 1 0 0 1 12 26"
      ></path>
      <path fill="#304046" d="M26 17.01H6v2h20z"></path>
      <path
        fill="#1565C0"
        d="M14 11h-3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1m-2-2h1V8h-1z"
      ></path>
      <path
        fill="#304046"
        d="M21 15H11a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2M21 8h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2M21 11h-3a1 1 0 0 1 0-2h3a1 1 0 1 1 0 2"
      ></path>
      <path fill="#EEE" d="M9 2a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h7V2z"></path>
      <path
        fill="#689F38"
        d="M13.17 21.45 12.12 23l-.23-.46a1 1 0 0 0-1.79.89l1 2a1 1 0 0 0 .84.56H12a1 1 0 0 0 .83-.45l2-3a1 1 0 0 0-1.66-1.11z"
      ></path>
      <path fill="#616161" d="M16 17.01H6v2h10z"></path>
      <path
        fill="#1565C0"
        d="M14 11h-3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1m-2-2h1V8h-1z"
      ></path>
      <path fill="#616161" d="M11 13a1 1 0 0 0 0 2h5v-2z"></path>
      <path
        fill="#263238"
        d="M23 2H9a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m1 25a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1z"
      ></path>
    </g>
  </svg>
);