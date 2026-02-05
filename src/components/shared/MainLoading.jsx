export default function MainLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-5">
        
        {/* Logo */}
        <div className="logo-calm md:w-[500px] w-[240px]">
          <img
            src="/logo-big.svg"
            alt="SukunLife"
            className="w-full h-auto"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
