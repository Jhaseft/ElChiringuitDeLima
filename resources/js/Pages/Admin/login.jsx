import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  const token = document.querySelector('meta[name="csrf-token"]').content;

  try {
    const res = await fetch("/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": token,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      window.location.href = data.redirect;
    } else {
      setError(data.message || "Credenciales incorrectas");
    }
  } catch (err) {
    setError("Error de conexión");
    console.error(err);
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-center">Login Administrador</h2>

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="border rounded p-2"
        />

        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="border rounded p-2"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="bg-blue-500 text-white rounded p-2 mt-2">
          Entrar
        </button>
      </form>
    </div>
  );
}
