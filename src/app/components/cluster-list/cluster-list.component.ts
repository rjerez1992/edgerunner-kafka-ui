import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { actionShowToast, headerClusterList, navigationActionKey } from 'src/app/definitions/constants';
import { NavigationAction } from 'src/app/models/navigation-action';
import { GeneralParamsService } from 'src/app/services/general-params.service';
import { KafkaService } from 'src/app/services/kafka.service';
import { StorageService } from 'src/app/services/storage.service';
import { UserClustersService } from 'src/app/services/user-clusters.service';
import { SwalHelpers } from 'src/app/utils/swal-helpers';
import { KafkaClusterInformation } from '../../models/cluster-information'
import { GithubHelperService } from 'src/app/services/github-helper.service';

@Component({
  selector: 'app-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent implements OnInit {
  public isLoading : boolean = false;

  public userClusters: Array<KafkaClusterInformation>;
  public loadingText: string = "";

  private isConnecting : boolean = false;

  private releasesURL : string = "https://github.com/rjerez1992/edgerunner-kafka-ui/releases";

  constructor(
    private kafkaService: KafkaService, 
    private cdRef: ChangeDetectorRef,
    private userClustersService: UserClustersService,
    private router: Router,
    private route: ActivatedRoute,
    private generalParamsService: GeneralParamsService,
    private storageService: StorageService,
    private githubHelperService: GithubHelperService
  ) {}
  
  ngOnInit(): void { 
    this.setLoading("Loading user settings");
    let actionString = this.route.snapshot.queryParamMap.get(navigationActionKey);
    if (actionString != undefined){
      let navAction : NavigationAction = JSON.parse(actionString);
      this.resolveAction(navAction);
    }
    this.generalParamsService.setHeaderMode(headerClusterList);
    this.kafkaService.errorCallback = () => {
      SwalHelpers.triggerToast("error", "Cluster connectivity error");
    };
  }

  ngAfterViewInit() {
    this.lookForUpdates();
    this.loadUserClusters();
    this.cdRef.detectChanges();
  }

  loadUserClusters(){
    console.log("Loading user's cluster information");
    this.userClusters = this.userClustersService.getUserClusters();
    console.log("Loaded user's clusters information")
    console.info(this.userClusters);

    this.isLoading = false;
  }

  exploreCluster(id: string){
    if (this.isConnecting){
      console.warn("There is already a connection attemp in progress");
      return;
    }
    this.isConnecting = true;
    
    console.log("Trying to connect to cluster with ID: " + id);
    this.setLoading("Connecting to cluster");
    let targetCluster = this.userClusters.find(x => x.id == id);

    if (targetCluster){
      this.kafkaService.connectToCluster(targetCluster).then((value) => {
        this.isLoading = false;
        this.isConnecting = false;
        this.router.navigate(['/', 'explore']);
      }).catch((e) => {
        console.error("Unable to connect to cluster");
        console.error(e);
        this.isLoading = false;
        this.isConnecting = false;
        SwalHelpers.showErrorSwal("Unable to connect to cluster. Check the configuration.");
      });
    } else {
      SwalHelpers.showErrorSwal("Unable to find cluster configuration. Unkown error.");
    }   
  }

  editCluster(id: string){
    console.log("Redirecting to add view in edit mode for cluster ID: "+id);
    this.router.navigate(['/add'], { queryParams : { clusterId :  id }});
  }

  deleteCluster(id: string){
    console.log("Requesting confirmation to delete cluster with ID: "+id);
    SwalHelpers.showConfirmationWarning('Delete cluster', 
    "You won't be able to recover the settings after deleting. Do you want to proceed?", 
    'Delete', 
    () => {
      console.warn("Deleting cluster with ID: "+ id);
      this.userClustersService.removeUserCluster(id);
      this.loadUserClusters();
      SwalHelpers.triggerToast('success', 'Cluster deleted');
      this.cdRef.detectChanges();
    });
  }

  setLoading(message: string){
    this.loadingText = message;
    this.isLoading = true;
  }

  resolveAction(action: NavigationAction){
    if(action.action == actionShowToast){
      SwalHelpers.triggerToast(action.type, action.value);
    }
  }

  lookForUpdates() {
    window.utils.appVersion().then((currentVersion) => {
      console.log("Current app version:"+currentVersion);
      this.githubHelperService.hasNewVersion(currentVersion, (hasUpdate: boolean) => {
        if (hasUpdate){
          console.log("New version available");
          SwalHelpers.triggerToastWithAction("info", "New version available", "Go to Github", () => {
            window.utils.openLink(this.releasesURL);
          });
        } else {
          console.log("Running on latest version");
        }
      });
    });
  }
}
