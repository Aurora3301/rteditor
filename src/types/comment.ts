export interface Comment {
  id: string
  documentId: string
  authorId: string
  authorName: string
  authorRole: 'teacher' | 'student'
  content: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolvedBy?: string
  parentId?: string // For threading
  highlightRange: {
    from: number
    to: number
  }
  highlightedText: string
}

export interface CommentThread {
  rootComment: Comment
  replies: Comment[]
  isResolved: boolean
  participantCount: number
}

export interface CommentStore {
  comments: Map<string, Comment>
  threads: Map<string, CommentThread>
  addComment: (comment: Comment) => void
  getComment: (id: string) => Comment | undefined
  getThread: (id: string) => CommentThread | undefined
  resolveComment: (id: string, resolvedBy: string) => void
  deleteComment: (id: string) => void
  getAllComments: () => Comment[]
}
