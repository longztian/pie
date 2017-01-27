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

const add = (messageId, name, path) => {
  // path: /data/_width_height_<timestamp><i>.<type>

  // get width and height from path
  const tmp = path.split('_')
  const newPath = tmp[0] + tmp[3]
  const width = parseInt(tmp[1], 10)
  const height = parseInt(tmp[2], 10)

  return new Promise((resolve, reject) => {
    rename(`${config.dir}${path}`, `${config.dir}${newPath}`, (error) => {
      if (error) {
        reject(error)
      } else {
        const { columns, values } = toInsertColumnValues({
          messageId,
          name,
          width,
          height,
          path: newPath,
        }, fieldColumnMap)

        query(`INSERT INTO images ${columns}`, values)
        .then((results) => {
          resolve({
            id: results.insertId,
            name,
            width,
            height,
            path: newPath,
          })
        })
      }
    })
  })
}

const update = (id, name) => query('UPDATE images SET name = ? WHERE id = ?', [name, id])

const deleteImage = id => query('SELECT path FROM images WHERE id = ?', [id])
  .then(results => new Promise((resolve, reject) => {
    if (results.length > 0) {
      const path = results[0].path
      rename(`${config.dir}${path}`, `${config.dir}${path}.deleted`, (error) => {
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
