import nats, { Stan } from 'node-nats-streaming';
class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (this._client) return this._client
    throw new Error("Cannot access NATS client before connecting")
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url })

    return new Promise((res, rej) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        res()
      })
      this.client.on("error", (err) => {
        rej(err)
      })
    })
  }
}

export const natsWrapper = new NatsWrapper()