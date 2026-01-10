# Front Kitsu

Proyecto frontend construido con **React**, **Vite** y **Tailwind CSS**.  
La idea principal es practicar una estructura limpia de navegación, manejo de rutas y diseño responsive.

## 🚀 Tecnologías

- React
- Vite
- React Router
- Tailwind CSS
- TypeScript

## 📁 Estructura general

- `routes/`  
  Configuración centralizada de rutas (paths y labels), utilizada por el Navbar y Outlet.
- `components/`  
  Componentes reutilizables como el Navbar.
- `pages/`  
  Páginas principales de la aplicación.
- `router/`  
  Definición de las rutas de React Router.

## 🧭 Navegación

Las rutas se definen en un solo lugar y se consumen desde el Navbar para evitar:
- strings mágicos
- duplicación de paths
- errores al cambiar URLs

El Navbar es responsive:
- Desktop: links visibles
- Mobile: menú lateral (drawer)

## 🎨 Tema

Incluye un sistema básico de cambio de tema (claro / oscuro) usando clases en el `<html>` y `localStorage`.

## 📦 Instalación

```bash
npm install
npm run dev
