import { ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AppSidebar from "./AppSidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <AppSidebar isOpen={sidebarOpen} />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
