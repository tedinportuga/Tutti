const API_URL = process.env.EVOLUTION_API_URL!;
const API_KEY = process.env.EVOLUTION_API_KEY!;
const GERENTE_WHATSAPP = process.env.GERENTE_WHATSAPP!;

export type WhatsAppMessage = {
  number: string;
  text: string;
};

/**
 * Send WhatsApp message via Evolution API
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        number: message.number,
        text: message.text,
      }),
    });

    if (!response.ok) {
      console.error('WhatsApp API error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

/**
 * Send order confirmation to customer
 */
export async function sendOrderConfirmation(
  customerNumber: string,
  orderId: string,
  pizzaName: string,
  quantity: number
): Promise<boolean> {
  const message = `Olá! 🍕\n\nSua encomenda #${orderId} foi registada com sucesso!\n\n📋 Detalhes:\n- Pizza: ${pizzaName}\n- Quantidade: ${quantity}\n\nAguarde a confirmação final.\n\nTutti Pizzeria`;

  return sendWhatsAppMessage({
    number: customerNumber,
    text: message,
  });
}

/**
 * Notify manager of new order
 */
export async function notifyManagerNewOrder(
  orderId: string,
  pizzaName: string,
  quantity: number,
  customerNumber: string,
  observations?: string
): Promise<boolean> {
  const obs = observations ? `\nObs: ${observations}` : '';
  const message = `🔔 NOVA ENCOMENDA\n\nID: #${orderId}\nPizza: ${pizzaName}\nQtd: ${quantity}\nCliente: ${customerNumber}${obs}`;

  return sendWhatsAppMessage({
    number: GERENTE_WHATSAPP,
    text: message,
  });
}

/**
 * Send order ready notification
 */
export async function sendOrderReadyNotification(
  customerNumber: string,
  orderId: string
): Promise<boolean> {
  const message = `✅ Sua pizza #${orderId} está pronta!\n\nVenha buscar na Tutti Pizzeria 🍕`;

  return sendWhatsAppMessage({
    number: customerNumber,
    text: message,
  });
}

/**
 * Send estimated time message
 */
export async function sendEstimatedTime(
  customerNumber: string,
  orderId: string,
  minutes: number
): Promise<boolean> {
  const message = `⏱️ Sua pizza #${orderId} estará pronta em aproximadamente ${minutes} minutos.\n\nObrigado pela paciência! 🍕`;

  return sendWhatsAppMessage({
    number: customerNumber,
    text: message,
  });
}
