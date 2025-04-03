import { GetEventMinimizeSchema, GetEventSchema } from "./eventModule.schema";

export const getEventsMinimizeSchemaExample: GetEventMinimizeSchema[] = [{
  id: 1,
  name: 'TAOM SKILLS',
  date: new Date('2025-04-02'),
  places: [{
    isOnline: false,
    address: "Yagodnoe, forest, TAOM",
    officeNumber: "C-404",
    floor: 4,
  }, {
    isOnline: true,
    connectionLink: "https://zoom.com",
    identifier: "11-654-89-12",
    accessCode: "SuperPassword",
    recordLink: "https://youtube.com/taom",
  }],
  type: {
    id: 1,
    name: 'Championship'
  },
  status: {
    id: 1,
    name: 'Planned'
  }
}]

export const getEventSchemaExample: GetEventSchema = {
  id: 1,
  name: 'TAOM SKILLS',
  description: 'TAOM SKILLS description',
  date: new Date('2025-04-02'),
  seatsNumber: 20,
  inspector: {
    id: 1,
    name: 'Devil Diamond',
    position: 'Queen of Hell'
  },
  executors: [{
    id: 2,
    name: 'Eco Maria',
    position: 'Ecologist'
  }],
  participants: [{
    id: 3,
    name: 'Random Men'
  }],
  places: [{
    isOnline: false,
    address: "Yagodnoe, forest, TAOM",
    officeNumber: "C-404",
    floor: 4,
  }, {
    isOnline: true,
    connectionLink: "https://zoom.com",
    identifier: "11-654-89-12",
    accessCode: "SuperPassword",
    recordLink: "https://youtube.com/taom",
  }],
  type: {
    id: 1,
    name: 'Championship'
  },
  status: {
    id: 1,
    name: 'Planned'
  },
  department: {
    id: 1,
    name: 'IT'
  }
}