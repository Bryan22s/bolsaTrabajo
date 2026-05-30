package progra4.bolsabe.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.ResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

import java.io.IOException;
import java.util.List;

/**
 * WebConfig: configuración para producción (frontend React + backend Spring en un solo servidor).
 *
 * Resuelve dos problemas:
 *
 * 1. PDFs de currículos:
 *    Sirve los archivos de "uploads/curriculos/" en la ruta /curriculos/**
 *    (fuera del classpath, en el disco junto al JAR).
 *
 * 2. SPA fallback:
 *    React Router maneja rutas como /buscar, /admin/dashboard, etc.
 *    Si el usuario recarga la página, el navegador pide esa ruta a Spring,
 *    que no la conoce. El SpaResourceResolver devuelve el index.html de React
 *    para cualquier ruta que no sea /api/** ni un archivo estático real.
 *
 * En DESARROLLO no aplica (Vite sirve el frontend en puerto 5173).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // ── PDFs de currículos ────────────────────────────────────────────
        registry.addResourceHandler("/curriculos/**")
                .addResourceLocations("file:uploads/curriculos/");

        // ── SPA fallback: cualquier ruta que no sea /api/** ───────────────
        // Primero intenta encontrar el archivo estático real (JS, CSS, imágenes).
        // Si no existe, devuelve index.html para que React Router lo maneje.
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());
    }

    /**
     * SpaResourceResolver: resuelve recursos estáticos del build de React.
     *
     * Lógica:
     *  - Si la ruta empieza con /api/ o /curriculos/ → no interviene (Spring la maneja)
     *  - Si existe el archivo estático (bundle.js, imagen, etc.) → lo devuelve
     *  - Si no existe (ruta de React Router) → devuelve index.html
     */
    static class SpaResourceResolver implements ResourceResolver {

        private static final Resource INDEX_HTML =
                new ClassPathResource("/static/index.html");

        @Override
        public Resource resolveResource(HttpServletRequest request,
                                        String requestPath,
                                        List<? extends Resource> locations,
                                        ResourceResolverChain chain) {
            // Dejar que /api/** y /curriculos/** los maneje Spring normalmente
            if (requestPath.startsWith("api/") || requestPath.startsWith("curriculos/")) {
                return null;
            }

            // Intentar encontrar el archivo estático real
            Resource resolved = chain.resolveResource(request, requestPath, locations);
            if (resolved != null) {
                return resolved;
            }

            // No es un archivo estático → devolver index.html (React Router lo maneja)
            try {
                return INDEX_HTML.exists() ? INDEX_HTML : null;
            } catch (Exception e) {
                return null;
            }
        }

        @Override
        public String resolveUrlPath(String resourcePath,
                                     List<? extends Resource> locations,
                                     ResourceResolverChain chain) {
            return chain.resolveUrlPath(resourcePath, locations);
        }
    }
}