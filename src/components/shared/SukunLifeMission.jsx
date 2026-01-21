const SukunLifeMission = () => {
  return (
    <div className="flex flex-col ">
      {/* Upper section with light background */}
      <div className=" mission-wrapper-upper-div flex items-center justify-center md:h-[310px] h-[400px]">
            <h3 className="font-semibold md:text-[32px] text-[26px] charisSIL-font max-w-[80vw] text-center">
            Sukun Life is not just a centre—it's a mission to restore balance, heal the heart, and guide the soul with the light of Islamic knowledge.
        </h3>
      </div>

      {/* Lower section with black background */}
      <div className=" h-[501px] bg-black flex flex-col items-center justify-center p-8 text-white">

        <h3 className="font-medium text-center md:text-[36px] text-[26px] charisSIL-font">
          Find your <span className='text-[#73FF00] italic'>peace</span>. Find your peace. Heal with <span className='text-[#73FF00] italic'>faith</span>.
        </h3>
        <h3 className="md:text-[64px] text-[50px] font-bold text-center charisSIL-font">
          Welcome to Sukun Life.
        </h3>
      </div>
    </div>
  );
};

export default SukunLifeMission;