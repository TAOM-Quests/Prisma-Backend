export interface QuestMinimize {
  id: number
  name: string
  group: {
    id: number
    name: string
  }
  tags: {
    id: number
    name: string
  }[]
  difficult: {
    id: number
    name: string
  }
}
