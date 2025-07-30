const FeaturesSection = () => {
  const features = [
    {
      title: ["Shariah-", "Compliant Treatment"],
      text: "We maintain the highest level of Islamic integrity and do not compromise on religious principles.",
    },
    {
      title: ["Time", "and Care"],
      text: "We provide dedicated consultation, giving each case the attention, time, and wisdom it needs.",
    },
    {
      title: ["Customized", "Counselling"],
      text: "Depending on the patient and their condition, Islamic counselling is provided where necessary.",
    },
    {
      title: ["Ongoing", "Support"],
      text: "Patients are followed up for 1–2 months to ensure proper recovery. Lifetime support is offered via dedicated WhatsApp groups.",
    },
    {
      title: ["Online", "Consultation"],
      text: "Our treatments are carried out by certified, experienced Raqis, scholars (Ulama), and medical professionals who understand both spiritual and physical health.",
    },
    {
      title: ["Authentic", "Methods Only"],
      text: "We strictly adhere to healing practices based on the Qur’an, Sunnah, and the understanding of the Salaf. We avoid all newly invented and harmful methods.",
    },
    {
      title: ["Home", "Visits"],
      text: "If someone is unable to visit the center, we offer home treatment upon the recommendation of a senior consultant.",
    },
    {
      title: ["Honest", "Advice"],
      text: "If a condition is purely psychological or medical, we provide the appropriate guidance without misattributing it to spiritual causes.",
    },
  ];

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16">
        {features?.map(({ title, text }, idx) => (
          <div key={idx}>
            <h3 className="font-semibold text-[32px] mb-[19px] charisSIL-font">
              <span className={`${(idx === 2 || idx === 5 || idx === 7) ? 'text-green' : 'text-black'}`}>{title[0]}</span>{idx !==0 && " "}
              <span className={`${(idx === 2 || idx === 5 || idx === 7) ? 'text-black' : 'text-green'}`}>{title[1]}</span>
            </h3>
            <p className="text-black text-base">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
