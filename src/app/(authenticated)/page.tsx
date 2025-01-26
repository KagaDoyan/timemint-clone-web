import { redirect } from "next/navigation";
import { getSession, logout, isAuthenticated, redirectToLogin } from "@/lib/lib";

export default async function HomePage() {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return redirectToLogin();
  }

  // Get session details
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-3xl">
        <div className="p-8">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Welcome Home</h1>
            
            {session && (
              <div className="mb-6">
                <p className="text-gray-600">Logged in ass: {session.user.email}</p>
              </div>
            )}

            <form
              action={async () => {
                "use server";
                await logout();
                redirect("/login");
              }}
            >
              <button 
                type="submit" 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}