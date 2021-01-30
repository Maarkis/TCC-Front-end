import {Component, OnInit} from '@angular/core';
import {ResponseBase} from '../../../shared/models/response-base';
import {Scheduling, SchedulingStatus} from '../../../shared/models/scheduling';
import {SchedulingService} from '../../../shared/services/scheduling.service';
import {MatDialog} from '@angular/material/dialog';
import {SessionService} from '../../../shared/services/session.service';
import {ModalComponent} from '../../../shared/components/modal/modal.component';
import {UserAuthenticated} from '../../../shared/models/authentication/authentication';
import {NotificationService} from '../../../shared/services/notification/notification-service.service';
import {DeviceService} from '../../../shared/services/device/device.service';

@Component({
    selector: 'app-appointments',
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {

    public schedules: Scheduling[];
    private user: UserAuthenticated;

    constructor(private schedulingService: SchedulingService,
                private dialog: MatDialog, private sessionService: SessionService,
                private notificationService: NotificationService, private deviceService: DeviceService) {
    }

    ngOnInit(): void {
        this.user = this.sessionService.userAuthenticated;
        this.getScheduling();
    }

    private getScheduling(): void {
        this.schedulingService.getClientSchedulingsByUserId(this.user.id)
            .subscribe((response: ResponseBase<Scheduling[]>) => {
                if (response.success) {
                    console.log(response.message);
                    this.schedules = response.result;
                } else {
                    this.deviceService.desktop ?
                        this.notificationService.showMessageMatDialog('', response.message) :
                        this.notificationService.showMessageSnackBar(response.message, true);
                }
            }, e => {
                this.deviceService.desktop ?
                    this.notificationService.showMessageMatDialog('', e.error.error) :
                    this.notificationService.showMessageSnackBar(e.error.error, true);
            });
    }

    public cancelSchedule(scheduling: Scheduling): void {
        const updateScheduling = {
            schedulingId: scheduling.schedulingId,
            newStatus: SchedulingStatus.Canceled
        };
        console.log(updateScheduling);
        this.schedulingService.updateSchedulingStatus(updateScheduling).subscribe((response: ResponseBase<any>) => {
            if (response.success) {
                const dialogRef = this.dialog.open(ModalComponent, {
                    panelClass: 'custom-modais', backdropClass: 'blur',
                    data: {
                        title: 'Pronto!',
                        text: response.result,
                        button: 'Fechar',
                        route: ''
                    }
                });
                dialogRef.afterClosed().subscribe(resp => {
                    this.getScheduling();
                }, error => {
                    console.log(error);
                });
            }
        }, error => {
            console.log(error);
        });
    }

}
