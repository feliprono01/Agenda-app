package com.consultorio.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record TurnoRequest(
        @NotNull(message = "El paciente es obligatorio")
        Long pacienteId,

        @NotNull(message = "La fecha y hora son obligatorias")
        LocalDateTime fechaHora,

        @Min(value = 15, message = "La duración mínima es de 15 minutos")
        @Max(value = 180, message = "La duración máxima es de 180 minutos")
        Integer duracionMinutos,

        @Size(max = 500, message = "El motivo no puede superar los 500 caracteres")
        String motivo
) {}
