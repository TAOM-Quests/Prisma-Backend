import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { WordleService } from './wordle.service'
import {
  GetWordleUserAttemptSchema,
  GetWordleWordSchema,
} from './schema/wordle.schema'

@Controller('games/wordle')
export class WordleController {
  constructor(private wordleService: WordleService) {}

  @ApiQuery({ name: 'date', type: 'string', required: true })
  @ApiQuery({ name: 'departmentId', type: 'number', required: true })
  @Get('/attempts/:userId')
  async getAttempts(
    @Param('userId') userId: string,
    @Query('date') date: string,
    @Query('departmentId') departmentId: string,
  ): Promise<GetWordleUserAttemptSchema[]> {
    return this.wordleService.getUserAttempts(+userId, date, +departmentId)
  }

  @ApiQuery({ name: 'date', type: 'string', required: true })
  @ApiQuery({ name: 'departmentId', type: 'number', required: true })
  @Post('/attempts/:userId')
  async createAttempt(
    @Param('userId') userId: string,
    @Query('departmentId') departmentId: string,
    @Body('attempt') attempt: string,
  ): Promise<GetWordleUserAttemptSchema> {
    return this.wordleService.createAttempt(attempt, +userId, +departmentId)
  }

  @Get('/words/:departmentId')
  async getWords(
    @Param('departmentId') departmentId: string,
  ): Promise<GetWordleWordSchema[]> {
    return await this.wordleService.getWordByDepartment(+departmentId)
  }

  @Post('/words/:departmentId')
  async createWord(
    @Param('departmentId') departmentId: string,
    @Body('word') word: string,
  ): Promise<GetWordleWordSchema> {
    return await this.wordleService.createWord(word, +departmentId)
  }

  @Post('/words/:id')
  async updateWord(
    @Param('id') id: string,
    @Body('word') word: string,
  ): Promise<GetWordleWordSchema> {
    return await this.wordleService.updateWord(word, +id)
  }

  @Delete('/words/:id')
  async deleteWord(@Param('id') id: string): Promise<void> {
    return await this.wordleService.deleteWord(+id)
  }
}
