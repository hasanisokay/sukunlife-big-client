import Link from "next/link";

const TransparentGreenButton = ({ hrefLink, text }) => {
    return (
        <div className="flex items-center justify-center mt-[63px] ">
            <Link href={hrefLink || "/"}><button className="w-[262px] md:h-[80px] h-[60px] rounded-full block text-green border-2 font-semibold hover:bg-[#63953A] hover:text-white hover:border-0 border-[#63953A]">{text || ""}</button></Link>
        </div>

    );
};

export default TransparentGreenButton;