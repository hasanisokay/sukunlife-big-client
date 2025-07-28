const SubmitButton = ({ loading, styles, onsubmit }) => {
    return (
        <button
            type="submit"
            role="button"
            onSubmit={onsubmit}
            disabled={loading}
            className={`w-[236px] h-[54px] text-white opacity-100 bg-[#779341] rounded-full ${styles}`}
        >
            {loading ? <span className="btn-loader"></span> : <span className="inline-block">Sign In</span>}
        </button>
    );
};

export default SubmitButton;