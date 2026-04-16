
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (

      <div style={{ minHeight: "calc(100vh - 55px)" }}>
        

        
    
          {children}
        </div>
    
  );
}