/**
 * @fileoverview logger service,
 * @description This file contains the logger service
 *
 * @error Errors that are completely preventing a resource from working and unexpected
 * @warn Errors that are not preventing a resource from working, but are not expected
 *       (e.g. a user missing a field in a request body)
 * @info Informational messages that are not errors or warnings
 *       (e.g. endpoint hits)
 * @debug Debugging messages
 */

import { NextFunction, Request, Response } from 'express'
import winston from 'winston'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  silly: 4
}

const color = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  silly: 'white'
}

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  ),
  winston.format.colorize({ all: true })
)

export const logger = winston.createLogger({
  levels,
  format,
  transports: [
    new winston.transports.File({ filename: 'logs/all.log', level: 'silly' })
  ]
})

winston.addColors(color)

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format,
      level: 'silly'
    })
  )
}

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(`Request: ${req.method} ${req.originalUrl}`)
  next()
}

export const responseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send

  res.send = function (body) {
    const responseBody = body instanceof Buffer ? body.toString() : body

    logger.silly(`Response Body: ${responseBody}`)

    return originalSend.apply(this, arguments)
  }
  res.on('finish', () => {
    if (res.statusCode === 200) {
      logger.info(`Response: ${res.statusCode} ${res.statusMessage}`)
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      logger.warn(`Response: ${res.statusCode} ${res.statusMessage}`)
    } else if (res.statusCode >= 500) {
      logger.error(`Response: ${res.statusCode} ${res.statusMessage}`)
    }
  })
  next()
}
