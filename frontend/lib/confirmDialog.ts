import Swal from 'sweetalert2';

export async function confirmDialog(message: string): Promise<boolean> {
  const result = await Swal.fire({
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0284c7',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
  });
  return result.isConfirmed;
}
