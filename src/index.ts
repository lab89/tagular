import {tag} from './tag/tag'
import reader from './reader/reader'

console.log("**********************************")
console.log("%c Targular", 'background: #222; color: #bada55')
console.log("%c a tiny template literal rendering library", 'background: #222; color: #bada55')
console.log("%c Thank you", 'background: #222; color: cyan')
console.log("**********************************")

export default {tag, reader}