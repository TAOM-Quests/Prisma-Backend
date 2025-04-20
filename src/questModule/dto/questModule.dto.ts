import { ApiProperty } from "@nestjs/swagger"

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

  @ApiProperty({ example: [1, 2], required: false })
  questionsIds?: number[] 
}