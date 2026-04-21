package com.consultorio.backend.service;

import com.consultorio.backend.dto.CreateUserRequest;
import com.consultorio.backend.dto.UpdateUserRequest;
import com.consultorio.backend.dto.UserResponse;
import com.consultorio.backend.entity.User;
import com.consultorio.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un usuario con el email: " + request.email());
        }
        User user = new User();
        user.setNombre(request.nombre());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return mapToResponse(userRepository.save(user));
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuario no encontrado con id: " + id));

        // Verificar que el nuevo email no esté en uso por otro usuario
        userRepository.findByEmail(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El email ya está en uso por otro usuario");
            }
        });

        user.setNombre(request.nombre());
        user.setEmail(request.email());
        user.setRole(request.role());

        // Solo actualizar la contraseña si se envió un valor
        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return mapToResponse(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuario no encontrado con id: " + id));

        // Evitar borrar al último administrador
        long totalAdmins = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ROLE_ADMIN"))
                .count();

        if (user.getRole().name().equals("ROLE_ADMIN") && totalAdmins <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede eliminar al último administrador del sistema");
        }

        userRepository.deleteById(id);
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNombre(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
