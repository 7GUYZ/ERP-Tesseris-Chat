import { useState } from "react";

export default function UseForm(initialState) {
    const [form, setForm] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }
    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, file: e.target.files[0] }));
    }
    const resetForm = () => {
        setForm(initialState);
    }
    return { form, setForm, handleChange, handleFileChange, resetForm };
}