import { Injectable } from '@angular/core';
import { storageUserClustersKey } from '../definitions/constants';
import { KafkaClusterInformation } from '../models/cluster-information';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserClustersService {

  constructor(private storageService: StorageService,) { }

  getUserClusters(): Array<KafkaClusterInformation> {
    let userClusters = this.storageService.get(storageUserClustersKey);
    if (userClusters == undefined){
      console.warn("Unable to retrieve user clusters. Creating empty record");
      userClusters = new Array<KafkaClusterInformation>();
      this.storageService.set(storageUserClustersKey, userClusters);
    }
    return userClusters;
  }

  addUserCluster(cluster: KafkaClusterInformation): void {
    //NOTE: Data is always fetched to account for external changes
    let userClusters = this.getUserClusters();
    userClusters.push(cluster);
    this.storageService.set(storageUserClustersKey, userClusters);
  }

  updateUserCluster(cluster: KafkaClusterInformation): void {
    let userClusters = this.getUserClusters();

    let currentClusterIndex = userClusters.findIndex(x => x.id == cluster.id);
    //NOTE: Replaces old with updated one
    userClusters.splice(currentClusterIndex, 1, cluster);
    
    this.storageService.set(storageUserClustersKey, userClusters);
  }

  removeUserCluster(clusterId: string): void {
    let userClusters = this.getUserClusters();
    userClusters = userClusters.filter(x => x.id !== clusterId); 
    this.storageService.set(storageUserClustersKey, userClusters);
  }

  //NOTE: For debugging purposes only
  resetClusterData(): void {
    console.warn("Cleaning up clusters data");
    let userClusters = new Array<KafkaClusterInformation>();
    this.storageService.set(storageUserClustersKey, userClusters);
  }
}
