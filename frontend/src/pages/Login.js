import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, {
                email,
                password,
            });
            
            localStorage.setItem("token", res.data.token);
            alert("Login Successful!");
            navigate("/dashboard"); 
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    const handleGuestLogin = () => {
        localStorage.setItem("token", "guest");
        navigate("/dashboard"); 
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            {error && <p className="text-danger">{error}</p>}
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary">Login</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={handleGuestLogin}>Guest Login</button>
            </form>
        </div>
    );
};

export default Login;
