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

    return foundDepartments.map((department) => ({
      id: department.id,
      name: department.name,
      description: department.description,
      image: this.filesService.getFileStats({ id: department.id_image }),
    }))
  }
}
