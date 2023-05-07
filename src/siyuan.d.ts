type TEventBus = "ws-main"

interface IObject {
    [key: string]: string;
}

export const Confirm: (title: string, text: string, confirmCB?: () => void, cancelCB?: () => void) => void;

/**
 * @param timeout - 毫秒；0 手动关闭；-1 用不关闭; 6000 默认关闭时间
 * @param messageId - 设置相同 id 时，会覆盖之前的消息
 */
export const Message: (text: string, timeout: number, type: "info" | "error", id?: string) => void;

export class EventBus {
    on(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    once(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    off(type: TEventBus, listener: (event: CustomEvent<any>) => void): void;

    emit(type: TEventBus, detail?: any): boolean;
}

export class App {
    plugins: Plugin[];
}

export abstract class Plugin {
    eventBus: EventBus;
    i18n: IObject;

    constructor(options: {
        app: App,
        id: string,
        name: string,
        i18n: IObject
    })

    onload(): void;

    onunload(): void;

    // registerCommand(command: IPluginCommand): void;

    // registerSettingRender(settingRender: SettingRender): void;

    loadStorage(filename: string): Promise<any>;

    writeStorage(filename: string, content: any): Promise<void>;
}
