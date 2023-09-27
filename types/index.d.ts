declare type OnConnect = (element: HTMLElement) => void | OnDisconnect;
declare type OnDisconnect = () => void;
export declare const onConnect: (selector: string, callback: OnConnect) => Promise<void>;
export {};
