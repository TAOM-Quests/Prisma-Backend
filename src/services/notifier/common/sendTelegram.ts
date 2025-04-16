import { PrismaService } from "src/prisma/prisma.service";
import { TelegramMessage } from "../interface/telegram";

const TelegramBot = require('node-telegram-bot-api')

const token = '7487340014:AAEVre0muveJ3RdSr1ir0CTAgA82S4y_loQ'
const bot = new TelegramBot(token, { polling: true })

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText === '/start') {
    bot.sendMessage(chatId, 'Welcome to the bot!');

    const tgUsername = msg.from.username
    const prisma = new PrismaService()

    await prisma.users.update({ where: { telegram: tgUsername }, data: { telegram_chat_id: msg.chat.id } })
  }
});

export const sendTelegram = async ({chatId, message}: TelegramMessage) => {
  await bot.sendMessage(chatId, message)
}