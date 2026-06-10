export const COURSE_LIST_CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'chinese', name: '语文' },
  { id: 'math', name: '数学' },
  { id: 'physics', name: '物理' },
  { id: 'chemistry', name: '化学' },
  { id: 'english', name: '外语' },
  { id: 'music', name: '音乐' },
  { id: 'dance', name: '舞蹈' },
  { id: 'coding', name: '编程' },
] as const

export const COURSE_SORT_OPTIONS = [
  { key: 'default', label: '综合排序' },
  { key: 'sales', label: '销量排序' },
  { key: 'rating', label: '评分排序' },
  { key: 'price', label: '价格排序' },
] as const

export type CourseSortKey = (typeof COURSE_SORT_OPTIONS)[number]['key']
