export class GetWordleUserAttemptSchema {
  letters: {
    name: string
    status: 'correct' | 'present' | 'absent'
  }[]
}

export class GetWordleWordSchema {
  id: number
  word: string
  departmentId: number
}
