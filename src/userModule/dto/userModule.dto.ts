import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class UserAuthDto {
  @ApiProperty({
    example: 'test@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string
}
