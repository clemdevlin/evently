import EventForm from "@/components/shared/EventForm";
import { auth } from "@clerk/nextjs";

const CreateEvent = async () => {
  const { sessionClaims } = auth();
  const { userId } = sessionClaims?.userId as { userId: string };
  if (!userId) {
    return <p className="wrapper py-10 text-center">Unauthorized</p>;
  }

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10">
        <h3 className="wrapper h3-bold text-center sm:text-left">
          Create Event
        </h3>
      </section>

      <div className="wrapper my-8">
        <EventForm userId={userId as string} type="Create" />
      </div>
    </>
  );
};

export default CreateEvent;
