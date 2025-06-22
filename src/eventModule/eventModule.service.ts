import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import {
  GetEventsMinimizeQuery,
  CreateEventDto,
  UpdateEventDto,
  UpdateEventParticipantsDto,
  SaveEventDto,
  GetEventTagsQuery,
} from './dto/eventModule.dto'
import {
  GetEventMinimizeSchema,
  GetEventSchema,
  GetEventStatusSchema,
  GetEventTagSchema,
  GetEventTypeSchema,
} from './schema/eventModule.schema'
import { Prisma } from '@prisma/client'
import { Executor, Inspector, Participant } from 'src/models/users'
import { EventType } from 'src/models/eventType'
import { EventStatus } from 'src/models/eventStatus'
import { NotFoundError } from 'src/errors/notFound'
import { difference } from 'lodash'
import { EventTag } from 'src/models/eventTag'
import { GamingService } from 'src/userModule/gaming.service'
import { FilesService } from 'src/commonModule/files/files.service'
import { GetFileStatsSchema } from 'src/commonModule/files/schema/GetFileStatsSchema'
import { CommentsService } from 'src/commonModule/comments/comments.service'
import { GetCommentsSchema } from 'src/commonModule/comments/schema/GetCommentsSchema'
import { GetUserProfileSchema } from 'src/userModule/schema/userModule.schema'
import { UserModuleService } from 'src/userModule/userModule.service'
import { GetDepartmentsSchema } from 'src/commonModule/departments/schema/GetDepartmentsSchema'
import { DepartmentsService } from 'src/commonModule/departments/department.service'

