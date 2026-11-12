const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = "adaego123";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "";
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "";

const customers = new Map();
const orders = [];
const BUSINESS_NAME = "Nigeria Style Hub";
const PHONE = "09117104081";

function mainMenu() {
  return `Welcome to ${BUSINESS_NAME} 💛\nI be Adaego, your AI assistant.\n\nReply with number:\n\n1️⃣ *1* - See Menu\n2️⃣ *2* - See Price\n3️⃣ *3* - Place Order\n4️⃣ *4* - Talk to Human\n\nOr type *Hi* anytime to start again.`;
}
function menuMsg() {
  return `*MENU - ${BUSINESS_NAME}*\n\nWe dey build WhatsApp AI for business:\n✅ Auto-reply 24/7\n✅ Menu & Price\n✅ Order taking\n✅ Payment follow-up\n\nType *2* to see Price\nType *3* to Order\nType *0* to go back to Main Menu`;
}
function priceMsg() {
  return `*PRICE LIST*\n\n1️⃣ SMALL - ₦50,000\nWhatsApp AI, Auto-reply, Menu & Price\n\n2️⃣ MEDIUM - ₦100,000\nEverything for SMALL + Order Tracking + Google Sheet\n\n3️⃣ LARGE - ₦200,000\nEverything for MEDIUM + Full AI Brain + Payment Follow-up\n\nType *3* to Order now\nType *0* for Main Menu`;
}
function humanMsg() {
  return `No wahala! Human go attend to you soon 🙏\n\nCall/WhatsApp us: ${PHONE}\nWe dey reply within 1 hour (9am - 8pm).\n\nType *0* to go back to menu.`;
}

function handleMessage(phone, textRaw) {
  const text = textRaw.toLowerCase().trim();
  let user = customers.get(phone);
  if (!user) { user = { step: "start" }; customers.set(phone, user); }

  if (text === "0" || text === "hi" || text === "hello" || text === "menu") {
    user.step = "start";
    return mainMenu();
  }
  if (user.step === "ask_name") {
    user.name = textRaw; user.step = "ask_business";
    return `Nice to meet you ${user.name} 💛\n\nWetin be your business name?`;
  }
  if (user.step === "ask_business") {
    user.business = textRaw; user.step = "ask_package";
    return `Good! ${user.business} - nice name.\n\nWhich package you want?\nType: *SMALL* or *MEDIUM* or *LARGE*`;
  }
  if (user.step === "ask_package") {
    if (text.includes("small") || text.includes("medium") || text.includes("large")) {
      user.package = text.toUpperCase(); user.step = "ask_location";
      return `You choose *${user.package}* ✅\n\nLast one: Where you dey?\nExample: Aba, Port Harcourt, Lagos`;
    } else { return `Abeg type *SMALL*, *MEDIUM* or *LARGE* only.`; }
  }
  if (user.step === "ask_location") {
    user.location = textRaw; user.step = "ask_confirm";
    return `Confirm your order 👇\n\nName: ${user.name}\nBusiness: ${user.business}\nPackage: ${user.package}\nLocation: ${user.location}\n\nType *YES* to confirm\nType *NO* to start again`;
  }
  if (user.step === "ask_confirm") {
    if (text === "yes" || text === "confirm") {
      user.step = "done";
      orders.push({ ...user, phone, date: new Date().toISOString() });
      return `DONE! 🎉 Thank you ${user.name}!\n\nYour ${user.package} order for ${user.business} don enter.\n\nWe go call you for ${phone} to confirm payment.\n\nType *0* to go back to menu.`;
    }
    if (text === "no") { user.step = "ask_name"; return `No wahala, make we start again.\n\nWetin be your name?`; }
    return `Abeg type *YES* or *NO* only.`;
  }
  if (text === "1") return menuMsg();
  if (text === "2") return priceMsg();
  if (text === "3") { user.step = "ask_name"; return `Make we start your order 🎉\n\nWetin be your name?`; }
  if (text === "4") return humanMsg();
  return `I no understand that one o 😅\n\n${mainMenu()}`;
}
// WhatsApp go use this to verify
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
app.post('/webhook', (req, res) => {
  const phone = req.body.phone || req.body.from || "test-user";
  const message = req.body.message || req.body.text || req.body.Body || "";
  const reply = handleMessage(phone, message);
  res.json({ reply: reply });
});

app.get('/', (req, res) => {
  res.send("Adaego Rule-Based Bot is LIVE! Nigeria Style Hub");
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => console.log(`Adaego running on ${PORT}`));
