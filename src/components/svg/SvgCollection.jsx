import { useSelector } from "react-redux";

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
export const VideoSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      id="SVGRepo_iconCarrier"
      stroke={color ? color : theme === "light" ? "#343541" : "#d9eff1"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m16 10 2.577-1.546c.793-.476 1.19-.714 1.516-.683a1 1 0 0 1 .713.403c.194.264.194.727.194 1.652v4.348c0 .925 0 1.388-.194 1.652a1 1 0 0 1-.713.404c-.326.03-.723-.208-1.516-.684L16 14m-9.8 4h6.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C16 16.48 16 15.92 16 14.8V9.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 6 13.92 6 12.8 6H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 7.52 3 8.08 3 9.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 18 5.08 18 6.2 18"
    ></path>
  </svg>
};
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
export const TakaSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    id="taka"
    width="16"
    height="16"
    fill={color ? color : theme === "light" ? "#000" : "#ffffff"}
    stroke={color ? color : theme === "light" ? "#000" : "#ffffff"}
    strokeWidth="0.48"
    className="icon flat-color"
    data-name="Flat Color"
    viewBox="0 0 24 24"
  >
    <g id="SVGRepo_iconCarrier">
      <path
        id="primary"
        fill={color ? color : theme === "light" ? "#000" : "#ffffff"}
        d="M18.67 12.16a3.9 3.9 0 0 0-2.32-2.11 1 1 0 0 0-.63 1.9 1.87 1.87 0 0 1 1.12 2.53l-1.75 3.94A2.66 2.66 0 0 1 10 17.34V12h2a1 1 0 0 0 0-2h-2V6a4 4 0 0 0-4-4 1 1 0 0 0 0 2 2 2 0 0 1 2 2v4H6a1 1 0 0 0 0 2h2v5.34a4.66 4.66 0 0 0 8.92 1.89l1.75-3.93a3.9 3.9 0 0 0 0-3.14Z"
      ></path>
    </g>
  </svg>
};
export const UpdateSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      id="SVGRepo_iconCarrier"
      stroke={color ? color : theme === "light" ? "#000" : "#ffffff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.984 10H17m3.984 0V6m0 4-3.327-3.657A8 8 0 1 0 19.418 15M12 9v4l3 1.5"
    ></path>
  </svg>
};
export const StatsSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    id="Capa_1"
    width="24"
    height="24"
    fill={color ? color : theme === "light" ? "#000" : "#ffffff"}
    stroke={color ? color : theme === "light" ? "#000" : "#ffffff"}
    strokeWidth="6.501"
    version="1.1"
    viewBox="0 0 250.076 250.076"
  >
    <path
      id="SVGRepo_iconCarrier"
      d="M4.924.003A5 5 0 0 0 0 5.073v240a5 5 0 0 0 5 5h240a5.002 5.002 0 1 0 0-10H10v-235A5 5 0 0 0 4.924.003zm220.348 30.012a5 5 0 0 0-4.746 2.826l-23.641 47.367a15 15 0 0 0-1.885-.135c-8.225 0-15 6.775-15 15 0 4.011 1.62 7.669 4.225 10.373l-37.379 74.756a15 15 0 0 0-1.846-.129c-2.296 0-4.469.544-6.424 1.484l-49.941-50.301A14.8 14.8 0 0 0 90 125.073c0-8.225-6.775-15-15-15s-15 6.775-15 15c0 4.252 1.821 8.106 4.707 10.848l-34.275 77.121c-2.88 6.156 6.495 10.325 9.137 4.062l34.264-77.092c.387.03.774.061 1.168.061a14.8 14.8 0 0 0 6.695-1.613l49.803 50.16a14.8 14.8 0 0 0-1.498 6.453c0 8.225 6.775 15 15 15s15-6.775 15-15c0-4.012-1.619-7.671-4.225-10.375l37.379-74.752c.607.076 1.22.127 1.846.127 8.225 0 15-6.775 15-15 0-3.997-1.607-7.643-4.195-10.344l23.668-47.424c1.672-3.234-.564-7.115-4.202-7.29zm-30.271 60.058c2.821 0 5 2.179 5 5s-2.179 5-5 5-5-2.179-5-5c0-2.82 2.179-5 5-5zm-120 30c2.821 0 5 2.179 5 5s-2.179 5-5 5-5-2.179-5-5c0-2.82 2.179-5 5-5zm70 70c2.821 0 5 2.179 5 5s-2.179 5-5 5-5-2.179-5-5c0-2.82 2.179-5 5-5z"
    ></path>
  </svg>
};
export const CertificateSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      id="SVGRepo_iconCarrier"
      stroke={color ? color : theme === "light" ? "#000" : "#ffffff"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m9 12 2 2 4-4m-3-7 1.91 1.871 2.59-.665.718 2.576 2.576.718-.666 2.59L21 12l-1.872 1.91.666 2.59-2.576.718-.718 2.576-2.59-.666L12 21l-1.91-1.872-2.59.666-.718-2.576-2.576-.718.665-2.59L3 12l1.871-1.91-.665-2.59 2.576-.718.718-2.576 2.59.665z"
    ></path>
  </svg>
};
export const QuizSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g id="SVGRepo_iconCarrier" fill={color ? color : theme === "light" ? "#343541" : "#d9eff1"} fillRule="evenodd">
      <path d="M13 0H3a3.01 3.01 0 0 0-3 3v13.99a3.01 3.01 0 0 0 3 3h10a3.01 3.01 0 0 0 3-3V3a3.01 3.01 0 0 0-3-3m1 16.99a1.016 1.016 0 0 1-1 1H3a1.016 1.016 0 0 1-1-1V3a1.016 1.016 0 0 1 1-1h10c.549.009.991.451 1 1z"></path>
      <path d="M20 7v14a3.01 3.01 0 0 1-3 3H5a1 1 0 0 1 0-2h12a1.016 1.016 0 0 0 1-1V7a1 1 0 0 1 2 0"></path>
      <circle cx="8" cy="15" r="1"></circle>
      <path d="M12 8a3.99 3.99 0 0 1-3 3.87V12a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1 2 2 0 1 0-2-2 1 1 0 1 1-2 0 4 4 0 1 1 8 0"></path>
    </g>
  </svg>
};
export const CartSVG = ({ color }) => {
  const theme = useSelector(state => state.theme.mode);
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <g
      id="SVGRepo_iconCarrier"
      fill={color ? color : theme === "light" ? "#1C274C" : "#ffffff"}
      // 
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <path d="M2.237 2.288a.75.75 0 1 0-.474 1.424l.265.088c.676.225 1.124.376 1.453.529.312.145.447.262.533.382s.155.284.194.626c.041.361.042.833.042 1.546v2.672c0 1.367 0 2.47.117 3.337.12.9.38 1.658.982 2.26.601.602 1.36.86 2.26.982.866.116 1.969.116 3.336.116H19a.75.75 0 0 0 0-1.5h-8c-1.435 0-2.436-.002-3.192-.103-.733-.099-1.122-.28-1.399-.556a1.5 1.5 0 0 1-.255-.341h9.905c.448 0 .842 0 1.17-.035.354-.039.698-.124 1.02-.337.324-.213.537-.495.712-.806.161-.286.317-.649.493-1.061l.467-1.09c.385-.896.706-1.647.867-2.257.168-.637.212-1.302-.184-1.903-.396-.6-1.025-.822-1.676-.919-.625-.092-1.441-.092-2.417-.092H5.707l-.009-.083c-.055-.485-.176-.93-.467-1.333-.291-.404-.675-.66-1.117-.865-.417-.194-.946-.37-1.572-.58zM5.75 6.75V9.5c0 1.172.001 2.054.057 2.75h10.215c.496 0 .809-.001 1.046-.027.219-.023.303-.062.356-.097s.122-.097.23-.289c.117-.208.24-.495.436-.95l.429-1c.414-.968.69-1.616.819-2.106.126-.476.062-.62.014-.694-.049-.073-.157-.189-.644-.26-.501-.075-1.205-.077-2.257-.077zM5.25 19.5a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0m2.25.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5M16.5 21.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5m-.75-2.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0"></path>
    </g>
  </svg>
};