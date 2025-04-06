import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetEventsMinimizeQuery, CreateEventDto, UpdateEventDto } from "./dto/eventModule.dto";
import { GetEventMinimizeSchema, GetEventSchema } from "./schema/eventModule.schema";
import { Prisma } from "@prisma/client";
import { Executor, Inspector, Participant } from "src/models/users";
import { EventType } from "src/models/eventType";
import { EventStatus } from "src/models/eventStatus";
import { Department } from "src/models/department";
import { NotFoundError } from "src/errors/notFound";

@Injectable()
export class EventModuleService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getEvents(getEventsParams: GetEventsMinimizeQuery): Promise<GetEventMinimizeSchema[]> {
    const where: Prisma.eventsWhereInput = {};

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
          status: eventWithAdditionalData.status
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
      schedule: eventWithAdditionalData.schedule
    }
  }

  async createEvent(event: CreateEventDto): Promise<GetEventSchema> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: {
        id: event.departmentId
      }
    })

    if (!foundDepartment) {
      throw new NotFoundError(`Department with id ${event.departmentId} not found`)
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
    if (event.executorsIds) updateData.executors = {
      connect: await Promise.all(event.executorsIds.map(async executorId => {
        const foundExecutor = await this.prisma.users.findUnique({
          where: {
            id: executorId
          }
        })

        if (!foundExecutor) {
          throw new NotFoundError(`Executor with id ${executorId} not found`)
        }

        return {id_event_id_executor: { id_event: createdEvent.id, id_executor: executorId }}
      }))
    }
    if (event.statusId) {
      const foundStatus = await this.prisma.event_statuses.findUnique({
        where: {
          id: event.statusId
        }
      })

      if (!foundStatus) {
        throw new NotFoundError(`Status with id ${event.statusId} not found`)
      }

      updateData.status = { connect: { id: event.statusId } }
    }
    if (event.typeId) {
      const foundType = await this.prisma.event_types.findUnique({
        where: {
          id: event.typeId
        }
      })

      if (!foundType) {
        throw new NotFoundError(`Type with id ${event.typeId} not found`)
      }

      updateData.type = { connect: { id: event.typeId } }
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
      status: eventWithAdditionalData.status
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

    const updateData: Prisma.eventsUpdateInput = {}

    if (updateEvent.name) updateData.name = updateEvent.name
    if (updateEvent.description) updateData.description = updateEvent.description
    if (updateEvent.date) updateData.date = updateEvent.date
    if (updateEvent.seatsNumber) updateData.seats_number = updateEvent.seatsNumber
    if (updateEvent.places) updateData.places = { set: updateEvent.places}
    if (updateEvent.schedule) updateData.schedule = { set: updateEvent.schedule }
    if (updateEvent.executorsIds) updateData.executors = {
      connect: await Promise.all(updateEvent.executorsIds.map(async executorId => {
        const foundExecutor = await this.prisma.users.findUnique({
          where: {
            id: executorId
          }
        })

        if (!foundExecutor) {
          throw new NotFoundError(`Executor with id ${executorId} not found`)
        }

        return {id_event_id_executor: { id_event: event.id, id_executor: executorId }}
      }))
    }
    if (updateEvent.statusId) {
      const foundStatus = await this.prisma.event_statuses.findUnique({
        where: {
          id: updateEvent.statusId
        }
      })

      if (!foundStatus) {
        throw new NotFoundError(`Status with id ${updateEvent.statusId} not found`)
      }

      updateData.status = { connect: { id: updateEvent.statusId } }
    }
    if (updateEvent.typeId) {
      const foundType = await this.prisma.event_types.findUnique({
        where: {
          id: updateEvent.typeId
        }
      })

      if (!foundType) {
        throw new NotFoundError(`Type with id ${updateEvent.typeId} not found`)
      }
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
      status: eventWithAdditionalData.status
    }
  }

  private async getEventMinimizeWithAdditionalData(event): Promise<GetEventMinimizeSchema> {
    if (event.id_type) event.type = await this.getType(event)
    if (event.id_status) event.status = await this.getStatus(event)

    return event
  }

  private async getEventWithAdditionalData(event): Promise<GetEventSchema> {
    if (event.executors_ids.length) event.executors = await this.getExecutors(event)
    if (event.participants_ids.length) event.participants = await this.getParticipants(event)
    if (event.id_inspector) event.inspector = await this.getInspector(event)
    if (event.id_type) event.type = await this.getType(event)
    if (event.id_status) event.status = await this.getStatus(event)

    return event
  }

  private async getExecutors(event): Promise<Executor[]> {
    const executors: Executor[] = [];

    for (let executorId of event.executors_ids) {
      const foundExecutor = await this.prisma.users.findUnique({
        where: {
          id: executorId
        }
      })
      const foundExecutorPosition = await this.prisma.user_positions.findUnique({
        where: {
          id: foundExecutor.id_position
        }
      })

      executors.push({
        id: foundExecutor.id,
        name: foundExecutor.first_name + ' ' + foundExecutor.last_name,
        position: foundExecutorPosition.name
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
}