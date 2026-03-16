const SEDES_CHILDREN = [
  {
    id: 'ves',
    title: 'Villa el Salvador',
    items: ['Corporación', 'Opticolor', 'Creaciones', 'Glasses', 'Medic Lents', "D'Alonzo", '+ Visión', 'Color Lents', 'Lents Exclusiva'],
  },
  {
    id: 'surco',
    title: 'Surco',
    items: ['Color Lents'],
  },
  {
    id: 'lurin',
    title: 'Lurín',
    items: ['Creaciones', 'Glasses Visión'],
  },
  {
    id: 'manchay',
    title: 'Manchay',
    items: ['+ Visión', 'Medic Lents', 'Glasses', 'Opticolor', 'Creaciones'],
  },
  {
    id: 'almacen',
    title: 'Almacén',
    items: ['Almacén Principal'],
  },
];

/* Ventas no incluye Almacén porque es solo distribuidor */
const VENTAS_CHILDREN = SEDES_CHILDREN.filter(s => s.id !== 'almacen').map(s => ({
  ...s,
  id: s.id + '-v',
}));

/* Consultorio tampoco incluye Almacén */
const CONSUL_CHILDREN = SEDES_CHILDREN.filter(s => s.id !== 'almacen').map(s => ({
  ...s,
  id: s.id + '-c',
}));

const navConfig = [
  {
    id: 'sedes',
    title: 'Sedes',
    icon: 'store',
    path: '/sedes',
    children: SEDES_CHILDREN,
  },
  {
    id: 'ventas',
    title: 'Ventas',
    icon: 'dollar',
    path: '/ventas',
    children: VENTAS_CHILDREN,
  },
  {
    id: 'consultorio',
    title: 'Consultorio',
    path: '/consultorio',
    icon: 'eye',
    children: CONSUL_CHILDREN,
  },
  { id: 'reporte', title: 'Reporte', path: '/reporte', icon: 'chart' },
];

export default navConfig;
