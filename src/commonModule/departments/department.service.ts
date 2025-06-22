import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { GetDepartmentsSchema } from './schema/GetDepartmentsSchema'
import { FilesService } from '../files/files.service'

@Injectable()
export class DepartmentsService {
  constructor(
    private prisma: PrismaService,
    private filesService: FilesService,
  ) {}

  async getDepartments(): Promise<GetDepartmentsSchema[]> {
    const foundDepartments = await this.prisma.departments.findMany()

    return await Promise.all(
      foundDepartments.map(async (department) => ({
        id: department.id,
        name: department.name,
        description: department.description,
        image: await this.filesService.getFileStats({
          id: department.id_image,
        }),
      })),
    )
  }

  async getDepartment({ id }: { id: number }): Promise<GetDepartmentsSchema> {
    const foundDepartment = await this.prisma.departments.findUnique({
      where: { id },
    })

    return {
      id: foundDepartment.id,
      name: foundDepartment.name,
      description: foundDepartment.description,
      image: await this.filesService.getFileStats({
        id: foundDepartment.id_image,
      }),
    }
  }
}
