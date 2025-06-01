import { ApiProperty } from '@nestjs/swagger'

export class CreateExcelDto {
  @ApiProperty({
    example: [{ name: 'Roman', lastName: 'Nichi' }],
    required: true,
  })
  data: any

  @ApiProperty({
    example: 'Участники_мероприятия',
    required: true,
  })
  fileName: string

  @ApiProperty({
    example: [{ key: 'name', header: 'Имя', format: 'string', width: 20 }],
    required: true,
  })
  columns: CreateExcelColumn[]
}

export class CreateExcelColumn {
  @ApiProperty({
    example: 'name',
    required: true,
  })
  key: string

  @ApiProperty({
    example: 'Имя',
    required: true,
  })
  header: string

  @ApiProperty({
    example: 'string',
    required: true,
  })
  format: ColumnFormat

  @ApiProperty({
    example: 20,
    required: false,
  })
  width?: number
}

type ColumnFormat = 'string' | 'number' | 'date'
