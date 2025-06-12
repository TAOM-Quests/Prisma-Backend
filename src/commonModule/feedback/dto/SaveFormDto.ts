import { ApiProperty } from '@nestjs/swagger'
import { SaveFormQuestionDto } from './SaveFormQuestionDto'

export class SaveFormDto {
  @ApiProperty({
    example: [{ type: 'free', question: 'What is your age?', answers: [] }],
    required: true,
  })
  questions: SaveFormQuestionDto[]

  @ApiProperty({
    example: 'IT Open Doors',
    required: false,
  })
  name?: string

  @ApiProperty({
    example: 'Thanks for your feedback',
    required: false,
  })
  description?: string

  id?: number
  entityId?: number
  entityName?: string
}
