export interface CollaborationUser {
  id: string
  name: string
  color: string
}

export interface CollaborationOptions {
  document: unknown  // Y.Doc
  provider?: unknown // WebsocketProvider
  user: CollaborationUser
}
