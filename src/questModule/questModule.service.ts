import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetCompleteQuestsQuery, GetQuestsQuery } from "./dto/questModule.dto";
import { Prisma } from "@prisma/client";
import { GetQuestSchema } from "./schema/questModule.schema";
import { QuestQuestion } from "src/models/questQuestion";
import { QuestAnswer } from "src/models/questAnswer";

@Injectable()
export class QuestModuleService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getQuests(getQuestsQuery: GetQuestsQuery): Promise<GetQuestSchema[]> {
    const where: Prisma.questsWhereInput = {}

    if (getQuestsQuery.ids) where.id = { in: getQuestsQuery.ids }
    if (getQuestsQuery.tagsIds) where.tags_ids = { hasSome: getQuestsQuery.tagsIds }
    if (getQuestsQuery.executorsIds) where.id_executor = { in: getQuestsQuery.executorsIds }
    if (getQuestsQuery.departmentsIds) where.id_department = { in: getQuestsQuery.departmentsIds }

    const foundQuests = await this.prisma.quests.findMany({ where })
    const quests: GetQuestSchema[] = []
    
    for (let foundQuest of foundQuests) {
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

      quests.push(quest)
    }

    return quests
  }

  async getCompleteQuests(getQuestsQuery: GetCompleteQuestsQuery) {
    
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