import { GetQuestDifficultiesSchema, GetQuestGroupsSchema, GetQuestMinimizeSchema, GetQuestSchema, GetQuestTagsSchema } from "./questModule.schema";

export const getQuestSchemaMinimizeExample: GetQuestMinimizeSchema = {
  id: 1,
  name: 'TAOM SKILLS',
  time: '9:30',
  description: '<b>BEST QUEST EVER</b>',
  group: { id: 1, name: 'TAOM SKILLS', departmentId: 1 },
  difficult: { id: 1, name: 'Easy' },
  tags: [{ id: 1, name: 'TAOM' }, { id: 2, name: 'Start' }],
  image: {
    id: 1,
    size: 1000,
    extension: 'jpg',
    originalName: "test",
    name: '1744810610173-320802287.png',
    url: "https://localhost:3000/commonModule/file?fileName=1744810610173-320802287.png",
  },
}

export const getQuestSchemaExample: GetQuestSchema = {
  id: 1,
  executor: { id: 1, name: 'Roman Nichi', position: 'President of Academy' },
  name: 'TAOM SKILLS',
  group: { id: 1, name: 'TAOM SKILLS', departmentId: 1 },
  difficult: { id: 1, name: 'Easy' },
  tags: [{ id: 1, name: 'TAOM' }, { id: 2, name: 'Start' }],
  questions: [
    {
      id: 1,
      text: 'Question 1',
      type: 'single',
      answer: {
        id: 1,
        options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: 1
      }
    },
    
    {
      id: 2,
      text: 'Question 2',
      type: 'multiple',
      answer: {
        id: 1,
        options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: [1, 2]
      }
    },
    
    {
      id: 3,
      text: 'Question 3',
      type: 'connection',
      answer: {
        id: 1,
        options: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: ['1 - 3', '2 - 4']
      }
    },
    // {
    //   id: 4,
    //   text: 'Question 4',
    //   type: 'boxSorting',
    //   answer: {
    //     id: 1,
    //     answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
    //     correctAnswer: [1]
    //   }
    // },
    {
      id: 5,
      text: 'Question 5',
      type: 'free',
      answer: {
        id: 1,
        correctAnswer: 'FreeAnswer'
      }
    }
  ]
}

export const getQuestDifficultiesSchemaExample: GetQuestDifficultiesSchema = {
  id: 1,
  name: 'Easy'
}

export const getQuestGroupsSchemaExample: GetQuestGroupsSchema = {
  id: 1,
  name: 'Start'
}

export const getQuestTagsSchemaExample: GetQuestTagsSchema = {
  id: 1,
  name: 'Python'
}