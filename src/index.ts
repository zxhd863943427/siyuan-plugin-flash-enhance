import {Plugin} from "siyuan";
import "./index.scss";

export default class MyPlugin extends Plugin {
    onload() {
        console.log(this.i18n.helloPlugin);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
    }
}
