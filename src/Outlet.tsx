import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Updates } from "./pages/Updates";
import { Searcher } from "./pages/Searcher";
import { Manga } from "./pages/Manga";
import { getRoute, routes } from "./routes/routes";
import { Chapter } from "./pages/Chapter";


export function Outlet() {
    const homeRoute = getRoute("home");
    const updatesRoute = getRoute("updates");
    const searchRoute = getRoute("search");
    const mangaRoute = getRoute("manga");
    const chapterRoute = getRoute("chapter");

    console.log("routes:", routes);
    console.log("chapter:", getRoute("chapter"));
    if (!homeRoute || !updatesRoute || !searchRoute || !mangaRoute || !chapterRoute) {
        console.error("Navbar: rutas no encontradas");
        return null;
    }
    return (
        <Routes>
            <Route path={homeRoute.path} element={<Home/>}/>
            <Route path={updatesRoute.path} element={<Updates/>}/>
            <Route path={searchRoute.path} element={<Searcher/>}/>
            <Route path={mangaRoute.path} element={<Manga/>}/>
            <Route path={chapterRoute.path} element={<Chapter/>}/>
        </Routes>
    );
}