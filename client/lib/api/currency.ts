// CBU API javobining tipi
interface CbuCurrency {
  id: number;
  Code: string;
  Ccy: string; // "USD"
  CcyNm_RU: string;
  CcyNm_UZ: string;
  CcyNm_UZC: string;
  CcyNm_EN: string;
  Nominal: string;
  Rate: string; // "12800.00"
  Diff: string;
  Date: string;
}

export async function getUsdRate(): Promise<string | null> {
  try {
    const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/', {
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      console.error("CBU API ishlamadi");
      return null;
    }

    const data: CbuCurrency[] = await res.json();

    const usd = data.find((item) => item.Ccy === 'USD');

    return usd ? usd.Rate : null;

  } catch (error) {
    console.error("Valyuta olishda xatolik:", error);
    return null;
  }
}