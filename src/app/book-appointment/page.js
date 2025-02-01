import BookAppointment from "@/components/appointment/BookAppointment";
import getAllScheduleDates from "@/utils/getAllScheduleDates.mjs";
import appointmentCover from "@/../public/images/blog.jpg";
import { websiteName } from "@/constants/names.mjs";
import hostname from "@/constants/hostname.mjs";

const page = async () => {
  const dates = await getAllScheduleDates();

  return <BookAppointment dates={dates.dates} status={dates?.status} />;
};

export default page;

export async function generateMetadata() {
  const host = await hostname();
  const appointmentCoverUrl = `${host}${appointmentCover.src}`;

  const metadata = {
    title: `Book Appointment - ${websiteName}`,
    description: "Book an appointment.",
    keywords: ["appointment"],
    url: `${host}/book-appointment`,
    canonical: `${host}/book-appointment`,
    openGraph: {
      title: `Book Appointment - ${websiteName}`,
      description: "Book an appointment.",
      url: `${host}/book-appointment`,
      images: [
        {
          url: appointmentCoverUrl,
          width: 800,
          height: 600,
          alt: 'Appointment Cover Image',
        },
      ],
      siteName: websiteName,
      locale: 'bn_BD',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book Appointment - ${websiteName}`,
      description: "Book an appointment.",
      images: [appointmentCoverUrl],
    },
  };

  return metadata;
}