import keypunch from '../keypunch/keypunch'
import {uuidv4} from '../util/util'

// class TAG {
//     public id: string = "";
//     public punchingText: string = "";    
//     public punchingHole: Array<any> = [];    
//     private fragment: DocumentFragment;
//     private exprIdx: number = 0;
//     private contents: Array<any> = []
//     private comments: Array<Node> = [];
//     public data: any = {};
//     private text: any = "";
//     constructor(strings: TemplateStringsArray, ...expr: any[]){
//         this.id = uuidv4();
//         this.punchingText = keypunch(this.id, strings, expr);
//         this.punchingHole = [...expr]
//         this.fragment = document.createDocumentFragment();
//         const root = document.createElement("div");
//         this.fragment.appendChild(root);
//         root.innerHTML = this.punchingText;   
//         this.parseAttribute(root)
//         this.comments = [...this.parseComment(root)]
//         this.initialize();
//         while(root.childNodes.length){
//             this.fragment.appendChild(Array.from(root.childNodes).shift())
//         }
//         this.fragment.childNodes[0].remove();                

//         this.text = this.punchingText.split("<!--" + this.id + "-->");
        
//     }

//     private commentMerge(idx: number, parentString: Array<string>, parentID: string){  
//         const filtered = Object.values(this.data).filter((d: any)=> d.type === "html");
//         if(!filtered.length) return;
//         this.text.forEach((d: string, i: number)=>{
//             const p = filtered[i]
//             if(p === undefined) return;
//             if(p.value instanceof Array){
//                 p.value.forEach((f: TAG)=>{
//                     f.commentMerge(i, this.text, parentID);
//                 })
//             }else if(p.value instanceof TAG){
//                 p.value.commentMerge(i, this.text, parentID);
//             }
//         })
//         parentString.splice(idx, 0, this.text.join("<!--" + parentID + "-->"))
//     }
//     private parseAttribute(html: HTMLElement){
//         if(html.attributes && html.attributes.length){            
//             const attr = html.attributes        
//             for(let i = 0; i < html.attributes.length; i++){
//                 const currentAttr = attr[i]
//                 if(currentAttr.value === this.id){
//                     const expression = this.punchingHole[this.exprIdx];
//                     if(currentAttr.name.includes("@")){
//                         html.addEventListener(currentAttr.name.slice(1, currentAttr.name.length), expression);  
//                         currentAttr.nodeValue = expression                        
//                     }else if(expression instanceof Object){
//                         Object.assign(html.style, expression);
//                     }else{                        
//                         html.setAttribute(currentAttr.name, expression);
//                     }                               
//                     this.data[this.exprIdx] = {
//                         type: "attribute",
//                         value : expression,
//                         target : currentAttr
//                     }
//                     this.exprIdx = this.exprIdx + 1;
//                 }else if(currentAttr.value.includes("<!--")){                                                            
//                     const l = (currentAttr.value.match(new RegExp("<!--" + this.id + "-->", "g")) || []).length                                        
//                     let st = currentAttr.value
//                     //g
//                     //regex : all replace
//                     //string : first replace
//                     for(let i = 0 ; i < l; i++){ 
//                         st = st.replace("<!--" + this.id + "-->", this.punchingHole[this.exprIdx])
//                         this.exprIdx = this.exprIdx + 1;

//                     }                    
//                     currentAttr.value = st;
//                 } 
//             }       
           
//         }
        
//         if(html instanceof Comment) {    
//             if(this.exprIdx < this.punchingHole.length){                
//                 this.contents.push({
//                     idx : this.exprIdx,
//                     value : this.punchingHole[this.exprIdx]
//                 })                                                
//             } 
                
//             this.exprIdx = this.exprIdx + 1;                
//         }; 
        
//         if(html.hasChildNodes()) {                
//             html.childNodes.forEach((c: HTMLElement)=>{  
//                 this.parseAttribute(c);
//             })
//         }else{            
//             return;
//         }                    
//     }
//     /**
//      * 
//      * https://stackoverflow.com/questions/6027830
//      * /is-it-possible-to-get-reference-to-comment-element-block-by-javascript
//     */
//     private parseComment(root: HTMLElement){
//         var treeWalker = document.createTreeWalker(
//             root,
//             NodeFilter.SHOW_COMMENT,
//             {
//                 "acceptNode": function acceptNode (node) {
//                     return NodeFilter.FILTER_ACCEPT;
//                 }
//             }
//         );    
//         var currentNode = treeWalker.nextNode();
//         var nodeList = [];
//         while (currentNode) {            
//             if(currentNode.nodeValue === this.id){
//                 nodeList.push(currentNode);
//             }            
//             currentNode = treeWalker.nextNode();
//         }
//         return nodeList;
//     }
//     private initialize(){
//         if(!this.comments.length) return;
//         const comment = this.comments.shift();
//         const content = this.contents.shift();
//         if(content.value instanceof TAG){
//             content.value.initialize();
//             comment.parentElement.insertBefore(content.value.fragment, comment.nextSibling)
//             this.data[content.idx] = {
//                 type: "html",
//                 value : content.value,
//                 target : null
//             }
//         }else if(content.value instanceof Array){
//             content.value.forEach((d: any)=>{
//                 if(d instanceof TAG){
//                     d.initialize();                    
//                     comment.parentElement.insertBefore(d.fragment, comment.nextSibling)                  
//                     this.data[content.idx] = {
//                         type: "html",
//                         value : content.value,
//                         target : null
//                     }
//                 }
//             })
//         }else{
//             const node = document.createTextNode(content.value.toString())
//             this.data[content.idx] = {
//                 type: "html",
//                 value : content.value,
//                 target : node
//             }
//             comment.parentElement.insertBefore(node, comment.nextSibling)                  
//         }
//         this.initialize();
//     }

//     public render(renderTarget: HTMLElement){             
//         const filtered = Object.values(this.data).filter((d: any)=> d.type === "html");
//         this.text.forEach((d: string, i: number)=>{            
//             const p = filtered[i]      
//             if(p === undefined) return;         
//             if(p.value instanceof Array){
//                 p.value.forEach((f: TAG)=>{
//                     if(f instanceof TAG){
//                         f.commentMerge(i, this.text, this.id);
//                     }
                        
//                 })
//             }else if(p.value instanceof TAG){
//                 p.value.commentMerge(i, this.text, this.id);
//             }
//         })

//         renderTarget.appendChild(this.fragment)
//     }
// }
// interface TAG {
//     template: TemplateStringsArray;
//     values : any[];
// }

class TAG {
    public punchingText: string[];    
    public punchingHole: Array<any> = [];  
    public id: string = "";
    private idx: number = 0;
    private inserted: number = 0;
    constructor(strings: string[], ...expr: any[]){        
        this.punchingText = strings;
        this.punchingHole = [...expr];
        this.id = uuidv4();
    }
    public reset(){        
        const expr = [...this.punchingHole]
        const txt = [...this.punchingText];
        while(expr.length){            
            const e = expr.shift();
            txt.splice(this.idx + 1 + this.inserted,0, {value : e ? e : null} as any)
            this.inserted++;
            this.idx++;
        }
        this.punchingText = txt;
    }
}
function tag(strings: string[], ...expr: any[]): TAG{    
    // return new TAG(strings, ...expr)
    
    return new TAG(strings, ...expr)
}    

// export {tag, TAG};
export {tag, TAG}