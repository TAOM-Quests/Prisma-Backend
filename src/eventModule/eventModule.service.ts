import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetEventsMinimizeQuery } from "./dto/eventModule.dto";
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
      status: eventWithAdditionalData.status
    }
  }

  private async getEventMinimizeWithAdditionalData(event): Promise<GetEventMinimizeSchema> {
    const type = await this.getType(event)
    const status = await this.getStatus(event)

    return {...event, type, status}
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