import { NavLink } from "react-router-dom";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import "./Header.css";
import { useEffect, useRef, useState } from "react";

function Header() {

    const isAdmin: boolean = false;
    const [state, setState] = useState<boolean>(false);
    const myRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (state && myRef.current && !myRef.current.contains(event.target as Node)) {
                setState(false); // Close the mobile navigation
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [state]);

    return (
        <header className="header">
            <div className="container mx-auto">
                <div className="navbar flex flex-row justify-between items-center bg-base-100">
                    <div className="flex">
                        <a className="btn btn-ghost text-xl">daisyUI</a>
                    </div>
                    <div className="w-72 self-center hidden lg:flex flex-row justify-evenly items-center">
                        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Acceuil</NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Contacter</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Info</NavLink>
                    </div>
                    <div className="hidden lg:block">
                        <button className="sign-in-button mx-1">Connection</button>
                        <button className="create-account mx-1">Crée un compte</button>
                    </div>
                    <div className="flex-none block lg:hidden">
                        <button className="burger-mobile btn btn-square btn-ghost" onClick={() => setState((prev) => !prev)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div ref={myRef} className={`${state ? "mobile-nav-active" : "mobile-nav"} flex lg:hidden flex-col justify-start items-start gap-8`}>
                <div className="flex-none block lg:hidden self-end">
                    <button className="burger-mobile btn btn-square btn-ghost mx-5" onClick={() => setState((prev) => !prev)}>
                        <MdOutlinePlaylistRemove size={24} />
                    </button>
                </div>
                <div className="flex flex-col justify-evenly items-start mx-0">
                    <a className="btn btn-ghost text-xl px-5">daisyUI</a>
                </div>
                <div className="flex flex-col justify-evenly items-start px-5 gap-5">
                    <NavLink to="/" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Acceuil</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Contacter</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Info</NavLink>
                </div>
                <div className="px-5 py-5">
                    <button className="sign-in-button mx-1">Connection</button>
                    <button className="create-account mx-1">Crée un compte</button>
                </div>
            </div>
        </header>
    )
}

export default Header;