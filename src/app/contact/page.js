const Page = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-6 mb-10">
      <div className="text-center">
        <span className="headbtn">যোগাযোগ</span>
      </div>

      <div>
        {/* Location */}
        <div className="flex gap-3 items-center mb-2 mt-6">
          <span className="block bg-[#1c1c1c] rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 384 512"
              className="w-4 h-4 text-white fill-current"
            >
              <path d="M215.7 499.2C267 435 384 279.4 384 192 384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2a31.9 31.9 0 0 0 47.4 0zM192 272a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
            </svg>
          </span>
          <p className="py-2">
            Dhanmondi 32 area, near sobhanbag jame mosque, Dhanmondi, Dhaka.
          </p>
        </div>

        {/* Phone */}
        <div className="flex gap-3 items-center mb-2">
          <span className="block bg-[#1c1c1c] rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-4 h-4 text-white fill-current"
            >
              <path d="M511.1 387.1l-23.1 100.7c-3.3 14.3-15.9 24.3-30.6 24.3C205.4 512 0 306.6 0 54.6 0 39.9 10 27.3 24.3 24L125 0.9c15.5-3.6 31.1 4.4 37.8 19.2l46.4 108.2c6 14-0.2 30.2-13.9 37.2l-49.6 24.8c29.5 61.9 79.6 112 141.5 141.5l24.8-49.6c7-13.7 23.2-19.9 37.2-13.9l108.2 46.4c14.8 6.7 22.8 22.3 19.2 37.8z" />
            </svg>
          </span>
          <a href="tel:01915109430" className="py-2">01915109430</a>
        </div>

        {/* Email */}
        <div className="flex gap-3 items-center mb-2">
          <span className="block bg-[#1c1c1c] rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-4 h-4 text-white fill-current"
            >
              <path d="M502.3 190.8L327.4 338.6c-15.9 13.7-39 13.7-54.9 0L9.7 190.8C3.9 186.1 0 178.9 0 171V80c0-26.5 21.5-48 48-48h416c26.5 0 48 21.5 48 48v91c0 7.9-3.9 15.1-9.7 19.8zM0 214.2V432c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V214.2L353.5 355.6c-37.4 32.4-93.6 32.4-131 0L0 214.2z" />
            </svg>
          </span>
          <a href="mailto:sukunlifebd@gmail.com" className="py-2">sukunlifebd@gmail.com</a>
        </div>

      </div>
    </div>
  );
};

export default Page;
