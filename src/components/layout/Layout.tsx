import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AppSidebar from "./AppSidebar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col">
    <Header />
    <div className="flex flex-1">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  </div>
);

export default Layout;
