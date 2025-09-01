"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState } from "react";


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);
    return (
    <div>
        <div>
            {/* Barra de navegación */}
            <div className="navbar">
                <div className="navbar-title">KICKSHOPPING</div>
                <div className="right-icons">
                <a href="/">
                    <i className="bx bx-home"></i>
                </a>
                </div>
            </div>

            <main>
                <div className="login-container">
                <h2 className="login-title">Login</h2>
                <form>
                        <div className="input-box">
                            <input type="text" placeholder="Username" required />
                            <i className='bx bx-user'></i>
                        </div>
                        <div className="input-box">
                            <input type="email" placeholder="Email" required />
                            <i className="bx bx-envelope"></i>
                        </div>

                        <div className="input-box">
                            <input type="password" placeholder="Password" required />
                            <i className="bx bx-lock-alt"></i>
                        </div>
                        <div className="input-box">
                            <input type="date" id="fecha_nacimiento" placeholder="Date" required />
                            <i className='bx bx-calendar'></i>
                        </div>

                        <div className="options">
                            <label>
                                <input type="checkbox" /> Remember Me
                            </label>
                            <a href="#">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn">Login</button>

                        <p className="register-text">Don't have an account? <a href="/registro">Register</a></p>
                    </form>
                </div>
                <style>{`
                .login-container {
                    background: #111;
                    padding: 2rem;
                    border-radius: 10px;
                    width: 100%;
                    max-width: 350px;
                    text-align: center;
                    color: #fff;
                    margin: 0 auto;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
                }
                .login-title {
                    margin-bottom: 1.5rem;
                    font-weight: bold;
                }
                .input-box {
                    position: relative;
                    margin-bottom: 1rem;
                }
                .input-box input {
                    width: 100%;
                    padding: 10px 40px 10px 10px;
                    background: none;
                    border: none;
                    border-bottom: 1px solid #555;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
                }
                .input-box i {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #aaa;
                    font-size: 1.2rem;
                }
                .input-box input:focus {
                    border-bottom: 1px solid #fff;
                }
                .options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                }
                .options a {
                    color: #ccc;
                    text-decoration: none;
                }
                .btn {
                    width: 100%;
                    padding: 10px;
                    background: #fff;
                    color: #000;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .register-text {
                    margin-top: 1rem;
                    font-size: 0.9rem;
                    color: #aaa;
                }
                .register-text a {
                    color: #fff;
                    text-decoration: none;
                }
                @media (max-width: 600px) {
                    .login-container {
                        padding: 1.2rem;
                        max-width: 95vw;
                        border-radius: 6px;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                }
                `}</style>
            </main>
        </div>
    </div>
    );
}