import { api } from './api.service';

export type StartPaymentRequest = {
  items: { productId: number; quantity: number }[];
  paymentMethodId?: string;
  paymentConfigId?: number;
  paymentType?: string;
  installments?: number;
  receiveOnDelivery?: boolean;
};

export type StartPaymentResponse = {
  orderId: number;
  total: number;
  status: string;
  payment: { provider: string; status: string; transactionId?: string };
};

export const paymentService = {
  async startPayment(data: StartPaymentRequest): Promise<StartPaymentResponse> {
    const response = await api.post<StartPaymentResponse>('/loja/pedidos', data);
    return response.data;
  },
};
