import Image from "next/image";
import bookAppointment from "@/../public/bgImages/about-us.jpg";


const BookAnAppointment = () => {
    return (
        <div className="montserrat-font ">
            <section className="text-white h-[665px] flex flex-col items-center justify-center  text-center ">
                <div className="absolute top-0 bottom-0 right-0 left-0 h-[665px]">
                    <Image className="w-full h-[665px]  object-cover pointer-events-none select-none" src={bookAppointment} width={1000} height={1000} alt="Book an appointment banner" />
                </div>
                <div className="bg-black bg-opacity-[41%] w-full h-[665px] absolute top-0 bottom-0 right-0 left-0">
                </div>
                <div className="relative z-10 max-w-4xl md:px-6 px-4 md:-mt-0 -mt-[100px]">
                    <div className="flex flex-col gap-[19px]">
                        <h2 className="charisSIL-font md:text-[60px] text-[30px] font-bold leading-tight text-center ">Book an Appointment</h2>
                        <p className="text-sm md:text-base">
                            We offer a range of specialized spiritual and holistic services designed to restore your physical, emotional, and spiritual well-being. Book your session with ease and begin your journey towards healing today.
                        </p>
                    </div>
                </div>
            </section>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="flex items-center md:flex-row flex-col gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setSelectedService(null)}
                                className="text-[#2e3e23] hover:text-[#4a5e3a] dark:text-[#4a5e3a] dark:hover:text-[#2e3e23] flex items-center gap-1"
                            >
                                Back to Services
                            </button>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Selected: {selectedService.label}
                            </h3>
                        </div>

                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Name
                            </label>
                            <input
                                {...register("name")}
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Mobile Field */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Mobile Number
                            </label>
                            <input
                                {...register("mobile")}
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                placeholder="Enter your mobile number"
                            />
                            {errors.mobile && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.mobile.message}</p>
                            )}
                        </div>

                        {/* Address Field */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Address
                            </label>
                            <input
                                {...register("address")}
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                placeholder="Enter your address"
                            />
                            {errors.address && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.address.message}</p>
                            )}
                        </div>

                        {/* Date Field */}
                        <div>
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                    <DatePickerWithDisableDates
                                        labelText={'Select Date'}
                                        availableDates={uniqueDateStrings}
                                        onChangeHandler={(date) => {
                                            const formattedDate = handleDateChange(date);
                                            field.onChange(formattedDate);
                                        }}
                                    />
                                )}
                            />
                            {errors.date && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
                            )}
                        </div>

                        {/* Time Field */}
                        {availableTimes?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Select Time
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableTimes.map((time, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleTimeClick(time)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedTime === time
                                                    ? "bg-[#2e3e23] text-white"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {convertTo12HourFormat(time)}
                                        </button>
                                    ))}
                                </div>
                                {errors.time && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.time.message}</p>
                                )}
                            </div>
                        )}

                        {/* Consultant Field */}
                        {availableConsultants?.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Select Consultant
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableConsultants?.map((consultant, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleConsultantClick(consultant)}
                                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${selectedConsultant === consultant
                                                    ? "bg-[#2e3e23] text-white"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                                }`}
                                        >
                                            {consultant}
                                        </button>
                                    ))}
                                </div>
                                {errors.consultant && (
                                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.consultant.message}</p>
                                )}
                            </div>
                        )}

                        {/* Problem Field */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Problem Description
                            </label>
                            <textarea
                                {...register("problem")}
                                className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                placeholder="Describe your problem"
                                rows={4}
                            />
                            {errors.problem && (
                                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.problem.message}</p>
                            )}
                        </div>

                        {/* Payment Options */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Payment Option
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValue("advancePayment", true);
                                        setShowTransactionField(true);
                                    }}
                                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${showTransactionField
                                            ? "bg-[#2e3e23] text-white hover:bg-[#4a5e3a]"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    Pay 500 TK Now
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setValue("advancePayment", false);
                                        setShowTransactionField(false);
                                        setValue("transactionNumber", "");
                                    }}
                                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${!showTransactionField
                                            ? "bg-[#2e3e23] text-white hover:bg-[#4a5e3a]"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        }`}
                                >
                                    Pay Later
                                </button>
                            </div>

                            {showTransactionField && (
                                <div
                                    className="mt-4"
                                >
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Pay 500 TK to <strong>017xxxxx (Bkash)</strong> to confirm your booking.
                                    </p>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Transaction Number
                                    </label>
                                    <input
                                        {...register("transactionNumber")}
                                        type="text"
                                        className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2e3e23] transition-all"
                                        placeholder="Enter transaction number"
                                    />
                                    {errors.transactionNumber && (
                                        <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                                            {errors.transactionNumber.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register("termsAgreed")}
                                onClick={() => setShowTermsModal(true)}
                                className="h-4 w-4 text-[#2e3e23] border-gray-300 rounded dark:border-gray-600"
                            />
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                I agree to the{" "}
                                <span
                                    className="text-[#2e3e23] hover:underline cursor-pointer dark:text-[#4a5e3a]"
                                    onClick={() => setShowTermsModal(true)}
                                >
                                    Terms & Conditions
                                </span>
                            </label>
                            {errors.termsAgreed && (
                                <p className="text-red-500 dark:text-red-400 text-sm">{errors.termsAgreed.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full p-3 bg-[#2e3e23] text-white rounded-lg font-medium hover:bg-[#4a5e3a] transition-colors"
                        >
                            Book Appointment
                        </button>
                    </form>
        </div>
    );
};

export default BookAnAppointment;