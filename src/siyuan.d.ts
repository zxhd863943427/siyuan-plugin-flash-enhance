type TEventBus = "ws-main"

interface IObject {
    [key: string]: string;
}

interface IWebSocketData {
    cmd: string
    callback?: string
    data: any
    msg: string
    code: number
    sid: string
}

export function fetchPost(url: string, data?: any, cb?: (response: IWebSocketData) => void, headers?: IObject): void;

export function fetchSyncPost(url: string, data?: any): Promise<IWebSocketData>;

export function fetchGet(url: string, cb: (response: IWebSocketData) => void): void;

export function isMobile(): boolean;

export function confirm(title: string, text: string, confirmCB?: () => void, cancelCB?: () => void): void;

/**
 * @param timeout - ms. 0: manual close；-1: always show; 6000: default
 * @param {string} [type=info]
 */
export function showMessage(text: string, timeout?: number, type?: "info" | "error", id?: string): void;

export class App {
    plugins: Plugin[];
}

export abstract class Plugin {
    eventBus: EventBus;
    i18n: IObject;
    data: any
    name: string

    constructor(options: {
        app: App,
        id: string,
        name: string,
        i18n: IObject
    })

    onload(): void;

    onunload(): void;

    /*
     * @param {string} [options.position=right]
     */
    addTopBar(options: {
        icon: string,
        title: string,
        callback: (evt: MouseEvent) => void
        position?: "right" | "left"
    }): HTMLDivElement;

    openSetting(): void

    // registerCommand(command: IPluginCommand): void;

    // registerSettingRender(settingRender: SettingRender): void;

    loadData(storageName: string): Promise<any>;

    saveData(storageName: string, content: any): Promise<void>;
}

export class EventBus {
    on(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    once(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    off(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    emit(type: TEventBus, detail?: any): boolean;
}

export class Dialog {

    element: HTMLElement;

    constructor(options: {
        title?: string,
        transparent?: boolean,
        content: string,
        width?: string
        height?: string,
        destroyCallback?: (options?: IObject) => void
        disableClose?: boolean
        disableAnimation?: boolean
    });

    destroy(options?: IObject): void;

    bindInput(inputElement: HTMLInputElement | HTMLTextAreaElement, enterEvent?: () => void): void;
}

export interface IMenuItemOption {
    label?: string,
    click?: (element: HTMLElement) => void,
    type?: "separator" | "submenu" | "readonly",
    accelerator?: string,
    action?: string,
    id?: string,
    submenu?: IMenuItemOption[]
    disabled?: boolean
    icon?: string
    iconHTML?: string
    current?: boolean
    bind?: (element: HTMLElement) => void
}

export class Menu {
    constructor(id?: string, closeCB?: () => void);

    showSubMenu(subMenuElement: HTMLElement): void;

    addItem(options: IMenuItemOption): HTMLElement;

    addSeparator(): void;

    open(options: { x: number, y: number, h?: number, w?: number, isLeft?: boolean }): void;

    /*
     * @param {string} [position=all]
     */
    fullscreen(position?: "bottom" | "all"): void;

    close(): void;
}
