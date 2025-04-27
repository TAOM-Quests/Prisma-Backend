import { GetQuestMinimizeSchema, GetQuestSchema } from "./questModule.schema";

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
      type: {
        id: 1,
        name: 'Single'
      },
      answer: {
        id: 1,
        answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: 1
      }
    },
    
    {
      id: 2,
      text: 'Question 2',
      type: {
        id: 2,
        name: 'Multiple'
      },
      answer: {
        id: 1,
        answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: [1, 2]
      }
    },
    
    {
      id: 3,
      text: 'Question 3',
      type: {
        id: 3,
        name: 'Connection'
      },
      answer: {
        id: 1,
        answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
        correctAnswer: ['1 - 3', '2 - 4']
      }
    },
    // {
    //   id: 4,
    //   text: 'Question 4',
    //   type: {
    //     id: 4,
    //     name: 'BoxSorting'
    //   },
    //   answer: {
    //     id: 1,
    //     answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'],
    //     correctAnswer: [1]
    //   }
    // },
    {
      id: 5,
      text: 'Question 5',
      type: {
        id: 5,
        name: 'Free'
      },
      answer: {
        id: 1,
        correctAnswer: 'FreeAnswer'
      }
    }
  ]
}