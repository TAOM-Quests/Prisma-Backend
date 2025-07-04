import { GetEventMinimizeSchema, GetEventSchema } from './eventModule.schema'

export const getEventsMinimizeSchemaExample: GetEventMinimizeSchema[] = [
  {
    id: 1,
    name: 'TAOM SKILLS',
    department: {
      id: 2,
      name: 'IT',
      image: {
        id: 1,
        name: 'image.png',
        size: 12345,
        originalName: 'image.png',
        extension: 'png',
        url: 'https://localhost:3000/commonModule/file?fileName=image.png',
      },
      description: 'IT department',
    },
    places: [
      {
        isOnline: false,
        address: 'Yagodnoe, forest, TAOM',
        officeNumber: 'C-404',
        floor: 4,
      },
      {
        isOnline: true,
        connectionLink: 'https://zoom.com',
        identifier: '11-654-89-12',
        accessCode: 'SuperPassword',
        recordLink: 'https://youtube.com/taom',
        platform: 'Zoom',
      },
    ],
    type: {
      id: 1,
      name: 'Championship',
    },
    status: {
      id: 1,
      name: 'Planned',
    },
    image: {
      id: 1,
      name: 'TAOM SKILLS',
      size: 1234,
      extension: 'png',
      originalName: 'TAOM SKILLS',
      url: 'https://localhost:3000/eventModule/file?fileName=TAOM SKILLS.png',
    },
    schedule: [
      {
        timeEnd: new Date('2025-04-02 09:00'),
        timeStart: new Date('2025-04-02 10:00'),
      },
    ],
    tags: [
      {
        id: 1,
        name: 'TAOM',
      },
      {
        id: 2,
        name: 'IT',
      },
    ],
    participantsCount: 10,
  },
]

export const getEventSchemaExample: GetEventSchema = {
  id: 1,
  department: {
    id: 2,
    name: 'IT',
    image: {
      id: 1,
      name: 'image.png',
      size: 12345,
      originalName: 'image.png',
      extension: 'png',
      url: 'https://localhost:3000/commonModule/file?fileName=image.png',
    },
    description: 'IT department',
  },
  name: 'TAOM SKILLS',
  description: 'TAOM SKILLS description',
  date: new Date('2025-04-02'),
  seatsNumber: 20,
  inspector: {
    id: 1,
    name: 'Devil Diamond',
    position: 'Queen of Hell',
  },
  executors: [
    {
      id: 2,
      name: 'Eco Maria',
      position: 'Ecologist',
    },
  ],
  participants: [
    {
      id: 3,
      name: 'Random Men',
    },
  ],
  places: [
    {
      isOnline: false,
      address: 'Yagodnoe, forest, TAOM',
      officeNumber: 'C-404',
      floor: 4,
    },
    {
      isOnline: true,
      connectionLink: 'https://zoom.com',
      identifier: '11-654-89-12',
      accessCode: 'SuperPassword',
      recordLink: 'https://youtube.com/taom',
      platform: 'Zoom',
    },
  ],
  schedule: [
    {
      timeEnd: new Date('2025-04-02 09:00'),
      timeStart: new Date('2025-04-02 10:00'),
    },
  ],
  type: {
    id: 1,
    name: 'Championship',
  },
  status: {
    id: 1,
    name: 'Planned',
  },
  image: {
    id: 1,
    name: 'TAOM SKILLS',
    size: 1234,
    extension: 'png',
    originalName: 'TAOM SKILLS',
    url: 'https://localhost:3000/eventModule/file?fileName=TAOM SKILLS.png',
  },
  files: [
    {
      id: 1,
      name: 'TAOM SKILLS',
      size: 1234,
      extension: 'pdf',
      originalName: 'TAOM SKILLS',
      url: 'https://localhost:3000/eventModule/file?fileName=TAOM SKILLS.pdf',
    },
  ],
  tags: [
    {
      id: 1,
      name: 'TAOM',
    },
    {
      id: 2,
      name: 'IT',
    },
  ],
  inspectorComments: [],
  participantsCount: 10,
}

export const getEventTypeSchemaExample = [
  {
    id: 1,
    name: 'Championship',
  },
  {
    id: 2,
    name: 'Practice',
  },
]

export const getEventStatusSchemaExample = [
  {
    id: 1,
    name: 'Planned',
  },
  {
    id: 2,
    name: 'Canceled',
  },
]

export const getEventTagsSchemaExample = [
  {
    id: 1,
    name: 'TAOM',
  },
  {
    id: 2,
    name: 'IT',
  },
]
