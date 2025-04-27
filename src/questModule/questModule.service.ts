import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetQuestsMinimizeQuery, PostQuestDto, PostQuestionDto, SaveQuestDto, SaveQuestionDto } from "./dto/questModule.dto";
import { Prisma } from "@prisma/client";
import { GetQuestMinimizeSchema, GetQuestQuestionSchema, GetQuestSchema } from "./schema/questModule.schema";
import { QuestQuestion } from "src/models/questQuestion";
import { QuestAnswer } from "src/models/questAnswer";
import { NotFoundError } from "src/errors/notFound";
import { CommonModuleService } from "src/commonModule/commonModule.service";

@Injectable()
export class QuestModuleService {
  constructor(
    private prisma: PrismaService,
    private commonModuleService: CommonModuleService,
  ) {}

  async getQuests(getQuestsQuery: GetQuestsMinimizeQuery): Promise<GetQuestMinimizeSchema[]> {
    const where: Prisma.questsWhereInput = {}

    if (getQuestsQuery.ids) where.id = { in: getQuestsQuery.ids }
    if (getQuestsQuery.tagsIds) where.tags_ids = { hasSome: getQuestsQuery.tagsIds }
    if (getQuestsQuery.executorsIds) where.id_executor = { in: getQuestsQuery.executorsIds }
    if (getQuestsQuery.departmentsIds) where.id_department = { in: getQuestsQuery.departmentsIds }

    const foundQuests = await this.prisma.quests.findMany({ where })
    const quests: GetQuestMinimizeSchema[] = []
    
    for (let foundQuest of foundQuests) {
      const quest: GetQuestMinimizeSchema = {
        id: foundQuest.id,
      }

      if (foundQuest.name) quest.name = foundQuest.name
      if (foundQuest.time) quest.time = foundQuest.time
      if (foundQuest.description) quest.description = foundQuest.description
      if (foundQuest.id_group) {
        const group = await this.prisma.quest_groups.findUnique({ where: { id: foundQuest.id_group } })
        quest.group = { id: group.id, name: group.name, departmentId: group.id_department }
      }
      if (foundQuest.tags_ids) {
        const tags = await this.prisma.quest_tags.findMany({ where: { id: { in: foundQuest.tags_ids } } })
        quest.tags = tags.map(tag => ({ id: tag.id, name: tag.name }))
      }
      if (foundQuest.id_difficult) {
        const difficult = await this.prisma.quest_difficulties.findUnique({ where: { id: foundQuest.id_difficult } })
        quest.difficult = { id: difficult.id, name: difficult.name }
      }
      if (foundQuest.id_image) {
        const image = await this.prisma.shared_files.findUnique({ where: { id: foundQuest.id_image } })
        quest.image = await this.commonModuleService.getFileStats(image.name)
      }

      quests.push(quest)
    }

    return quests
  }

  // async getCompleteQuests(getQuestsQuery: GetCompleteQuestsMinimizeQuery): Promise<GetQuestMinimizeSchema[]> {

  // }

  async getQuest(id: number): Promise<GetQuestSchema> {
    const foundQuest = await this.prisma.quests.findUnique({ where: { id } })

    if (!foundQuest) {
      throw new NotFoundError(`Quest with id ${id} not found`)
    }
    
    const executor = await this.prisma.users.findUnique({ where: { id: foundQuest.id_executor } })
    const executorPosition = await this.prisma.user_positions.findUnique({ where: { id: executor.id_position } })

    const quest: GetQuestSchema = {
      id: foundQuest.id,
      executor: {
        id: executor.id,
        name: executor.first_name + ' ' + executor.last_name,
        position: executorPosition.name
      }
    }

    if (foundQuest.name) quest.name = foundQuest.name
    if (foundQuest.id_group) {
      const group = await this.prisma.quest_groups.findUnique({ where: { id: foundQuest.id_group } })
      quest.group = { id: group.id, name: group.name, departmentId: group.id_department }
    }
    if (foundQuest.tags_ids) {
      const tags = await this.prisma.quest_tags.findMany({ where: { id: { in: foundQuest.tags_ids } } })
      quest.tags = tags.map(tag => ({ id: tag.id, name: tag.name }))
    }
    if (foundQuest.id_difficult) {
      const difficult = await this.prisma.quest_difficulties.findUnique({ where: { id: foundQuest.id_difficult } })
      quest.difficult = { id: difficult.id, name: difficult.name }
    }
    if (foundQuest.questions_ids) {
      const questions = await this.getQuestQuestions(foundQuest.id)
      quest.questions = questions
    }

    return quest
  }

