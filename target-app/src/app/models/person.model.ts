export type Area = 'Tecnología' | 'Producto' | 'Personas' | 'Comercial' | 'Finanzas';

export interface Person {
  id: number;
  name: string;
  area: Area;
  role: string;
  email: string;
  hireDate: string; // ISO date: 'YYYY-MM-DD'
  manager: string;
}
