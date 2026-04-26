"use client";

import React from "react";
import { 
    PDFDownloadLink,
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
} from "@react-pdf/renderer";

interface Product {
  name: string;
  unitPrice: number;
}

interface InvoiceData {
    sender: {
        name: string;
        email: string;
        phone: string;
        website: string;
        logoUrl?: string;
    };

    client: {
        name: string;
        address: string;
        city: string;
        email: string;
        phone: string;
    };

    invoiceNumber: string;
    invoiceDate: string;
    debt: number;
    fine: number;
    

    products: Product[];
    currency: string;

    notes?: string;
    footerText?: string;
  
}

const fmt = (value: number, currency = "MZN") =>
  `${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`;


const S = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: "#ffffff",
        fontFamily: "Courier",
        fontSize: 9,
        color: "#222222",
    },


    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },

    logoBox: {
        width: 50,
        height: 50,
        backgroundColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        color: "#ffffff",
        fontSize: 16,
        fontFamily: "Courier-Bold",
    },
    logoImage: { width: 50, height: 50 },
    senderBlock: { alignItems: "flex-end" },
    senderName: {
        fontFamily: "Courier-Bold",
        fontSize: 11,
        letterSpacing: 2,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    senderDetail: { color: "#666666", fontSize: 8.5, lineHeight: 1.7 },

    divider: {
        borderBottomWidth: 1,
        borderBottomColor: "#dddddd",
        marginBottom: 20,
    },

    recipientInvoiceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    sectionLabel: {
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 2,
        marginBottom: 8,
    },
    recipientText: { color: "#666666", fontSize: 8.5, lineHeight: 1.8 },
    invoiceTitle: {
        fontFamily: "Courier-Bold",
        fontSize: 22,
        letterSpacing: 3,
        textAlign: "right",
        marginBottom: 6,
    },
    invoiceNumLabel: {
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 2,
        textAlign: "right",
    },
    invoiceNum: { color: "#666666", fontSize: 8.5, textAlign: "right" },

    dateRow: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 16,
    },
    dateLabel: {
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    dateValue: { color: "#666666", fontSize: 8.5, textAlign: "center" },

    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#222222",
        paddingBottom: 5,
        marginBottom: 4,
    },
    thProduct: {
        width: "40%",
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 1.2,
    },
    thQty: {
        width: "15%",
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 1.2,
        textAlign: "right",
    },
    thUnit: {
        width: "22%",
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 1.2,
        textAlign: "right",

    },

    thAmount: {
        width: "23%",
        fontFamily: "Courier-Bold",
        fontSize: 8,
    },
 
    tableRow: {
        flexDirection: "row",
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: "#eeeeee",
    },
    tdProduct: { width: "40%", color: "#555555", fontSize: 8.5 },
    tdQty: { width: "15%", color: "#555555", fontSize: 8.5, textAlign: "right" },
    tdUnit: {
        width: "22%",
        color: "#555555",
        fontSize: 8.5,
        textAlign: "right",
    },
    tdAmount: {
        width: "23%",
        color: "#555555",
        fontSize: 8.5,
        textAlign: "right",
    },

    totalsContainer: {
        alignItems: "flex-end",
        marginTop: 12,
        marginBottom: 20,
    },
    totalsBlock: { width: "45%" },
    totalsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
        color: "#555555",
        fontSize: 8.5,
    },
    totalsRowFinal: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 8,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: "#222222",
    },
    totalLabel: { fontFamily: "Courier-Bold", fontSize: 11 },
    totalValue: { fontFamily: "Courier-Bold", fontSize: 11 },

    notesLabel: {
        fontFamily: "Courier-Bold",
        fontSize: 8,
        letterSpacing: 2,
        marginBottom: 6,
    },

    notesText: { 
        color: "#666666",
        fontSize: 8.5, 
        lineHeight: 1.7 
    },

    
    footer: {
        position: "absolute",
        bottom: 28,
        left: 50,
        right: 50,
        borderTopWidth: 1,
        borderTopColor: "#dddddd",
        paddingTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    footerText: { 
        color: "#aaaaaa", 
        fontSize: 7.5 
    },

    card: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 6,
    },
});

