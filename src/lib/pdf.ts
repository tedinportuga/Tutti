import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowLabel: {
    fontWeight: 'bold',
    width: '50%',
  },
  rowValue: {
    textAlign: 'right',
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

export type OrderPdfData = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  createdAt: Date;
  items: Array<{
    sabor: string;
    quantidade: number;
    tamanho?: string;
  }>;
  observations?: string;
  total?: number;
};

/**
 * Generate order receipt PDF
 */
export function generateOrderPdf(order: OrderPdfData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TUTTI PIZZERIA</Text>
          <Text style={styles.subtitle}>Recibo de Encomenda</Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Encomenda #:</Text>
            <Text style={styles.rowValue}>{order.orderId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Data:</Text>
            <Text style={styles.rowValue}>{order.createdAt.toLocaleDateString('pt-PT')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Hora:</Text>
            <Text style={styles.rowValue}>{order.createdAt.toLocaleTimeString('pt-PT')}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Nome:</Text>
            <Text style={styles.rowValue}>{order.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Telefone:</Text>
            <Text style={styles.rowValue}>{order.customerPhone}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pizzas Encomendadas</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.rowLabel}>
                {item.quantidade}x {item.sabor}
                {item.tamanho && ` (${item.tamanho})`}
              </Text>
              <Text style={styles.rowValue}></Text>
            </View>
          ))}
        </View>

        {/* Observations */}
        {order.observations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{order.observations}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Obrigado pela sua encomenda!</Text>
          <Text>Tutti Pizzeria • Algarve, Portugal</Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generate sales report PDF (for manager)
 */
export type SalesReportData = {
  period: string;
  totalSales: number;
  totalQuantity: number;
  topPizzas: Array<{ sabor: string; quantidade: number }>;
  byModel: Record<string, number>;
};

export function generateSalesReportPdf(report: SalesReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TUTTI PIZZERIA</Text>
          <Text style={styles.subtitle}>Relatório de Vendas - {report.period}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total de Vendas:</Text>
            <Text style={styles.rowValue}>{report.totalSales}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Pizzas Vendidas:</Text>
            <Text style={styles.rowValue}>{report.totalQuantity}</Text>
          </View>
        </View>

        {/* Top Pizzas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pizzas Mais Vendidas</Text>
          {report.topPizzas.map((pizza, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.rowLabel}>{pizza.sabor}</Text>
              <Text style={styles.rowValue}>{pizza.quantidade} un.</Text>
            </View>
          ))}
        </View>

        {/* By Model */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendas por Modelo</Text>
          {Object.entries(report.byModel).map(([model, count]) => (
            <View key={model} style={styles.row}>
              <Text style={styles.rowLabel}>{model}</Text>
              <Text style={styles.rowValue}>{count}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Relatório gerado automaticamente</Text>
        </View>
      </Page>
    </Document>
  );
}
