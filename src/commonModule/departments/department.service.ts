import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetDepartmentsSchema } from './schema/GetDepartmentsSchema'

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async getDepartments(): Promise<GetDepartmentsSchema[]> {
    const foundDepartments = await this.prisma.departments.findMany()

    return foundDepartments.map((department) => ({
      id: department.id,
      name: department.name,
    }))
  }

  async getDepartment({ id }: { id: number }): Promise<GetDepartmentsSchema> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: { id },
    })

    return {
      id: foundDepartment.id,
      name: foundDepartment.name,
    }
  }
}
