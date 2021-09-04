import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/**
 * App routing configuration.
 */
const routes: Routes = [];

/**
 * The app routing module.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
