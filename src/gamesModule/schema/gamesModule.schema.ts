export class GetWordleUserAttemptSchema {
  letters: {
    name: string
    status: 'correct' | 'present' | 'absent'
  }[]
}
