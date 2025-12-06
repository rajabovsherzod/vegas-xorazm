import qz from "qz-tray";
import { Order } from "./order.service"; // Frontenddagi order tipi
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

// 🔥 MUHIM: Printeringiz nomi (Linux CUPS da qo'yilgan nom)
// Agar hali nom qo'ymagan bo'lsangiz, "" qoldiring (Default printerga chiqaradi)
const PRINTER_NAME = "POS-80"; 

export const printService = {
  
  // 1. QZ TRAY BILAN ULANISH
  init: async () => {
    if (!qz.websocket.isActive()) {
      try {
        await qz.websocket.connect();
      } catch (err) {
        console.error("QZ Tray ulanmadi. Dastur yoniqmi?", err);
        throw new Error("QZ Tray dasturini kompyuterga o'rnating va ishga tushiring!");
      }
    }
  },

  // 2. CHEK CHIQARISH
  printReceipt: async (order: Order) => {
    await printService.init();

    // 🔥 FIX: TypeScript xatosini yo'qotish uchun "as any" ishlatamiz.
    // Aslida kutubxona 2 ta argument qabul qiladi, shunchaki Type definition xato.
    const config = (qz.configs as any).create(PRINTER_NAME || null, { 
      scaleContent: true, 
      size: { width: 80, height: null }, // 80mm
      units: 'mm' 
    });

    // HTML shablonni yasash
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
      throw err;
    }
  }
};

// 🔥 HTML SHABLON YASOVCHI
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
    
    // Agar sotilgan narx < asl narx bo'lsa, chegirma bor
    const hasDiscount = soldPrice < originalPrice;

    return `
      <div style="margin-bottom: 5px; border-bottom: 1px dashed #000; padding-bottom: 2px;">
        <div style="font-weight: bold; font-size: 12px;">${item.product?.name || "Mahsulot"}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <div style="width: 40%;">
            ${hasDiscount 
              ? `<span style="text-decoration: line-through; color: #555; font-size: 9px;">${formatCurrency(originalPrice, "UZS")}</span><br/>` 
              : ''}
            ${formatCurrency(soldPrice, "UZS")}
          </div>
          <div style="width: 20%; text-align: center;">x${Number(item.quantity)}</div>
          <div style="width: 40%; text-align: right; font-weight: bold;">${formatCurrency(total, "UZS")}</div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: monospace; width: 78mm; margin: 0; padding: 2px; color: #000;">
      
      <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 5px;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">VEGAS SYSTEM</h2>
        <p style="margin: 2px 0; font-size: 11px;">Tel: +998 90 123 45 67</p>
      </div>

      <div style="font-size: 11px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
        <div style="display: flex; justify-content: space-between;"><span>Chek:</span> <b>#${order.id}</b></div>
        <div style="display: flex; justify-content: space-between;"><span>Sana:</span> <span>${date}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Kassir:</span> <span>${order.seller?.fullName || "Kassir"}</span></div>
        <div style="display: flex; justify-content: space-between;"><span>Mijoz:</span> <span>${order.customerName || "—"}</span></div>
      </div>

      <div style="margin-bottom: 10px;">
        ${itemsHtml}
      </div>

      <div style="font-size: 12px; margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Jami:</span> <span>${formatCurrency(itemsSubtotal, "UZS")}</span>
        </div>
        
        ${discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Chegirma:</span> <span>-${formatCurrency(discountAmount, "UZS")}</span>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; margin-top: 5px; border-top: 2px solid #000; padding-top: 5px;">
          <span>TO'LOV:</span> <span>${formatCurrency(finalPayable, "UZS")}</span>
        </div>
        
        ${totalSavings > 0 ? `
          <div style="margin-top: 5px; text-align: center; font-size: 11px; border-top: 1px dashed #000; padding-top: 2px;">
            Siz <b>${formatCurrency(totalSavings, "UZS")}</b> tejadingiz!
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px;">
        <p style="font-weight: bold; margin-bottom: 2px;">XARIDINGIZ UCHUN RAHMAT!</p>
        <p>Ilova orqali savdo qilindi</p>
      </div>

    </body>
    </html>
  `;
}