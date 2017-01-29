import { IncomingForm } from 'formidable'

export default opts => (ctx, next) => {
  if (ctx.is('multipart')) {
    const form = new IncomingForm(opts)

    return new Promise((resolve, reject) => {
      form.parse(ctx.req, (err, fields, files) => {
        if (err) {
          reject(err)
        } else {
          ctx.request.body = {
            fields,
            files,
          }
          resolve(next())
        }
      })
    })
  }

  return next()
}
