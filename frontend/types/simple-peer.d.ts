declare module 'simple-peer' {
  import { EventEmitter } from 'events'
  interface SimplePeerOptions {
    initiator?: boolean
    trickle?: boolean
    stream?: MediaStream
    config?: RTCConfiguration
  }
  class SimplePeer extends EventEmitter {
    constructor(opts?: SimplePeerOptions)
    signal(data: unknown): void
    destroy(): void
  }
  export default SimplePeer
}
