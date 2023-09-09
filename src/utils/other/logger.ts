import dateFormat from "date-fns/format";
import { format, createLogger, transports } from "winston";

import env from "./env";

const time = dateFormat(Date.now(), "yyMMddHHmmss");

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} | ${level} | ${message}`;
});

const initLogger = () => {
  const formatTimestamp = format.timestamp({ format: "HH:mm:ss" });
  const logger = createLogger({
    transports: [
      new transports.Console({
        level: env.NODE_ENV === "dev" ? "debug" : "info",
        format: format.combine(
          format.colorize(),
          format.splat(),
          formatTimestamp,
          customFormat
        ),
      }),
      new transports.File({
        level: "debug",
        filename: `./logs/${time}_debug.log`,
        format: format.combine(format.splat(), formatTimestamp, customFormat),
      }),
      new transports.File({
        level: "info",
        filename: `./logs/${time}_info.log`,
        format: format.combine(format.splat(), formatTimestamp, customFormat),
      }),
      new transports.File({
        level: "error",
        filename: `./logs/${time}_error.log`,
        format: format.combine(format.splat(), formatTimestamp, customFormat),
      }),
    ],
  });

  return logger;
};

const logger = initLogger();

export default logger;
