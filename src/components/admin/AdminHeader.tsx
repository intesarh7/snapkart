export default function AdminHeader() {
  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Admin Panel</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>
    </header>
  );
}
