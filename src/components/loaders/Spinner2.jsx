import MainLoading from "../shared/MainLoading";

const Spinner2 = ({ loadingText = "Loading..." }) => {
    return <MainLoading />
    return (
        <div className="absolute right-1/2 translate-x-1/2 top-4 z-50">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-black/60 px-4 py-3 backdrop-blur-md text-white shadow-lg">
                <span className="spinner-modern" />
                <span className="text-sm tracking-wide opacity-90">
                    {loadingText}
                </span>
            </div>
        </div>
    );
};

export default Spinner2;
