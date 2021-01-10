import { TAG } from "../tag/tag"

type hole ={
    type : string;
    value : Array<number | string | TAG>
    target : Array<HTMLElement | Text | Comment>
    targetComment : Comment
}
export {hole}