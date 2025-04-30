import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetQuestGroupsQuery, GetQuestsMinimizeQuery, GetQuestTagsQuery, PostQuestDto, SaveQuestDto, SaveQuestionDto } from "./dto/questModule.dto";
import { Prisma } from "@prisma/client";
import { GetQuestDifficultiesSchema, GetQuestGroupsSchema, GetQuestMinimizeSchema, GetQuestQuestionSchema, GetQuestSchema, GetQuestTagsSchema, GetQuestResult } from "./schema/questModule.schema";
import { QuestQuestion } from "src/models/questQuestion";
import { QuestAnswer } from "src/models/questAnswer";
import { NotFoundError } from "src/errors/notFound";
import { CommonModuleService } from "src/commonModule/commonModule.service";
import { QuestResult } from "src/models/questResult";

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
    if (foundQuest.result_ids) {
      const results = await this.getResultsByQuestId(foundQuest.id)
      quest.results = results
    }

    return quest
  }

  async createQuest(quest: PostQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest)
  }

  async updateQuest(id: number, quest: SaveQuestDto): Promise<GetQuestSchema> {
    return this.saveQuest(quest, id)
  }

  async getDifficulties(): Promise<GetQuestDifficultiesSchema[]> {
    const difficulties = await this.prisma.quest_difficulties.findMany()

    return difficulties
      .map(difficult => ({
        id: difficult.id,
        name: difficult.name
      }))
  }

  async getGroups(getGroupsQuery: GetQuestGroupsQuery): Promise<GetQuestGroupsSchema[]> {
    const groupsFindParams: Prisma.quest_groupsFindManyArgs = {}

    if (getGroupsQuery.departmentId) {
      groupsFindParams.where = { id_department: getGroupsQuery.departmentId }
    }

    const groups = await this.prisma.quest_groups.findMany(groupsFindParams)

    return groups
      .map(group => ({
        id: group.id,
        name: group.name
      }))
  }

  async getTags(getTagsQuery: GetQuestTagsQuery): Promise<GetQuestTagsSchema[]> {
    const tagsFindParams: Prisma.quest_tagsFindManyArgs = {}

    if (getTagsQuery.departmentId) {
      tagsFindParams.where = { id_department: getTagsQuery.departmentId }
    }

    const tags = await this.prisma.quest_tags.findMany(tagsFindParams)

    return tags
      .map(tag => ({
        id: tag.id,
        name: tag.name
      }))
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
          : await this.prisma.quest_tags.findFirst({ where: { name: tagName, department: { id: quest.departmentId } }}) 
            ??  await this.prisma.quest_tags.create({
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
    if (quest.questions) {
      const foundQuestionsIds: number[] = []
      for (let question of quest.questions.filter(q => q.id) ?? []) {
        const foundQuestion = await this.prisma.questions.findUnique({ where: { id: question.id } })
        
        if (!foundQuestion) {
          throw new NotFoundError(`Question with id ${foundQuestion.id} not found`)
        }
        
        await this.updateQuestion(question, question.id)

        foundQuestionsIds.push(foundQuestion.id)
      }

      upsertData.questions_ids = foundQuestionsIds
      upsertData.questions = { connect: foundQuestionsIds.map(id => ({ id })) }
    }    
    if (quest.results) {
      const foundResultsIds: number[] = []
      for (let result of quest.results.filter(r => r.id) ?? []) {
        const foundResult = await this.prisma.quest_results.findUnique({ where: { id: result.id } })
        
        if (!foundResult) {
          throw new NotFoundError(`Result with id ${foundResult.id} not found`)
        }

       await this.saveResult(result)

        foundResultsIds.push(foundResult.id)
      }      

      upsertData.result_ids = foundResultsIds
      upsertData.results = { connect: foundResultsIds.map(id => ({ id })) }
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
    if (quest.imageId) {
      const image = await this.prisma.shared_files.findUnique({ where: { id: quest.imageId } })

      if (!image) {
        throw new NotFoundError(`Image with id ${quest.imageId} not found`)
      }

      upsertData.image = { connect: { id: quest.imageId } }
    }

    const savedQuest = id
      ? await this.prisma.quests.update({ where: { id }, data: upsertData })
      : await this.prisma.quests.create({ data: upsertData as Prisma.questsCreateInput })

    const createdResultsIds: number[] = []
    const createdQuestionsIds: number[] = []

    for (const result of quest.results?.filter(r => !r.id) ?? []) {
      const createdResult = await this.saveResult({...result, questId: savedQuest.id})
      createdResultsIds.push(createdResult.id)
    }
    for (const question of quest.questions?.filter(q => !q.id) ?? []) {
      const createdQuestion = await this.createQuestion({...question, questId: savedQuest.id})
      createdQuestionsIds.push(createdQuestion.id)
    }
    await this.prisma.quests.update({
      where: { id: savedQuest.id },
      data: { 
        questions_ids: [...savedQuest.questions_ids, ...createdQuestionsIds ],
        questions: { connect: createdQuestionsIds.map(id => ({ id })) },
        result_ids: [...savedQuest.result_ids, ...createdResultsIds ],
        results: { connect: createdResultsIds.map(id => ({ id })) }
      }
    })

    return this.getQuest(savedQuest.id)
  }
  
  async createQuestion(question: SaveQuestionDto): Promise<GetQuestQuestionSchema> {
    const createQuestionData: Prisma.questionsCreateInput = {
      quest: { connect: { id: question.questId } }
    }

    if (question.text) createQuestionData.text = question.text
    if (question.type) {
      createQuestionData.type = question.type

      const updateAnswerData: Prisma.answersCreateInput = {}

      if (question.type === 'single') {
        updateAnswerData.single = { create: {
          options: question.answer.options,
          correct_answers: question.answer.correctAnswer as number
        } }
      }
      if (question.type === 'multiple') {
        updateAnswerData.multiple = { create: {
          options: question.answer.options,
          correct_answers: question.answer.correctAnswer as number[]
        } }
      }
      if (question.type === 'connection') {
        updateAnswerData.connection = { create: {
          options: question.answer.options,
          correct_answers: question.answer.correctAnswer as string[]
        } }
      }
      if (question.type === 'boxSorting') {
        updateAnswerData.box_sorting = { create: {
          options: question.answer.options,
          correct_answers: question.answer.correctAnswer 
        } }
      }
      if (question.type === 'free') {
        updateAnswerData.free = { create: {
          correct_answers: question.answer.correctAnswer as string
        } }
      }

      createQuestionData.answer = { create: updateAnswerData }
    }

    const createdQuestion = await this.prisma.questions.create({
      data: createQuestionData
    })
    
    const createdSingleAnswers = await this.prisma.answers_single.findMany({where: {id_parent_answer: createdQuestion.id_answer}})
    const createdMultipleAnswers = await this.prisma.answers_multiple.findMany({where: {id_parent_answer: createdQuestion.id_answer}})
    const createdConnectionAnswers = await this.prisma.answers_connection.findMany({where: {id_parent_answer: createdQuestion.id_answer}})
    const createdBoxSortingAnswers = await this.prisma.answers_box_sorting.findMany({where: {id_parent_answer: createdQuestion.id_answer}})
    const createdFreeAnswers = await this.prisma.answers_free.findMany({where: {id_parent_answer: createdQuestion.id_answer}})

    for (const single of createdSingleAnswers ?? []) {
      await this.prisma.answers.update({
        where: {id: createdQuestion.id_answer},
        data: {id_single: single.id}
      })
    }
    for (const multiple of createdMultipleAnswers ?? []) {
      await this.prisma.answers.update({
        where: {id: createdQuestion.id_answer},
        data: {id_multiple: multiple.id}
      })
    }
    for (const connection of createdConnectionAnswers ?? []) {
      await this.prisma.answers.update({
        where: {id: createdQuestion.id_answer},
        data: {id_connection: connection.id}
      })
    }
    for (const boxSorting of createdBoxSortingAnswers ?? []) {
      await this.prisma.answers.update({
        where: {id: createdQuestion.id_answer},
        data: {id_box_sorting: boxSorting.id}
      })
    }
    for (const free of createdFreeAnswers ?? []) {
      await this.prisma.answers.update({
        where: {id: createdQuestion.id_answer},
        data: {id_free: free.id}
      })
    }
    
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

    if (question.type !== foundQuestion.type) {
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
    if (question.type) {
      updateQuestionData.type = question.type

      const updateAnswerData: Prisma.answersCreateInput = {}

      if (question.type === 'single') {
        if (foundAnswer.id_single) {
          await this.prisma.answers_single.update({
            where: { id: foundAnswer.id_single },
            data: {
              options: question.answer.options,
              correct_answers: question.answer.correctAnswer as number
            }
          })
        } else {
          updateAnswerData.single = { create: {
          options: question.answer.options,
          correct_answers: question.answer.correctAnswer as number
          } }
        }        
      }
      if (question.type === 'multiple') {
        if (foundAnswer.id_multiple) {
          await this.prisma.answers_multiple.update({
            where: { id: foundAnswer.id_multiple },
            data: {
              options: question.answer.options,
              correct_answers: question.answer.correctAnswer as number[]
            }
          })
        } else {
          updateAnswerData.multiple = { create: {
            options: question.answer.options,
            correct_answers: question.answer.correctAnswer as number[]
          } }
        }
      }
      if (question.type === 'connection') {
        if (foundAnswer.id_connection) {
          await this.prisma.answers_connection.update({
            where: { id: foundAnswer.id_connection },
            data: {
              options: question.answer.options,
              correct_answers: question.answer.correctAnswer as string[]
            }
          })
        } else {
          updateAnswerData.connection = { create: {
            options: question.answer.options,
            correct_answers: question.answer.correctAnswer as string[]
          } }
        }
      }
      if (question.type === 'boxSorting') {
        if (foundAnswer.id_box_sorting) {
          await this.prisma.answers_box_sorting.update({
            where: { id: foundAnswer.id_box_sorting },
            data: {
              options: question.answer.options,
              correct_answers: question.answer.correctAnswer
            }
          })
        } else {
          updateAnswerData.box_sorting = { create: {
            options: question.answer.options,
            correct_answers: question.answer.correctAnswer 
          } }
        } 
      }
      if (question.type === 'free') {
        if (foundAnswer.id_free) {
          await this.prisma.answers_free.update({
            where: { id: foundAnswer.id_free },
            data: {
              correct_answers: question.answer.correctAnswer as string
            }
          })
        } else {
          updateAnswerData.free = { create: {
            correct_answers: question.answer.correctAnswer as string
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

    const answer = await this.prisma.answers.findUnique({ where: { id: question.id_answer } })
    let questionAnswer: QuestAnswer

    if (answer.id_single) {
      const singleAnswer = await this.prisma.answers_single.findUnique({ where: { id: answer.id_single } })
      questionAnswer = {
        id: answer.id,
        options: singleAnswer.options,
        correctAnswer: singleAnswer.correct_answers
      }
    }

    if (answer.id_multiple) {
      const multipleAnswer = await this.prisma.answers_multiple.findUnique({ where: { id: answer.id_multiple } })
      questionAnswer = {
        id: answer.id,
        options: multipleAnswer.options,
        correctAnswer: multipleAnswer.correct_answers,
      }

    }

    if (answer.id_connection) {
      const connectionAnswer = await this.prisma.answers_connection.findUnique({ where: { id: answer.id_connection } })
      questionAnswer = {
        id: answer.id,
        options: connectionAnswer.options,
        correctAnswer: connectionAnswer.correct_answers,
      }
    }

    if (answer.id_box_sorting) {
      const boxSortingAnswer = await this.prisma.answers_box_sorting.findUnique({ where: { id: answer.id_box_sorting } })
      questionAnswer = {
        id: answer.id,
        options: boxSortingAnswer.options,
        correctAnswer: boxSortingAnswer.correct_answers as {[key: string]: number[]},
      }
    }

    if (answer.id_free) {
      const freeAnswer = await this.prisma.answers_free.findUnique({ where: { id: answer.id_free } })
      questionAnswer = {
        id: answer.id,
        correctAnswer: freeAnswer.correct_answers,
      }
    }
    return {
      id: question.id,
      text: question.text,
      type: question.type,
      answer: questionAnswer
    }
  }

  private async getResultsByQuestId(questId: number): Promise<GetQuestResult[]> {
    const results = await this.prisma.quest_results.findMany({ where: { quest: { id: questId } } })

    return Promise.all(results.map(async result => await this.getResultById(result.id)))
  }

  private async getResultById(id: number): Promise<GetQuestResult> {
    const foundResult =  await this.prisma.quest_results.findUnique({ where: { id } })

    if (!foundResult) {
      throw new NotFoundError(`Result with id ${id} not found`)
    }

    const foundImage = foundResult.id_image
      ? await this.prisma.shared_files.findUnique({ where: { id: foundResult.id_image } })
      : null

    return {
      id: foundResult.id,
      name: foundResult.name,
      image: foundImage ? await this.commonModuleService.getFileStats(foundImage.name) : null,
      minPoints: foundResult.min_points,
      description: foundResult.description
    }
  }

  private async saveResult(result:  Partial<QuestResult>): Promise<GetQuestResult> {

    if (result.id) {
      const foundResult = await this.prisma.quest_results.findUnique({ where: { id: result.id } })

      if (!foundResult) {
        throw new NotFoundError(`Result with id ${result.id} not found`)
      }

      const updateResultData: Prisma.quest_resultsUpdateInput = {}

      if (result.name) updateResultData.name = result.name
      if (result.imageId) updateResultData.image = { connect: { id: result.imageId } }
      if (result.minPoints) updateResultData.min_points = result.minPoints
      if (result.description) updateResultData.description = result.description

      await this.prisma.quest_results.update({
        where: { id: result.id },
        data: updateResultData
      })
    } else {
      const createResultData: Prisma.quest_resultsCreateInput = {
        name: result.name,
        min_points: result.minPoints,
        description: result.description,
        quest: { connect: { id: result.questId } },
      }

      if (result.imageId) createResultData.image = { connect: { id: result.imageId } }

      const {id} = await this.prisma.quest_results.create({
        data: createResultData
      })

      result.id = id
    }

    return this.getResultById(result.id)
  }
}