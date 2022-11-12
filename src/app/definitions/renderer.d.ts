import { KafkaClusterInformation } from "../models/cluster-information"

export interface IStoreAPI {
  set: (key: string, value: any) => void,
  get: (key: string) => any
  hasSafe: () => Promise<boolean>,
  safeSet: (value: string) => Promise<Buffer>,
  safeGet: (encryptedValue: Buffer) => Promise<string>
}

export interface IFileAPI {
  save: (output: string, name: string) => Promise<boolean>,
  read: () => Promise<string>
}

export interface IKafkaAPI {
  connect: (clusterInformation: KafkaClusterInformation, securedPass: string, errorCallback: Function) => Promise<boolean>,
  topics: () => Promise<string[]>,
  create: (topicName: string) => Promise<boolean>,
  subscribe: (topic: string, messageCallback: Function) => Promise<void>,
  produce: (topic: string, key: string, value: string) => Promise<boolean>,
  cleanup: () => void,
  pause: () => void,
  resume: () => void
}

export interface IUtilsAPI {
  appVersion: () => Promise<string>,
  openLink: (url: string) => void,
  play: () => void
}

declare global {
  interface Window {
    store: IStoreAPI,
    kafka: IKafkaAPI,
    files: IFileAPI,
    utils: IUtilsAPI
  }
}