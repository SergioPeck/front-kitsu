import { Navbar } from "./components/Navbar";
import { Outlet } from "./Outlet";

export default function App() {
  return (
    <div className="min-h-screen bg-bg theme-transition">
      <Navbar/>
      <Outlet/>
    </div>
  );
}
