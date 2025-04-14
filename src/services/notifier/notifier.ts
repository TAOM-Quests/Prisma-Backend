import { PrismaService } from "src/prisma/prisma.service"
import { eventsNotifier } from "./events/eventsNotifier"

export const notifier = () => {
  console.log('START NOTIFIER')

  const prisma = new PrismaService()

  eventsNotifier(prisma)
}