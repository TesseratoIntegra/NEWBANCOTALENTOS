export default function formatCPF(value: string): string {
    if (!value) return '';
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    // Aplica a máscara xxx.xxx.xxx-xx
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
        .slice(0, 14);
}