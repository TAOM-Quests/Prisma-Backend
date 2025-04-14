import * as moment from "moment";
import { PrismaService } from "src/prisma/prisma.service"

// Проверяем наличие мероприятий для уведомления раз в день
const LOOP_INTERVAL = 24* 60 *60 * 1000

const sendTomorrowEventsNotifications = async (prisma: PrismaService) => {
  const tomorrowStart = moment().add(1, 'day').startOf('day').toISOString()
  const tomorrowEnd = moment().add(1, 'day').endOf('day').toISOString()
  const tomorrowEvents = await prisma.events.findMany({
    where: {
      date: {
        gte: tomorrowStart,
        lte: tomorrowEnd
      }
    }
  })

  
}

export const eventsNotifier = async (prisma: PrismaService) => {
  await sendTomorrowEventsNotifications(prisma)

  setInterval(() => sendTomorrowEventsNotifications(prisma), LOOP_INTERVAL)
}