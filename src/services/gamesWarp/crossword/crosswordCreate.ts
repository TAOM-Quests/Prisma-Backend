type Direction = 'across' | 'down'
type Grid = string[][]

interface PlacedWord {
  word: string
  x: number // координата первой буквы
  y: number // координата первой буквы
  direction: Direction
}

function createEmptyGrid(size: number): Grid {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ''),
  )
}

function canPlaceWord(
  grid: Grid,
  word: string,
  x: number,
  y: number,
  direction: Direction,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const xi = direction === 'across' ? x + i : x
    const yi = direction === 'down' ? y + i : y
    if (xi < 0 || yi < 0 || xi >= grid.length || yi >= grid.length) return false
    const cell = grid[yi][xi]
    if (cell !== '' && cell !== word[i]) return false
  }
  return true
}

function placeWord(
  grid: Grid,
  word: string,
  x: number,
  y: number,
  direction: Direction,
) {
  for (let i = 0; i < word.length; i++) {
    const xi = direction === 'across' ? x + i : x
    const yi = direction === 'down' ? y + i : y
    grid[yi][xi] = word[i]
  }
}

function findIntersections(
  placedWords: PlacedWord[],
  word: string,
): { x: number; y: number; direction: Direction }[] {
  const positions = []
  for (const placed of placedWords) {
    for (let i = 0; i < placed.word.length; i++) {
      for (let j = 0; j < word.length; j++) {
        if (placed.word[i] === word[j]) {
          // Пересечение: placed и word имеют общую букву
          if (placed.direction === 'across') {
            positions.push({
              x: placed.x + i,
              y: placed.y - j,
              direction: 'down' as Direction,
            })
          } else {
            positions.push({
              x: placed.x - j,
              y: placed.y + i,
              direction: 'across' as Direction,
            })
          }
        }
      }
    }
  }
  return positions
}

function buildCrossword(words: string[]): PlacedWord[] {
  const size = 30 // можно увеличить при необходимости
  const grid = createEmptyGrid(size)
  const mid = Math.floor(size / 2)

  const placed: PlacedWord[] = []
  // Ставим первое слово горизонтально в центр
  placeWord(grid, words[0], mid, mid, 'across')
  placed.push({ word: words[0], x: mid, y: mid, direction: 'across' })

  for (let wi = 1; wi < words.length; wi++) {
    const word = words[wi]
    const positions = findIntersections(placed, word)
    let placedFlag = false
    for (const pos of positions) {
      if (canPlaceWord(grid, word, pos.x, pos.y, pos.direction)) {
        placeWord(grid, word, pos.x, pos.y, pos.direction)
        placed.push({ word, x: pos.x, y: pos.y, direction: pos.direction })
        placedFlag = true
        break
      }
    }
    if (!placedFlag) {
      // Если не удалось разместить слово, можно попробовать другие стратегии,
      // например, перебор других позиций, ротацию слов и т.д.
      // В этом базовом алгоритме мы просто пропускаем такие слова.
    }
  }

  return placed
}
