/**
 * api.js — Servicio centralizado para fetch con JWT.
 *
 * En DESARROLLO (npm run dev, puerto 5173):
 *   Vite proxy redirige /api → http://localhost:8080
 *   así que usamos rutas relativas siempre.
 *
 * En PRODUCCIÓN (build servido por Spring Boot en 8080):
 *   Todo corre en el mismo servidor, rutas relativas funcionan igual.
 *
 * En ambos casos la URL base queda vacía y apiFetch usa solo "/api/..."
 */

export function getToken() {
    return localStorage.getItem('token')
}

export function saveToken(token) {
    localStorage.setItem('token', token)
}

export function removeToken() {
    localStorage.removeItem('token')
}

/**
 * apiFetch: wrapper de fetch que agrega Authorization: Bearer <token>
 * si hay un token guardado en localStorage.
 *
 * @param {string} path   - Ruta relativa, ej: '/api/puestos/recientes'
 * @param {object} options - Opciones de fetch (method, body, headers, etc.)
 */
export async function apiFetch(path, options = {}) {
    const token = getToken()

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(path, {
        ...options,
        headers,
    })

    // 401 o 403: limpiar sesión y lanzar error
    if (response.status === 401 || response.status === 403) {
        removeToken()
        localStorage.removeItem('user')
        const msg = response.status === 401
            ? 'Sesión expirada. Por favor inicie sesión nuevamente.'
            : 'No tiene permisos para realizar esta acción.'
        throw new Error(msg)
    }

    return response
}