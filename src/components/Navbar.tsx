import { useState } from "react";
import { NavLink } from "react-router-dom";
import { getRoute } from "../routes/routes";

export function Navbar() {
	const [open, setOpen] = useState(false);

  const ulStyle = "space-y-3 pl-2";

	const homeRoute = getRoute("home");
	const updatesRoute = getRoute("updates");

	if (!homeRoute || !updatesRoute) {
		console.error("Navbar: rutas no encontradas");
		return null;
	}
	function toggleTheme() {
		const html = document.documentElement;
		const isLight = html.classList.toggle("light-theme");
		localStorage.setItem("theme", isLight ? "light-theme" : "dark");
	}

	return (
		<>
			<nav className="bg-bg-secondary h-13 theme-transition">
				<div className="flex items-center justify-between h-full w-full px-4 md:px-8">

					<div className="flex items-center">
						<button onClick={() => setOpen(true)} className="md:hidden">
							<svg
								className="text-text-title cursor-pointer"
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="currentColor"
							>
								<path d="M4 8h24v2.668H4V8m0 6.668h24v2.664H4v-2.664m0 6.664h24V24H4Zm0 0" />
							</svg>
						</button>

						<div className="hidden md:flex items-center gap-8">
							<NavLink
								to={homeRoute.path}
								className={({ isActive }) =>
									isActive
										? "text-text-title"
										: "text-text-secondary hover:text-text-title transition"
								}
							>
								{homeRoute.label}
							</NavLink>

							<NavLink
								to={updatesRoute.path}
								className={({ isActive }) =>
									isActive
										? "text-text-title"
										: "text-text-secondary hover:text-text-title transition"
								}
							>
								{updatesRoute.label}
							</NavLink>
						</div>
					</div>

					<h1 className="text-text-title font-semibold text-xl absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
						logo
					</h1>

					<div className="flex items-center gap-5 md:gap-6">
						<svg
							className="text-text-title cursor-pointer w-7 h-7 md:w-6 md:h-6"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							fill="currentColor"
						>
							<path d="M10.879.805A17.162 17.162 0 0 1 13.414.8c4.48.492 8.219 3.52 9.656 7.82.414 1.227.59 2.512.54 3.965-.055 1.758-.387 3.086-1.16 4.672-.247.512-.825 1.449-1.25 2.027-.04.059 1.077 1.203 4.812 4.942l4.867 4.867-1.785 1.785-4.867-4.867c-3.739-3.735-4.883-4.852-4.942-4.813-1.723 1.258-3.379 1.98-5.258 2.297-.71.117-2.234.16-3.004.078a11.442 11.442 0 0 1-9.707-7.789c-.77-2.336-.77-4.86 0-7.2a11.513 11.513 0 0 1 4.606-5.987A11.771 11.771 0 0 1 10.879.805Zm2.562 2.562a8.893 8.893 0 0 0-6.199 1.414c-2.094 1.395-3.5 3.63-3.887 6.18-.082.547-.082 1.902 0 2.453.301 1.973 1.153 3.672 2.543 5.063 1.387 1.39 3.086 2.242 5.063 2.539.973.148 2.418.058 3.465-.207a8.97 8.97 0 0 0 6.383-6.383c.523-2.047.293-4.344-.625-6.16-1.34-2.668-3.875-4.508-6.743-4.899Zm0 0" />
						</svg>

						<button className="cursor-pointer">
							<svg
								className="hidden text-text-title w-7 h-7 md:w-6 md:h-6 md:block"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						</button>
					</div>
				</div>
			</nav>


			{open && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={() => setOpen(false)}
				/>
			)}

			<aside
				className={`fixed top-0 left-0 z-50 h-full w-72 bg-bg-secondary text-text-title transform transition-transform duration-300 md:hidden
					${open ? "translate-x-0" : "-translate-x-full"}`}
			>
				<div className="p-6 space-y-8">
					<section>
						<h3 className="text-sm uppercase opacity-60 mb-3">Navegación</h3>
						<ul className={ulStyle}>
							<li className="border-b border-white/10 pb-2">
								<NavLink
									to={homeRoute.path}
									onClick={() => setOpen(false)}
									className="block"
								>
									{homeRoute.label}
								</NavLink>
							</li>
							<li className="border-b border-white/10 pb-2">
								<NavLink
									to={updatesRoute.path}
									onClick={() => setOpen(false)}
									className="block"
								>
									{updatesRoute.label}
								</NavLink>
							</li>
						</ul>
					</section>

					<section>
						<h3 className="text-sm uppercase opacity-60 mb-3">Perfil</h3>
						<ul className={ulStyle}>
							<li className="border-b border-white/10 pb-2 cursor-pointer">
								Iniciar sesión
							</li>
							<li className="border-b border-white/10 pb-2 cursor-pointer">
								Registrarse
							</li>
						</ul>
					</section>

					<section>
						<h3 className="text-sm uppercase opacity-60 mb-3">Tema</h3>
						<button className="pl-1 cursor-pointer" onClick={()=>{toggleTheme();setOpen(false)}}>
							Cambiar tema
						</button>
					</section>
				</div>
			</aside>
		</>
	);
}