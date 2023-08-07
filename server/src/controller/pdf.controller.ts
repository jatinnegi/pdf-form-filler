import { Controller, HttpStatus, Patch, Body, Res } from '@nestjs/common';
import generatePdf from 'src/utils/generatePdf';
import * as fs from 'fs';

@Controller('/api/pdf')
export class PdfController {
  constructor() {}

  @Patch('/')
  async updatePdf(@Res() response, @Body() body) {
    const examplePdfBytes = await generatePdf(body);

    fs.writeFile('./client/example.pdf', examplePdfBytes, function (err) {
      return console.log(err);
    });

    return response.status(HttpStatus.OK).json({});
  }
}
