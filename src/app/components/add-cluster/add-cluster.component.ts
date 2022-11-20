import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { KafkaClusterInformation } from 'src/app/models/cluster-information';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UserClustersService } from 'src/app/services/user-clusters.service';
import {v4 as uuidv4} from 'uuid';
import { GeneralUtils } from 'src/app/utils/general-utils';
import { SwalHelpers } from 'src/app/utils/swal-helpers';
import { StorageService } from 'src/app/services/storage.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NavigationAction } from 'src/app/models/navigation-action';
import { actionShowToast, headerAddCluster, headerEditCluster } from 'src/app/definitions/constants';
import { Buffer } from 'buffer';
import { GeneralParamsService } from 'src/app/services/general-params.service';
import { KafkaService } from 'src/app/services/kafka.service';

@Component({
  selector: 'app-add-cluster',
  templateUrl: './add-cluster.component.html',
  styleUrls: ['./add-cluster.component.scss']
})
export class AddClusterComponent implements OnInit {

  @Input() clusterInformation : KafkaClusterInformation;
  @Input() password : string;
  @ViewChild('secureModeToggle') secureModeTottle!: ElementRef;
  @ViewChild('readModeToggle') readModeToggle!: ElementRef;

  public editMode: boolean = false;
  public headText: string = "Add";

  public isLoading : boolean = false;
  public loadingText: string = "";

  constructor(
    private router: Router, 
    private userClustersService: UserClustersService, 
    private storageService: StorageService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private generalParamsService: GeneralParamsService,
    private kafkaService: KafkaService
  ) { 
    this.clusterInformation = {} as KafkaClusterInformation;
    this.password = "";
  }

  ngOnInit(): void {
    dayjs.extend(utc);

    let clusterId = this.route.snapshot.queryParamMap.get("clusterId");
    if (clusterId != undefined){
      this.generalParamsService.setHeaderMode(headerEditCluster);
      this.setEditMode();
      this.setClusterData(clusterId);
    } else {
      this.generalParamsService.setHeaderMode(headerAddCluster);
      this.headText = "Add";
      this.editMode = false;
    }    
  }

  setRandomClientName(): void {
    let clientName = GeneralUtils.getFunnyName();
    console.log("Setting random client name with value: "+clientName);
    this.clusterInformation.clientName = clientName;
  }

  setEditMode(): void {
    this.editMode = true;
    this.headText = "Save";
  }

  async setClusterData(clusterId: string) : Promise<void> {
    let userClusters = this.userClustersService.getUserClusters();
    let editingCluster = userClusters.find(x => x.id === clusterId);

    if (editingCluster != undefined){
      this.clusterInformation = editingCluster;
      if (await this.storageService.isSafeAvailable() && editingCluster.securedPassword){
        let encryptedPassword = Buffer.from(editingCluster.encryptedPassword);
        this.password = await this.storageService.safeGet(encryptedPassword);
      } else {
        this.password = editingCluster.plainPassword;
      }
    }

    this.secureModeTottle.nativeElement.setAttribute('data-checked', this.clusterInformation.secureMode);
    this.readModeToggle.nativeElement.setAttribute('data-checked', this.clusterInformation.readOnly);

    this.cdRef.detectChanges();
  }

  addOrEditCluster(): void {
    if(this.editMode){
      this.editCluster();
    } else {
      this.addCluster();
    }
  }

  async addCluster() : Promise<void> {
    if (!this.clusterInformation.host || !this.clusterInformation.clientName || !this.clusterInformation.groupId){
      SwalHelpers.showErrorSwal('Host, group ID and client name are required');
    }    
    else {
      //NOTE: We setup some properties before creating
      this.clusterInformation.id = uuidv4();
      if (!this.clusterInformation.name){
        let clusterName = GeneralUtils.getFunnyShortName();
        this.clusterInformation.name = clusterName;
      }
      this.clusterInformation.secureMode = this.secureModeTottle.nativeElement.getAttribute('data-checked') == "true" ? true : false;
      this.clusterInformation.readOnly = this.readModeToggle.nativeElement.getAttribute('data-checked') == "true" ? true : false;
      
      //NOTE: Protects password if available
      if (await this.storageService.isSafeAvailable() && this.password != ""){
        this.clusterInformation.securedPassword = true;
        let encryptedPass = await this.storageService.safeSet(this.password);
        this.clusterInformation.encryptedPassword = [...encryptedPass];
        console.log(this.clusterInformation.encryptedPassword);
      } else {
        if (this.password != ""){
          console.warn("Safe keychain for password storage not available");
        }
        this.clusterInformation.securedPassword = false;
        this.clusterInformation.plainPassword = this.password
      }

      this.clusterInformation.dateAdded = dayjs().utc().format();
      this.clusterInformation.dateModified = dayjs().utc().format();

      console.log("Storing new cluster with name: " + this.clusterInformation.name);
      this.userClustersService.addUserCluster(this.clusterInformation);

      let action : NavigationAction = {
        action: actionShowToast,
        type: 'success',
        value: 'Cluster added'
      } 

      this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
    }
  }

  async editCluster(): Promise<void> {
    //NOTE: This is almost the same as addCluster. Just minor changes
    if (!this.clusterInformation.host || !this.clusterInformation.clientName || !this.clusterInformation.groupId){
      SwalHelpers.showErrorSwal('Host, group ID and client name are required');
    }    
    else {
      if (!this.clusterInformation.name){
        let clusterName = GeneralUtils.getFunnyName();
        this.clusterInformation.name = clusterName;
      }
      this.clusterInformation.secureMode = this.secureModeTottle.nativeElement.getAttribute('data-checked') == "true" ? true : false;
      this.clusterInformation.readOnly = this.readModeToggle.nativeElement.getAttribute('data-checked') == "true" ? true : false;
      
      //NOTE: Protects password if available
      if (await this.storageService.isSafeAvailable() && this.password != ""){
        this.clusterInformation.securedPassword = true;
        let encryptedPass = await this.storageService.safeSet(this.password);
        this.clusterInformation.encryptedPassword = [...encryptedPass];
        console.log(this.clusterInformation.encryptedPassword);
      } else {
        if (this.password != ""){
          console.warn("Safe keychain for password storage not available");
        }
        this.clusterInformation.securedPassword = false;
        this.clusterInformation.plainPassword = this.password
      }

      this.clusterInformation.dateModified = dayjs().utc().format();

      console.log("Updating cluster with name: " + this.clusterInformation.name);
      this.userClustersService.updateUserCluster(this.clusterInformation);

      let action : NavigationAction = {
        action: actionShowToast,
        type: 'success',
        value: 'Cluster updated'
      } 

      this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
    }
  }

  async testConnection(): Promise<void> {
    this.setLoading("Testing connectivity");
    this.kafkaService.connectToCluster(this.clusterInformation).then((result) => {
      if (result){
        SwalHelpers.triggerToast("success", "Connection successful");
      } else {
        SwalHelpers.triggerToast("error", "Unable to connect");
      }
      this.kafkaService.cleanUpConnection(() => { console.log("Connections cleaned from testing"); });
      this.isLoading = false;
      this.cdRef.detectChanges();
    }, (err) => {
      SwalHelpers.triggerToast("error", "Error when connecting");
      this.kafkaService.cleanUpConnection(() => { console.log("Connections cleaned from testing"); });
      this.isLoading = false;
      this.cdRef.detectChanges();
    });
  }

  setLoading(message: string){
    this.loadingText = message;
    this.isLoading = true;
  }
}
