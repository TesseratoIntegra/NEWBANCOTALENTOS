export function formatTEL(tel: string): string {
	// Remove tudo que não for dígito
let cleaned = tel.replace(/\D/g, "");
// Limita a 11 dígitos
if (cleaned.length > 11) {
    cleaned = cleaned.slice(0, 11);
}
	// Aplica a máscara
	if (cleaned.length === 11) {
		// (xx) xxxxx-xxxx
		return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	} else if (cleaned.length === 10) {
		// (xx) xxxx-xxxx
		return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}
	// Retorna original se não bater com formatos conhecidos
	return tel;
}
