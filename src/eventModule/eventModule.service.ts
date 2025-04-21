import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetEventsMinimizeQuery, CreateEventDto, UpdateEventDto, UpdateEventParticipantsDto } from "./dto/eventModule.dto";
import { GetEventMinimizeSchema, GetEventSchema, GetEventStatusSchema, GetEventTypeSchema } from "./schema/eventModule.schema";
import { Prisma } from "@prisma/client";
import { Executor, Inspector, Participant } from "src/models/users";
import { EventType } from "src/models/eventType";
import { EventStatus } from "src/models/eventStatus";
import { Department } from "src/models/department";
import { NotFoundError } from "src/errors/notFound";
import { CommonModuleService } from "src/commonModule/commonModule.service";
import { GetFileStatsSchema } from "src/commonModule/schema/commonModule.schema";

@Injectable()
export class EventModuleService {
  constructor(
    private prisma: PrismaService,
    private commonModuleService: CommonModuleService
  ) {}

  async getEvents(getEventsParams: GetEventsMinimizeQuery): Promise<GetEventMinimizeSchema[]> {
    const where: Prisma.eventsWhereInput = {};

    if (getEventsParams.name) where.name = {contains: getEventsParams.name}
    if (getEventsParams.department) where.id_department = getEventsParams.department
    if (getEventsParams.date) where.date = getEventsParams.date
    if (getEventsParams.executor) where.executors_ids = {has: getEventsParams.executor}
    if (getEventsParams.participant) where.participants_ids = {has: getEventsParams.participant}
    if (getEventsParams.type) where.id_type = getEventsParams.type

    const foundEvents = await this.prisma.events.findMany({
      where
    })

    return await Promise.all(
      foundEvents.map(async event => {
        const eventWithAdditionalData = await this.getEventMinimizeWithAdditionalData(event)

        return {
          id: eventWithAdditionalData.id,
          name: eventWithAdditionalData.name,
          date: eventWithAdditionalData.date,
          places: eventWithAdditionalData.places,
          type: eventWithAdditionalData.type,
          status: eventWithAdditionalData.status,
          image: eventWithAdditionalData.image
        }
      })
    )
  }

