const SubmitButton = ({ loading, styles, onsubmit }) => {
    return (
        <button
            type="submit"
            role="button"
            onSubmit={onsubmit}
            disabled={loading}
            className={`btn-sm w-full  btn-submit ${styles}`}
        >
            {loading ? <span className="btn-loader"></span> : <span className="inline-block">Login</span>}
        </button>
    );
};

export default SubmitButton;