package com.consultorio.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record PacienteRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100, message = "El apellido no puede superar los 100 caracteres")
        String apellido,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^\\+?\\d{7,15}$", message = "El teléfono debe tener entre 7 y 15 dígitos (podés incluir el + del código de país)")
        String telefono,

        @Email(message = "El email no tiene un formato válido")
        String email,

        @Size(max = 20, message = "El DNI no puede superar los 20 caracteres")
        String dni,

        LocalDate fechaNacimiento,

        @Size(max = 1000, message = "Las observaciones no pueden superar los 1000 caracteres")
        String observaciones
) {}
