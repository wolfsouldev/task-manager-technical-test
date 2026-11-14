import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class PositiveIdPipe implements PipeTransform<string, number> {
  transform(value: string) {
    const id = Number(value);
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0)
      throw new BadRequestException("El ID debe ser un entero positivo");
    return id;
  }
}
