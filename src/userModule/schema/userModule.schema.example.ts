import {
  GetPositionsSchema,
  GetRolesSchema,
  GetUserProfileSchema,
  UpdateUserProfileSchema,
} from './userModule.schema'

export const getUsersSchemaExample = {
  id: 10,
  name: 'Roman Nichi',
  position: 'President of Academy',
}

export const authUserSchemaExample = {
  id: 10,
  email: 'test@gmail.com',
  token: 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4',
}

export const getUserProfileSchemaExample: GetUserProfileSchema = {
  id: 10,
  email: 'roman.nichi.o@gmail.com',
  firstName: 'Roman',
  lastName: 'Nichi',
  patronymic: 'Olegovich',
  birthDate: new Date('2003-06-28T00:00:00.000Z'),
  sex: 'Male',
  phoneNumber: '8(999)999-99-99',
  department: {
    id: 2,
    name: 'IT',
  },
  position: {
    id: 2,
    name: 'President of Academy',
  },
  role: {
    id: 0,
    name: 'Admin',
    description: 'Director of department',
  },
  image: {
    id: 1,
    name: 'image.png',
    size: 12345,
    originalName: 'image.png',
    extension: 'png',
    url: 'https://localhost:3000/commonModule/file?fileName=image.png',
  },
  level: {
    number: 1,
    name: 'Beginner',
    experience: 0,
    experienceToNextLevel: 300,
  },
  achievements: [],
  notificationsSettings: [
    {
      name: 'Напоминание о мероприятии за день',
      typeId: 1,
      email: true,
      telegram: false,
    },
  ],
}

export const updateUserProfileSchemaExample: UpdateUserProfileSchema = {
  id: 10,
  email: 'roman.nichi.o@gmail.com',
  firstName: 'Roman',
  lastName: 'Nichi',
  patronymic: 'Olegovich',
  birthDate: new Date('2003-06-28T00:00:00.000Z'),
  sex: 'Male',
  phoneNumber: '8(999)999-99-99',
  image: {
    id: 1,
    name: 'image.png',
    size: 12345,
    originalName: 'image.png',
    extension: 'png',
    url: 'https://localhost:3000/commonModule/file?fileName=image.png',
  },
}

export const getRolesSchemaExample: GetRolesSchema = {
  id: 1,
  name: 'Admin',
}

export const getPositionsSchemaExample: GetPositionsSchema = {
  id: 1,
  name: 'President of Academy',
}

export const getUserNotificationSettingsItemSchemaExample = [
  {
    name: 'Напоминание о мероприятии за день',
    typeId: 1,
    email: true,
    telegram: false,
  },
]
