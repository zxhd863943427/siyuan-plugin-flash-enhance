import { showMessage, confirm, Menu, isMobile } from "siyuan";

export async function addMenu(ev: MouseEvent,plugin:any) {
    const menu = new Menu("topBarSample", () => {
        console.log(plugin.i18n.byeMenu);
    });
    let target:any = ev.target
    let rect: any = target.getBoundingClientRect()
    menu.addItem({
        icon: "iconHelp",
        label: "Confirm",
        click() {
            confirm("Confirm", "Is this a confirm?", () => {
                showMessage("confirm");
            }, () => {
                showMessage("cancel");
            });
        }
    });
    if (isMobile()) {
        menu.fullscreen();
    } else {
        menu.open({
            x: rect.right,
            y: rect.bottom,
            isLeft: true,
        });
    }
}