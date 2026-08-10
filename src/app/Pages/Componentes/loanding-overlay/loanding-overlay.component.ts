import { Component, OnInit, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading';


@Component({
  selector: 'app-loanding-overlay',
  templateUrl: './loanding-overlay.component.html',
  styleUrls: ['./loanding-overlay.component.scss'],
})
export class LoandingOverlayComponent  implements OnInit {
  private loadingService = inject(LoadingService);
  isLoading = this.loadingService.isLoading;
  
  constructor() { }

  ngOnInit() {}

}
