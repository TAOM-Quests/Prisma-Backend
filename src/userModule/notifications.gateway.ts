import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'http'

export interface Notification {
  name: string
  type: string
  imageUrl: string
  description: string
}

@WebSocketGateway(3050, { namespace: 'notifications' })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server

  sendNotification(data: Notification) {
    console.log('WS WORK')

    this.server.emit('notification', data)
  }
}