@Injectable()
export class EventModuleService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
    private gamingService: GamingService,
    private commentsService: CommentsService,
    private userModuleService: UserModuleService,
    private departmentsService: DepartmentsService,
  ) {}

  async getEvents(
    getEventsParams: GetEventsMinimizeQuery,
  ): Promise<GetEventMinimizeSchema[]> {
    const where: Prisma.eventsWhereInput = {}

    if (getEventsParams.status) where.id_status = { in: getEventsParams.status }
    if (getEventsParams.name) where.name = { contains: getEventsParams.name }
    if (getEventsParams.department)
      where.id_department = getEventsParams.department
    if (getEventsParams.dateStart)
      where.date = { gte: getEventsParams.dateStart }
    if (getEventsParams.dateEnd) where.date = { lte: getEventsParams.dateEnd }
    if (getEventsParams.executor)
      where.executors = { some: { id_executor: getEventsParams.executor } }
    if (getEventsParams.participant)
      where.participants = {
        some: { id_participant: getEventsParams.participant },
      }
    if (getEventsParams.type) where.id_type = getEventsParams.type

    const foundEvents = await this.prisma.events.findMany({
      where,
      take: getEventsParams.limit,
      orderBy: { date: 'desc' },
      skip: getEventsParams.offset,
    })

    return await Promise.all(
      foundEvents.map(
        async (event) => await this.getEventMinimizeWithAdditionalData(event),
      ),
    )
  }

  async getEventById(id: number): Promise<GetEventSchema> {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id,
      },
    })

    if (!foundEvent) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }

    return await this.getEventWithAdditionalData(foundEvent)
  }

  async createEvent(event: CreateEventDto): Promise<GetEventSchema> {
    return await this.saveEvent(event)
  }

  async updateEvent(
    id: number,
    event: UpdateEventDto,
  ): Promise<GetEventSchema> {
    const updateKeys = Object.keys(event)

    console.log(event)

    if (updateKeys.includes('executorsIds')) {
      const oldExecutorsIds = (
        await this.prisma.users.findMany({
          where: { events_where_executor: { some: { id_event: id } } },
        })
      ).map((executor) => executor.id)
      for (const executorId of [
        ...difference(oldExecutorsIds ?? [], event.executorsIds ?? []),
      ]) {
        await this.removeExecutorFromEvent(id, executorId)
      }
    }

    if (updateKeys.includes('filesIds')) {
      const oldFilesIds = (
        await this.prisma.shared_files.findMany({
          where: { events_where_file: { some: { id_event: id } } },
        })
      ).map((file) => file.id)
      for (const fileId of [
        ...difference(oldFilesIds ?? [], event.filesIds ?? []),
      ]) {
        await this.removeFileFromEvent(id, fileId)
      }
    }

    const foundEvent = await this.prisma.events.findUnique({
      where: { id },
    })

    event.id = foundEvent.id
    event.departmentId = foundEvent.id_department

    return await this.saveEvent(event)
  }

  async deleteEvent(id: number): Promise<void> {
    const executorsIds = (
      await this.prisma.users.findMany({
        where: { events_where_executor: { some: { id_event: id } } },
      })
    ).map((executor) => executor.id)
    for (let executorId of executorsIds ?? []) {
      await this.removeExecutorFromEvent(id, executorId)
    }

    const participantsIds = (
      await this.prisma.users.findMany({
        where: { events_where_participant: { some: { id_event: id } } },
      })
    ).map((participant) => participant.id)
    for (let participantId of participantsIds ?? []) {
      await this.removeParticipantFromEvent(id, participantId)
    }

    const filesIds = (
      await this.prisma.shared_files.findMany({
        where: { events_where_file: { some: { id_event: id } } },
      })
    ).map((file) => file.id)
    for (let fileId of filesIds ?? []) {
      await this.removeFileFromEvent(id, fileId)
    }

    await this.prisma.events.delete({
      where: { id },
    })
  }

  async addOrRemoveParticipants(
    id: number,
    updateParticipants: UpdateEventParticipantsDto,
  ): Promise<void> {
    const event = await this.prisma.events.findUnique({
      where: {
        id,
      },
    })

    if (!event) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }

    for (let participantId of updateParticipants.add || []) {
      await this.addParticipantToEvent(event.id, participantId)
      await this.gamingService.addAchievement(
        participantId,
        'FIRST_EVENT_REGISTER',
      )
    }

    for (let participantId of updateParticipants.remove ?? []) {
      await this.removeParticipantFromEvent(event.id, participantId)
    }
  }

  async getTypes(): Promise<GetEventTypeSchema[]> {
    const types = await this.prisma.event_types.findMany()
    return types.map((type) => ({
      id: type.id,
      name: type.name,
    }))
  }

  async getStatuses(): Promise<GetEventStatusSchema[]> {
    const statuses = await this.prisma.event_statuses.findMany()
    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
    }))
  }

  async getTags(searchQuery: GetEventTagsQuery): Promise<GetEventTagSchema[]> {
    const where: Prisma.event_tagsWhereInput = {}

    if (searchQuery.departmentId) {
      where.department_id = searchQuery.departmentId
    }

    const tags = await this.prisma.event_tags.findMany({ where })

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }))
  }

  async getParticipantsProfiles(eventId): Promise<GetUserProfileSchema[]> {
    const foundParticipants = await this.prisma.users.findMany({
      where: { events_where_participant: { some: { id_event: eventId } } },
    })

    return Promise.all(
      foundParticipants.map((participant) =>
        this.userModuleService.getUserProfileById(participant.id),
      ),
    )
  }

  private async getEventMinimizeWithAdditionalData(
    event,
  ): Promise<GetEventMinimizeSchema> {
    const eventData: GetEventMinimizeSchema = {
      id: event.id,
      places: event.places,
      schedule: event.schedule,
      status: await this.getStatus(event),
      tags: await this.getEventTags(event),
      department: await this.getDepartment(event),
      participantsCount: await this.prisma.user_participants_on_events.count({
        where: { id_event: event.id },
      }),
    }

    if (event.name) eventData.name = event.name
    if (event.date) eventData.date = event.date
    if (event.id_type) eventData.type = await this.getType(event)
    if (event.id_image_file) eventData.image = await this.getImage(event)

    return eventData
  }

  private async getEventWithAdditionalData(event): Promise<GetEventSchema> {
    const eventData: GetEventSchema = {
      ...(await this.getEventMinimizeWithAdditionalData(event)),
      files: await this.getFiles(event),
      executors: await this.getExecutors(event),
      participants: await this.getParticipants(event),
      inspectorComments: await this.getInspectorComments(event),
    }

    if (event.description) eventData.description = event.description
    if (event.seats_number) eventData.seatsNumber = event.seats_number
    if (event.id_inspector) eventData.inspector = await this.getInspector(event)

    return eventData
  }

  private async getExecutors(event): Promise<Executor[]> {
    const executors: Executor[] = []

    const foundExecutors = await this.prisma.users.findMany({
      where: { events_where_executor: { some: { id_event: event.id } } },
    })

    for (const executor of foundExecutors) {
      const foundExecutorPosition = await this.prisma.user_positions.findUnique(
        { where: { id: executor.id_position } },
      )
      const executorData: Executor = {
        id: executor.id,
        name: executor.first_name + ' ' + executor.last_name,
        position: foundExecutorPosition.name,
      }

      if (executor.id_image_file) {
        executorData.image = await this.getImage(executor)
      }

      executors.push(executorData)
    }

    return executors
  }

  private async getParticipants(event): Promise<Participant[]> {
    const participants = await this.prisma.users.findMany({
      where: { events_where_participant: { some: { id_event: event.id } } },
    })

    return participants.map((participant) => ({
      id: participant.id,
      name: participant.first_name + ' ' + participant.last_name,
    }))
  }

  private async getInspector(event): Promise<Inspector> {
    const foundInspector = await this.prisma.users.findUnique({
      where: { id: event.id_inspector },
    })
    const foundInspectorPosition = await this.prisma.user_positions.findUnique({
      where: { id: foundInspector.id_position },
    })

    return {
      id: foundInspector.id,
      name: foundInspector.first_name + ' ' + foundInspector.last_name,
      position: foundInspectorPosition.name,
    }
  }

  private async getType(event): Promise<EventType> {
    const foundType = await this.prisma.event_types.findUnique({
      where: {
        id: event.id_type,
      },
    })

    return {
      id: foundType.id,
      name: foundType.name,
    }
  }

  private async getStatus(event): Promise<EventStatus> {
    const foundStatus = await this.prisma.event_statuses.findUnique({
      where: { id: event.id_status },
    })

    return {
      id: foundStatus.id,
      name: foundStatus.name,
    }
  }

  private async getDepartment(event): Promise<GetDepartmentsSchema> {
    return await this.departmentsService.getDepartment({
      id: event.id_department,
    })
  }

  private async getImage(event): Promise<GetFileStatsSchema> {
    const foundFile = await this.prisma.shared_files.findUnique({
      where: { id: event.id_image_file },
    })

    return await this.filesService.getFileStats({ id: foundFile.id })
  }

  private async getFiles(event): Promise<GetFileStatsSchema[]> {
    const files = await this.prisma.shared_files.findMany({
      where: { events_where_file: { some: { id_event: event.id } } },
    })

    return Promise.all(
      files.map(
        async (file) => await this.filesService.getFileStats({ id: file.id }),
      ),
    )
  }

  private async getEventTags(event): Promise<EventTag[]> {
    const tags = await this.prisma.event_tags.findMany({
      where: { events: { some: { id: event.id } } },
    })

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
    }))
  }

  private async getInspectorComments(event): Promise<GetCommentsSchema[]> {
    return this.commentsService.getComments({
      entityName: 'events',
      entityId: event.id,
    })
  }

  private async saveEvent(event: SaveEventDto): Promise<GetEventSchema> {
    const foundEvent = await this.prisma.events.findUnique({
      where: { id: event.id ?? -1 },
    })
    const upsertEvent: Prisma.eventsUpsertArgs = {
      where: { id: event.id ?? -1 },
      create: { department: { connect: { id: event.departmentId } } },
      update: {},
    }
    const upsertData: Prisma.eventsUpdateInput = {}
    const onlyUpdateData: Prisma.eventsUpdateInput = {}
    const upsertFields = Object.keys(event)

    //Поля с простыми типами данных
    if (upsertFields.includes('date')) upsertData.date = event.date
    if (upsertFields.includes('name')) upsertData.name = event.name
    if (upsertFields.includes('places')) upsertData.places = event.places
    if (upsertFields.includes('schedule')) upsertData.schedule = event.schedule
    if (upsertFields.includes('description'))
      upsertData.description = event.description
    if (upsertFields.includes('seatsNumber'))
      upsertData.seats_number = event.seatsNumber

    //Обязательные поля с внешними ключами
    if (upsertFields.includes('statusId'))
      upsertData.status = { connect: { id: event.statusId } }

    //Не обязательные поля с внешними ключами
    if (upsertFields.includes('typeId')) {
      if (event.typeId) {
        upsertData.type = { connect: { id: event.typeId } }
      } else if (foundEvent?.id_type) {
        onlyUpdateData.type = { delete: true }
      }
    }
    if (upsertFields.includes('imageId')) {
      if (event.imageId) {
        upsertData.image = { connect: { id: event.imageId } }
      } else if (foundEvent?.id_image_file) {
        onlyUpdateData.image = { delete: true }
      }
    }

    upsertEvent.create = Object.assign(upsertEvent.create, upsertData)
    upsertEvent.update = { ...upsertData, ...onlyUpdateData }

    const savedEvent = await this.prisma.events.upsert(upsertEvent)

    for (const executorId of event.executorsIds ?? []) {
      await this.addExecutorToEvent(savedEvent.id, executorId)
    }
    for (const fileId of event.filesIds ?? []) {
      await this.addFileToEvent(savedEvent.id, fileId)
    }
    for (const tag of event.tags ?? []) {
      await this.prisma.event_tags.upsert({
        where: { id: tag.id ?? -1 },
        create: {
          name: tag.name,
          events: { connect: { id: savedEvent.id } },
          department: { connect: { id: event.departmentId } },
        },
        update: { events: { connect: { id: savedEvent.id } } },
      })
    }
    for (const comment of event.inspectorComments ?? []) {
      await this.prisma.comments.upsert({
        where: { id: comment.id ?? -1 },
        create: {
          text: comment.text,
          user: { connect: { id: comment.userId } },
          entity_name: 'events',
          entity_id: savedEvent.id,
        },
        update: {},
      })
    }

    return this.getEventById(savedEvent.id)
  }

  private async addExecutorToEvent(eventId: number, executorId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        executors: {
          connectOrCreate: {
            where: {
              id_event_id_executor: {
                id_event: eventId,
                id_executor: executorId,
              },
            },
            create: { id_executor: executorId },
          },
        },
      },
    })
  }

  private async removeExecutorFromEvent(eventId: number, executorId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        executors: {
          delete: {
            id_event_id_executor: {
              id_event: eventId,
              id_executor: executorId,
            },
          },
        },
      },
    })
  }

  private async addParticipantToEvent(eventId: number, participantId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        participants: {
          connectOrCreate: {
            where: {
              id_event_id_participant: {
                id_event: eventId,
                id_participant: participantId,
              },
            },
            create: { id_participant: participantId },
          },
        },
      },
    })
  }

  private async removeParticipantFromEvent(
    eventId: number,
    participantId: number,
  ) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        participants: {
          delete: {
            id_event_id_participant: {
              id_event: eventId,
              id_participant: participantId,
            },
          },
        },
      },
    })
  }

  private async addFileToEvent(eventId: number, fileId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        files: {
          connectOrCreate: {
            where: {
              id_event_id_file: {
                id_event: eventId,
                id_file: fileId,
              },
            },
            create: { id_file: fileId },
          },
        },
      },
    })
  }

  private async removeFileFromEvent(eventId: number, fileId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        files: {
          delete: {
            id_event_id_file: {
              id_event: eventId,
              id_file: fileId,
            },
          },
        },
      },
    })
  }
}
