import { Area } from '../../models/person.model';

export const AREA_COLORS: Record<Area, string> = {
  'Tecnología': 'blue',
  'Producto':   'purple',
  'Personas':   'green',
  'Comercial':  'orange',
  'Finanzas':   'cyan',
};

export const AREAS = Object.keys(AREA_COLORS) as Area[];

export function areaColor(area: Area): string {
  return AREA_COLORS[area] ?? 'default';
}
