type Direction = 'horizontal' | 'vertical'

export interface PlacedWord {
  word: string
  x: number // координата первой буквы
  y: number // координата первой буквы
  direction: Direction
  number?: number // для нумерации (опционально)
}

interface GridCell {
  letter: string
  placedWords: Set<number> // индексы PlacedWord
}

type Grid = Map<string, GridCell> // key = `${x},${y}`

// --- Основной алгоритм ---

export function generateCrossword(words: string[]): PlacedWord[] {
  // Сортировка по длине и "пересекаемости"
  const sortedWords = [...words].sort(
    (a, b) =>
      b.length - a.length ||
      intersectionScore(b, words) - intersectionScore(a, words),
  )
  const grid: Grid = new Map()
  const placedWords: PlacedWord[] = []

  // Размещаем первое слово по центру
  placeWordOnGrid(grid, placedWords, sortedWords[0], 0, 0, 'horizontal')

  // Рекурсивно размещаем остальные
  if (!placeRemainingWords(grid, placedWords, sortedWords.slice(1))) {
    throw new Error(
      'Не удалось сгенерировать кроссворд для данного набора слов',
    )
  }

  // Присваиваем номера словам
  assignNumbers(placedWords)

  return placedWords
}

// --- Вспомогательные функции ---

// Оцениваем "пересекаемость" слова
function intersectionScore(word: string, words: string[]): number {
  const letters = new Set(word)
  return words.reduce((score, w) => {
    if (w === word) return score
    return score + Array.from(w).filter((l) => letters.has(l)).length
  }, 0)
}

// Размещаем слово на сетке
function placeWordOnGrid(
  grid: Grid,
  placedWords: PlacedWord[],
  word: string,
  x: number,
  y: number,
  direction: Direction,
) {
  const wordIndex = placedWords.length
  for (let i = 0; i < word.length; i++) {
    const [cx, cy] = direction === 'horizontal' ? [x + i, y] : [x, y + i]
    const key = `${cx},${cy}`
    if (!grid.has(key))
      grid.set(key, { letter: word[i], placedWords: new Set([wordIndex]) })
    else grid.get(key)!.placedWords.add(wordIndex)
  }
  placedWords.push({ word, x, y, direction })
}

// Удаляем слово с сетки (для backtracking)
function removeWordFromGrid(grid: Grid, placedWords: PlacedWord[]) {
  const word = placedWords.pop()!
  for (let i = 0; i < word.word.length; i++) {
    const [cx, cy] =
      word.direction === 'horizontal'
        ? [word.x + i, word.y]
        : [word.x, word.y + i]
    const key = `${cx},${cy}`
    const cell = grid.get(key)!
    cell.placedWords.delete(placedWords.length)
    if (cell.placedWords.size === 0) grid.delete(key)
  }
}

// Рекурсивное размещение оставшихся слов
function placeRemainingWords(
  grid: Grid,
  placedWords: PlacedWord[],
  words: string[],
): boolean {
  if (words.length === 0) return true
  const word = words[0]
  const candidates = findAllValidPlacements(grid, placedWords, word)

  for (const { x, y, direction } of candidates) {
    placeWordOnGrid(grid, placedWords, word, x, y, direction)
    if (placeRemainingWords(grid, placedWords, words.slice(1))) return true
    removeWordFromGrid(grid, placedWords) // backtrack
  }
  return false
}

// Поиск всех возможных пересечений для слова
function findAllValidPlacements(
  grid: Grid,
  placedWords: PlacedWord[],
  word: string,
): PlacedWord[] {
  const candidates: PlacedWord[] = []
  // Для каждого уже размещенного слова ищем пересечения
  for (const placed of placedWords) {
    for (let i = 0; i < placed.word.length; i++) {
      const placedLetter = placed.word[i]
      for (let j = 0; j < word.length; j++) {
        if (word[j] !== placedLetter) continue
        // Пробуем пересечь горизонтальное слово вертикальным и наоборот
        if (placed.direction === 'horizontal') {
          const x = placed.x + i
          const y = placed.y - j
          if (isValidPlacement(grid, word, x, y, 'vertical')) {
            candidates.push({ word, x, y, direction: 'vertical' })
          }
        } else {
          const x = placed.x - j
          const y = placed.y + i
          if (isValidPlacement(grid, word, x, y, 'horizontal')) {
            candidates.push({ word, x, y, direction: 'horizontal' })
          }
        }
      }
    }
  }
  // Если нет пересечений, пробуем добавить слово "в стороне" (только если сетка пуста)
  if (placedWords.length === 0) {
    candidates.push({ word, x: 0, y: 0, direction: 'horizontal' })
  }
  return candidates
}

// Проверка, можно ли разместить слово в данной позиции
function isValidPlacement(
  grid: Grid,
  word: string,
  x: number,
  y: number,
  direction: Direction,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const [cx, cy] = direction === 'horizontal' ? [x + i, y] : [x, y + i]
    const key = `${cx},${cy}`
    const cell = grid.get(key)
    if (cell) {
      if (cell.letter !== word[i]) return false // несовпадение буквы
    } else {
      // Проверяем отсутствие "случайных" примыканий по бокам
      if (direction === 'horizontal') {
        if (grid.has(`${cx},${cy - 1}`)) return false
        if (grid.has(`${cx},${cy + 1}`)) return false
      } else {
        if (grid.has(`${cx - 1},${cy}`)) return false
        if (grid.has(`${cx + 1},${cy}`)) return false
      }
    }
  }
  // Проверяем черные клетки/границы по краям слова
  const before = direction === 'horizontal' ? `${x - 1},${y}` : `${x},${y - 1}`
  const after =
    direction === 'horizontal'
      ? `${x + word.length},${y}`
      : `${x},${y + word.length}`
  if (grid.has(before) || grid.has(after)) return false
  return true
}

// Нумерация слов по правилам (слева-направо, сверху-вниз)
function assignNumbers(placedWords: PlacedWord[]) {
  // Определяем уникальные стартовые позиции
  const starts = placedWords
    .map((w, idx) => ({ idx, x: w.x, y: w.y }))
    .sort((a, b) => a.y - b.y || a.x - b.x)
  for (let i = 0; i < starts.length; i++) {
    placedWords[starts[i].idx].number = i + 1
  }
}
