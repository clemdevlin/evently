import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { createUser } from "@/lib/actions/user.actions";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import { currentUser } from "@clerk/nextjs";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (user) {
    await connectToDatabase();

    const existing = await User.findOne({ clerkId: user.id });

    // If Clerk webhook missed this user, save them now
    if (!existing) {
      console.log("⚠️ User missing in DB — creating fallback:", user);
      await createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || user.firstName || "",
        firstName: user.firstName || "Random",
        lastName: user.lastName || "User",
        photo: user.imageUrl,
      });
    }
  }
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
