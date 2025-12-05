import postgres from 'postgres';
import 'dotenv/config';
import { env } from 'process';

// .env fayldan DATABASE_URL ni oladi
const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL topilmadi!');
}

const sql = postgres(connectionString);

async function main() {
  console.log("🔥 price_history jadvali o'chirilmoqda...");
  
  // Jadvalni butunlay o'chirib yuboramiz
  await sql`DROP TABLE IF EXISTS price_history CASCADE`;
  
  console.log("✅ Jadval o'chirildi! Endi bemalol push qilsang bo'ladi.");
  process.exit(0);
}

main();