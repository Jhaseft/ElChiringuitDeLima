import { useState } from "react";
import axios from "axios";

export default function Crear({ close }) {
    const [data, setData] = useState({
        currency_pair: "",
        type: "",
        title: "",
        number: "",
        image: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post("/transfer-methods/crear", data);

            close(); // cerrar modal
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-3">

            <input
                name="currency_pair"
                className="border p-2 w-full"
                placeholder="Currency Pair"
                onChange={handleChange}
            />

            <input
                name="type"
                className="border p-2 w-full"
                placeholder="Type"
                onChange={handleChange}
            />

            <input
                name="title"
                className="border p-2 w-full"
                placeholder="Title"
                onChange={handleChange}
            />

            <input
                name="number"
                className="border p-2 w-full"
                placeholder="Number"
                onChange={handleChange}
            />

            <input
                name="image"
                className="border p-2 w-full"
                placeholder="Image URL"
                onChange={handleChange}
            />

            <button
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
                {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
                type="button"
                onClick={close}
                className="w-full mt-2 text-gray-500"
            >
                Cancelar
            </button>
        </form>
    );
}