'use client';

export default function ClienteCompras() {
  return (
    <div 
      className="group"
      style={{ 
        background: "white", 
        border: "1px solid #e5e7eb", 
        borderRadius: 12, 
        padding: 20,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.02)";
        e.currentTarget.style.borderColor = "#f97316";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e5e7eb";
      }}
    >
      <h2 
        style={{ 
          margin: 0, 
          marginBottom: 12,
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#1f2937",
          transition: "color 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "#f97316"}
        onMouseLeave={(e) => e.currentTarget.style.color = "#1f2937"}
      >
        Compras
      </h2>
      
      <p 
        style={{ 
          margin: 0,
          color: "#6b7280",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          transition: "color 0.2s ease"
        }}
      >
        Precisa endpoint dedicado no backend para listar compras do cliente por token/clienteId.
      </p>

   
      <div 
        style={{
          marginTop: 16,
          height: 2,
          width: 40,
          background: "#f97316",
          borderRadius: 2,
          transition: "width 0.3s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.width = "80px"}
        onMouseLeave={(e) => e.currentTarget.style.width = "40px"}
      />
    </div>
  );
}