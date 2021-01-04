export as namespace tagular;
export function tag(strings: TemplateStringsArray, ...expr: any[]): any
export function reader(name: string): (renderTarget: HTMLElement, data: any) => void