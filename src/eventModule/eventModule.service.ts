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
import { Department } from 'src/models/department'
import { NotFoundError } from 'src/errors/notFound'
import { CommonModuleService } from 'src/commonModule/commonModule.service'
import { GetFileStatsSchema } from 'src/commonModule/schema/commonModule.schema'
import { difference } from 'lodash'
import { EventTag } from 'src/models/eventTag'

@Injectable()
export class EventModuleService {
  constructor(
    private prisma: PrismaService,
    private commonModuleService: CommonModuleService,
  ) {}

  async getEvents(
    getEventsParams: GetEventsMinimizeQuery,
  ): Promise<GetEventMinimizeSchema[]> {
    const where: Prisma.eventsWhereInput = {}

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

  private async getDepartment(event): Promise<Department> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: { id: event.id_department },
    })

    return {
      id: foundDepartment.id,
      name: foundDepartment.name,
    }
  }

  private async getImage(event): Promise<GetFileStatsSchema> {
    const foundFile = await this.prisma.shared_files.findUnique({
      where: { id: event.id_image_file },
    })

    return await this.commonModuleService.getFileStats(foundFile.name)
  }

  private async getFiles(event): Promise<GetFileStatsSchema[]> {
    const files = await this.prisma.shared_files.findMany({
      where: { events_where_file: { some: { id_event: event.id } } },
    })

    return Promise.all(
      files.map(
        async (file) => await this.commonModuleService.getFileStats(file.name),
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

  private async saveEvent(event: SaveEventDto): Promise<GetEventSchema> {
    const upsertEvent: Prisma.eventsUpsertArgs = {
      where: { id: event.id ?? -1 },
      create: { department: { connect: { id: event.departmentId } } },
      update: {},
    }
    const upsertData: Prisma.eventsUpdateInput = {}

    if (event.date) upsertData.date = event.date
    if (event.name) upsertData.name = event.name
    if (event.places) upsertData.places = event.places
    if (event.schedule) upsertData.schedule = event.schedule
    if (event.description) upsertData.description = event.description
    if (event.seatsNumber) upsertData.seats_number = event.seatsNumber
    if (event.typeId) upsertData.type = { connect: { id: event.typeId } }
    if (event.imageId) upsertData.image = { connect: { id: event.imageId } }
    if (event.statusId) upsertData.status = { connect: { id: event.statusId } }

    upsertEvent.create = Object.assign(upsertEvent.create, upsertData)
    upsertEvent.update = upsertData

    const savedEvent = await this.prisma.events.upsert(upsertEvent)

    for (const executorId of event.executorsIds) {
      await this.addExecutorToEvent(savedEvent.id, executorId)
    }
    for (const fileId of event.filesIds) {
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

    return this.getEventById(savedEvent.id)
  }

  private async addExecutorToEvent(eventId: number, executorId: number) {
    await this.prisma.user_executors_on_events.create({
      data: {
        id_executor: executorId,
        id_event: eventId,
      },
    })
  }

  private async removeExecutorFromEvent(eventId: number, executorId: number) {
    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        executors: {
          disconnect: {
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
          connect: {
            id_event_id_participant: {
              id_event: eventId,
              id_participant: participantId,
            },
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
          disconnect: {
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
          connect: {
            id_event_id_file: { id_event: eventId, id_file: fileId },
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
          disconnect: {
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
