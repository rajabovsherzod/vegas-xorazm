import qz from "qz-tray";
import { Order } from "./order.service"; 
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

// 🔥 DIQQAT: Sizning printeringiz nomi shu yerda!
const EXACT_PRINTER_NAME = "POSPrinter POS80";

export const printService = {
  
  init: async () => {
    if (!qz.websocket.isActive()) {
      try {
        await qz.websocket.connect();
      } catch (err) {
        console.error("QZ Tray ulanmadi", err);
        alert("QZ Tray dasturi yoniqmi? Iltimos tekshiring!");
        throw err;
      }
    }
  },

  findPrinter: async () => {
    try {
      const printers = await qz.printers.find();
      console.log("Mavjud printerlar ro'yxati:", printers);

      // 1. Aniq nom bo'yicha qidiramiz
      const found = printers.find((p: string) => p === EXACT_PRINTER_NAME);
      if (found) {
        console.log(`✅ Printer topildi: ${found}`);
        return found;
      }

      // 2. Agar topilmasa, nomida "POSPrinter" borini qidiramiz (zaxira)
      const similar = printers.find((p: string) => p.includes("POSPrinter"));
      if (similar) {
        console.log(`⚠️ Aniq nom topilmadi, lekin o'xshashi topildi: ${similar}`);
        return similar;
      }

      // Agar hech narsa topilmasa
      alert(`DIQQAT: "${EXACT_PRINTER_NAME}" nomli printer topilmadi!\nQZ Tray sozlamalarini tekshiring.`);
      throw new Error("Printer topilmadi");

    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  printReceipt: async (order: Order) => {
    await printService.init();
    const printerName = await printService.findPrinter();

    // 80mm chek sozlamalari
    const config = (qz.configs as any).create(printerName, { 
      scaleContent: true, 
      size: { width: 72, height: null }, // 72mm (80mm qog'ozning bosiladigan qismi)
      units: 'mm', 
      margins: 0 
    });

    const htmlData = generateReceiptHTML(order);

    const data = [
      {
        type: 'html',
        format: 'plain', 
        data: htmlData
      }
    ];

    try {
      await qz.print(config, data);
    } catch (err) {
      console.error("Chop etishda xatolik:", err);
      alert("Xatolik! Printer qog'ozi tugamaganmi yoki qopqog'i yopiqmi?");
    }
  }
};

// --- HTML SHABLON ---
function generateReceiptHTML(order: Order) {
  const date = format(new Date(order.createdAt), "dd.MM.yyyy HH:mm");
  const originalTotal = Number(order.totalAmount);
  const finalPayable = Number(order.finalAmount);
  const discountAmount = Number(order.discountAmount || 0);
  const itemsSubtotal = order.items?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;
  const totalSavings = originalTotal - finalPayable;

  const itemsHtml = order.items?.map((item: any) => {
    const originalPrice = Number(item.originalPrice);
    const soldPrice = Number(item.price);
    const total = Number(item.totalPrice);
    const hasDiscount = soldPrice < originalPrice;

    return `
      <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #ccc;">
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">${item.product?.name || "Mahsulot"}</div>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
          <div style="width: 35%;">
            ${hasDiscount 
              ? `<span style="text-decoration: line-through; color: #888; font-size: 10px;">${formatCurrency(originalPrice, "UZS")}</span><br/>` 
              : ''}
            ${formatCurrency(soldPrice, "UZS")}
          </div>
          <div style="width: 20%; text-align: center;">x${Number(item.quantity)}</div>
          <div style="width: 45%; text-align: right; font-weight: bold;">${formatCurrency(total, "UZS")}</div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 72mm; margin: 0; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .flex { display: flex; justify-content: space-between; }
        .border-b { border-bottom: 1px dashed #000; }
        .border-t { border-top: 1px dashed #000; }
        .border-double { border-bottom: 3px double #000; }
        .mb-2 { margin-bottom: 8px; }
        .pb-2 { padding-bottom: 8px; }
        .pt-2 { padding-top: 8px; }
        .text-lg { font-size: 16px; }
        .text-xl { font-size: 20px; }
        .text-sm { font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="center border-double mb-2 pb-2">
        <h1 class="text-xl bold" style="margin: 0;">VEGAS MARKET</h1>
        <p style="margin: 2px 0;">Xorazm, Urganch sh.</p>
        <p style="margin: 2px 0;">Tel: +998 90 123 45 67</p>
      </div>
      <div class="border-b mb-2 pb-2 text-sm">
        <div class="flex"><span>Chek:</span> <span class="bold">#${order.id}</span></div>
        <div class="flex"><span>Sana:</span> <span>${date}</span></div>
        <div class="flex"><span>Kassir:</span> <span>${order.seller?.fullName || "Kassir"}</span></div>
        <div class="flex"><span>Mijoz:</span> <span>${order.customerName || "—"}</span></div>
      </div>
      <div class="mb-2">${itemsHtml}</div>
      <div class="mb-2">
        <div class="flex"><span>Jami:</span> <span>${formatCurrency(itemsSubtotal, "UZS")}</span></div>
        ${discountAmount > 0 ? `<div class="flex bold" style="margin-top: 2px;"><span>Chegirma:</span> <span>-${formatCurrency(discountAmount, "UZS")}</span></div>` : ''}
        <div class="flex border-t border-b text-lg bold pt-2 pb-2" style="margin-top: 5px;"><span>TO'LOV:</span> <span>${formatCurrency(finalPayable, "UZS")}</span></div>
        ${totalSavings > 0 ? `<div class="center text-sm pt-2">Siz <b>${formatCurrency(totalSavings, "UZS")}</b> tejadingiz!</div>` : ''}
      </div>
      <div class="center border-t pt-2" style="margin-top: 15px;">
        <p class="bold" style="margin-bottom: 2px;">XARIDINGIZ UCHUN RAHMAT!</p>
        <p class="text-sm">Baraka toping!</p>
        <p style="font-size: 9px; margin-top: 5px; color: #555;">Power by Vegas System</p>
      </div>
    </body>
    </html>
  `;
}