export function comprasAnaliseStepRouterLink(uuid: string, routeSlug: string): string[] {
  return ['/contratacao', 'compras', 'analise', uuid, routeSlug];
}

export function comprasVendorListRouterLink(uuid: string): string[] {
  return ['/contratacao', 'compras', 'vendor-list', uuid];
}
