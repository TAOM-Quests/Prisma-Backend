import { ApiProperty } from "@nestjs/swagger"
import { CorrectAnswer } from "src/models/questAnswer"

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

  @ApiProperty({ example: 1, required: false })
  groupId?: number

  @ApiProperty({ example: [1, 2], required: false })
  tagsIds?: number[]

  @ApiProperty({ example: 1, required: false })
  difficultId?: number

  @ApiProperty({ example: [
    {
      questId: 1,
      text: 'Question 1',
      typeId: 1,
      answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
      correctAnswer: 1
    }
  ], required: false })
  questions?: PostQuestionDto[] 
}

export class PostQuestionDto {
  @ApiProperty({ example: 1, required: true })
  questId: number

  @ApiProperty({ example: 'Question 1', required: false })
  text?: string

  @ApiProperty({ example: 1, required: false })
  typeId?: number

  @ApiProperty({ example: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'], required: false })
  answers?: string[]

  @ApiProperty({ example: 1, required: false })
  @ApiProperty({ example: [1, 2], required: false })
  @ApiProperty({ example: ['1 - 3', '2 - 4'], required: false })
  @ApiProperty({ example: 'answer', required: false })
  correctAnswer?: CorrectAnswer
}

export class SaveQuestDto {
  id?: number
  name?: string
  groupId?: number
  tagsIds?: number[]
  executorId?: number
  difficultId?: number
  departmentId?: number
  questionsIds?: number[]
}

export class SaveQuestionDto {
  id?: number
  text?: string
  typeId?: number
  questId?: number
  answers?: string[]
  correctAnswer?: CorrectAnswer
}