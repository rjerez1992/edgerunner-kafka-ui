import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KafkaMessage } from 'kafkajs';
import { actionShowToast } from '../definitions/constants';
import { KafkaClusterInformation } from '../models/cluster-information';
import { NavigationAction } from '../models/navigation-action';
import {v4 as uuidv4} from 'uuid';
import { StorageService } from './storage.service';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class KafkaService {
  public errorCallback: Function;

  private connected : boolean = false;
  private isDisconnecting : boolean = false;
  private cluster: KafkaClusterInformation;
  private isConsumerPaused : boolean = false;
  private isChangingTopics : boolean = false;
  private hasBroken : boolean = false;
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  async connectToCluster(clusterInformation: KafkaClusterInformation): Promise<boolean> {
    if (this.isConnected()){
      console.error("Trying to connect to a cluster while another connection is open");
      return false;
    }
    this.connected = false;
    this.hasBroken = false;
    this.isConsumerPaused = false;
    this.isChangingTopics = false;
    this.isDisconnecting = false;
    this.cluster = clusterInformation;
    try {
      let securedPassword = await this.getSecurePassword();
      const value = await window.kafka.connect(this.cluster, securedPassword, (errorType: string, error: any) => {
        if (this.hasBroken){
          return;
        }
        this.hasBroken = true;

        let errorCallback = this.errorCallback;
        this.errorCallback = () => { console.warn("Error callback removed") };
        if (errorType == "CRASH"){
          console.error("Connection to Kafka CRASHED");
          this.cleanUpConnection(() => {errorCallback(error);});
        } else if (errorType == "DISCONNECT" && this.connected && !this.isChangingTopics && !this.isDisconnecting){
          console.error("Connection to Kafka DISCONNECTED");
          this.cleanUpConnection(() => {errorCallback(error);});
        } else if (errorType != "DISCONNECT" && this.connected && !this.isChangingTopics && !this.isDisconnecting)  {
          console.error("Connection to Kafka FAILED with TYPE:");
          console.error(errorType);
          this.cleanUpConnection(() => {errorCallback(error);});
        }
      });
      
      if (!value){
        console.error("Unable to connect to cluster. Returned false");
        this.connected = false;
        return false;
      }
      this.connected = true;
      return true;
    } catch (e) {
      console.log("Unable to log into cluster");
      console.error(e);
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  currentClusterInfo(): KafkaClusterInformation {
    return this.cluster;
  }

  removeErrorCallback(): void {
    this.errorCallback = (error: string) => { 
      console.warn("### Error callback removed ###"); 
      console.warn(error);
    };
  }

  async topicsList(): Promise<string[]> {
    try {
      let value = await window.kafka.topics();
      value = value.filter(x => x !== '__consumer_offsets'); 
      return value;
    } catch (e) {
      console.error("Unable to fetch topic list");
      console.error(e);
      this.cleanupAndCallback();
      return [];
    } 
  }

  async subscribeTo(topic: string, callback: Function): Promise<void> {
    try {
      this.isChangingTopics = true;
      const value = await window.kafka.subscribe(topic, callback);
      this.isChangingTopics = false;
      return;
    } catch (e) {
      console.error("Unable to subscribe to topic");
      console.error(e);
      this.cleanupAndCallback();
      return;
    }
  }

  async produceToTopic(topic: string, key: string, message:string): Promise<boolean> {
    if (!key || key == ""){
      key = uuidv4();
      console.log("Message without key. Generated one: "+key);
    }
    try {
      this.isChangingTopics = true;
      let result = await window.kafka.produce(topic, key, message);
      this.isChangingTopics = false;
      return result;
    } catch (e) {
      console.log("Unable to produce to topic "+topic);
      console.error(e);
      return false;
    }
  }

  async createTopic(name: string): Promise<boolean> {
    console.log("Requested topic creating with name: "+name);
    return window.kafka.create(name);
  }

  pauseConsumer(): void {
    if(!this.isConsumerPaused){
      this.isConsumerPaused = true;
      window.kafka.pause();
    }
  }

  resumeConsumer(): void {
    if(this.isConsumerPaused){
      this.isConsumerPaused = false;
      window.kafka.resume();
    }
  }

  cleanUpConnection(callback: Function): void {
    if (!this.isConnected){
      console.warn("Kafka is not connected and cleanup attempted");
      return;
    }

    console.info("Closing up connection on request");
    this.isDisconnecting = true;

    window.kafka.cleanup(() => {
      console.info("Connection closed. Resetting variables");
      this.isDisconnecting = false;
      this.connected = false;
      this.cluster = {} as KafkaClusterInformation;
      this.isConsumerPaused = false;
      callback();
    });
  }

  getMessageStringValue(message: KafkaMessage): string {
    if (message.value != null){
      let stringValue = String.fromCharCode(...message.value);
      return stringValue;
    }
    return "";
  }

  getMessageStringKey(message: KafkaMessage): string {
    if (message.key != null){
      let stringKey = String.fromCharCode(...message.key);
      return stringKey;
    }
    return "";
  }

  getMessageJSONValue(message: KafkaMessage): any {
    let json = JSON.parse(this.getMessageJSONValue(message));
    return json;
  }

  cleanupAndCallback(): void {
    this.cleanUpConnection(this.errorCallback);
  }

  getSecurePassword(): Promise<string> {
    if (this.cluster.securedPassword){
      let encryptedPassword = Buffer.from(this.cluster.encryptedPassword);
      return this.storageService.safeGet(encryptedPassword);
    }
    return Promise.resolve("");
  }
}
