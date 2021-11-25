export class PrintDataNode {
  private tagName: string
  public children: PrintDataNode[]
  public text = ''
  public att: Record<string, string | number>

  constructor(tagName: string, att: Record<string, string | number> = {}, children: PrintDataNode[] = [], text = '') {
    this.tagName = tagName
    this.att = att
    this.text = text
    this.children = children
  }

  public xml(rootNode = false): string {
    return (
      (rootNode ? `<?xml version="1.0" encoding="utf-8"?>` : '') +
      `<${this.tagName}` +
      (Object.keys(this.att).length > 0
        ? ` ${Object.entries(this.att)
            .map((att) => {
              const [attName, value] = att
              return `${attName}="${value.toString()}"`
            })
            .join(' ')}`
        : '') +
      (this.children.length !== 0 || this.text
        ? '>' + this.text + this.children.map((child) => child.xml()).join('') + `</${this.tagName}>`
        : '/>')
    )
  }
}

export const text = (text = '', att: Record<string, string | number> = {}) => new PrintDataNode('text', att, [], text)

export const feed = (lines = 1) => new PrintDataNode('feed', { line: lines })

export const cut = () => new PrintDataNode('cut', { type: 'feed' })

export const image = (width: number, height: number, base64Image: string, align = 'center') =>
  new PrintDataNode('image', { width, height, align }, undefined, base64Image)

export const qrCode = (text: string, width = '10') =>
  new PrintDataNode('symbol', { type: 'qrcode_model_1', width, align: 'center' }, undefined, text)

export const eposPrintJob = (printData: PrintDataNode[], devId = 'local_printer', timeout = 10000) => {
  return new PrintDataNode('ePOSPrint', undefined, [
    new PrintDataNode('Parameter', undefined, [
      new PrintDataNode('devid', undefined, undefined, devId),
      new PrintDataNode('timeout', undefined, undefined, timeout.toString()),
    ]),
    new PrintDataNode('PrintData', undefined, [
      new PrintDataNode('epos-print', { xmlns: 'http://www.epson-pos.com/schemas/2011/03/epos-print' }, printData),
    ]),
  ])
}
export const eposPrintRequest = (printJobs: PrintDataNode[]) =>
  new PrintDataNode('PrintRequestInfo', undefined, printJobs)
