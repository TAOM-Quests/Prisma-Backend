import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GetEventsParams } from "./dto/eventModule.dto";
import { GetEventSchema } from "./schema/eventModule.schema";
import { Prisma } from "@prisma/client";
import { Executor, Inspector, Participant } from "src/models/users";
import { EventType } from "src/models/eventType";
import { EventStatus } from "src/models/eventStatus";
import { Department } from "src/models/department";

@Injectable()
export class EventModuleService {
  constructor(
    private prisma: PrismaService
  ) {}

  async getEvents(getEventsParams: GetEventsParams): Promise<GetEventSchema[]> {
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
      foundEvents.map(async event => await this.getEventWithAdditionalData(event))
    )
  }

  private async getEventWithAdditionalData(event): Promise<GetEventSchema> {
    const executors = await this.getExecutors(event)
    const participants = await this.getParticipants(event)
    const inspector = await this.getInspector(event)
    const type = await this.getType(event)
    const status = await this.getStatus(event)
    const department = await this.getDepartment(event)

    return {...event, executors, participants, inspector, type, status, department}
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