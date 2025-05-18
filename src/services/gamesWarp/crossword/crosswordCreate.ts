import { CrosswordWord, CrosswordDirection } from 'src/models/crosswordWord'

interface GridCell {
  letter: string
  CrosswordWords: Set<number> // индексы Omit<CrosswordWord, 'question'>
}

type Grid = Map<string, GridCell> // key = `${x},${y}`

// --- Маппинг визуально одинаковых букв (латиница <-> кириллица) ---
const letterMap: Record<string, string> = {
  A: 'A',
  А: 'A',
  B: 'B',
  В: 'B',
  C: 'C',
  С: 'C',
  E: 'E',
  Е: 'E',
  H: 'H',
  Н: 'H',
  K: 'K',
  К: 'K',
  M: 'M',
  М: 'M',
  O: 'O',
  О: 'O',
  P: 'P',
  Р: 'P',
  T: 'T',
  Т: 'T',
  X: 'X',
  Х: 'X',
}
function normalizeLetter(ch: string): string {
  return letterMap[ch] || ch
}
function lettersEqual(a: string, b: string): boolean {
  return normalizeLetter(a) === normalizeLetter(b)
}

// --- Основной алгоритм ---

export function generateCrossword(
  words: string[],
): Omit<CrosswordWord, 'question'>[] {
  // Сортировка по длине и "пересекаемости"
  const sortedWords = [...words].sort(
    (a, b) =>
      b.length - a.length ||
      intersectionScore(b, words) - intersectionScore(a, words),
  )
  const grid: Grid = new Map()
  const CrosswordWords: Omit<CrosswordWord, 'question'>[] = []

  // Размещаем первое слово по центру
  placeWordOnGrid(grid, CrosswordWords, sortedWords[0], 0, 0, 'horizontal')

  // Рекурсивно размещаем остальные
  if (!placeRemainingWords(grid, CrosswordWords, sortedWords.slice(1))) {
    throw new Error(
      'Не удалось сгенерировать кроссворд для данного набора слов',
    )
  }

  return CrosswordWords
}

// --- Вспомогательные функции ---

// Оцениваем "пересекаемость" слова
function intersectionScore(word: string, words: string[]): number {
  const letters = new Set(Array.from(word).map(normalizeLetter))
  return words.reduce((score, w) => {
    if (w === word) return score
    return (
      score +
      Array.from(w).filter((l) => letters.has(normalizeLetter(l))).length
    )
  }, 0)
}

// Размещаем слово на сетке
function placeWordOnGrid(
  grid: Grid,
  CrosswordWords: Omit<CrosswordWord, 'question'>[],
  word: string,
  x: number,
  y: number,
  direction: CrosswordDirection,
) {
  const wordIndex = CrosswordWords.length
  for (let i = 0; i < word.length; i++) {
    const [cx, cy] = direction === 'horizontal' ? [x + i, y] : [x, y + i]
    const key = `${cx},${cy}`
    if (!grid.has(key))
      grid.set(key, { letter: word[i], CrosswordWords: new Set([wordIndex]) })
    else grid.get(key)!.CrosswordWords.add(wordIndex)
  }
  CrosswordWords.push({ word, x, y, direction })
}

// Удаляем слово с сетки (для backtracking)
function removeWordFromGrid(
  grid: Grid,
  CrosswordWords: Omit<CrosswordWord, 'question'>[],
) {
  const word = CrosswordWords.pop()!
  for (let i = 0; i < word.word.length; i++) {
    const [cx, cy] =
      word.direction === 'horizontal'
        ? [word.x + i, word.y]
        : [word.x, word.y + i]
    const key = `${cx},${cy}`
    const cell = grid.get(key)!
    cell.CrosswordWords.delete(CrosswordWords.length)
    if (cell.CrosswordWords.size === 0) grid.delete(key)
  }
}

// Рекурсивное размещение оставшихся слов
function placeRemainingWords(
  grid: Grid,
  CrosswordWords: Omit<CrosswordWord, 'question'>[],
  words: string[],
): boolean {
  if (words.length === 0) return true
  const word = words[0]
  const candidates = findAllValidPlacements(grid, CrosswordWords, word)

  for (const { x, y, direction } of candidates) {
    placeWordOnGrid(grid, CrosswordWords, word, x, y, direction)
    if (placeRemainingWords(grid, CrosswordWords, words.slice(1))) return true
    removeWordFromGrid(grid, CrosswordWords) // backtrack
  }
  return false
}

// Поиск всех возможных пересечений для слова
function findAllValidPlacements(
  grid: Grid,
  CrosswordWords: Omit<CrosswordWord, 'question'>[],
  word: string,
): Omit<CrosswordWord, 'question'>[] {
  const candidates: Omit<CrosswordWord, 'question'>[] = []
  // Для каждого уже размещенного слова ищем пересечения
  for (const placed of CrosswordWords) {
    for (let i = 0; i < placed.word.length; i++) {
      const placedLetter = placed.word[i]
      for (let j = 0; j < word.length; j++) {
        if (!lettersEqual(word[j], placedLetter)) continue
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
  if (CrosswordWords.length === 0) {
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
  direction: CrosswordDirection,
): boolean {
  for (let i = 0; i < word.length; i++) {
    const [cx, cy] = direction === 'horizontal' ? [x + i, y] : [x, y + i]
    const key = `${cx},${cy}`
    const cell = grid.get(key)
    if (cell) {
      if (!lettersEqual(cell.letter, word[i])) return false // несовпадение буквы
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
