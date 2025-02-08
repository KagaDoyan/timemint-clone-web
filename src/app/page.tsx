import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/lib";

export default async function HomePage() {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/home");
  }

  // If not authenticated, redirect to login
  redirect("/login");
}