import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationAction } from 'src/app/models/navigation-action';
import { GeneralParamsService } from 'src/app/services/general-params.service';
import { KafkaService } from 'src/app/services/kafka.service';
import { SwalHelpers } from 'src/app/utils/swal-helpers';
import { headerClusterList, headerAddCluster, headerEditCluster, headerExploreCluster, actionShowToast } from '../../definitions/constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(
    private generalParamsService: GeneralParamsService, 
    private cdRef: ChangeDetectorRef, 
    private kafkaService: KafkaService, 
    private router: Router
  ) { }

  public headerMode: string = "";
  public clusterName: string = "";


  ngOnInit(): void {
    this.generalParamsService.getHeaderMode().subscribe((value) => {
      this.headerMode = value;
      this.cdRef.detectChanges();
    });
    this.generalParamsService.getClusterName().subscribe((value) => {
      this.clusterName = value;
      this.cdRef.detectChanges();
    });
  }

  isClusterList(): boolean {
    return this.headerMode == headerClusterList || this.headerMode == "";
  }

  isAddCluster(): boolean {
    return this.headerMode == headerAddCluster;
  }

  isEditCluster(): boolean {
    return this.headerMode == headerEditCluster;
  }

  isClusterExplorer(): boolean {
    return this.headerMode == headerExploreCluster;
  }

  changeCluster(): void {
    console.log("Trying to change cluster");
    SwalHelpers.showConfirmationWarning("Change cluster", "Are you sure you want to close the current connection?", "Change", ()=>{
      this.kafkaService.cleanUpConnection();
      let action : NavigationAction = {
        action: actionShowToast,
        type: 'success',
        value: 'Connection closed'
      } 
      this.router.navigate(['/'], { queryParams : { navAction :  JSON.stringify(action) }} );
    });
  }
  
}
