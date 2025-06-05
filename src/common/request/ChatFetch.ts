import { globalRequest, fetchEventSourceRequest } from '@/common/request';
import { FetchEventSourceInit } from '@microsoft/fetch-event-source';

type FetchType = string

class ChatFetch {

  private fetchType: FetchType
  private ctrl: AbortController
  private url: string

  constructor(url: string, type?: string) {
    this.url = url
    this.fetchType = type || 'STREAM'
    this.ctrl = new AbortController()
  }

  public fetchData(options: RequestInit | FetchEventSourceInit, fetchType?: FetchType) {
    const url = this.url
    fetchType = fetchType || this.fetchType
    if (['STREAM', 'STEAM'].includes(fetchType)) {
      return this.fetchDataStream(url, options as FetchEventSourceInit)
    }
    return globalRequest(url, options as RequestInit)
  }

  public async fetchDataStream(url: string, options: FetchEventSourceInit) {
    const result = await fetchEventSourceRequest(url, {
      signal: this.ctrl.signal,
      ...options,
    })
    console.info(result)
    return result
  }

  private stopStream(conversationId: string) {
    if (this.url) {
      globalRequest(`${this.url}/stop`, {
        method: 'POST',
        params: {
          conversationId,
        },
      })
    }
  }

  public abort(conversationId: string) {
    this.ctrl.abort()
    this.stopStream(conversationId)
  }
}

export default ChatFetch
