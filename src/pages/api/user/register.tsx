import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleRegister = async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      alert("Registration successful");
      router.push("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">
          SnapKart Signup
        </h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-3"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          placeholder="Phone"
          className="border p-2 w-full mb-3"
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleRegister}
          className="bg-green-600 text-white w-full p-2"
        >
          Signup
        </button>
      </div>
    </div>
  );
}
