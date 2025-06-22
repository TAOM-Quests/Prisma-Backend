import * as moment from 'moment'
import { PrismaService } from 'src/prisma/prisma.service'
import { sendEmail } from '../common/sendEmail'
import { sendTelegram } from '../common/sendTelegram'
import { PrismaClient } from '@prisma/client'

// Проверяем наличие мероприятий для уведомления раз в день
const SEND_INTERVAL = 24 * 60 * 60 * 1000
// Время отправки уведомления - 8:00
const SEND_HOUR = 8

const prisma = new PrismaClient()

export const eventsNotifier = async () => {
  const nextSendTime = moment()
    .set('hour', SEND_HOUR)
    .set('minute', 0)
    .set('second', 0)

  if (moment().hour() >= SEND_HOUR) {
    nextSendTime.add(1, 'day')
  }

  const timeToNextSend = nextSendTime.diff(moment())

  setTimeout(() => {
    sendTomorrowEventsNotifications()
    setInterval(() => sendTomorrowEventsNotifications(), SEND_INTERVAL)
  }, timeToNextSend)
}

const sendTomorrowEventsNotifications = async () => {
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
      const participantNotificationsSettings =
        await prisma.user_notifications_settings.findUnique({
          where: {
            user_id_type_id: {
              user_id: participant.id,
              type_id: 1,
            },
          },
        })

      if (participantNotificationsSettings.email) {
        await sendEmail({
          to: participant.email,
          subject: 'TQ Event Notification',
          text: `Event ${event.name} will start in 24 hours`,
          html: `Event <b>${event.name}</b> will start in 24 hours`,
        })
      }

      if (
        participant.telegram_chat_id &&
        participantNotificationsSettings.telegram
      ) {
        await sendTelegram({
          chatId: participant.telegram_chat_id,
          message: `Event ${event.name} will start in 24 hours`,
        })
      }
    }
  }
}
