import { createConnection } from 'mysql'
import config from '../config/db'

const conn = createConnection(config)

export default (sql, values) => new Promise((resolve, reject) => {
  console.log(sql, values)
  conn.query({ sql, values }, (error, results, fields) => {
    if (error) reject(error)
    else resolve(results)
  })
})
