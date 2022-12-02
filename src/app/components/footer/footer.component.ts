import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GeneralParamsService } from 'src/app/services/general-params.service';

const reportBugURL = "https://github.com/rjerez1992/edgerunner-kafka-ui/issues";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public buildVersion : string = "Unfetched";
  private secureModeFlag: boolean = false;
  private readOnlyFlag: boolean = false;
  public subscribedTopic: string = "";

  private nameClickCounter: number = 0;

  constructor(
    private cdRef: ChangeDetectorRef, 
    private generalParamsService: GeneralParamsService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    window.utils.appVersion().then((value) => {
      this.buildVersion = value;
      this.cdRef.detectChanges();
    });

    this.generalParamsService.getIsSecureMode().subscribe((value) => {
      this.secureModeFlag = value;
      this.cdRef.detectChanges();
    });
    this.generalParamsService.getIsReadOnly().subscribe((value) => {
      this.readOnlyFlag = value;
      this.cdRef.detectChanges();
    });
    this.generalParamsService.getSubscribedTopic().subscribe((value) => {
      this.subscribedTopic = value;
      this.cdRef.detectChanges();
    });
  }

  reportBug(): void {
    window.utils.openLink(reportBugURL);
  }

  clickEdgerunner(): void {
    this.nameClickCounter += 1;
    if (this.nameClickCounter >= 18){
      this.nameClickCounter = 0;
      window.utils.play();
    }
  }

  shoudlShowSecureMode(): boolean {
    return this.isExplorerView() && this.secureModeFlag == true;
  }

  shouldShowReadOnlyMode(): boolean {
    return this.isExplorerView() && this.readOnlyFlag == true;
  }

  isExplorerView(): boolean {
    return this.router.url == "/explore";
  }
}
