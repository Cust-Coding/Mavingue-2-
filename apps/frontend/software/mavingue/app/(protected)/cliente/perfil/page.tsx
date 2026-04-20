"use client";

import { useEffect, useState } from "react";
import { Empty, ErrorBox, Loading } from "@/components/ui/State";
import { clientApi } from "@/features/client/api";
import type { ClientProfile } from "@/features/client/types";

export default function Perfil() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        setProfile(await clientApi.profile());
      } catch (error: any) {
        setErr(error?.message ?? "Erro ao carregar o perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Perfil</h2>
        <p style={{ marginBottom: 0, color: "#555" }}>Dados da conta, cadastro comercial e modulo de agua.</p>
      </div>

      {loading && <Loading />}
      {err && <ErrorBox text={err} />}

      {!loading && !err && profile && (
        <>
          <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16, display: "grid", gap: 10 }}>
            <h3 style={{ marginTop: 0 }}>Conta</h3>
            <div>
              <strong>Nome:</strong> {profile.account.nome}
            </div>
            <div>
              <strong>Email:</strong> {profile.account.email}
            </div>
            <div>
              <strong>Role:</strong> {profile.account.role}
            </div>
          </div>

          <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Cadastro de Cliente</h3>
            {profile.customer ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Nome:</strong> {profile.customer.name}
                </div>
                <div>
                  <strong>Telefone:</strong> {profile.customer.phone}
                </div>
                <div>
                  <strong>Morada:</strong> {profile.customer.endereco}, {profile.customer.bairro}, {profile.customer.cidade}
                </div>
                <div>
                  <strong>Documento:</strong> {profile.customer.tipoDocumento || "-"} {profile.customer.numeroDocumento || ""}
                </div>
              </div>
            ) : (
              <Empty text="Nao existe cadastro comercial ligado a este email." />
            )}
          </div>

          <div style={{ background: "white", border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Consumidor de Agua</h3>
            {profile.waterCustomer ? (
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <strong>Nome:</strong> {profile.waterCustomer.name}
                </div>
                <div>
                  <strong>Telefone:</strong> {profile.waterCustomer.phone}
                </div>
                <div>
                  <strong>Casa:</strong> {profile.waterCustomer.houseNR}
                </div>
                <div>
                  <strong>Zona:</strong> {profile.waterCustomer.adress || "-"}
                </div>
              </div>
            ) : (
              <Empty text="Nao existe cadastro de agua ligado a este email." />
            )}
          </div>
        </>
      )}
    </div>
  );
}
