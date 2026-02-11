/**
 * Aplica máscara DD/MM/AAAA conforme o usuário digita.
 * Ex: "01082025" → "01/08/2025"
 */
export function formatDateInput(value: string): string {
	let cleaned = value.replace(/\D/g, '');
	if (cleaned.length > 8) {
		cleaned = cleaned.slice(0, 8);
	}

	if (cleaned.length <= 2) return cleaned;
	if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
	return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
}

/**
 * Converte data no formato display "DD/MM/AAAA" para ISO "AAAA-MM-DD" (para API).
 * Retorna string vazia se o formato for incompleto.
 */
export function displayDateToISO(display: string): string {
	const cleaned = display.replace(/\D/g, '');
	if (cleaned.length !== 8) return '';

	const day = cleaned.slice(0, 2);
	const month = cleaned.slice(2, 4);
	const year = cleaned.slice(4, 8);

	return `${year}-${month}-${day}`;
}

/**
 * Converte data no formato ISO "AAAA-MM-DD" para display "DD/MM/AAAA".
 * Retorna string vazia se o formato for invalido.
 */
export function isoDateToDisplay(iso: string): string {
	if (!iso) return '';

	const parts = iso.split('-');
	if (parts.length !== 3) return '';

	const [year, month, day] = parts;
	if (!year || !month || !day) return '';

	return `${day}/${month}/${year}`;
}

/**
 * Valida se uma data no formato "DD/MM/AAAA" é uma data real.
 * Ex: "31/02/2025" → false, "28/02/2025" → true
 */
export function isValidDate(display: string): boolean {
	const cleaned = display.replace(/\D/g, '');
	if (cleaned.length !== 8) return false;

	const day = parseInt(cleaned.slice(0, 2), 10);
	const month = parseInt(cleaned.slice(2, 4), 10);
	const year = parseInt(cleaned.slice(4, 8), 10);

	if (month < 1 || month > 12) return false;
	if (day < 1) return false;
	if (year < 1900 || year > 2100) return false;

	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
