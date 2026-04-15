package com.consultorio.backend.dto;

import java.time.LocalDateTime;

public record TurnoResponse(Long id, Long pacienteId, String pacienteNombre, LocalDateTime fechaHora, Integer duracionMinutos, String motivo, String estado) {}
