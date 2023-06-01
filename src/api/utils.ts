import { getFrontend } from "siyuan"
const frontEnd = getFrontend();
export const isMobile = (frontEnd === "mobile" || frontEnd === "browser-mobile")