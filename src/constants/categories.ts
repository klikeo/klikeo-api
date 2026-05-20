export const BUSINESS_CATEGORIES = [
  'alimentos',
  'ropa',
  'salud',
  'servicios',
  'tecnologia',
  'educacion',
  'belleza',
  'hogar',
  'deportes',
  'entretenimiento',
  'transporte',
  'turismo',
  'mascotas',
  'construccion',
  'otros',
] as const

export type BusinessCategory = typeof BUSINESS_CATEGORIES[number]
