export type AppRoute = {
  id: string;
  path: string;
  label: string;
};

export const routes: AppRoute[] = [
  { id: "home", path: "/", label: "Inicio" },
  { id: "updates", path: "/updates", label: "Actualizaciones" },
  { id: "search", path: "/search", label: "Buscador" },
];

export function getRoute(id: string): AppRoute | undefined {
  return routes.find(route => route.id === id);
}