import * as moment from 'moment'
import { PrismaService } from 'src/prisma/prisma.service'
import { sendEmail } from '../common/sendEmail'
import { sendTelegram } from '../common/sendTelegram'

// Проверяем наличие мероприятий для уведомления раз в день
const SEND_INTERVAL = 24 * 60 * 60 * 1000
// Время отправки уведомления - 8:00
const SEND_HOUR = 8

export const eventsNotifier = async (prisma: PrismaService) => {
  const nextSendTime = moment()
    .set('hour', SEND_HOUR)
    .set('minute', 0)
    .set('second', 0)

  if (moment().hour() >= SEND_HOUR) {
    nextSendTime.add(1, 'day')
  }

  const timeToNextSend = nextSendTime.diff(moment())

  setTimeout(() => {
    sendTomorrowEventsNotifications(prisma)
    setInterval(() => sendTomorrowEventsNotifications(prisma), SEND_INTERVAL)
  }, timeToNextSend)
}

const sendTomorrowEventsNotifications = async (prisma: PrismaService) => {
  const tomorrowStart = moment().add(1, 'day').startOf('day').toISOString()
  const tomorrowEnd = moment().add(1, 'day').endOf('day').toISOString()
  const tomorrowEvents = await prisma.events.findMany({
    where: {
      date: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
  })

  for (let event of tomorrowEvents) {
    const participants = await prisma.users.findMany({
      where: {
        events_where_participant: {
          some: {
            id_event: event.id,
          },
        },
      },
    })

    for (let participant of participants) {
      await sendEmail({
        to: participant.email,
        subject: 'TQ Event Notification',
        text: `Event ${event.name} will start in 24 hours`,
        html: `Event <b>${event.name}</b> will start in 24 hours`,
      })

      if (participant.telegram_chat_id) {
        await sendTelegram({
          chatId: participant.telegram_chat_id,
          message: `Event ${event.name} will start in 24 hours`,
        })
      }
    }
  }
}
