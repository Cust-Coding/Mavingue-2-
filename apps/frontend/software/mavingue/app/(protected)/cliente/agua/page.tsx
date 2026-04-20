"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clientApi } from "@/features/client/api";
import type { ClientProfile } from "@/features/client/types";
import {
  completeClientWaterRequest,
  createClientWaterRequest,
  listAddresses,
  listClientWaterBills,
  listClientWaterContracts,
  listClientWaterReadings,
} from "@/features/water/api";
import type { AddressItem, WaterBill, WaterContract, WaterCustomer, WaterReading } from "@/features/water/types";
import { printWaterBillDocument } from "@/lib/documents/print";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime, formatMoney } from "@/lib/formatters";

type CompletionFormMap = Record<number, { houseNR: string; adressId: string }>;

export default function ClienteAguaPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [enderecos, setEnderecos] = useState<AddressItem[]>([]);
  const [contratos, setContratos] = useState<WaterContract[]>([]);
  const [leituras, setLeituras] = useState<WaterReading[]>([]);
  const [faturas, setFaturas] = useState<WaterBill[]>([]);
  const [requestForm, setRequestForm] = useState({ referenciaLocal: "", observacoes: "" });
  const [completionForms, setCompletionForms] = useState<CompletionFormMap>({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [profileData, addressRows, contractRows, readingRows, billRows] = await Promise.all([
        clientApi.profile(),
        listAddresses(),
        listClientWaterContracts(),
        listClientWaterReadings(),
        listClientWaterBills(),
      ]);
      setProfile(profileData);
      setEnderecos(addressRows);
      setContratos(contractRows);
      setLeituras(readingRows);
      setFaturas(billRows);
      setCompletionForms(
        profileData.waterCustomers.reduce<CompletionFormMap>((acc, item) => {
          acc[item.id] = {
            houseNR: item.houseNR || "",
            adressId: item.adressId ? String(item.adressId) : "",
          };
          return acc;
        }, {})
      );
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel carregar a area de agua"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const waterCustomers = profile?.waterCustomers ?? [];
  const customerById = useMemo(() => new Map(waterCustomers.map((item) => [item.id, item])), [waterCustomers]);

  async function submitRequest() {
    setError("");
    setSuccess("");
    try {
      await createClientWaterRequest({
        referenciaLocal: requestForm.referenciaLocal.trim(),
        observacoes: requestForm.observacoes.trim() || undefined,
      });
      setRequestForm({ referenciaLocal: "", observacoes: "" });
      setSuccess("Pedido de agua enviado com sucesso. Aguarde aprovacao do administrador.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel criar o pedido de agua"));
    }
  }

  async function submitCompletion(requestId: number) {
    const current = completionForms[requestId];
    setError("");
    setSuccess("");
    try {
      await completeClientWaterRequest(requestId, {
        houseNR: current.houseNR,
        adressId: Number(current.adressId),
      });
      setSuccess("Dados da casa enviados. O servico de agua desta conta ja esta activo.");
      await load();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Nao foi possivel guardar os dados da casa"));
    }
  }

  return (
    <main className="grid gap-6">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Agua</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Pedidos e contas de agua da sua area</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-500 dark:text-slate-400">
          Aqui pode pedir agua para uma ou mais casas. Cada pedido fica pendente para aprovacao e, depois disso,
          completa os dados finais da casa para activar o servico.
        </p>
      </section>

      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      {loading ? <div className="text-sm text-slate-500">A carregar modulo de agua...</div> : null}

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pedir nova conta de agua</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Use esta secao quando tiver outra casa ou novo local. O administrador aprova primeiro e depois completa o
          numero da casa e a zona.
        </p>
        <div className="mt-5 grid gap-3 xl:grid-cols-[1.2fr_1.2fr_auto]">
          <Input
            value={requestForm.referenciaLocal}
            onChange={(event) => setRequestForm((current) => ({ ...current, referenciaLocal: event.target.value }))}
            placeholder="Ex.: Casa da Matola, Talhao 7, Loja do Mercado"
          />
          <Input
            value={requestForm.observacoes}
            onChange={(event) => setRequestForm((current) => ({ ...current, observacoes: event.target.value }))}
            placeholder="Observacoes opcionais para ajudar a equipa"
          />
          <Button type="button" onClick={submitRequest}>Enviar pedido</Button>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">As suas contas e pedidos</h2>
        {!loading && waterCustomers.length === 0 ? (
          <div className="mt-4 text-sm text-slate-500">A sua conta ainda nao tem pedidos de agua associados.</div>
        ) : null}

        <div className="mt-5 grid gap-4">
          {waterCustomers.map((waterCustomer) => (
            <article key={waterCustomer.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                <div className="grid gap-3">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    Casa ID #{waterCustomer.id} - {waterCustomer.name}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{waterCustomer.email} - {waterCustomer.phone}</div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Local pedido</div>
                      <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{waterCustomer.referenciaLocal || "-"}</div>
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado</div>
                      <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{waterCustomer.estado}</div>
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Casa</div>
                      <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{waterCustomer.houseNR || "-"}</div>
                    </div>
                    <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Zona</div>
                      <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{waterCustomer.adress || "-"}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Observacoes: {waterCustomer.observacoes || "Sem observacoes"}
                  </div>
                </div>

                {waterCustomer.estado === "AGUARDANDO_DADOS_CASA" ? (
                  <div className="rounded-[24px] border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/40 dark:bg-orange-950/10">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Completar dados da casa</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Este pedido foi aprovado. Informe agora o numero da casa e a zona para activar a conta.
                    </p>
                    <div className="mt-4 grid gap-3">
                      <Input
                        value={completionForms[waterCustomer.id]?.houseNR || ""}
                        onChange={(event) =>
                          setCompletionForms((current) => ({
                            ...current,
                            [waterCustomer.id]: {
                              ...(current[waterCustomer.id] ?? { houseNR: "", adressId: "" }),
                              houseNR: event.target.value,
                            },
                          }))
                        }
                        placeholder="Numero da casa"
                      />
                      <select
                        value={completionForms[waterCustomer.id]?.adressId || ""}
                        onChange={(event) =>
                          setCompletionForms((current) => ({
                            ...current,
                            [waterCustomer.id]: {
                              ...(current[waterCustomer.id] ?? { houseNR: "", adressId: "" }),
                              adressId: event.target.value,
                            },
                          }))
                        }
                        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="">Seleccionar zona</option>
                        {enderecos.map((endereco) => (
                          <option key={endereco.id} value={endereco.id}>
                            {endereco.name} - {endereco.bairro}
                          </option>
                        ))}
                      </select>
                      <Button type="button" onClick={() => submitCompletion(waterCustomer.id)}>Guardar dados da casa</Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    {waterCustomer.estado === "PENDENTE_APROVACAO"
                      ? "Aguardando aprovacao do administrador."
                      : waterCustomer.estado === "ATIVO"
                      ? "Conta activa e pronta para gestao de leitura, factura e pagamento pela equipa."
                      : "Pedido indisponivel neste momento. Consulte as observacoes acima."}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ligacoes e leituras</h2>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="grid gap-3">
            {contratos.length === 0 ? <div className="text-sm text-slate-500">Sem ligacoes ainda.</div> : contratos.map((contrato) => {
              const cliente = customerById.get(contrato.consumidorId);
              return (
                <article key={contrato.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    Ligacao #{contrato.id} - Casa ID #{contrato.consumidorId}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {contrato.estado} - {contrato.consumidorNome} - {cliente?.referenciaLocal || "Sem local"}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Casa {contrato.houseNR || "-"} - Operador {contrato.funcionarioNome}</div>
                </article>
              );
            })}
          </div>
          <div className="grid gap-3">
            {leituras.length === 0 ? <div className="text-sm text-slate-500">Sem leituras ainda.</div> : leituras.map((leitura) => {
              const contrato = contratos.find((item) => item.id === leitura.ligacaoId);
              return (
                <article key={leitura.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-base font-black text-slate-900 dark:text-white">{formatDateTime(leitura.data)}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Ligacao #{leitura.ligacaoId} - Casa ID #{contrato?.consumidorId || "-"} - {contrato?.consumidorNome || "Consumidor"}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Actual: {leitura.leituraActual} - Consumo: {leitura.consumoM3} m3 - Valor: {formatMoney(leitura.valorPagar)}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Faturas emitidas</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              O pagamento e confirmado pela equipa no sistema. Aqui pode acompanhar o estado e imprimir a factura.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {faturas.length === 0 ? <div className="text-sm text-slate-500">Sem faturas emitidas ainda.</div> : faturas.map((fatura) => {
            const cliente = customerById.get(fatura.consumidorId);
            return (
              <article key={fatura.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      Factura #{fatura.id} - Casa ID #{fatura.consumidorId}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {fatura.consumidorNome} - {cliente?.referenciaLocal || "Sem local"}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {formatDateTime(fatura.data)} - {formatMoney(fatura.valorTotal)} - Estado: {fatura.estadoPagamento}
                    </div>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => printWaterBillDocument(fatura)}>
                    Imprimir PDF
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
