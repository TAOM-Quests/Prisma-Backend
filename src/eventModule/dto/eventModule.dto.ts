import { ApiProperty } from '@nestjs/swagger'
import { JsonArray } from '@prisma/client/runtime/library'

export interface GetEventsMinimizeQuery {
  limit: number
  offset: number
  name?: string
  type?: number
  dateEnd?: Date
  status?: number
  dateStart?: Date
  executor?: number
  department?: number
  participant?: number
}

export interface GetEventParams {
  id: number
}

export interface GetEventTagsQuery {
  departmentId?: number
}

export class SaveEventDto {
  id: number
  departmentId?: number

  @ApiProperty({
    example: 'Open Doors... to Hell',
    required: false,
  })
  name?: string

  @ApiProperty({
    example: 'Hello, we want to you all burn!!!',
    required: false,
  })
  description?: string

  @ApiProperty({
    example: 1,
    required: false,
  })
  imageId?: number

  @ApiProperty({
    example: new Date('03-04-2025'),
    required: false,
  })
  date?: Date

  @ApiProperty({
    example: 20,
    required: false,
  })
  seatsNumber?: number

  @ApiProperty({
    example: [
      {
        is_online: false,
        address: 'Yagodnoe, forest, TAOM',
        officeNumber: 'C-404',
        floor: 4,
      },
      {
        is_online: true,
        connection_link: 'https://zoom.com/...',
        identifier: '7813963421',
        access_code: 'UDFfi34SD',
        record_link: 'https://youtube.com/...',
      },
    ],
    required: false,
  })
  places?: JsonArray[]

  @ApiProperty({
    example: [
      {
        timeEnd: new Date('2025-04-02 09:00'),
        timeStart: new Date('2025-04-02 10:00'),
      },
    ],
    required: false,
  })
  schedule?: JsonArray[]

  @ApiProperty({
    example: [1, 2],
    required: false,
  })
  executorsIds?: number[]

  @ApiProperty({
    example: 20,
    required: false,
  })
  statusId?: number

  @ApiProperty({
    example: 10,
    required: false,
  })
  typeId?: number

  @ApiProperty({
    example: [1, 2],
    required: false,
  })
  filesIds?: number[]

  @ApiProperty({
    example: [{ id: 1, name: 'Start' }, { name: 'Python' }],
    required: false,
  })
  tags?: { name: string; id?: number }[]
}

export class CreateEventDto extends SaveEventDto {
  @ApiProperty({
    example: 1,
    required: true,
  })
  departmentId: number
}

export class UpdateEventDto extends SaveEventDto {}

export class UpdateEventParticipantsDto {
  @ApiProperty({
    example: [1, 2],
    required: false,
  })
  add?: number[]

  @ApiProperty({
    example: [3, 4],
    required: false,
  })
  remove?: number[]
}
