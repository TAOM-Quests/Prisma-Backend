import { ApiProperty } from '@nestjs/swagger'

export class GetFileDto {
  @ApiProperty({ example: 1, required: false })
  id?: number

  @ApiProperty({ example: 'Default_avatar', required: false })
  fileName?: string
}
