import Sidebar from "@/components/layout/Sidebar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (

      <div style={{ minHeight: "calc(100vh - 55px)" }}>
        

    <Sidebar />
          {children}
        </div>
    
  );
}