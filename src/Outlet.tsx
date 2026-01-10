import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Updates } from "./pages/Updates";
import { Searcher } from "./pages/Searcher";
import { getRoute } from "./routes/routes";

export function Outlet() {
    const homeRoute = getRoute("home");
    const updatesRoute = getRoute("updates");
    const searchRoute = getRoute("search");

    if (!homeRoute || !updatesRoute || !searchRoute) {
        console.error("Navbar: rutas no encontradas");
        return null;
    }
    return (
        <Routes>
            <Route path={homeRoute.path} element={<Home/>}/>
            <Route path={updatesRoute.path} element={<Updates/>}/>
            <Route path={searchRoute.path} element={<Searcher/>}/>
        </Routes>
    );
}