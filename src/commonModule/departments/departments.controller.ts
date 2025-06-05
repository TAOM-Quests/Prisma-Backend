import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiResponse } from '@nestjs/swagger'
import { DepartmentsService } from './department.service'
import { getDepartmentsSchemaExample } from './schema/example/getDepartmentsSchemaExample'
import { GetDepartmentsSchema } from './schema/GetDepartmentsSchema'

@ApiTags('commonModule')
@Controller('commonModule/departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @ApiResponse({
    status: 200,
    type: GetDepartmentsSchema,
    example: getDepartmentsSchemaExample,
  })
  @Get('')
  async getDepartments(): Promise<GetDepartmentsSchema[]> {
    return this.departmentsService.getDepartments()
  }
}
