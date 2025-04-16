import { Injectable, StreamableFile } from "@nestjs/common";
import { createReadStream } from "fs";
import { join } from "path";
import * as mime from 'mime-types'

@Injectable()
export class CommonModuleService {
  async getFile(fileName: string): Promise<StreamableFile> {
    const file = createReadStream(join(process.cwd(), `public/${fileName}`))
    const stream = new StreamableFile(file)
    const fileExtension = fileName.split('.')[fileName.split('.').length - 1]

    stream.options.type = mime.lookup(fileExtension)
    stream.options.disposition = `attachment; filename="${encodeURIComponent(fileName)}"`

    return stream
  }
}