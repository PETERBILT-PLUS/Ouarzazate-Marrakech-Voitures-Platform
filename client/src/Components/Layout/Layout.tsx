import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
        <Header />
        <Outlet />
        <Footer />
    </>
  )
}

export default Layout;