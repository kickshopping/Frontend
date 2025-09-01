"use client"; // Necesario porque usamos onClick (JS en el cliente)
import { useState } from "react";
import style from "./login.module.css"; // Importa los estilos específicos de esta página

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Alterna abrir/cerrar menú
  const toggleMenu = () => setMenuOpen(!menuOpen);
    return (
    <div>
        <div>
            {/* Barra de navegación */}
            <div className="navbar">
                <i id="menu-icon" className="bx bx-menu" onClick={toggleMenu}></i>
                <div className="navbar-title">KICKSHOPPING</div>
                <div className="right-icons">
                <a href="/usuario">
                    <i className="bx bx-user"></i>
                </a>
                <a href="/">
                    <i className="bx bx-home"></i>
                </a>
                </div>
            </div>

            <main>
                <div className={style["login-container"]}>
                <h2 className={style["login-title"]}>Login</h2>
                <form>
                        <div className={style["input-box"]}>
                            <input type="email" placeholder="Email" required />
                            <i className="bx bx-envelope"></i>
                        </div>


                        <div className={style["input-box"]}>
                            <input type="password" placeholder="Password" required />
                            <i className="bx bx-lock-alt"></i>
                        </div>

                        <div className={style.options}>
                            <label>
                                <input type="checkbox" /> Remember Me
                            </label>
                            <a href="#">Forgot Password?</a>
                        </div>

                        <button type="submit" className={style["btn"]}>Login</button>

                        <p className="register-text">Don't have an account? <a href="/registro">Register</a></p>
                    </form>
                </div>    
            </main>
        </div>
    </div>
    );
}