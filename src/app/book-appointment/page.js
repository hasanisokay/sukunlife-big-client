import BookAppointment from "@/components/appointment/BookAppointment";
import appointmentCover from "@/../public/images/blog.jpg";
import { websiteName } from "@/constants/names.mjs";
import hostname from "@/constants/hostname.mjs";
import NotFound from "@/components/not-found/NotFound";

const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const selected = s?.selected || '';

    return <BookAppointment preSelectedService={selected} />;
  } catch {
    return <NotFound />;
  }
};

export default page;

export async function generateMetadata() {
  const host = await hostname();
  const appointmentCoverUrl = `${host}${appointmentCover.src}`;

  const metadata = {
    title: `Book Appointment`,
    description:
      "Schedule your appointment with ease at SukunLife. Book now for personalized consultations and expert guidance tailored to your needs.",
    url: `${host}/book-appointment`,
    alternates: {
      canonical: `${host}/book-appointment`,
    },
    keywords: [
      "book appointment",
      "schedule consultation",
      "sukunlife appointment",
      "online booking",
      "consultation",
      "personal growth",
      "appointment scheduling",
    ],
    openGraph: {
      title: `Book Appointment - ${websiteName}`,
      description: "Book an appointment.",
      url: `${host}/book-appointment`,
      images: [
        {
          url: appointmentCoverUrl,
          width: 800,
          height: 600,
          alt: "Appointment Cover Image",
        },
      ],
      siteName: websiteName,
      locale: "bn_BD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Book Appointment - ${websiteName}`,
      description:
        "Schedule your appointment with ease at SukunLife. Book now for personalized consultations and expert guidance tailored to your needs.",
      images: [appointmentCoverUrl],
    },
  };

  return metadata;
}
