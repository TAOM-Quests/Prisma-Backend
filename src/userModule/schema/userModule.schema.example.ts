import { GetUserProfileSchema, UpdateUserProfileSchema } from "./userModule.schema"

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
    description: 'Director of department'
  },
  completeQuests: [
    {
      id: 10,
      name: 'Python start',
      group: {
        id: 10,
        name: 'Python',
      },
      tags: [
        {
          id: 10,
          name: 'Start',
        },
      ],
      difficult: {
        id: 2,
        name: 'Medium',
      },
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
}