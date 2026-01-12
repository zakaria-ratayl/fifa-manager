import { Pipe, PipeTransform } from '@angular/core';
import { Position } from '../models/player.model';

@Pipe({
    name: 'position',
    standalone: true
})
export class PositionPipe implements PipeTransform {
    transform(value: Position): string {
        return value.toString();
    }
}
