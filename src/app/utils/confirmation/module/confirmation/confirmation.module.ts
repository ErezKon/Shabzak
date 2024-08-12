import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationComponent } from '../../component/confirmation.component';
import { ConfirmationService } from '../../service/confirmation.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ConfirmationComponent,
  ],
  providers: [ConfirmationService]
})
export class ConfirmationModule { }
