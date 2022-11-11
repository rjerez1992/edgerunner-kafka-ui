import Swal, { SweetAlertIcon } from "sweetalert2"

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export class SwalHelpers {

  public static showConfirmationWarning(title: string, message: string, btnText: string, callback: Function){
    this.showConfirmationSwal(title, message, btnText, '#dc3545', 'warning', callback);
  }

  static showConfirmationSwal(title: string, message: string, btnText: string, btnColor: string, swalIcon: SweetAlertIcon, callback: Function){
    Swal.fire({
      title: title,
      text: message,
      icon: swalIcon,
      showCancelButton: true,
      backdrop: "rgba(32,34,37,1)",
      confirmButtonColor: btnColor,
      confirmButtonText: btnText
    }).then((result) => {
      if (result.isConfirmed) {
        callback();        
      }
    })
  }

  public static async showTextInputSwal(title: string, label: string, emptyErr: string, callback: Function){
    const { value: entered } = await Swal.fire({
      title: title,
      input: 'text',
      inputLabel: label,
      backdrop: "rgba(32,34,37,1)",
      inputValidator: value => {
        return new Promise((resolve) => {
          if (value !== '') {
            resolve(null);
          } else {
            resolve(emptyErr)
          }
        })
      },
    })

    callback(entered);
  }
  
  public static showErrorSwal(message: string){
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Close',
      backdrop: "rgba(32,34,37,1)"
    });
  }

  public static showHTMLTextSwal(htmlMessage: string){
    Swal.fire({
      title: 'Data generators',
      html: htmlMessage,
      confirmButtonText: 'Close',
      backdrop: "rgba(32,34,37,1)"
    });
  }

  public static triggerToast(icon: string, message: string){
    if (icon == 'success' || icon == 'warning' || icon == 'error' || icon == 'info' || icon == 'question'){
      Toast.fire({
        icon: icon,
        title: message
      });
    }
  }

  public static triggerToastWithAction(icon: string, message: string, buttonText: string, onConfirm: Function){
    if (icon == 'success' || icon == 'warning' || icon == 'error' || icon == 'info' || icon == 'question'){
      Toast.fire({
        icon: icon,
        title: message,
        showConfirmButton: true,
        confirmButtonText: buttonText,
        timer: 5000,
      }).then((result) => {
        if (result.isConfirmed) {     
          onConfirm();
        }
      })
    }
  }
} 
