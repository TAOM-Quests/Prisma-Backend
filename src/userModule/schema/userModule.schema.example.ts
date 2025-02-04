export const authUserSchemaExample = {
  id: 10,
  email: 'test@gmail.com',
  token: 'e234dsdom3k2kmdl3l43iwes9vjro44223m3n32kn5n2ksdo4',
}

export const getUserProfileSchemaExample = {
  id: 10,
  name: 'Roman',
  surname: 'Nichi',
  email: 'roman.nichi.o@gmail.com',
  department: {
    id: 0,
    name: 'IT',
  },
  role: {
    id: 0,
    name: 'Admin',
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
