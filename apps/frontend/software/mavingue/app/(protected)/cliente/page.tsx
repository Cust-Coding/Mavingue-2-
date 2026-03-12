'use client'

export default function ClienteHome() {
  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-gray-100 rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );

  const Badge = ({ children, type = "success" }: { children: React.ReactNode; type?: "success" | "danger" | "warning" }) => {
    const styles = {
      success: "bg-green-100 text-green-700",
      danger: "bg-red-100 text-red-700",
      warning: "bg-yellow-100 text-yellow-700"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[type]}`}>
        {children}
      </span>
    );
  };

  return (
    <div className="space-y-6 m-4">
      <h2>Cliente</h2>
      <p>Área do cliente.</p>

         {/* Dash */}
         
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <h3 className="font-bold mb-4">Histórico de Compras</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <span>Venda #102 - ---- (-----)</span>
                    <span className="font-bold">-----</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm text-orange-600">
                    <span>Venda #105 - Pendente de Entrega</span>
                    <span className="font-bold">-----</span>
                  </div>
                </div>
              </Card>
              <Card className="bg-red-600/12">
                <h3 className="font-bold mb-2">Aviso</h3>
                <p className="text-sm opacity-90 text-orange-600">
                  Lembre-se: Após a venda, não aceitamos devoluções. Pode comprar mesmo sem stock para reserva.
                </p>
              </Card>
            </div>
      
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-lg">Consumo Mensal</h3>
                    <p className="text-xs text-gray-400">Contador: ------</p>
                  </div>

                  <Badge>Ligação Activa</Badge>
               
                </div>
                <div className="text-3xl font-black text-blue-600">42.5 m³</div>
                <p className="text-sm text-gray-500">Referente a Janeiro 2026</p>
              </Card>
              <Card>
                <h3 className="font-bold mb-4">Última Factura</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">-----</span>
                  <Badge type="warning">Pendente</Badge>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">
                  Pagar Via M-Pesa
                </button>
              </Card>
            </div>
    </div>
  );
}