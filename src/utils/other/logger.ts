import dateFormat from "date-fns/format";
import { format, createLogger, transports } from "winston";
import TelegramLogger from "winston-telegram";

import env from "./env";

const time = dateFormat(Date.now(), "yyMMddHHmmss");

const customFormat = format.printf(
  ({ level, message, timestamp }) => `${timestamp} | ${level} | ${message}`,
);

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
          customFormat,
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

  if (env.TELEGRAM_TOKEN && env.TELEGRAM_CHAT_ID) {
    logger.add(
      new TelegramLogger({
        token: env.TELEGRAM_TOKEN,
        chatId: env.TELEGRAM_CHAT_ID,
        level: "error",
        batchingDelay: 1000,
      }),
    );
  }

  return logger;
};

const logger = initLogger();

export default logger;
