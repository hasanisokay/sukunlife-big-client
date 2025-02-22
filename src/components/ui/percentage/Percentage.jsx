
const Percentage = ({ progress }) => {
    return (
        <div className="mx-auto flex  flex-col gap-2">
            <div className="flex h-3 w-full  items-center justify-center rounded-full bg-sky-300">
                <div style={{ width: `${progress}%` }} className="transition-width mr-auto h-3 w-0 rounded-full  bg-sky-600 duration-500"></div>
            </div>
            {/* <span className="text-center text-sm font-medium text-sky-500">{progress}%</span> */}
        </div>
    );
};

export default Percentage;