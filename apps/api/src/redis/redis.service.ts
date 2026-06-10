import { Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
  constructor(private readonly client: Redis) {}

  getClient() {
    return this.client
  }

  async get(key: string) {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds)
    }
    return this.client.set(key, value)
  }

  async del(key: string) {
    return this.client.del(key)
  }

  async quit() {
    return this.client.quit()
  }
}
