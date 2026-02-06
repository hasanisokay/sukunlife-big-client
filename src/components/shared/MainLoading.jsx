import Image from "next/image";
import logoSvg from "./logo-big.svg";

export default function MainLoading() {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-5">
        
        {/* Logo */}
        <div className="logo-calm md:w-[500px] w-[240px]">
          <Image
            src={logoSvg}
            alt="SukunLife"
            width={1000}
            height={1000}
            className="w-full h-auto"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
