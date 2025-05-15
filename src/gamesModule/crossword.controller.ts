import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { CrosswordService } from './crossword.service'
import { GetCrosswordAnswerSchema } from './schema/crossword.schema'
import { ApiQuery } from '@nestjs/swagger'
import { CheckCrosswordAnswerDto } from './dto/crossword.dto'

@Controller('games/crossword')
export class CrosswordController {
  constructor(private crosswordService: CrosswordService) {}

  @ApiQuery({ name: 'day', type: 'string', required: true })
  @ApiQuery({ name: 'departmentId', type: 'number', required: true })
  @ApiQuery({ name: 'difficultyId', type: 'number', required: true })
  @Get('/')
  async getCrossword(
    @Query('day') day: string,
    @Query('departmentId') departmentId: string,
    @Query('difficultyId') difficultyId: string,
  ): Promise<GetCrosswordAnswerSchema[]> {
    return this.crosswordService.getCrossword({
      day,
      departmentId: +departmentId,
      difficultyId: +difficultyId,
    })
  }

  @Post('/')
  async checkAnswer(
    @Body() checkDto: CheckCrosswordAnswerDto,
  ): Promise<unknown> {
    return this.crosswordService.checkAnswer(checkDto)
  }
}
