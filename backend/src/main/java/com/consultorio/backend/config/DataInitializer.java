package com.consultorio.backend.config;

import com.consultorio.backend.entity.Role;
import com.consultorio.backend.entity.User;
import com.consultorio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Se ejecuta al arrancar la aplicación.
 * Crea el usuario administrador inicial si no existe ninguno en la base de datos.
 *
 * Credenciales por defecto (solo si no hay ningún admin):
 *   Email:    ADMIN_EMAIL    (default: admin@consultorio.com)
 *   Password: ADMIN_PASSWORD (default: Admin1234!)
 *
 * En producción, setear ADMIN_EMAIL y ADMIN_PASSWORD como variables de entorno.
 * Cambiar la contraseña después del primer login.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@consultorio.com}")
    private String adminEmail;

    @Value("${admin.password:Admin1234!}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        // Solo crea el admin si no existe ningún usuario con ROLE_ADMIN
        boolean existeAdmin = userRepository.findAll().stream()
                .anyMatch(u -> u.getRole() == Role.ROLE_ADMIN);

        if (!existeAdmin) {
            User admin = new User();
            admin.setNombre("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);

            log.warn("═══════════════════════════════════════════════════");
            log.warn("  Usuario administrador creado automáticamente");
            log.warn("  Email:    {}", adminEmail);
            log.warn("  Password: {}", adminPassword);
            log.warn("  ⚠ Cambiá la contraseña después del primer login");
            log.warn("═══════════════════════════════════════════════════");
        }
    }
}
