import { ApiProperty } from '@nestjs/swagger'
import { CorrectAnswer } from 'src/models/questAnswer'

export class GetQuestsMinimizeQuery {
  ids?: number[]
  departmentsIds?: number[]
  tagsIds?: number[]
  executorsIds?: number[]
}

export class GetCompleteQuestsMinimizeQuery {
  ids?: number[]
  departmentsIds?: number[]
  tagsIds?: number[]
  executorsIds?: number[]
  completeByUserId?: number
}

export class PostQuestDto {
  @ApiProperty({ example: 1, required: true })
  executorId: number

  @ApiProperty({ example: 1, required: true })
  departmentId: number

  @ApiProperty({ example: 'Python Start', required: false })
  name?: string

  @ApiProperty({ example: '9:30', required: false })
  time?: string

  @ApiProperty({ example: '<b>BEST PYTHON QUEST</b>', required: false })
  description?: string

  @ApiProperty({ example: { id: 1, name: 'Start' }, required: false })
  group?: { name: string; id?: number }

  @ApiProperty({
    example: [{ id: 1, name: 'Start' }, { name: 'Python' }],
    required: false,
  })
  tags?: { name: string; id?: number }[]

  @ApiProperty({ example: 1, required: false })
  difficultId?: number

  @ApiProperty({ example: 1, required: false })
  imageId?: number

  @ApiProperty({
    example: [
      {
        questId: 1,
        text: 'Question 1',
        type: 'single',
        answer: {
          options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
          correctAnswer: 1,
        },
      },
    ],
    required: false,
  })
  questions?: SaveQuestionDto[]
}

export class GetQuestGroupsQuery {
  @ApiProperty({ example: 1, required: false })
  departmentId?: number
}

export class GetQuestTagsQuery {
  @ApiProperty({ example: 1, required: false })
  departmentId?: number
}

export class SaveQuestDto {
  id?: number
  name?: string
  time?: string
  imageId?: number
  executorId?: number
  description?: string
  difficultId?: number
  departmentId?: number
  results?: SaveResultDto[]
  questions?: SaveQuestionDto[]
  group?: { name: string; id?: number }
  tags?: { name: string; id?: number }[]
}

export class SaveQuestionDto {
  type: string
  questId: number
  answer: SaveAnswerDto
  id?: number
  text?: string
}

export class SaveAnswerDto {
  id?: number
  options?: string[]
  correctAnswer?: CorrectAnswer
}

export class SaveResultDto {
  questId: number
  id?: number
  name?: string
  imageId?: number
  minPoints?: number
  description?: string
}

export class SaveQuestCompleteDto {
  name: string
  questId: number
  executor: {
    name: string
    imageId?: number
  }
  time?: string
  tags?: string[]
  imageId?: number
  difficult?: string
  description?: string
  departmentId?: number
  result?: SaveResultCompleteDto
  questions?: SaveQuestionCompleteDto[]
}

export class SaveQuestionCompleteDto {
  id: number
  type: string
  answer: SaveAnswerCompleteDto
  text?: string
  imageId?: number
}

export class SaveAnswerCompleteDto {
  id: number
  isCorrect: boolean
  userAnswer: CorrectAnswer
  options?: string[]
}

export class SaveResultCompleteDto {
  id: number
  name: string
  description: string
  userCorrectAnswerCount: number
  imageId?: number
}
