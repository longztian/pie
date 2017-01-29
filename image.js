import { rename } from 'fs'
import config from './config/image'
import query from './db/query'
import { toInsertColumnValues } from './db/toColumnValue'

const fieldColumnMap = {
  messageId: 'cid',
  name: 'name',
  path: 'path',
  width: 'width',
  height: 'height',
}

const add = (messageId, name, tmpPath) => {
  // tmpPath: /data/<timestamp><i>.<type>_width_height
  const tmp = tmpPath.split('_')
  if (tmp.length < 3) return Promise.reject('Invalid image path')

  const path = tmp.slice(0, -2).join('_')
  const width = parseInt(tmp[tmp.length - 2], 10)
  const height = parseInt(tmp[tmp.length - 1], 10)
  if (isNaN(width) || isNaN(height) || width < 60 || height < 60) {
    return Promise.reject('Invalid image size')
  }

  return new Promise((resolve, reject) => {
    rename(`${config.dir}${tmpPath}`, `${config.dir}${path}`, (error) => {
      if (error) {
        reject(error)
      } else {
        const { columns, values } = toInsertColumnValues({
          messageId,
          name,
          width,
          height,
          path,
        }, fieldColumnMap)

        query(`INSERT INTO images ${columns}`, values)
        .then(results => resolve({
          id: results.insertId,
          name,
          width,
          height,
          path,
        }))
      }
    })
  })
}

const update = (id, name) => query('UPDATE images SET name = ? WHERE id = ?', [name, id])

const deleteImage = id => query('SELECT path FROM images WHERE id = ?', [id])
  .then(results => new Promise((resolve, reject) => {
    if (results.length > 0) {
      const path = results[0].path
      rename(`${config.dir}${path}`, `${config.dir}${path}_deleted`, (error) => {
        query('DELETE FROM images WHERE id = ?', [id]).then(() => {
          if (error) reject(error)
          else resolve()
        })
      })
    } else {
      resolve()
    }
  }))

const deleteMessageImages = messageId => query('SELECT path FROM images WHERE cid = ?', [messageId])
  .then((results) => {
    results.map(img => rename(`${config.dir}${img.path}`, `${config.dir}${img.path}.deleted`))
    return query('DELETE FROM images WHERE cid = ?', [messageId])
  })

export default {
  add,
  update,
  delete: deleteImage,
  deleteMessageImages,
}