  async createQuest(quest: PostQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest)
  }

  async updateQuest(id: number, quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest, id)
  }

  private async saveQuest(quest: SaveQuestDto, id?: number): Promise<GetQuestSchema> {
    const upsertData: Prisma.questsUpdateInput = {}
    
    if (quest.departmentId) {
      const department = await this.prisma.departments.findUnique({ where: { id: quest.departmentId } })

      if (!department) {
        throw new NotFoundError(`Department with id ${quest.departmentId} not found`)
      }

      upsertData.department = { connect: { id: quest.departmentId } }
    }   
    if (quest.name) upsertData.name = quest.name
    if (quest.time) upsertData.time = quest.time
    if (quest.description) upsertData.description = quest.description
    if (quest.tags) {
      const questTagsIds: number[] = []

      for (const {id: tagId, name: tagName} of quest.tags) {
        const tag = tagId
          ? await this.prisma.quest_tags.findUnique({ where: { id: tagId } })
          : await this.prisma.quest_tags.create({
            data: {
              name: tagName,
              department: {
                connect: {
                  id: quest.departmentId
                }
              }
            }
          })

        if (!tag) {
          throw new NotFoundError(`Quest tag with id ${tagId} not found`)
        }

        questTagsIds.push(tag.id)
      }

      upsertData.tags_ids = questTagsIds
    }
    if (quest.questionsIds) {
      for (let questionId of quest.questionsIds ?? []) {
        const question = await this.prisma.questions.findUnique({ where: { id: questionId } })

        if (!question) {
          throw new NotFoundError(`Question with id ${questionId} not found`)
        }
      }

      upsertData.questions_ids = quest.questionsIds
    }
    if (quest.group) {
      const group = quest.group.id
        ? await this.prisma.quest_groups.findUnique({ where: { id: quest.group.id } })
        : await this.prisma.quest_groups.create({
          data: {
            name: quest.group.name,
            department: {
              connect: {
                id: quest.departmentId
              }
            }
          }
        })

      if (!group) {
        throw new NotFoundError(`Group with id ${quest.group.id} not found`)
      }

      upsertData.group = { connect: { id: quest.group.id } }
    }
    if (quest.executorId) {
      const executor = await this.prisma.users.findUnique({ where: { id: quest.executorId } })

      if (!executor) {
        throw new NotFoundError(`Executor with id ${quest.executorId} not found`)
      }

      upsertData.executor = { connect: { id: quest.executorId } }
    }

    const savedQuest = id
      ? await this.prisma.quests.update({ where: { id }, data: upsertData })
      : await this.prisma.quests.create({ data: upsertData as Prisma.questsCreateInput })

    return this.getQuest(savedQuest.id)
  }

  async createQuestion(question: PostQuestionDto): Promise<GetQuestQuestionSchema> {
    const createQuestionData: Prisma.questionsCreateInput = {
      quest: { connect: { id: question.questId } }
    }

    if (question.text) createQuestionData.text = question.text
    if (question.typeId) {
      createQuestionData.type = { connect: { id: question.typeId } }

      const updateAnswerData: Prisma.answersCreateInput = {}

      //Single
      if (question.typeId === 1) {
        updateAnswerData.single = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as number
        } }
      }
      //Multiple
      if (question.typeId === 2) {
        updateAnswerData.multiple = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as number[]
        } }
      }
      //Connection
      if (question.typeId === 3) {
        updateAnswerData.connection = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as string[]
        } }
      }
      //BoxSorting
      if (question.typeId === 4) {
        updateAnswerData.box_sorting = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer 
        } }
      }
      //Free
      if (question.typeId === 5) {
        updateAnswerData.free = { create: {
          correct_answers: question.correctAnswer as string
        } }
      }

      createQuestionData.answer = { create: updateAnswerData }
    }

    const createdQuestion = await this.prisma.questions.create({
      data: createQuestionData
    })

    return this.getQuestionById(createdQuestion.id)
  }

  private async updateQuestion(question: SaveQuestionDto, id?: number): Promise<GetQuestQuestionSchema> {
    const foundQuestion = await this.prisma.questions.findUnique({ where: { id } })
    const foundAnswer = await this.prisma.answers.findUnique({ where: { id: foundQuestion.id_answer } })

    if (!foundQuestion) {
      throw new NotFoundError(`Question with id ${id} not found`)
    }

    if (!foundAnswer) {
      throw new NotFoundError(`Answer with id ${foundQuestion.id_answer} not found`)
    }

    if (question.typeId !== foundQuestion.id_type) {
      await this.prisma.answers.update({
        where: { id: foundAnswer.id },
        data: {
          id_single: null,
          id_multiple: null,
          id_connection: null,
          id_box_sorting: null,
          id_free: null,
        }
      })
    }
    
    const updateQuestionData: Prisma.questionsUpdateInput = {}

    if (question.text) updateQuestionData.text = question.text
    if (question.typeId) {
      updateQuestionData.type = { connect: { id: question.typeId } }

      const updateAnswerData: Prisma.answersCreateInput = {}

      //Single
      if (question.typeId === 1) {
        if (foundAnswer.id_single) {
          await this.prisma.answers_single.update({
            where: { id: foundAnswer.id_single },
            data: {
              answers: question.answers,
              correct_answers: question.correctAnswer as number
            }
          })
        } else {
          updateAnswerData.single = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as number
          } }
        }        
      }
      //Multiple
      if (question.typeId === 2) {
        if (foundAnswer.id_multiple) {
          await this.prisma.answers_multiple.update({
            where: { id: foundAnswer.id_multiple },
            data: {
              answers: question.answers,
              correct_answers: question.correctAnswer as number[]
            }
          })
        } else {
          updateAnswerData.multiple = { create: {
            answers: question.answers,
            correct_answers: question.correctAnswer as number[]
          } }
        }
      }
      //Connection
      if (question.typeId === 3) {
        if (foundAnswer.id_connection) {
          await this.prisma.answers_connection.update({
            where: { id: foundAnswer.id_connection },
            data: {
              answers: question.answers,
              correct_answers: question.correctAnswer as string[]
            }
          })
        } else {
          updateAnswerData.connection = { create: {
            answers: question.answers,
            correct_answers: question.correctAnswer as string[]
          } }
        }
      }
      //BoxSorting
      if (question.typeId === 4) {
        if (foundAnswer.id_box_sorting) {
          await this.prisma.answers_box_sorting.update({
            where: { id: foundAnswer.id_box_sorting },
            data: {
              answers: question.answers,
              correct_answers: question.correctAnswer
            }
          })
        } else {
          updateAnswerData.box_sorting = { create: {
            answers: question.answers,
            correct_answers: question.correctAnswer 
          } }
        } 
      }
      //Free
      if (question.typeId === 5) {
        if (foundAnswer.id_free) {
          await this.prisma.answers_free.update({
            where: { id: foundAnswer.id_free },
            data: {
              correct_answers: question.correctAnswer as string
            }
          })
        } else {
          updateAnswerData.free = { create: {
            correct_answers: question.correctAnswer as string
          } }
        }
      }

      updateQuestionData.answer = { create: updateAnswerData }
    }

    await this.prisma.questions.update({
      where: { id },
      data: updateQuestionData
    })

    return this.getQuestionById(id)
  }

  private async getQuestQuestions(questId: number): Promise<QuestQuestion[]> {
    const questions = await this.prisma.questions.findMany({ where: { quest: { id: questId } } })

    return Promise.all(questions.map(async question => await this.getQuestionById(question.id)))
  }

  private async getQuestionById(id: number): Promise<GetQuestQuestionSchema> {
    const question = await this.prisma.questions.findUnique({ where: { id } })

    if (!question) {
      throw new NotFoundError(`Question with id ${id} not found`)
    }

    const questQuestion: QuestQuestion = {
      id
    }

    const answer = await this.prisma.answers.findUnique({ where: { id: question.id_answer } })

    if (answer.id_single) {
      const singleAnswer = await this.prisma.answers_single.findUnique({ where: { id: answer.id_single } })
      const questionAnswer: QuestAnswer = questQuestion.answer = {
        id: answer.id,
      }

      questionAnswer.answers = singleAnswer.answers
      questionAnswer.correctAnswer = singleAnswer.correct_answers
    }

    if (answer.id_multiple) {
      const multipleAnswer = await this.prisma.answers_multiple.findUnique({ where: { id: answer.id_multiple } })
      const questionAnswer: QuestAnswer = questQuestion.answer = {
        id: answer.id,
      }

      questionAnswer.answers = multipleAnswer.answers
      questionAnswer.correctAnswer = multipleAnswer.correct_answers
    }

    if (answer.id_connection) {
      const connectionAnswer = await this.prisma.answers_connection.findUnique({ where: { id: answer.id_connection } })
      const questionAnswer: QuestAnswer = questQuestion.answer = {
        id: answer.id,
      }

      questionAnswer.answers = connectionAnswer.answers
      questionAnswer.correctAnswer = connectionAnswer.correct_answers
    }

    return questQuestion
  }
}