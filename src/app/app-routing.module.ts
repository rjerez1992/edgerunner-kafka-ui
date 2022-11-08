import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddClusterComponent } from './components/add-cluster/add-cluster.component';
import { ClusterListComponent } from './components/cluster-list/cluster-list.component';
import { ExplorerComponent } from './components/explorer/explorer.component';

const routes: Routes = [
  { path: '', component: ClusterListComponent },
  { path: 'add', component: AddClusterComponent },
  { path: 'explore', component: ExplorerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
