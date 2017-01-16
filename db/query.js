import { createConnection } from 'mysql'

const conn = createConnection({
  user: 'web',
  password: 'Ab663067',
  database: 'hbbs',
})

export default (sql, values) => new Promise((resolve, reject) => {
  console.log(sql, values)
  conn.query({ sql, values }, (error, results, fields) => {
    if (error) reject(error)
    else resolve(results)
  })
})
