import query from './db/query'

/*
class Tag {
  id,
  name,
  description,
}
*/

const getLeafTagId = results => results[0]
  .filter(tag => tag.level === 2)
  .map(tag => tag.id)

const queryForumTags = query('CALL get_tag_tree(1)')
  .then(getLeafTagId)

const queryYellowPageTags = query('CALL get_tag_tree(2)')
  .then(getLeafTagId)

export default {
  getForumTags: () => queryForumTags,
  getYellowPageTags: () => queryYellowPageTags,
}
