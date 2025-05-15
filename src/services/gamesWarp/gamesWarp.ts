import moment from 'moment'
import { wordleWarp } from './wordle/wordleWarp'

// Обновляем игры каждый 24 часа
const WARP_INTERVAL = 24 * 60 * 60 * 1000
// Время обновления игры - 00:00
const WARP_HOUR = 0

export const gamesWarp = () => {
  const nextSendTime = moment()
    .set('hour', WARP_HOUR)
    .set('minute', 0)
    .set('second', 0)

  if (moment().hour() >= WARP_HOUR) {
    nextSendTime.add(1, 'day')
  }

  const timeToNextSend = nextSendTime.diff(moment())

  setTimeout(() => {
    warp()
    setInterval(() => warp(), WARP_INTERVAL)
  }, timeToNextSend)
}

const warp = () => {
  wordleWarp()
}
