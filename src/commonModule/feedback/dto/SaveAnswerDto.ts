import { ApiProperty } from '@nestjs/swagger'

export class SaveAnswerDto {
  @ApiProperty({ example: ['Отлично', '5', '6 - Хорошо'], required: true })
  answers: string[]

  @ApiProperty({ example: 1, required: false })
  formId?: number

  @ApiProperty({ example: 1, required: false })
  userId?: number

  id?: number
}
