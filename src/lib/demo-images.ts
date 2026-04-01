/**
 * Demo images from Unsplash for properties without photos.
 * Used as illustrative placeholders until real photos are uploaded.
 * All images are free to use (Unsplash license).
 */

const UNSPLASH_PARAMS = "w=800&h=600&fit=crop&q=80";

const DEMO_IMAGES: Record<string, string[]> = {
  APPARTAMENTO: [
    `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?${UNSPLASH_PARAMS}`,
  ],
  VILLA: [
    `https://images.unsplash.com/photo-1613490493576-7fde63acd811?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?${UNSPLASH_PARAMS}`,
  ],
  CASA_INDIPENDENTE: [
    `https://images.unsplash.com/photo-1568605114967-8130f3a36994?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1570129477492-45c003edd2be?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?${UNSPLASH_PARAMS}`,
  ],
  ATTICO: [
    `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?${UNSPLASH_PARAMS}`,
  ],
  LOFT: [
    `https://images.unsplash.com/photo-1536376072261-38c75010e6c9?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?${UNSPLASH_PARAMS}`,
  ],
  UFFICIO: [
    `https://images.unsplash.com/photo-1497366216548-37526070297c?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1524758631624-e2822e304c36?${UNSPLASH_PARAMS}`,
  ],
  NEGOZIO: [
    `https://images.unsplash.com/photo-1604719312566-8912e9227c6a?${UNSPLASH_PARAMS}`,
    `https://images.unsplash.com/photo-1441986300917-64674bd600d8?${UNSPLASH_PARAMS}`,
  ],
};

const DEFAULT_IMAGES = [
  `https://images.unsplash.com/photo-1560518883-ce09059eeffa?${UNSPLASH_PARAMS}`,
  `https://images.unsplash.com/photo-1560185127-6ed189bf02f4?${UNSPLASH_PARAMS}`,
  `https://images.unsplash.com/photo-1600585154526-990dced4db0d?${UNSPLASH_PARAMS}`,
];

/** Get demo images for a property type. Returns 2-3 Unsplash URLs. */
export function getDemoImages(propertyType: string): string[] {
  return DEMO_IMAGES[propertyType] || DEFAULT_IMAGES;
}

/** Get a single cover demo image for a property type. */
export function getDemoCover(propertyType: string): string {
  const images = DEMO_IMAGES[propertyType] || DEFAULT_IMAGES;
  return images[0];
}
