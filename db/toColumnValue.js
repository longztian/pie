const toColumnValue = (data, fieldColumnMap) => {
  const fields = Object.keys(data).filter(field => (typeof data[field] !== 'undefined' && fieldColumnMap[field]))

  return {
    columns: fields.map(field => fieldColumnMap[field]),
    values: fields.map(field => data[field]),
  }
}

export const toSelectColumns = (fields, fieldColumnMap) => {
  const dbFields = fields.filter(field => fieldColumnMap[field])
  if (dbFields.length === 0) throw new Error('no column to select')

  return dbFields
    .map(field => (field === fieldColumnMap[field] ? field : `${fieldColumnMap[field]} AS ${field}`))
    .join(', ')
}

export const toInsertColumnValues = (data, fieldColumnMap) => {
  const { columns, values } = toColumnValue(data, fieldColumnMap)
  if (columns.length === 0) throw new Error('no column to insert')

  return {
    columns: `(${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    values,
  }
}

export const toUpdateColumnValues = (data, fieldColumnMap) => {
  const { columns, values } = toColumnValue(data, fieldColumnMap)
  if (columns.length === 0) throw new Error('no column to update')

  return {
    columns: columns.map(column => `${column}=?`).join(', '),
    values,
  }
}
