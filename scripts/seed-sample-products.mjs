import "dotenv/config";
import pg from "pg";

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const samples = [
  {
    name_en: "Straw Beach Tote Bag",
    name_ar: "شنطة tote شاطئية من القش",
    description_en: "Spacious woven straw tote with leather handles.",
    description_ar: "شنطة tote من القش المنسوج بمقابض جلد.",
    price: 890,
    compare_price: 1100,
    brand: "Trendy Seasons",
    category_slug: "bags",
    stock: 24,
    is_deal: true,
    discount_percent: 19,
    specs: { Material: "Natural straw", Size: "Large", Color: "Natural beige" },
  },
  {
    name_en: "SPF 50+ Sunscreen Fluid",
    name_ar: "واقي شمس SPF 50+",
    description_en: "Lightweight, non-greasy SPF 50+ fluid.",
    description_ar: "واقي شمس SPF 50+ خفيف غير دهني.",
    price: 450,
    compare_price: 520,
    brand: "La Roche-Posay",
    category_slug: "skincare-sunscreen",
    stock: 50,
    is_deal: true,
    discount_percent: 13,
    specs: { SPF: "50+", Volume: "50ml", Type: "Fluid" },
  },
  {
    name_en: "Linen Scarf — Sand & Coral",
    name_ar: "طرحة كتان — رملي ومرجاني",
    description_en: "Breathable linen scarf in soft sand and coral.",
    description_ar: "طرحة كتان خفيفة بتدرج رملي ومرجاني.",
    price: 320,
    compare_price: 400,
    brand: "Trendy Seasons",
    category_slug: "scarves-wraps",
    stock: 30,
    is_deal: true,
    discount_percent: 20,
    specs: { Material: "100% linen", Size: "180 x 70 cm" },
  },
];

async function main() {
  await client.connect();
  const count = await client.query("SELECT COUNT(*)::int AS c FROM products");
  if (count.rows[0].c > 0) {
    console.log(`Products already exist (${count.rows[0].c}). Skipping seed.`);
    await client.end();
    return;
  }

  for (const p of samples) {
    const cat = await client.query("SELECT id FROM categories WHERE slug = $1", [p.category_slug]);
    const categoryId = cat.rows[0]?.id ?? null;
    await client.query(
      `INSERT INTO products (
        name, name_en, name_ar, description, description_en, description_ar,
        price, compare_price, brand, category_id, stock, is_deal, discount_percent, specs, available
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,true)`,
      [
        p.name_en,
        p.name_en,
        p.name_ar,
        p.description_en,
        p.description_en,
        p.description_ar,
        p.price,
        p.compare_price,
        p.brand,
        categoryId,
        p.stock,
        p.is_deal,
        p.discount_percent,
        JSON.stringify(p.specs),
      ]
    );
    console.log("Seeded:", p.name_en);
  }

  await client.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