const CheckOutWatter = ({ data }: { data: InvoiceData }) => {
  const c = data.currency;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        
        <View style={S.header}>
          {data.sender.logoUrl ? (
            <Image src={data.sender.logoUrl} style={S.logoImage} />
          ) : (
            <View style={S.logoBox}>
              <Text style={S.logoText}>M</Text>
            </View>
          )}

          <View style={S.senderBlock}>
            <Text style={S.senderName}>{data.sender.name}</Text>
            <Text style={S.senderDetail}>{data.sender.website}</Text>
            <Text style={S.senderDetail}>{data.sender.email}</Text>
            <Text style={S.senderDetail}>{data.sender.phone}</Text>
          </View>
        </View>

        <View style={S.divider} />

        <View style={S.recipientInvoiceRow}>
          <View>
            <Text style={S.sectionLabel}>CLIENTE</Text>
            <Text style={S.recipientText}>Nome: {safe(data.client.name)}</Text>
            <Text style={S.recipientText}>Morada: {safe(data.client.address)}</Text>
            <Text style={S.recipientText}>Cidade: {safe(data.client.city)}</Text>
            <Text style={S.recipientText}> </Text>
            <Text style={S.recipientText}>Email: {safe(data.client.email)}</Text>
            <Text style={S.recipientText}>Telefone: {safe(data.client.phone)}</Text>
          </View>

          <View>
            <Text style={S.invoiceTitle}>Fatura</Text>
            <Text style={S.invoiceNum}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={S.recipientInvoiceRow}>
           <View style={S.dateRow}>
                <View style={S.card}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={S.dateLabel}>Leitura</Text>
                    </View>
                    <View style={[S.divider, { marginBottom: 5 }]} />

                    <View style={S.dateRow}>
                    <View style={{ marginRight: 50 }}>
                        <View style={{ alignItems: "center" }}>
                            <Text style={S.dateLabel}>Anterior</Text>
                        </View>
                        <View style={[S.divider, { marginBottom: 8 }]} />
                        
                    </View>

                    <View>
                        <View style={{ alignItems: "center" }}>
                            <Text style={S.dateLabel}>Atual</Text>
                        </View>
                        <View style={[S.divider, { marginBottom: 8 }]} />
                        
                    </View>
                    </View>
                </View>

                <View style={S.card}>
                    <View style={{ alignItems: "center" }}>
                        <Text style={S.dateLabel}>Consumo</Text>
                    </View>
                    <View style={[S.divider, { marginBottom: 5 }]} />
                    <View>
                        <View style={{ alignItems: "center" }}>
                            <Text style={S.dateLabel}>Total</Text>
                        </View>
                        <View style={[S.divider, { marginBottom: 8 }]} />
                        
                        
                    </View>
                </View>
            </View>
            <View style={S.dateRow}>
                <View>
                    <Text style={S.dateLabel}>DATA DO RECIBO</Text>
                    <Text style={S.dateValue}>{data.invoiceDate}</Text>
                </View>
            </View>
        </View>

        <View style={S.tableHeader}>
            <Text style={S.thProduct}>DESCRIÇÃO</Text>
            <Text style={S.thQty}>CONSUMO (m³)</Text>
            <Text style={S.thUnit}>PREÇO/m³</Text>
            <Text style={S.thAmount}>TOTAL</Text>
        </View>
        
        {data.products.map((p, i) => (
          <View key={i} style={S.tableRow}>
            <Text style={S.tdProduct}>{p.name}</Text>
            <Text style={S.tdQty}></Text>
            <Text style={S.tdUnit}>{fmt(p.unitPrice, c)}</Text>
            <Text style={S.tdAmount}>.00 MZN</Text>
          </View>
        ))}

        <View style={S.totalsContainer}>
          <View style={S.totalsBlock}>
            <View style={S.totalsRow}>
              <Text>Divida</Text>
              <Text>{money(data.fine, c)}</Text>
            </View>
            <View style={S.totalsRow}>
              <Text>{money(data.fine ?? 0, c)}</Text>
            </View>
            <View style={S.totalsRow}>
              <Text>Subtotal</Text>
              <Text>.00 MZN</Text>
            </View>
            
            
            <View style={S.totalsRowFinal}>
              <Text style={S.totalLabel}>TOTAL</Text>
              <Text>.00 MZN</Text>
            </View>
          </View>
        </View>
        
        {data.notes && (
          <View style={{ marginTop: 80 }}>
            <Text style={S.notesLabel}>NOTAS</Text>
            <Text style={S.notesText}>{data.notes}</Text>
          </View>
        )}

        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            {data.footerText ?? `${data.sender.name}. All Rights Reserved © ${new Date().getFullYear()}`}
          </Text>
          <Text style={S.footerText}>{data.sender.email}</Text>
        </View>

      </Page>
    </Document>
  );
};

const safe = (value: unknown, fallbackValue = "Desconhecido") => {
  if (typeof value !== "string") return fallbackValue;
  return value.trim() ? value : fallbackValue;
};


const generateInvoiceNumber = () => {
  const key = "invoice_counter";

  let current = Number(localStorage.getItem(key) || "0");
  current += 1;

  localStorage.setItem(key, String(current));

  return `EM${String(current).padStart(6, "0")}`;
};

const money = (value: unknown, currency = "MZN") => {
  const num = Number(value);

  if (value === null || value === undefined || isNaN(num)) {
    return `0.00 ${currency}`;
  }

  return `${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${currency}`;
};

const nowdata: string = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
}).toUpperCase();


const sampleInvoice: InvoiceData = {
  sender: {
    name: "Mavingue Água, Lda",
    email: "estaleiromavingue@gmail.com",
    phone: "+258 86 218 0576",
    website: "www.estaleiromavingueonline.com",
    logoUrl: "/mavingue-logo.png",
  },
  client: {
    name: "João da Silva",
    address: "Av. dos Combatentes, Nº 123",
    city: "Maputo",
    email: "texte@gmail.com",
    phone: "+258 84 765 4321",
  },
  invoiceNumber: generateInvoiceNumber(),
  invoiceDate: nowdata,
  debt: 0,
  fine: 0,

  products: [
    { name: "Água Potável", unitPrice: 60 },
  ],

  currency: "MZN",
  notes:
    "Se não for pago no prazo de 11 dias, incidirá multa de 20% ao mês sobre o valor em atraso.\n\nTenha um bom dia e obrigado! \n\nMavingue Água",
};


export default function Faturaagua() {
    
  return (
    <div style={{ height: "100vh" }}>
        <PDFDownloadLink
        document={<CheckOutWatter data={sampleInvoice} />}
        fileName={`fatura-${sampleInvoice.invoiceNumber}.pdf`}
        >Baixar PDF
        </PDFDownloadLink>
    </div>
  );
}