import {Plugin} from "siyuan";
import "./index.scss";

export default class MyPlugin extends Plugin {
    onload() {
        console.log("Hello Plugin!");
    }

    onunload() {
        console.log("Bye Plugin!");
    }
}
