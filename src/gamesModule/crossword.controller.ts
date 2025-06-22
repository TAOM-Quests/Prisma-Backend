import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { CrosswordService } from './crossword.service'
import {
  CheckCrosswordAnswerSchema,
  GetCrosswordAnswerSchema,
  GetCrosswordDifficultySchema,
} from './schema/crossword.schema'
import { ApiQuery } from '@nestjs/swagger'
import {
  CheckCrosswordAnswerDto,
  SaveCrosswordWordDto,
} from './dto/crossword.dto'

@Controller('games/crossword')
export class CrosswordController {
  constructor(private crosswordService: CrosswordService) {}

  @ApiQuery({ name: 'userId', type: 'number', required: true })
  @Get('/allowed')
  async getAllowedDifficulties(
    @Query('userId') userId: string,
  ): Promise<GetCrosswordDifficultySchema[]> {
    return this.crosswordService.getAllowedDifficulties(+userId)
  }

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
  ): Promise<CheckCrosswordAnswerSchema[]> {
    return this.crosswordService.checkAnswer(checkDto)
  }

  @ApiQuery({ name: 'departmentId', type: 'number', required: false })
  @ApiQuery({ name: 'difficultyId', type: 'number', required: false })
  @Get('/words')
  async getWords(
    @Query('departmentId') departmentId: string,
    @Query('difficultyId') difficultyId: string,
  ) {
    return this.crosswordService.getWords({
      departmentId: +departmentId,
      difficultyId: +difficultyId,
    })
  }

  @Post('/words')
  async createWord(@Body() saveDto: SaveCrosswordWordDto) {
    return this.crosswordService.createWord(saveDto)
  }

  @Post('/words/:id')
  async updateWord(
    @Body() saveDto: SaveCrosswordWordDto,
    @Param('id') id: string,
  ) {
    return this.crosswordService.updateWord(+id, saveDto)
  }

  @Delete('/words/:id')
  async deleteWord(@Param('id') id: string) {
    return this.crosswordService.deleteWord(+id)
  }

  @Get('/difficulties')
  async getDifficulties() {
    return this.crosswordService.getDifficulties()
  }
}
