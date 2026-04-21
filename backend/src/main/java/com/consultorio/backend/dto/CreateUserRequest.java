package com.consultorio.backend.dto;

import com.consultorio.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene formato válido") String email,
        @NotBlank(message = "La contraseña es obligatoria") String password,
        @NotNull(message = "El rol es obligatorio") Role role
) {}
