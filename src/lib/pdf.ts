import React from 'react'

export type OrderPdfData = {
  id: string
  date: string
  items: { sabor: string; modelo: string; qty: number }[]
}

export type SalesReportData = {
  date: string
  vendas: { hora: string; sabor: string; modelo: string; qty: number }[]
}

export function generateOrderPdf(order: OrderPdfData): React.ReactElement {
  return React.createElement('div', null, JSON.stringify(order))
}

export function generateSalesReportPdf(data: SalesReportData): React.ReactElement {
  return React.createElement('div', null, JSON.stringify(data))
}
