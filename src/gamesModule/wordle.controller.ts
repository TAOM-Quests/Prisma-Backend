import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { WordleService } from './wordle.service'
import { GetWordleUserAttemptSchema } from './schema/gamesModule.schema'

@Controller('games/wordle')
export class WordleController {
  constructor(private wordleService: WordleService) {}

  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'departmentId', required: true })
  @Get('/attempts/:userId')
  async getAttempts(
    @Param('userId') userId: string,
    @Query('date') date: string,
    @Query('departmentId') departmentId: string,
  ): Promise<GetWordleUserAttemptSchema[]> {
    return this.wordleService.getUserAttempts(
      +userId,
      new Date(date),
      +departmentId,
    )
  }

  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'departmentId', required: true })
  @Post('/attempts/:userId')
  async createAttempt(
    @Param('userId') userId: string,
    @Query('departmentId') departmentId: string,
    @Body() attempt: string,
  ): Promise<GetWordleUserAttemptSchema> {
    return this.wordleService.createAttempt(attempt, +userId, +departmentId)
  }
}
