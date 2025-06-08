import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

type USER_SEX = 'Мужской' | 'Женский'

export class GetUsersQuery {
  limit: number
  offset: number
  id?: number
  roleId?: number
  isAdmin?: boolean
  positionId?: number
  isEmployee?: boolean
  departmentId?: number
}

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

export class UpdateProfileDto {
  @ApiProperty({
    example: 'roman.nichi.o@gmail.com',
    required: false,
  })
  email: string

  @ApiProperty({
    example: 'Roman',
    required: false,
  })
  firstName: string

  @ApiProperty({
    example: 'Nichi',
    required: false,
  })
  lastName: string

  @ApiProperty({
    example: 'Olegovich',
    required: false,
  })
  patronymic: string

  @ApiProperty({
    example: new Date('2003-06-28T00:00:00.000Z'),
    required: false,
  })
  birthDate: Date

  @ApiProperty({
    example: 'Мужской',
    required: false,
  })
  sex: USER_SEX

  @ApiProperty({
    example: '8(999)999-99-99',
    required: false,
  })
  phoneNumber: string

  @ApiProperty({
    example: 'Nichi_Ro',
    required: false,
  })
  telegram: string

  @ApiProperty({
    example: 1,
    required: false,
  })
  imageId: number

  @ApiProperty({
    example: 1,
    required: false,
  })
  roleId: number

  @ApiProperty({
    example: 1,
    required: false,
  })
  positionId: number

  @ApiProperty({
    example: 1,
    required: false,
  })
  departmentId: number

  @ApiProperty({
    example: 'password',
    required: false,
  })
  password: string
}
