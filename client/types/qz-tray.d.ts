/**
 * QZ Tray Type Definitions
 */

declare module 'qz-tray' {
  interface QZConfig {
    printer?: string;
    copies?: number;
    jobName?: string;
    units?: string;
    orientation?: string;
    size?: string;
    margins?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  }

  interface QZPrintData {
    type: string;
    format?: string;
    data: string | string[];
    flavor?: string;
    options?: any;
  }

  interface QZWebSocket {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isActive(): boolean;
  }

  interface QZConfigs {
    create(printer?: string): QZConfig;
  }

  interface QZ {
    printers: any;
    websocket: QZWebSocket;
    configs: QZConfigs;
    print(config: QZConfig, data: QZPrintData[]): Promise<void>;
    findPrinter(): Promise<string[]>;
  }

  const qz: QZ;
  export default qz;
}

