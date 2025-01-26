
const Spinner2 = ({ loadingText }) => {
    return (
        <div className="bg-black text-white  flex flex-col items-center justify-center bg-opacity-70 px-2 py-1 absolute right-1/2 ">
            <span className="spinner2"></span>
            <span>{loadingText || 'Loading...'}</span>
        </div>
    );
};

export default Spinner2;