import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetQuestsMinimizeQuery, PostQuestDto, PostQuestionDto, SaveQuestDto } from "./dto/questModule.dto";
import { Prisma } from "@prisma/client";
import { GetQuestionSchema, GetQuestMinimizeSchema, GetQuestSchema } from "./schema/questModule.schema";
import { QuestQuestion } from "src/models/questQuestion";
import { QuestAnswer } from "src/models/questAnswer";
import { NotFoundError } from "src/errors/notFound";

@Injectable()
export class QuestModuleService {
  constructor(
    private prisma: PrismaService
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

    if (quest.name) upsertData.name = quest.name
    if (quest.tagsIds) {
      for (let tagId of quest.tagsIds ?? []) {
        const tag = await this.prisma.quest_tags.findUnique({ where: { id: tagId } })

        if (!tag) {
          throw new NotFoundError(`Tag with id ${tagId} not found`)
        }
      }

      upsertData.tags_ids = quest.tagsIds
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
    if (quest.groupId) {
      const group = await this.prisma.quest_groups.findUnique({ where: { id: quest.groupId } })

      if (!group) {
        throw new NotFoundError(`Group with id ${quest.groupId} not found`)
      }

      upsertData.group = { connect: { id: quest.groupId } }
    }
    if (quest.executorId) {
      const executor = await this.prisma.users.findUnique({ where: { id: quest.executorId } })

      if (!executor) {
        throw new NotFoundError(`Executor with id ${quest.executorId} not found`)
      }

      upsertData.executor = { connect: { id: quest.executorId } }
    }
    if (quest.departmentId) {
      const department = await this.prisma.departments.findUnique({ where: { id: quest.departmentId } })

      if (!department) {
        throw new NotFoundError(`Department with id ${quest.departmentId} not found`)
      }

      upsertData.department = { connect: { id: quest.departmentId } }
    }   

    const savedQuest = id
      ? await this.prisma.quests.update({ where: { id }, data: upsertData })
      : await this.prisma.quests.create({ data: upsertData as Prisma.questsCreateInput })

    return this.getQuest(savedQuest.id)
  }

  async createQuestion(question: PostQuestionDto): Promise<GetQuestionSchema> {
    const createQuestionData: Prisma.questionsCreateInput = {
      quest: { connect: { id: question.questId } }
    }

    if (question.text) createQuestionData.text = question.text
    if (question.typeId) {
      createQuestionData.type = { connect: { id: question.typeId } }

      const createAnswerData: Prisma.answersCreateInput = {}

      //Single
      if (question.typeId === 1) {
        createAnswerData.single = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as number
        } }
      }
      //Multiple
      if (question.typeId === 2) {
        createAnswerData.multiple = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as number[]
        } }
      }
      //Connection
      if (question.typeId === 3) {
        createAnswerData.connection = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer as string[]
        } }
      }
      //BoxSorting
      if (question.typeId === 4) {
        createAnswerData.box_sorting = { create: {
          answers: question.answers,
          correct_answers: question.correctAnswer 
        } }
      }
      //Free
      if (question.typeId === 5) {
        createAnswerData.free = { create: {
          correct_answers: question.correctAnswer as string
        } }
      }

      createQuestionData.answer = { create: createAnswerData }
    }
    
    console.log('CREATE QUESTION', createQuestionData)

    const createdQuestion = await this.prisma.questions.create({
      data: createQuestionData
    })

    return {
      id: createdQuestion.id,
    }
  }

  private async getQuestQuestions(questId: number): Promise<QuestQuestion[]> {
    const questQuestions: QuestQuestion[] = [];
    const questions = await this.prisma.questions.findMany({ where: { quest: { id: questId } } })

    for (let question of questions) {
      const questQuestion: QuestQuestion = {
        id: question.id,
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

      questQuestions.push(questQuestion)
    }

    return questQuestions
  }
}