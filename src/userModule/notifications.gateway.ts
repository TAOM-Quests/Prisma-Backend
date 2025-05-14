import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

export interface Notification {
  name: string
  type: string
  imageUrl: string
  description: string
}

@WebSocketGateway(3050, { namespace: 'notifications', cors: '*' })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server

  sendNotification(data: Notification) {
    this.server.emit('notification', data)
  }
}
