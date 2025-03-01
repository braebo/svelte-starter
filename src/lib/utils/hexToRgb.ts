/**
 * Converts a hex color string to RGB values.
 * @param hex - The hex color string (e.g., '#ff0000' or 'ff0000')
 * @returns A tuple of [r, g, b] values (0-255) or null if invalid hex
 */
export function hexToRgb(hex: string): [number, number, number] | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}
