export function formatRS(value: number | string): string {
	// Remove tudo que não é dígito
	const digits = String(value).replace(/\D/g, '');
	if (!digits) return 'R$ 0,00';

	// Limita a quantidade máxima de dígitos: 6 antes dos centavos, 2 para centavos
	const maxDigits = 8; // 6 para reais, 2 para centavos
	const limitedDigits = digits.slice(-maxDigits);

	// Preenche zeros à esquerda para garantir pelo menos 3 dígitos
	const padded = limitedDigits.padStart(3, '0');
	// Separa centavos
	const intPart = padded.slice(0, -2);
	const decimalPart = padded.slice(-2);
	// Formata parte inteira com separador de milhar
	const intFormatted = Number(intPart).toLocaleString('pt-BR');
	return `R$ ${intFormatted},${decimalPart}`;
}
