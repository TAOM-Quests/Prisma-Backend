import { ApiProperty } from "@nestjs/swagger"
import { CorrectAnswer } from "src/models/questAnswer"
import { QuestGroup } from "src/models/questGroup"
import { QuestTag } from "src/models/questTag"

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

  @ApiProperty({ example: {id: 1, name: 'Start'} , required: false })
  group?: Partial<QuestGroup>

  @ApiProperty({ example: [{id: 1, name: 'Start'}, {name: 'Python'}], required: false })
  tags?: Partial<QuestTag>[]

  @ApiProperty({ example: 1, required: false })
  difficultId?: number

  @ApiProperty({ example: 1, required: false })
  imageId?: number

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
  time?: string
  imageId?: number
  executorId?: number
  description?: string
  difficultId?: number
  departmentId?: number
  questionsIds?: number[]
  tags?: Partial<QuestTag>[]
  group?: Partial<QuestGroup>
}

export class SaveQuestionDto {
  id?: number
  text?: string
  typeId?: number
  questId?: number
  answers?: string[]
  correctAnswer?: CorrectAnswer
}