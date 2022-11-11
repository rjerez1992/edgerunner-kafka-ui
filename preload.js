const { contextBridge, ipcRenderer } = require('electron')
const { store } = require("./src/scripts/storage.js")
const { connectCluster, topicList, subscribeToTopic, kafkaCleanup, pauseConsumer, resumeConsumer, createTopic, publishToTopic } = require("./src/scripts/kafka.js")
const { playTheme } = require('./src/scripts/sound.js')

contextBridge.exposeInMainWorld('store', {
  set: (key, value) => store.set(key, value),
  get: (key) => store.get(key),
  hasSafe: () => ipcRenderer.invoke('hasEncription'),
  safeSet: (value) => ipcRenderer.invoke('encrypt', value),
  safeGet: (encryptedValue) => ipcRenderer.invoke('decrypt', encryptedValue)
})

contextBridge.exposeInMainWorld('files', {
  save: (output, name) => ipcRenderer.invoke('saveToFile', output, name),
  read: () => ipcRenderer.invoke('readFromFile'),
})

contextBridge.exposeInMainWorld('utils', {
  appVersion: () => ipcRenderer.invoke('appVersion'),
  openLink: (url) => ipcRenderer.invoke('openLink', url),
  play: () => playTheme()
})

contextBridge.exposeInMainWorld('kafka', {
  connect: (clusterInformation, errorCallback) => connectCluster(clusterInformation, errorCallback),
  topics: () => topicList(),
  create: (topicName) => createTopic(topicName),
  subscribe: (targetTopic, messageCallback) => subscribeToTopic(targetTopic, messageCallback),
  produce: (targetTopic, key, message) => publishToTopic(targetTopic, key, message),
  cleanup: () => kafkaCleanup(),
  pause: () => pauseConsumer(),
  resume: () => resumeConsumer(),
})