  async getEventById(id: number): Promise<GetEventSchema> {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id
      }
    })

    if (!foundEvent) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }

    const eventWithAdditionalData = await this.getEventWithAdditionalData(foundEvent)

    return {
      id: eventWithAdditionalData.id,
      name: eventWithAdditionalData.name,
      description: eventWithAdditionalData.description,
      date: eventWithAdditionalData.date,
      seatsNumber: eventWithAdditionalData.seatsNumber,
      inspector: eventWithAdditionalData.inspector,
      executors: eventWithAdditionalData.executors,
      participants: eventWithAdditionalData.participants,
      places: eventWithAdditionalData.places,
      type: eventWithAdditionalData.type,
      status: eventWithAdditionalData.status,
      schedule: eventWithAdditionalData.schedule,
      image: eventWithAdditionalData.image,
      files: eventWithAdditionalData.files
    }
  }

  async createEvent(event: CreateEventDto): Promise<GetEventSchema> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: {
        id: event.departmentId
      }
    })
    const foundStatus = event.statusId
      ? await this.prisma.event_statuses.findUnique({
        where: {
          id: event.statusId
        }
      })
      : null
    const foundType = event.typeId
      ? await this.prisma.event_types.findUnique({
        where: {
          id: event.typeId
        }
      })
      : null
    const foundImage = event.imageId
      ? await this.prisma.shared_files.findUnique({
        where: {
          id: event.imageId
        }
      })
      : null

    if (!foundDepartment) {
      throw new NotFoundError(`Department with id ${event.departmentId} not found`)
    }
    if (event.statusId && !foundStatus) {
      throw new NotFoundError(`Status with id ${event.statusId} not found`)
    }
    if (event.typeId && !foundType) {
      throw new NotFoundError(`Type with id ${event.typeId} not found`)
    }
    if (event.imageId && !foundImage) {
      throw new NotFoundError(`Image with id ${event.imageId} not found`)
    }

    for (let executorId of event.executorsIds ?? []) {
      const foundExecutor = await this.prisma.users.findUnique({
        where: {
          id: executorId
        }
      })

      if (!foundExecutor) {
        throw new NotFoundError(`Executor with id ${executorId} not found`) 
      }
    }

    for (let fileId of event.filesIds ?? []) {
      const foundFile = await this.prisma.shared_files.findUnique({
        where: {
          id: fileId
        }
      })

      if (!foundFile) {
        throw new NotFoundError(`File with id ${fileId} not found`)
      }
    }

    const createData: Prisma.eventsCreateInput = {
      department: {
        connect: {id: event.departmentId}
      }
    }
    const createdEvent = await this.prisma.events.create({data: createData})
    const updateData: Prisma.eventsUpdateInput = {}

    if (event.name) updateData.name = event.name
    if (event.description) updateData.description = event.description
    if (event.date) updateData.date = event.date
    if (event.seatsNumber) updateData.seats_number = event.seatsNumber
    if (event.places) updateData.places = { set: event.places}
    if (event.schedule) updateData.schedule = { set: event.schedule }
    if (event.statusId) updateData.status = { connect: { id: event.statusId } }
    if (event.typeId) updateData.type = { connect: { id: event.typeId } }
    if (event.imageId) updateData.image = { connect: { id: event.imageId } }

    for (let executorId of event.executorsIds ?? []) {
      await this.addExecutorToEvent(createdEvent.id, executorId)
    }

    for (let fileId of event.filesIds ?? []) {
      await this.addFileToEvent(createdEvent.id, fileId)
    }

    const updatedEvent = await this.prisma.events.update({
      where: { id: createdEvent.id },
      data: updateData
    })
    const eventWithAdditionalData = await this.getEventWithAdditionalData(updatedEvent)

    return {
      id: eventWithAdditionalData.id,
      name: eventWithAdditionalData.name,
      description: eventWithAdditionalData.description,
      date: eventWithAdditionalData.date,
      seatsNumber: eventWithAdditionalData.seatsNumber,
      inspector: eventWithAdditionalData.inspector,
      executors: eventWithAdditionalData.executors,
      participants: eventWithAdditionalData.participants,
      places: eventWithAdditionalData.places,
      schedule: eventWithAdditionalData.schedule,
      type: eventWithAdditionalData.type,
      status: eventWithAdditionalData.status,
      image: eventWithAdditionalData.image,
      files: eventWithAdditionalData.files
    }
  }

  async updateEvent(id: number, updateEvent: UpdateEventDto): Promise<GetEventSchema> {
    const event = await this.prisma.events.findUnique({
      where: {
        id
      }
    })

    if (!event) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }

    const foundStatus = updateEvent.statusId
      ? await this.prisma.event_statuses.findUnique({
        where: {
          id: updateEvent.statusId
        }
      })
      : null
    const foundType = updateEvent.typeId
      ? await this.prisma.event_types.findUnique({
        where: {
          id: updateEvent.typeId
        }
      })
      : null
    const foundImage = updateEvent.imageId
      ? await this.prisma.shared_files.findUnique({
        where: {
          id: updateEvent.imageId
        }
      })
      : null

    if (updateEvent.statusId && !foundStatus) {
      throw new NotFoundError(`Status with id ${updateEvent.statusId} not found`)
    }
    if (updateEvent.typeId && !foundType) {
      throw new NotFoundError(`Type with id ${updateEvent.typeId} not found`)
    }
    if (updateEvent.imageId && !foundImage) {
      throw new NotFoundError(`Image with id ${updateEvent.imageId} not found`)
    }

    for (let executorId of updateEvent.executorsIds ?? []) {
      const foundExecutor = await this.prisma.users.findUnique({
        where: {
          id: executorId
        }
      })

      if (!foundExecutor) {
        throw new NotFoundError(`Executor with id ${executorId} not found`) 
      }
    }

    for (let fileId of updateEvent.filesIds ?? []) {
      const foundFile = await this.prisma.shared_files.findUnique({
        where: {
          id: fileId
        }
      })

      if (!foundFile) {
        throw new NotFoundError(`File with id ${fileId} not found`)
      }
    }

    const updateData: Prisma.eventsUpdateInput = {}

    if (updateEvent.date) updateData.date = updateEvent.date
    if (updateEvent.name) updateData.name = updateEvent.name
    if (updateEvent.places) updateData.places = { set: updateEvent.places}
    if (updateEvent.schedule) updateData.schedule = { set: updateEvent.schedule }
    if (updateEvent.description) updateData.description = updateEvent.description
    if (updateEvent.seatsNumber) updateData.seats_number = updateEvent.seatsNumber
    if (updateEvent.typeId) updateData.type = { connect: { id: updateEvent.typeId } }
    if (updateEvent.imageId) updateData.image = { connect: { id: updateEvent.imageId } }
    if (updateEvent.statusId) updateData.status = { connect: { id: updateEvent.statusId } }

    for (let executorId of event.executors_ids ?? []) {
      await this.removeExecutorFromEvent(id, executorId)
    }

    for (let executorId of updateEvent.executorsIds ?? []) {
      await this.addExecutorToEvent(id, executorId)
    }

    for (let fileId of event.files_ids ?? []) {
      await this.removeFileFromEvent(id, fileId)
    }

    for (let fileId of updateEvent.filesIds ?? []) {
      await this.addFileToEvent(id, fileId)
    }

    const updatedEvent = await this.prisma.events.update({
      where: { id: event.id },
      data: updateData
    })
    const eventWithAdditionalData = await this.getEventWithAdditionalData(updatedEvent)

    return {
      id: eventWithAdditionalData.id,
      name: eventWithAdditionalData.name,
      description: eventWithAdditionalData.description,
      date: eventWithAdditionalData.date,
      seatsNumber: eventWithAdditionalData.seatsNumber,
      inspector: eventWithAdditionalData.inspector,
      executors: eventWithAdditionalData.executors,
      participants: eventWithAdditionalData.participants,
      places: eventWithAdditionalData.places,
      schedule: eventWithAdditionalData.schedule,
      type: eventWithAdditionalData.type,
      status: eventWithAdditionalData.status,
      image: eventWithAdditionalData.image,
      files: eventWithAdditionalData.files
    }
  }

  async deleteEvent(id: number): Promise<void> {
    const event = await this.prisma.events.findUnique({
      where: {
        id
      }
    })

    if (!event) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }

    for (let executorId of event.executors_ids ?? []) {
      await this.removeExecutorFromEvent(id, executorId)
    }
    for (let participantId of event.participants_ids ?? []) {
      await this.removeParticipantFromEvent(id, participantId)
    }
    for (let fileId of event.files_ids ?? []) {
      await this.removeFileFromEvent(id, fileId)
    }

    await this.prisma.events.delete({
      where: {
        id
      }
    })
  }

  async addOrRemoveParticipants(id: number, updateParticipants: UpdateEventParticipantsDto): Promise<void> {
    const event = await this.prisma.events.findUnique({
      where: {
        id
      }
    })

    if (!event) {
      throw new NotFoundError(`Event with id ${id} not found`)
    }
    
    for (let participantId of updateParticipants.add ?? []) {
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
      name: type.name
    }))
  }

  async getStatuses(): Promise<GetEventStatusSchema[]> {
    const statuses = await this.prisma.event_statuses.findMany()
    return statuses.map((status) => ({
      id: status.id,
      name: status.name
    }))
  }

  private async getEventMinimizeWithAdditionalData(event): Promise<GetEventMinimizeSchema> {
    if (event.id_type) event.type = await this.getType(event)
    if (event.id_status) event.status = await this.getStatus(event)
    if (event.id_image_file) event.image = await this.getImage(event)

    return event
  }

  private async getEventWithAdditionalData(event): Promise<GetEventSchema> {
    if (event.executors_ids.length) event.executors = await this.getExecutors(event)
    if (event.participants_ids.length) event.participants = await this.getParticipants(event)
    if (event.id_inspector) event.inspector = await this.getInspector(event)
    if (event.id_type) event.type = await this.getType(event)
    if (event.id_status) event.status = await this.getStatus(event)
    if (event.id_image_file) event.image = await this.getImage(event)
    if (event.files_ids.length) event.files = await this.getFiles(event)

    return event
  }

  private async getExecutors(event): Promise<Executor[]> {
    const executors: Executor[] = [];

    for (let executorId of event.executors_ids ?? []) {
      const foundExecutor = await this.prisma.users.findUnique({
        where: {
          id: executorId
        }
      })
      const foundExecutorPosition = foundExecutor.id_position
        ? await this.prisma.user_positions.findUnique({
            where: {
              id: foundExecutor.id_position
            }
          })
        : null

      executors.push({
        id: foundExecutor.id,
        name: foundExecutor.first_name + ' ' + foundExecutor.last_name,
        position: foundExecutorPosition?.name
      })
    }

    return executors
  }

  private async getParticipants(event): Promise<Participant[]> {
    const participants = await this.prisma.users.findMany({
      where: {
        id: {
          in: event.participants_ids
        }
      }
    })

    return participants.map(participant => ({
      id: participant.id,
      name: participant.first_name + ' ' + participant.last_name
    }))
  }

  private async getInspector(event): Promise<Inspector> {
    const foundInspector = await this.prisma.users.findUnique({
      where: {
        id: event.id_inspector
      }
    })
    const foundInspectorPosition = await this.prisma.user_positions.findUnique({
      where: {
        id: foundInspector.id_position
      }
    })

    return {
      id: foundInspector.id,
      name: foundInspector.first_name + ' ' + foundInspector.last_name,
      position: foundInspectorPosition.name
    }
  }

  private async getType(event): Promise<EventType> {
    const foundType = await this.prisma.event_types.findUnique({
      where: {
        id: event.id_type
      }
    })

    return {
      id: foundType.id,
      name: foundType.name
    }
  }

  private async getStatus(event): Promise<EventStatus> {
    const foundStatus = await this.prisma.event_statuses.findUnique({
      where: {
        id: event.id_status
      }
    })

    return {
      id: foundStatus.id,
      name: foundStatus.name
    }
  }

  private async getDepartment(event): Promise<Department> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: {
        id: event.id_department
      }
    })    

    return {
      id: foundDepartment.id,
      name: foundDepartment.name
    }
  }

  private async getImage(event): Promise<GetFileStatsSchema> {
    const foundFile = await this.prisma.shared_files.findUnique({
      where: {
        id: event.id_image_file
      }
    })

    return await this.commonModuleService.getFileStats(foundFile.name)
  }

  private async getFiles(event): Promise<GetFileStatsSchema[]> {
    const files = await this.prisma.shared_files.findMany({
      where: {
        id: {
          in: event.files_ids
        }
      }
    })

    return Promise.all(files.map(async file => await this.commonModuleService.getFileStats(file.name)))
  }

  private async addExecutorToEvent(eventId: number, executorId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })
    const foundExecutor = await this.prisma.users.findUnique({
      where: {
        id: executorId
      }
    })

    await this.prisma.users.update({
      where: { id: executorId },
      data: {
        events_where_executor_ids: foundExecutor.events_where_executor_ids.concat(eventId),
        events_where_executor: {
          connectOrCreate: { 
            where: { id_event_id_executor: { id_event: eventId, id_executor: executorId } },
            create: { event: { connect: { id: eventId } } }
          }
        }
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        executors_ids: foundEvent.executors_ids.concat(executorId),
        executors: {
          connect: { 
            id_event_id_executor: { id_event: eventId, id_executor: executorId }
          }
        }
      }
    })
  }

  private async removeExecutorFromEvent(eventId: number, executorId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })
    const foundExecutor = await this.prisma.users.findUnique({
      where: {
        id: executorId
      }
    })

    await this.prisma.user_executors_on_events.delete({
      where: {
        id_event_id_executor: { id_event: eventId, id_executor: executorId }
      }
    })

    await this.prisma.users.update({
      where: { id: executorId },
      data: {
        events_where_executor_ids: foundExecutor.events_where_executor_ids.filter(id => id !== eventId)
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        executors_ids: foundEvent.executors_ids.filter(id => id !== executorId)
      }
    })
  }

  private async addParticipantToEvent(eventId: number, participantId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })
    const foundParticipant = await this.prisma.users.findUnique({
      where: {
        id: participantId
      }
    })

    await this.prisma.users.update({
      where: { id: participantId },
      data: {
        events_where_participant_ids: foundParticipant.events_where_participant_ids.concat(eventId),
        events_where_participant: {
          connectOrCreate: { 
            where: { id_event_id_participant: { id_event: eventId, id_participant: participantId } },
            create: { event: { connect: { id: eventId } } }
          }
        }
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        participants_ids: foundEvent.participants_ids.concat(participantId),
        participants: {
          connect: { 
            id_event_id_participant: { id_event: eventId, id_participant: participantId }
          }
        }
      }
    })
  }

  private async removeParticipantFromEvent(eventId: number, participantId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })
    const foundParticipant = await this.prisma.users.findUnique({
      where: {
        id: participantId
      }
    })

    await this.prisma.user_participants_on_events.delete({
      where: {
        id_event_id_participant: { id_event: eventId, id_participant: participantId }
      }
    })

    await this.prisma.users.update({
      where: { id: participantId },
      data: {
        events_where_participant_ids: foundParticipant.events_where_participant_ids.filter(id => id !== eventId)
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        participants_ids: foundEvent.participants_ids.filter(id => id !== participantId)
      }
    })
  }

  private async addFileToEvent(eventId: number, fileId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        files_ids: foundEvent.files_ids.concat(fileId),
        files: {
          connect: { 
            id_event_id_file: { id_event: eventId, id_file: fileId }
          }
        }
      }
    })

    await this.prisma.shared_files.update({
      where: { id: fileId },
      data: {
        events_where_file: {
          connect: { 
            id_event_id_file: { id_event: eventId, id_file: fileId }
          }
        }
      }
    })
  }
      
  private async removeFileFromEvent(eventId: number, fileId: number) {
    const foundEvent = await this.prisma.events.findUnique({
      where: {
        id: eventId
      }
    })

    await this.prisma.shared_files_on_events.delete({
      where: {
        id_event_id_file: { id_event: eventId, id_file: fileId }
      }
    })

    await this.prisma.events.update({
      where: { id: eventId },
      data: {
        files_ids: foundEvent.files_ids.filter(id => id !== fileId)
      }
    })
  }
}