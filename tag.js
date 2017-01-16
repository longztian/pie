import query from './db/query'

/*
class Tag {
  id,
  name,
  description,
}
*/

const getLeafTagId = result => result[0]
  .filter(tag => tag.level === 2)
  .map(tag => tag.id)

const queryForumTags = query('CALL get_tag_tree(1)')
  .then(getLeafTagId)
  .catch(console.log)

const queryYellowPageTags = query('CALL get_tag_tree(2)')
  .then(getLeafTagId)
  .catch(console.log)

export default {
  getForumTags: () => queryForumTags,
  getYellowPageTags: () => queryYellowPageTags,
}
