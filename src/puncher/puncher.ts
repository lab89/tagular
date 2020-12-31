

function puncher(UID: string, strings: TemplateStringsArray, ...expr: any[]): string{
    const UIDC = '<!--' + UID + '-->'

    const VOID_ELEMENTS = /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i;
    const spaces = ' \\f\\n\\r\\t';
    const almostEverything = '[^' + spaces + '\\/>"\'=]+';
    const attrName = '[' + spaces + ']+' + almostEverything;
    const tagName = '<([A-Za-z]+[A-Za-z0-9:._-]*)((?:';
    const attrPartials = '(?:\\s*=\\s*(?:\'[^\']*?\'|"[^"]*?"|<[^>]*?>|' + almostEverything.replace('\\/', '') + '))?)';
    const attrSeeker = new RegExp(tagName + attrName + attrPartials + '+)([' + spaces + ']*/?>)', 'g');
    const selfClosing = new RegExp(tagName + attrName + attrPartials + '*)([' + spaces + ']*/>)', 'g');
    const findAttributes = new RegExp('(' + attrName + '\\s*=\\s*)([\'"]?)' + UIDC + '\\2', 'gi');
    
    function attrReplacer($0: string, $1: string, $2: string, $3: string) {
        return '<' + $1 + $2.replace(findAttributes, replaceAttributes) + $3;
    }

    function replaceAttributes($0: string, $1: string, $2: string) {
        return $1 + ($2 || '"') + UID + ($2 || '"');
    }

    function fullClosing($0: string, $1: string, $2: string) {
        return VOID_ELEMENTS.test($1) ? $0 : '<' + $1 + $2 + '></' + $1 + '>';
    }

    const templateString = strings.join(UIDC).replace(selfClosing, fullClosing).replace(attrSeeker, attrReplacer); 

    return templateString
}
export default puncher