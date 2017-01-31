import {
  IncomingForm,
} from 'formidable'
import fs from 'fs'
import sizeOf from 'image-size'
import sharp from 'sharp'
import config from './config/image'

const resize = (path, maxWidth, maxHeight) => new Promise((resolve, reject) => {
  const newPath = `${config.dir}${path}`

  sizeOf(path, (err, dimensions) => {
    if (err) {
      reject(err)
    } else {
      let factor = -1

      if (dimensions.width > maxWidth) {
        factor = dimensions.width / maxWidth
      }

      if (dimensions.height > maxHeight) {
        factor = Math.max(dimensions.height / maxHeight, factor)
      }

      if (factor > 0) {
        const width = Math.round(dimensions.width / factor)
        const height = Math.round(dimensions.height / factor)
        sharp(path)
          .resize(width, height)
          .toFile(newPath, (error) => {
            if (error) {
              reject(error)
            } else {
              // delete path
              resolve(newPath)
            }
          })
      } else {
        fs.rename(path, newPath, (error) => {
          if (error) {
            reject(error)
          } else {
            resolve(newPath)
          }
        })
      }
    }
  })
})

export default opts => (ctx, next) => {
  if (ctx.is('multipart')) {
    const form = new IncomingForm(opts)

    form.multiples = true

    form.on('progress', (bytesReceived, bytesExpected) => {
      // formidable should limit the body size and stop processing the req stream
      // not form middleware
      if (bytesReceived === 0) {
        if (bytesExpected > config.totalLimit) { form._error(new Error('request body is too big')) }
      } else if (bytesReceived > bytesExpected) { form._error(new Error('got more data than expected')) }
    })

    form.onPart = (part) => {
      if (part.filename) {
        if (!config.types.includes(part.mime)) { form._error(new Error(`unsupported type: ${part.mime}`)) }
      }

      form.handlePart(part)
    }

    const fields = {}
    const files = {}

    return new Promise((resolve, reject) => {
      form
        .on('field', (name, value) => {
          if (fields[name]) {
            if (!Array.isArray(fields[name])) fields[name] = [fields[name]]
            fields[name].push(value)
          } else {
            fields[name] = value
          }
        })
        .on('file', (name, file) => {
          resize(file.path, config.width, config.height)
            .then(() => {
              if (files[name]) {
                if (!Array.isArray(files[name])) files[name] = [files[name]]
                files[name].push(file)
              } else {
                files[name] = file
              }
            })
        })
        .on('end', () => {
          ctx.request.body = {
            fields,
            files,
          }
          resolve(next())
        })
        .on('error', (err) => {
          reject(err)
        })

      form.parse(ctx.req)
    })
  }

  return next()
}
