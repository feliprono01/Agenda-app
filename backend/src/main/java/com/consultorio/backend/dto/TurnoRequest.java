package com.consultorio.backend.dto;

import java.time.LocalDateTime;

public record TurnoRequest(Long pacienteId, LocalDateTime fechaHora, Integer duracionMinutos, String motivo) {}
