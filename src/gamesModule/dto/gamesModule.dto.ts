import { ApiProperty, PickType } from '@nestjs/swagger'

export class GetWordleUserAttemptQuery {
  date: Date
}

export class SaveWordleWordDto {
  @ApiProperty({ example: 'МОДЕМ', required: true })
  word: string

  id?: number
  departmentId?: number
}
export class SaveWordleWordBody extends PickType(SaveWordleWordDto, [
  'word',
] as const) {}
