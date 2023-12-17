import { getLabel } from "./color";
import { noop } from "lodash";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLoggerWrite(
  level: "log" | "warn" | "error" | "info" | "trace" | "debug",
  label?: string,
): (...messages: any[]) => void {
  return (...messages) => {
    console[level](label, ...messages);
  };
}

export function getLogger(
  id?: string,
  width?: number,
): Pick<Console, "log" | "warn" | "error" | "info" | "trace" | "debug"> {
  const label = id ? getLabel(id, width) : undefined;

  return {
    log: getLoggerWrite("log", label),
    warn: getLoggerWrite("warn", label),
    error: getLoggerWrite("error", label),
    info: getLoggerWrite("info", label),
    trace: getLoggerWrite("trace", label),
    debug: getLoggerWrite("debug", label),
  };
}

export function getLoggerNoop(): Pick<Console, "log" | "warn" | "error" | "info" | "trace" | "debug"> {
  return {
    log: noop,
    warn: noop,
    error: noop,
    info: noop,
    trace: noop,
    debug: noop,
  };
}
