/**
 * Test script for Cohere Chat API - run with: node scripts/test-chat-api.mjs
 * Requires COHERE_API_KEY in env (or .env.local loaded via dotenv)
 */
import { CohereClientV2 } from "cohere-ai";

const COHERE_KEY = process.env.COHERE_API_KEY;
if (!COHERE_KEY) {
  console.error("ERROR: COHERE_API_KEY not set. Add to .env.local or run: COHERE_API_KEY=your_key node scripts/test-chat-api.mjs");
  process.exit(1);
}

const cohere = new CohereClientV2({ token: COHERE_KEY });

async function test() {
  console.log("Testing Cohere chatStream API...\n");

  const stream = await cohere.chatStream({
    model: "command-a-03-2025",
    messages: [
      { role: "system", content: "You are a helpful assistant. Reply briefly in one sentence." },
      { role: "user", content: "What is 2+2? Reply in one word." },
    ],
  });

  let fullText = "";
  let eventCount = 0;

  for await (const event of stream) {
    eventCount++;
    if (event.type === "content-delta") {
      const delta = event.delta;
      const content = delta?.message?.content;
      const text = typeof content === "string" ? content : content?.text ?? "";
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
      // Debug: log first content-delta structure
      if (eventCount === 2) {
        console.log("\n\n[DEBUG] First content-delta structure:");
        console.log(JSON.stringify({ delta: delta }, null, 2));
      }
    }
  }

  console.log("\n\n---");
  console.log("Extracted text length:", fullText.length);
  console.log("Full response:", fullText);
  console.log("\nTest passed.");
}

test().catch((err) => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
