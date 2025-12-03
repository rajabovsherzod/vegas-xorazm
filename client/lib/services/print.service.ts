/**
 * Print Service - QZ Tray Integration
 * 
 * USB chek apparatdan chek chiqarish uchun
 * QZ Tray desktop app o'rnatilishi kerak
 */

import { Order } from "@/lib/services/order.service";
import qz from "qz-tray";

export class PrintService {
  private static instance: PrintService;
  private isConnected = false;

  private constructor() { }

  static getInstance(): PrintService {
    if (!PrintService.instance) {
      PrintService.instance = new PrintService();
    }
    return PrintService.instance;
  }

  /**
   * QZ Tray ga ulanish
   */
  async connect(): Promise<boolean> {
    if (typeof window === 'undefined') {
      throw new Error('QZ Tray faqat browser muhitida ishlaydi');
    }

    try {
      if (!this.isConnected) {
        await qz.websocket.connect();
        this.isConnected = true;
      }
      return true;
    } catch (error: any) {
      this.isConnected = false;
      throw new Error(`QZ Tray ga ulanishda xatolik: ${error.message}`);
    }
  }

  /**
   * QZ Tray dan uzilish
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await qz.websocket.disconnect();
        this.isConnected = false;
      } catch (error) {
        console.error('QZ Tray dan uzilishda xatolik:', error);
      }
    }
  }

  /**
   * Chek chiqarish
   */
  async printReceipt(order: Order): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    // ESC/POS formatida chek tayyorlash
    const receipt = this.formatReceipt(order);

    try {
      // QZ Tray orqali printerga yuborish
      // QZ Tray 2.2 API
      const config = qz.configs.create(); // Default printer

      // ESC/POS raw data yuborish
      await qz.print(config, [
        {
          type: 'raw',
          format: 'command',
          data: receipt,
        },
      ]);
    } catch (error: any) {
      throw new Error(`Chek chiqarishda xatolik: ${error.message}`);
    }
  }

  /**
   * ESC/POS formatida chek tayyorlash
   */
  private formatReceipt(order: Order): string {
    const ESC = '\x1B';
    const GS = '\x1D';
    const LF = '\x0A';

    let receipt = '';

    // Printerni sozlash
    receipt += ESC + '@'; // Reset printer
    receipt += ESC + 'a' + '\x01'; // Center align

    // Header
    receipt += ESC + '!' + '\x08'; // Bold, double height
    receipt += 'VEGAS CRM' + LF;
    receipt += ESC + '!' + '\x00'; // Normal
    receipt += 'Savdo tizimi' + LF;
    receipt += '='.repeat(32) + LF;
    receipt += LF;

    // Chek ma'lumotlari
    receipt += ESC + 'a' + '\x00'; // Left align
    receipt += `Chek #${order.id}` + LF;
    receipt += `Sana: ${new Date(order.createdAt).toLocaleString('uz-UZ')}` + LF;

    if (order.seller) {
      receipt += `Sotuvchi: ${order.seller.fullName || order.seller.username}` + LF;
    }

    if (order.cashier) {
      receipt += `Kassir: ${order.cashier.fullName || order.cashier.username}` + LF;
    }

    receipt += '-'.repeat(32) + LF;
    receipt += LF;

    // Mahsulotlar ro'yxati
    receipt += ESC + '!' + '\x01'; // Bold
    receipt += 'Mahsulot'.padEnd(20) + 'Miqdor'.padStart(6) + 'Summa'.padStart(10) + LF;
    receipt += ESC + '!' + '\x00'; // Normal
    receipt += '-'.repeat(32) + LF;

    order.items?.forEach((item: any) => {
      const productName = (item.product?.name || 'Noma\'lum').substring(0, 18);
      const quantity = String(item.quantity);
      const price = new Intl.NumberFormat('uz-UZ').format(Number(item.totalPrice));

      // Agar USD bo'lsa
      if (item.originalCurrency === 'USD') {
        const usdPrice = (Number(item.price) / Number(order.exchangeRate)).toFixed(2);
        receipt += `${productName}`.padEnd(20) + `${quantity}`.padStart(6) + `${price}`.padStart(10) + LF;
        receipt += `  $${usdPrice}`.padEnd(20) + LF;
      } else {
        receipt += `${productName}`.padEnd(20) + `${quantity}`.padStart(6) + `${price}`.padStart(10) + LF;
      }
    });

    receipt += '-'.repeat(32) + LF;
    receipt += LF;

    // Jami summa
    receipt += ESC + 'a' + '\x02'; // Right align
    receipt += ESC + '!' + '\x01'; // Bold

    // Agar USD mahsulotlar bo'lsa
    const hasUSDItems = order.items?.some((item: any) => item.originalCurrency === 'USD');
    if (hasUSDItems) {
      const totalUSD = order.items?.reduce((sum: number, item: any) => {
        if (item.originalCurrency === 'USD') {
          return sum + (Number(item.price) / Number(order.exchangeRate)) * Number(item.quantity);
        }
        return sum;
      }, 0) || 0;
      receipt += `Jami (USD): $${totalUSD.toFixed(2)}` + LF;
    }

    receipt += `Jami: ${new Intl.NumberFormat('uz-UZ').format(Number(order.finalAmount))} so'm` + LF;
    receipt += ESC + '!' + '\x00'; // Normal
    receipt += LF;

    // To'lov usuli
    receipt += ESC + 'a' + '\x00'; // Left align
    const paymentMethods: Record<string, string> = {
      cash: 'Naqd',
      card: 'Karta',
      transfer: 'O\'tkazma',
      debt: 'Nasiya',
    };
    receipt += `To'lov: ${paymentMethods[order.paymentMethod] || order.paymentMethod}` + LF;
    receipt += LF;

    // Footer
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += 'Rahmat!' + LF;
    receipt += 'Qayta tashrif buyurganingiz uchun' + LF;
    receipt += LF;
    receipt += LF;
    receipt += LF;

    // Chekni kesish
    receipt += GS + 'V' + '\x41' + '\x03'; // Cut paper

    return receipt;
  }

  /**
   * QZ Tray mavjudligini tekshirish
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }
}

export const printService = PrintService.getInstance();

