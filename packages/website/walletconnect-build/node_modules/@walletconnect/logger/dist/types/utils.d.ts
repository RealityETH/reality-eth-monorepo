import { Logger, LoggerOptions } from "pino";
import ClientChunkLogger from "./clientChunkLogger";
import ServerChunkLogger from "./serverChunkLogger";
import BaseChunkLogger from "./baseChunkLogger";
export interface ChunkLoggerController {
    logsToBlob: BaseChunkLogger["logsToBlob"];
    getLogArray: () => string[];
    clearLogs: () => void;
    downloadLogsBlobInBrowser?: ClientChunkLogger["downloadLogsBlobInBrowser"];
}
export declare function getDefaultLoggerOptions(opts?: LoggerOptions): LoggerOptions;
export declare function setLoggerContext(logger: Logger, context: string, customContextKey?: string): Logger;
export declare function getLoggerContext(logger: Logger, customContextKey?: string): string;
export declare function formatChildLoggerContext(logger: Logger, childContext: string, customContextKey?: string): string;
export declare function generateChildLogger(logger: Logger, childContext: string, customContextKey?: string): Logger;
export declare function generateClientLogger(params: {
    opts?: LoggerOptions;
    maxSizeInBytes?: number;
}): {
    logger: Logger;
    chunkLoggerController: ClientChunkLogger;
};
export declare function generateServerLogger(params: {
    maxSizeInBytes?: number;
    opts?: LoggerOptions;
}): {
    logger: Logger;
    chunkLoggerController: ServerChunkLogger;
};
export declare function generatePlatformLogger(params: {
    maxSizeInBytes?: number;
    opts?: LoggerOptions;
    loggerOverride?: string | Logger;
}): {
    logger: Logger;
    chunkLoggerController: ChunkLoggerController | null;
};
//# sourceMappingURL=utils.d.ts.map