import { NextRequest, NextResponse } from "next/server";
import { CohereClientV2 } from "cohere-ai";
import { getProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const COHERE_KEY = process.env.COHERE_API_KEY;

export async function POST(request: NextRequest) {
  if (!COHERE_KEY) {
    return NextResponse.json({ error: "Chat not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { messages = [] } = body as { messages?: { role: string; content: string }[]; locale?: string };

    const products = await getProducts();

    const productsText = products
      .map(
        (p) =>
          `- ${p.name_en} / ${p.name_ar} | Brand: ${p.brand} | Price: ${formatPrice(p.price)} EGP | ${p.description_en || ""} | Details: ${JSON.stringify(p.specs || {})}`
      )
      .join("\n");

    const systemPrompt = `You are a helpful assistant for Trendy Seasons, a summer fashion and beauty store in Egypt. You ONLY answer questions about:
1. Products in our catalog (bags, scarves, makeup, skincare, sunscreen, sunglasses, accessories, summer dresses, sandals)
2. Summer style, outfit ideas, beauty and skincare advice relevant to shopping at our store
3. Product details like shades, sizes, SPF, materials, and care

You have access to our current catalog:

PRODUCTS:
${productsText}

RULES:
- Answer ONLY about our products, summer fashion, beauty, or related shopping questions. If asked about unrelated topics, politely say you can only help with Trendy Seasons products and style questions.
- Respond in the SAME language as the user: if they write in English, reply in English; if they write in Arabic (including Egyptian dialect), reply in Egyptian Arabic (اللهجة المصرية).
- Use Egyptian pounds (ج.م or EGP) for prices.
- Be warm, friendly, and concise. Recommend products from our catalog when relevant.
- If a product isn't in our catalog, say we don't have it and suggest alternatives we do have.`;

    const cohere = new CohereClientV2({ token: COHERE_KEY });

    const apiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      })),
    ];

    const stream = await cohere.chatStream({
      model: "command-a-03-2025",
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if ((event as { type?: string }).type !== "content-delta") continue;
            const delta = (event as { delta?: { message?: { content?: { text?: string } } } }).delta;
            const content = delta?.message?.content;
            const text = typeof content === "string" ? content : content?.text ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[Chat API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
