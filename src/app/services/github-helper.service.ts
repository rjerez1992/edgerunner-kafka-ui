import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GithubHelperService {

  private githubURL = "https://api.github.com/repos/rjerez1992/edgerunner-kafka-ui/releases";

  constructor(private http: HttpClient) { 
    
  }

  hasNewVersion(current: string, callback: Function): void {
    this.http.get<any[]>(this.githubURL).subscribe((value) => {
      let latest = this.getVersion(value);
      console.log("Got remote version: "+latest);
      if (latest == "" || latest == current){
        callback(false);
      }
      callback(this.isHigherVersion(current, latest));
    },
    (err) => {
      console.error("Unable to retrieve latest version from Github");
      console.error(err);
      callback(false);
    });
  }

  private isHigherVersion(current: string, latest: string): boolean {
    //Expected format: v1.0.0-a3 | v1.23.0-b5 | v1.26.12-rc1
    latest = latest.substring(1); 

    let currentValues = current.split("-");
    let currentNumbers = currentValues[0].split(".");
    
    let latestValues = latest.split("-");
    let latestNumbers = latestValues[0].split(".");

    if (latestNumbers[0] > currentNumbers[0]){
      return true;
    } else if (latestNumbers[0] == currentNumbers[0] && latestNumbers[1] > currentNumbers[1]){
      return true;
    } else if (latestNumbers[0] == currentNumbers[0] && latestNumbers[1] == currentNumbers[1] && latestNumbers[2] > currentNumbers[2]){
      return true;
    } else if (latestNumbers[0] == currentNumbers[0] && latestNumbers[1] == currentNumbers[1] && latestNumbers[2] == currentNumbers[2] && latestValues[1] > currentValues[1]){
      return true;
    }

    return false;
  }

  private getVersion(result : any[]): string {
    if (result.length > 0){
      return result[0].name;
    }
    return "";
  }

}
