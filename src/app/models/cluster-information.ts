export interface KafkaClusterInformation {
  id: string,
  name: string,
  host: string,
  username: string,
  securedPassword: boolean,
  plainPassword: string,
  encryptedPassword: number[],
  groupId: string,
  clientName: string,
  secureMode: boolean,
  readOnly: boolean,
  dateAdded: string,
  dateModified: string
}