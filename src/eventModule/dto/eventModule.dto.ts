import { ApiProperty } from "@nestjs/swagger"
import { JsonArray } from "@prisma/client/runtime/library"

export interface GetEventsMinimizeQuery {
  department?: number
  date?: Date
  executor?: number
  participant?: number
  type?: number
}

export interface GetEventParams {
  id: number
}

export class CreateEventDto {
  @ApiProperty({
    example: 1,
    required: true
  })
  departmentId: number
  
  @ApiProperty({
    example: 'Open Doors... to Hell',
    required: false
  })
  name?: string
  
  @ApiProperty({
    example: 'Hello, we want to you all burn!!!',
    required: false
  })
  description?: string

  @ApiProperty({
    example: new Date('03-04-2025'),
    required: false
  })
  date?: Date
  
  @ApiProperty({
    example: 20,
    required: false
  })
  seatsNumber?: number
  
  @ApiProperty({
    example: [
      {
        is_online: false,
        address: 'Yagodnoe, forest, TAOM',
        officeNumber: 'C-404',
        floor: 4
      },
      {
        is_online: true,
        connection_link: 'https://zoom.com/...',
        identifier: '7813963421',
        access_code: 'UDFfi34SD',
        record_link: 'https://youtube.com/...'
      }
    ],
    required: false
  })
  places?: JsonArray[]

  @ApiProperty({
    example: [{
      timeEnd: new Date('2025-04-02 09:00'),
      timeStart: new Date('2025-04-02 10:00'),
    }],
    required: false
  })
  schedule?: JsonArray[]
  
  @ApiProperty({
    example: [1, 2],
    required: false
  })
  executorsIds?: number[]

  @ApiProperty({
    example: 20,
    required: false
  })
  statusId?: number

  @ApiProperty({
    example: 10,
    required: false
  })
  typeId?: number
}

export class UpdateEventDto {  
  @ApiProperty({
    example: 'Open Doors... to Hell',
    required: false
  })
  name?: string
  
  @ApiProperty({
    example: 'Hello, we want to you all burn!!!',
    required: false
  })
  description?: string

  @ApiProperty({
    example: new Date('03-04-2025'),
    required: false
  })
  date?: Date
  
  @ApiProperty({
    example: 20,
    required: false
  })
  seatsNumber?: number
  
  @ApiProperty({
    example: [
      {
        is_online: false,
        address: 'Yagodnoe, forest, TAOM',
        officeNumber: 'C-404',
        floor: 4
      },
      {
        is_online: true,
        connection_link: 'https://zoom.com/...',
        identifier: '7813963421',
        access_code: 'UDFfi34SD',
        record_link: 'https://youtube.com/...'
      }
    ],
    required: false
  })
  places?: JsonArray[]

  @ApiProperty({
    example: [{
      timeEnd: new Date('2025-04-02 09:00'),
      timeStart: new Date('2025-04-02 10:00'),
    }],
    required: false
  })
  schedule?: JsonArray[]
  
  @ApiProperty({
    example: [1, 2],
    required: false
  })
  executorsIds?: number[]

  @ApiProperty({
    example: 20,
    required: false
  })
  statusId?: number

  @ApiProperty({
    example: 10,
    required: false
  })
  typeId?: number
}

export class UpdateEventParticipantsDto {
  @ApiProperty({
    example: [1, 2],
    required: false
  })
  add?: number[]

  @ApiProperty({
    example: [3, 4],
    required: false
  })
  remove?: number[]
}